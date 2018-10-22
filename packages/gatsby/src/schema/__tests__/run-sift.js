const runSift = require(`../run-sift`)
const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
} = require(`graphql`)
const { connectionFromArray } = require(`graphql-skip-limit`)

jest.mock(`../node-tracking`, () => {
  return {
    trackInlineObjectsInRootNode: () => jest.fn(),
  }
})

jest.mock(`../../redux/actions/add-page-dependency`, () => {
  return {
    createPageDependency: jest.fn(),
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

jest.mock(`../../redux`, () => {
  return {
    getNode: id => mockNodes.find(node => node.id === id),
  }
})

describe(`run-sift`, () => {
  const typeName = `test`
  const type = new GraphQLObjectType({
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
      const args = {
        filter: {
          id: { eq: `id_2` },
        },
      }

      const resultSingular = await runSift({
        type,
        nodes,
        typeName,
        args,
        connection: false,
      })

      const resultConnection = await runSift({
        type,
        nodes,
        typeName,
        args,
        connection: true,
      })
      delete resultConnection.totalCount

      expect(resultSingular).toEqual(nodes[1])
      expect(resultConnection).toEqual(connectionFromArray([nodes[1]], args))
    })

    it(`non-eq operator`, async () => {
      const args = {
        filter: {
          id: { ne: `id_2` },
        },
      }

      const resultSingular = await runSift({
        type,
        nodes,
        typeName,
        args,
        connection: false,
      })

      const resultConnection = await runSift({
        type,
        nodes,
        typeName,
        args,
        connection: true,
      })
      delete resultConnection.totalCount

      expect(resultSingular).toEqual(nodes[0])
      expect(resultConnection).toEqual(
        connectionFromArray([nodes[0], nodes[2]], args)
      )
    })
  })
})
