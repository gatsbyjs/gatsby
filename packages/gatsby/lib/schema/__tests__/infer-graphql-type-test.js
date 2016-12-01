test(`Infers graphql type from array of nodes`, () => {
  const { inferObjectStructureFromNodes } = require(`../infer-graphql-type`)
  const {
    graphql,
    GraphQLObjectType,
    GraphQLList,
    GraphQLSchema,
  } = require(`graphql`)
  const nodes = [
    {
      name: `The Mad Max`,
      hair: 1,
      date: `1012-11-01`,
      anArray: [1, 2, 3, 4],
      frontmatter: {
        date: `1012-11-01`,
        title: `The world of dash and adventure`,
        blue: 100,
      },
    },
    {
      name: `The Mad Wax`,
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
  const inferredFields = inferObjectStructureFromNodes(nodes)
  const nodeType = new GraphQLObjectType({
    name: `TEST`,
    fields: { ...inferredFields },
  })
  const listNode = {
    name: `LISTNODE`,
    type: new GraphQLList(nodeType),
    resolve () {
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
  graphql(schema, `
        {
          listNode {
            hair,
            anArray,
            date(formatString: "YYYY"),
            frontmatter {
              title,
              date(formatString: "YYYY")
            }
          }
        }
        `)
  .then((result) => expect(result).toEqual({
    data: {
      listNode: [
        {
          hair: 1,
          anArray: [1, 2, 3, 4],
          date: `1012`,
          frontmatter: {
            date: `1012`,
            title: `The world of dash and adventure`,
          },
        },
        {
          hair: 2,
          anArray: [1, 2, 5, 4],
          date: `1984`,
          frontmatter: {
            date: `1984`,
            title: `The world of slash and adventure`,
          },
        },
      ],
    },
  }))
})
