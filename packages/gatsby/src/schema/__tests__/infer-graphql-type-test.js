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
              name: `TEST`,
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

  it(`removes specific fields `, () => {
    return queryResult(
      [
        {
          title: `Some test`,
          slug: `test`,
          summary: `_`,
          coverImage: {
            url: `_`,

            size: 720368,
            width: 2876,
            height: 1792,
          },
          date: `2015-11-01`,
          dateEnd: `2015-11-01`,
        },
      ],
      `
        title
        slug
        summary
        coverImage {
          url
          size
          width
          height
        }
        date
        dateEnd
      `
    ).then(result => expect(result).toMatchSnapshot())
  })
})
