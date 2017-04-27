test(`Infers graphql type from array of nodes`, () => {
  const { inferObjectStructureFromNodes } = require("../infer-graphql-type")
  const {
    graphql,
    GraphQLObjectType,
    GraphQLList,
    GraphQLSchema,
  } = require("graphql")
  const nodes = [
    {
      id: `foo`,
      name: `The Mad Max`,
      type: `Test`,
      hair: 1,
      date: `1012-11-01`,
      anArray: [1, 2, 3, 4],
      externalUrl: `https://example.com/awesome.jpg`,
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
      frontmatter: {
        date: `1984-10-12`,
        title: `The world of slash and adventure`,
        blue: 10010,
      },
    },
  ]
  const inferredFields = inferObjectStructureFromNodes({
    nodes,
    types: [{ name: `Test` }],
  })
  const nodeType = new GraphQLObjectType({
    name: `TEST`,
    fields: { ...inferredFields },
  })
  const listNode = {
    name: `LISTNODE`,
    type: new GraphQLList(nodeType),
    resolve() {
      return nodes
    },
  }
  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: `RootQueryType`,
      fields: () => ({
        listNode,
      }),
    }),
  })
  graphql(
    schema,
    `
        {
          listNode {
            hair,
            anArray,
            externalUrl,
            date(formatString: "YYYY"),
            frontmatter {
              title,
              date(formatString: "YYYY")
            }
          }
        }
        `
  ).then(result =>
    expect(result).toEqual({
      data: {
        listNode: [
          {
            hair: 1,
            anArray: [1, 2, 3, 4],
            externalUrl: `https://example.com/awesome.jpg`,
            date: `1012`,
            frontmatter: {
              date: `1012`,
              title: `The world of dash and adventure`,
            },
          },
          {
            hair: 2,
            anArray: [1, 2, 5, 4],
            externalUrl: null,
            date: `1984`,
            frontmatter: {
              date: `1984`,
              title: `The world of slash and adventure`,
            },
          },
        ],
      },
    })
  )
})
