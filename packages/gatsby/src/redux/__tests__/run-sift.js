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
  },
  {
    id: `id_2`,
    string: `bar`,
  },
  {
    id: `id_3`,
    string: `baz`,
  },
  {
    id: `id_4`,
    string: `qux`,
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
    getNodesByType: () => mockNodes,
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
      expect(resultMany).toEqual([nodes[0], nodes[2], nodes[3]])
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
    })

    expect(results[0].id).toBe(`id_4`)
  })
})
