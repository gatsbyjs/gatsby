const {
  graphql,
  GraphQLObjectType,
  GraphQLList,
  GraphQLSchema,
} = require(`graphql`)
const { inferObjectStructureFromNodes } = require(`../infer-graphql-type`)

function queryResult(nodes, fragment) {
  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: `RootQueryType`,
      fields: () => ({
        listNode: {
          name: `LISTNODE`,
          type: new GraphQLList(
            new GraphQLObjectType({
              name: `Test`,
              fields: inferObjectStructureFromNodes({
                nodes,
                types: [{ name: `Test` }],
              }),
            })
          ),
          resolve() {
            return nodes
          },
        },
      }),
    }),
  })

  return graphql(
    schema,
    `query {
      listNode {
        ${fragment}
      }
    }
    `
  )
}

describe(`GraphQL type inferance`, () => {
  const nodes = [
    {
      id: `foo`,
      name: `The Mad Max`,
      type: `Test`,
      hair: 1,
      date: `1012-11-01`,
      anArray: [1, 2, 3, 4],
      anObjectArray: [
        { aString: `some string`, aNumber: 2, aBoolean: true },
        { aString: `some string`, aNumber: 2, anArray: [1, 2] },
        { anotherObjectArray: [{ bar: 10 }] },
      ],
      deepObject: {
        level: 1,
        deepObject: {
          level: 2,
          deepObject: {
            level: 3,
          },
        },
      },
      aBoolean: true,
      externalUrl: `https://example.com/awesome.jpg`,
      domain: `pizza.com`,
      frontmatter: {
        date: `1012-11-01`,
        title: `The world of dash and adventure`,
        blue: 100,
      },
    },
    {
      id: `boo`,
      name: `The Mad Wax`,
      type: `Test`,
      hair: 2,
      date: `1984-10-12`,
      anArray: [1, 2, 5, 4],
      anObjectArray: [{ anotherObjectArray: [{ baz: `quz` }] }],
      frontmatter: {
        date: `1984-10-12`,
        title: `The world of slash and adventure`,
        blue: 10010,
      },
    },
  ]

  it(`filters out null example values`, async () => {
    let result = await queryResult(
      [{ foo: null, bar: `baz` }],
      `
        foo
        bar
      `
    )
    expect(result.errors.length).toEqual(1)
    expect(result.errors[0].message).toMatch(
      `Cannot query field "foo" on type "Test".`
    )
  })

  it(`filters out empty arrays`, async () => {
    let result = await queryResult(
      [{ foo: [], bar: `baz` }],
      `
        foo
        bar
      `
    )
    expect(result.errors.length).toEqual(1)
    expect(result.errors[0].message).toMatch(
      `Cannot query field "foo" on type "Test".`
    )
  })

  it(`filters out sparse arrays`, async () => {
    let result = await queryResult(
      [{ foo: [undefined, null, null], bar: `baz` }],
      `
        foo
        bar
      `
    )
    expect(result.errors.length).toEqual(1)
    expect(result.errors[0].message).toMatch(
      `Cannot query field "foo" on type "Test".`
    )
  })

  it(`Removes specific root fields`, () => {
    let fields = inferObjectStructureFromNodes({
      nodes: [
        {
          type: `Test`,
          id: `foo`,
          parent: `parent`,
          children: [`bar`],
          foo: {
            type: `Test`,
            id: `foo`,
            parent: `parent`,
            children: [`bar`],
          },
        },
      ],
      types: [{ name: `Test` }],
    })

    expect(Object.keys(fields)).toHaveLength(1)
    expect(Object.keys(fields.foo.type.getFields())).toHaveLength(4)
  })

  it(`Infers graphql type from array of nodes`, () => {
    return queryResult(
      nodes,
      `
        hair,
        anArray,
        anObjectArray {
          aNumber,
          aBoolean,
          anArray
          anotherObjectArray {
            bar
            baz
          }
        },
        deepObject {
          level
          deepObject {
            level
            deepObject {
              level
            }
          }
        }
        aBoolean,
        externalUrl,
        domain,
        date(formatString: "YYYY"),
        frontmatter {
          title,
          date(formatString: "YYYY")
        }
    `
    ).then(result => expect(result).toMatchSnapshot())
  })
})
