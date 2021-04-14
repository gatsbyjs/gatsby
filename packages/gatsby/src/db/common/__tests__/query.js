import { createDbQueriesFromObject } from "../query"

describe(`DbQuery`, () => {
  it(`converts basic query`, () => {
    const query = createDbQueriesFromObject({ id: { $eq: `2` } })
    expect(query).toMatchInlineSnapshot(`
      Array [
        Object {
          "path": Array [
            "id",
          ],
          "query": Object {
            "comparator": "$eq",
            "value": "2",
          },
          "type": "query",
        },
      ]
    `)
  })

  it(`converts nested query`, () => {
    const query = createDbQueriesFromObject({
      internal: { value: { $eq: `2` } },
    })
    expect(query).toMatchInlineSnapshot(`
      Array [
        Object {
          "path": Array [
            "internal",
            "value",
          ],
          "query": Object {
            "comparator": "$eq",
            "value": "2",
          },
          "type": "query",
        },
      ]
    `)
  })

  it(`converts branching nested query`, () => {
    const query = createDbQueriesFromObject({
      internal: { value: { $eq: `2` }, otherValue: { $regex: /baz/ } },
    })
    expect(query).toMatchInlineSnapshot(`
      Array [
        Object {
          "path": Array [
            "internal",
            "value",
          ],
          "query": Object {
            "comparator": "$eq",
            "value": "2",
          },
          "type": "query",
        },
        Object {
          "path": Array [
            "internal",
            "otherValue",
          ],
          "query": Object {
            "comparator": "$regex",
            "value": /baz/,
          },
          "type": "query",
        },
      ]
    `)
  })

  it(`converts complex branching nested query`, () => {
    const query = createDbQueriesFromObject({
      id: { $in: [`foo`] },
      internal: { value: { $eq: `2` }, otherValue: { $regex: /baz/ } },
    })

    expect(query).toMatchInlineSnapshot(`
      Array [
        Object {
          "path": Array [
            "id",
          ],
          "query": Object {
            "comparator": "$in",
            "value": Array [
              "foo",
            ],
          },
          "type": "query",
        },
        Object {
          "path": Array [
            "internal",
            "value",
          ],
          "query": Object {
            "comparator": "$eq",
            "value": "2",
          },
          "type": "query",
        },
        Object {
          "path": Array [
            "internal",
            "otherValue",
          ],
          "query": Object {
            "comparator": "$regex",
            "value": /baz/,
          },
          "type": "query",
        },
      ]
    `)
  })

  it(`converts elemMatch`, () => {
    const query = createDbQueriesFromObject({
      nested: { $elemMatch: { $eq: `foo` } },
    })
    expect(query).toMatchInlineSnapshot(`
      Array [
        Object {
          "nestedQuery": Object {
            "path": Array [],
            "query": Object {
              "comparator": "$eq",
              "value": "foo",
            },
            "type": "query",
          },
          "path": Array [
            "nested",
          ],
          "type": "elemMatch",
        },
      ]
    `)
  })

  it(`converts complex elemMatch`, () => {
    const query = createDbQueriesFromObject({
      nested: { $elemMatch: { foo: { $eq: `foo` } } },
    })
    expect(query).toMatchInlineSnapshot(`
      Array [
        Object {
          "nestedQuery": Object {
            "path": Array [
              "foo",
            ],
            "query": Object {
              "comparator": "$eq",
              "value": "foo",
            },
            "type": "query",
          },
          "path": Array [
            "nested",
          ],
          "type": "elemMatch",
        },
      ]
    `)
  })

  it(`converts nested elemMatch`, () => {
    const query = createDbQueriesFromObject({
      nested: { $elemMatch: { foo: { $eq: `foo` }, bar: { $eq: `bar` } } },
    })
    expect(query).toMatchInlineSnapshot(`
      Array [
        Object {
          "nestedQuery": Object {
            "path": Array [
              "foo",
            ],
            "query": Object {
              "comparator": "$eq",
              "value": "foo",
            },
            "type": "query",
          },
          "path": Array [
            "nested",
          ],
          "type": "elemMatch",
        },
        Object {
          "nestedQuery": Object {
            "path": Array [
              "bar",
            ],
            "query": Object {
              "comparator": "$eq",
              "value": "bar",
            },
            "type": "query",
          },
          "path": Array [
            "nested",
          ],
          "type": "elemMatch",
        },
      ]
    `)
  })
})
