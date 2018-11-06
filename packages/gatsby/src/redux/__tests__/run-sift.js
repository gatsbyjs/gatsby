const runSift = require(`../run-sift`)
const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
} = require(`graphql`)

jest.mock(`../../db/node-tracking`, () => {
  return {
    trackInlineObjectsInRootNode: () => jest.fn(),
  }
})

const mockNodes = [
  {
    id: `id_1`,
    string: `foo`,
  },
  {
    id: `id_2`,
    string: `bar`,
  },
  {
    id: `id_3`,
    string: `baz`,
  },
]

jest.mock(`../../db/nodes`, () => {
  return {
    getNode: id => mockNodes.find(node => node.id === id),
    getNodesByType: () => mockNodes,
  }
})

describe(`run-sift`, () => {
  const typeName = `test`
  const gqlType = new GraphQLObjectType({
    name: typeName,
    fields: () => {
      return {
        id: new GraphQLNonNull(GraphQLID),
        string: GraphQLString,
      }
    },
  })
  const nodes = mockNodes

  describe(`filters by just id correctly`, () => {
    it(`eq operator`, async () => {
      const queryArgs = {
        filter: {
          id: { eq: `id_2` },
        },
      }

      const resultSingular = await runSift({
        gqlType,
        queryArgs,
        firstOnly: true,
      })

      const resultMany = await runSift({
        gqlType,
        queryArgs,
        firstOnly: false,
      })

      expect(resultSingular).toEqual([nodes[1]])
      expect(resultMany).toEqual([nodes[1]])
    })

    it(`non-eq operator`, async () => {
      const queryArgs = {
        filter: {
          id: { ne: `id_2` },
        },
      }

      const resultSingular = await runSift({
        gqlType,
        queryArgs,
        firstOnly: true,
      })

      const resultMany = await runSift({
        gqlType,
        queryArgs,
        firstOnly: false,
      })

      expect(resultSingular).toEqual([nodes[0]])
      expect(resultMany).toEqual([nodes[0], nodes[2]])
    })
  })
})
