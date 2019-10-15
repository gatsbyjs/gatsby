if (process.env.GATSBY_DB_NODES === `loki`) {
  const _ = require(`lodash`)
  const { GraphQLObjectType } = require(`graphql`)
  const { store } = require(`../../../redux`)
  const runQuery = require(`../nodes-query`)
  const { getNodeTypeCollection } = require(`../nodes`)
  const lokiDb = require(`../index`)

  function makeNodes() {
    return [
      {
        id: `1`,
        internal: { type: `Test` },
        children: [],
        foo: `bar`,
      },
    ]
  }

  async function runQueries(nodes, n) {
    for (const node of nodes) {
      store.dispatch({ type: `CREATE_NODE`, payload: node })
    }
    const gqlType = new GraphQLObjectType({
      name: `Test`,
      fields: {
        foo: { type: `String` },
      },
    })
    const queryArgs = { filter: { foo: { eq: `bar` } } }
    const args = { gqlType, queryArgs, nodeTypeNames: [gqlType.name] }
    return await Promise.all(_.map(new Array(n), () => runQuery(args)))
  }

  describe(`query indexing`, () => {
    beforeEach(async () => {
      await lokiDb.start()
      store.dispatch({ type: `DELETE_CACHE` })
    })
    it(`does not create index when query run 1 time`, async () => {
      await runQueries(makeNodes(), 1)
      const coll = getNodeTypeCollection(`Test`)
      expect(coll.binaryIndices.hasOwnProperty(`foo`)).toEqual(false)
    })

    it(`creates index when query run 5 times`, async () => {
      await runQueries(makeNodes(), 5)
      const coll = getNodeTypeCollection(`Test`)
      expect(coll.binaryIndices.hasOwnProperty(`foo`)).toEqual(true)
    })
  })
} else {
  it(`skipping loki nodes-query-test`, () => {
    expect(true).toEqual(true)
  })
}
