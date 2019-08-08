if (process.env.GATSBY_DB_NODES === `redux`) {
  const runSift = require(`../run-sift`)
  const {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLID,
    GraphQLString,
    GraphQLList,
  } = require(`graphql`)

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

        expect(resultSingular).toEqual([nodes[2]])
        expect(resultMany).toEqual([nodes[2], nodes[3]])
      })
    })

    // This is now done on node-model layer
    it.skip(`resolves fields before querying`, async () => {
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
}
