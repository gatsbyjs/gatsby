const { print, parse } = require(`gatsby/graphql`)
const { merge, resolveResult } = require(`../merge-queries`)

describe(`Query merging`, () => {
  it(`merges simple queries`, () => {
    const queries = fromFixtures([
      [`{ foo }`, {}],
      [`{ bar }`, {}],
      [`{ baz }`, {}],
      [`{ foo, bar, baz }`, {}],
    ])
    const { query, variables } = merge(queries)
    const expected = parse(`{
      gatsby0_foo: foo
      gatsby1_bar: bar
      gatsby2_baz: baz
      gatsby3_foo: foo
      gatsby3_bar: bar
      gatsby3_baz: baz
    }`)
    expect(print(query)).toEqual(print(expected))
    expect(variables).toEqual({})
  })

  it(`merges aliased queries`, () => {
    const queries = fromFixtures([
      [`{ foo, bar }`, {}],
      [`{ foo, bar: foo }`, {}],
      [`{ foo, bar: foo(id: 2) }`, {}],
      [`{ foo: bar }`, {}],
    ])
    const { query, variables } = merge(queries)
    const expected = parse(`{
      gatsby0_foo: foo
      gatsby0_bar: bar
      gatsby1_foo: foo
      gatsby1_bar: foo
      gatsby2_foo: foo
      gatsby2_bar: foo(id: 2)
      gatsby3_foo: bar
    }`)
    expect(print(query)).toEqual(print(expected))
    expect(variables).toEqual({})
  })

  it(`merges template queries`, () => {
    const templateQuery = `
    query Foo($id: ID!) { node(id: $id) { title } }
  `
    const queries = fromFixtures([
      [templateQuery, { id: `1` }],
      [templateQuery, { id: `2` }],
      [templateQuery, { id: `3` }],
    ])
    const { query, variables } = merge(queries)

    const expectedQuery = parse(`
      query ($gatsby0_id: ID!, $gatsby1_id: ID!, $gatsby2_id: ID!) {
        gatsby0_node: node(id: $gatsby0_id) { title }
        gatsby1_node: node(id: $gatsby1_id) { title }
        gatsby2_node: node(id: $gatsby2_id) { title }
      }
    `)
    expect(print(query)).toEqual(print(expectedQuery))

    expect(variables).toEqual({
      gatsby0_id: `1`,
      gatsby1_id: `2`,
      gatsby2_id: `3`,
    })
  })

  it(`merges template queries with fragments`, () => {
    const templateQueryWithFragment = `
      query Foo($id: ID!, $withBody: Boolean!) { node(id: $id) { ...PostTitle ...PostBody } }
      fragment PostTitle on Post { title }
      fragment PostBody on Post { body @include(if: $withBody) }
    `
    const queries = fromFixtures([
      [templateQueryWithFragment, { id: `1` }],
      [templateQueryWithFragment, { id: `2` }],
      [templateQueryWithFragment, { id: `3` }],
    ])
    const { query, variables } = merge(queries)
    const expected = parse(`
      query (
        $gatsby0_id: ID!
        $gatsby0_withBody: Boolean!
        $gatsby1_id: ID!
        $gatsby1_withBody: Boolean!
        $gatsby2_id: ID!
        $gatsby2_withBody: Boolean!
      ) {
        gatsby0_node: node(id: $gatsby0_id) { ...PostTitle ...gatsby0_PostBody }
        gatsby1_node: node(id: $gatsby1_id) { ...PostTitle ...gatsby1_PostBody }
        gatsby2_node: node(id: $gatsby2_id) { ...PostTitle ...gatsby2_PostBody }
      }
      fragment PostTitle on Post { title }
      fragment gatsby0_PostBody on Post { body @include(if: $gatsby0_withBody) }
      fragment gatsby1_PostBody on Post { body @include(if: $gatsby1_withBody) }
      fragment gatsby2_PostBody on Post { body @include(if: $gatsby2_withBody) }
    `)
    expect(print(query)).toEqual(print(expected))
    expect(variables).toEqual({
      gatsby0_id: `1`,
      gatsby1_id: `2`,
      gatsby2_id: `3`,
    })
  })

  it(`handles fragments on Query type properly`, () => {
    const templateQueriesWithQueryFragment = `
      query Foo($id: ID!) {
        node(id: $id)
        foo
        ...QueryFragment
        ... on Query { foo, inlineFragmentField }
      }
      fragment QueryFragment on Query { foo, queryFragmentField }
    `
    const queries = fromFixtures([
      [templateQueriesWithQueryFragment, { id: `1` }],
      [templateQueriesWithQueryFragment, { id: `2` }],
    ])
    const { query, variables } = merge(queries)
    const expected = parse(`
      query ($gatsby0_id: ID!, $gatsby1_id: ID!) {
        gatsby0_node: node(id: $gatsby0_id)
        gatsby0_foo: foo
        ...QueryFragment @skip(if: true)
        ... on Query {
          gatsby0_foo: foo
          gatsby0_queryFragmentField: queryFragmentField
        }
        ... on Query {
          gatsby0_foo: foo
          gatsby0_inlineFragmentField: inlineFragmentField
        }
        gatsby1_node: node(id: $gatsby1_id)
        gatsby1_foo: foo
        ...QueryFragment @skip(if: true)
        ... on Query {
          gatsby1_foo: foo
          gatsby1_queryFragmentField: queryFragmentField
        }
        ... on Query {
          gatsby1_foo: foo
          gatsby1_inlineFragmentField: inlineFragmentField
        }
      }

      fragment QueryFragment on Query {
        foo
        queryFragmentField
      }
    `)
    expect(print(query)).toEqual(print(expected))
    expect(variables).toEqual({
      gatsby0_id: `1`,
      gatsby1_id: `2`,
    })
  })
})

describe(`Resolving merged query results`, () => {
  it(`resolves single result`, () => {
    const result = {
      data: {
        gatsby0_foo: { foo: `foo` },
      },
    }
    const resolved = resolveResult(result)
    expect(resolved).toEqual([
      {
        data: {
          foo: { foo: `foo` },
        },
      },
    ])
  })

  it(`resolves query results`, () => {
    const result = {
      data: {
        gatsby0_foo: { foo: `foo` },
        gatsby0_bar: { bar: `bar` },
        gatsby1_bar: { bar: `bar` },
      },
    }

    const resolved = resolveResult(result)
    expect(resolved).toEqual([
      {
        data: {
          foo: { foo: `foo` },
          bar: { bar: `bar` },
        },
      },
      {
        data: {
          bar: { bar: `bar` },
        },
      },
    ])
  })

  it(`correctly handles empty results`, () => {
    const resolved = resolveResult({ data: {} })
    expect(resolved).toEqual([])
  })

  it(`throws on unexpected results`, () => {
    const shouldThrow = () => {
      resolveResult({
        data: {
          gatsby0_foo: `foo`,
          bar: `bar`,
        },
      })
    }
    expect(shouldThrow).toThrow(`Unexpected data key: bar`)
  })
})

function fromFixtures(fixtures) {
  return fixtures.map(([query, variables]) => {
    return {
      query: parse(query),
      variables,
    }
  })
}
