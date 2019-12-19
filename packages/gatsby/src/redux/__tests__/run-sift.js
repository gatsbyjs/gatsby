if (!process.env.GATSBY_DB_NODES || process.env.GATSBY_DB_NODES === `redux`) {
  const { runSift } = require(`../run-sift`)
  const { store } = require(`../index`)
  const { actions } = require(`../actions`)
  const {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLID,
    GraphQLString,
    GraphQLList,
  } = require(`graphql`)

  const mockNodes = () => [
    {
      id: `id_1`,
      string: `foo`,
      internal: {
        type: `notTest`,
        contentDigest: `0`,
      },
    },
    {
      id: `id_2`,
      string: `bar`,
      internal: {
        type: `test`,
        contentDigest: `0`,
      },
    },
    {
      id: `id_3`,
      string: `baz`,
      internal: {
        type: `test`,
        contentDigest: `0`,
      },
    },
    {
      id: `id_4`,
      string: `qux`,
      internal: {
        type: `test`,
        contentDigest: `0`,
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

  beforeEach(() => {
    store.dispatch({ type: `DELETE_CACHE` })
    mockNodes().forEach(node =>
      actions.createNode(node, { name: `test` })(store.dispatch)
    )
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

        expect(resultSingular.map(o => o.id)).toEqual([mockNodes()[1].id])
        expect(resultMany.map(o => o.id)).toEqual([mockNodes()[1].id])
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

        expect(resultSingular.map(o => o.id)).toEqual([mockNodes()[2].id])
        expect(resultMany.map(o => o.id)).toEqual([
          mockNodes()[2].id,
          mockNodes()[3].id,
        ])
      })
      it(`return empty array in case of empty nodes`, async () => {
        const queryArgs = { filter: {}, sort: {} }
        const resultSingular = await runSift({
          gqlType,
          queryArgs,
          firstOnly: true,
          nodeTypeNames: [`NonExistentNodeType`],
        })
        expect(resultSingular).toEqual([])
      })
    })
  })
} else {
  it(`Loki skipping redux run-sift`, () => {
    expect(true).toEqual(true)
  })
}
