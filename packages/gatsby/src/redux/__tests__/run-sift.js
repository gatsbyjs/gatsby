const runSift = require(`../run-sift`)
const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLList,
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
    internal: {
      type: `notTest`,
    },
  },
  {
    id: `id_2`,
    string: `bar`,
    internal: {
      type: `test`,
    },
  },
  {
    id: `id_3`,
    string: `baz`,
    internal: {
      type: `test`,
    },
  },
  {
    id: `id_4`,
    string: `qux`,
    internal: {
      type: `test`,
    },
    first: {
      willBeResolved: `willBeResolved`,
      second: [
        {
          willBeResolved: `willBeResolved`,
          third: {
            foo: `foo`,
          },
        },
      ],
    },
  },
]

jest.mock(`../../db/nodes`, () => {
  return {
    getNode: id => mockNodes.find(node => node.id === id),
    getNodesByType: type =>
      mockNodes.filter(node => node.internal.type === type),
  }
})

describe(`run-sift`, () => {
  const typeName = `test`
  const gqlType = new GraphQLObjectType({
    name: typeName,
    fields: () => {
      return {
        id: { type: new GraphQLNonNull(GraphQLID) },
        string: { type: GraphQLString },
        first: {
          type: new GraphQLObjectType({
            name: `First`,
            fields: {
              willBeResolved: {
                type: GraphQLString,
                resolve: () => `resolvedValue`,
              },
              second: {
                type: new GraphQLList(
                  new GraphQLObjectType({
                    name: `Second`,
                    fields: {
                      willBeResolved: {
                        type: GraphQLString,
                        resolve: () => `resolvedValue`,
                      },
                      third: new GraphQLObjectType({
                        name: `Third`,
                        fields: {
                          foo: GraphQLString,
                        },
                      }),
                    },
                  })
                ),
              },
            },
          }),
        },
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
        nodeTypeNames: [gqlType.name],
      })

      const resultMany = await runSift({
        gqlType,
        queryArgs,
        firstOnly: false,
        nodeTypeNames: [gqlType.name],
      })

      expect(resultSingular).toEqual([nodes[1]])
      expect(resultMany).toEqual([nodes[1]])
    })

    it(`eq operator honors type`, async () => {
      const queryArgs = {
        filter: {
          id: { eq: `id_1` },
        },
      }

      const resultSingular = await runSift({
        gqlType,
        queryArgs,
        firstOnly: true,
        nodeTypeNames: [gqlType.name],
      })

      const resultMany = await runSift({
        gqlType,
        queryArgs,
        firstOnly: false,
        nodeTypeNames: [gqlType.name],
      })

      // `id-1` node is not of queried type, so results should be empty
      expect(resultSingular).toEqual([])
      expect(resultMany).toEqual(null)
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
        nodeTypeNames: [gqlType.name],
      })

      const resultMany = await runSift({
        gqlType,
        queryArgs,
        firstOnly: false,
        nodeTypeNames: [gqlType.name],
      })

      expect(resultSingular).toEqual([nodes[2]])
      expect(resultMany).toEqual([nodes[2], nodes[3]])
    })
  })

  it(`resolves fields before querying`, async () => {
    const queryArgs = {
      filter: {
        first: {
          willBeResolved: { eq: `resolvedValue` },
          second: {
            elemMatch: {
              willBeResolved: { eq: `resolvedValue` },
              third: {
                foo: { eq: `foo` },
              },
            },
          },
        },
      },
    }

    const results = await runSift({
      gqlType,
      queryArgs,
      firstOnly: true,
      nodeTypeNames: [gqlType.name],
    })

    expect(results[0].id).toBe(`id_4`)
  })
})
