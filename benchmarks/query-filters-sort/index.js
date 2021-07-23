const { GraphQLEngine } = require(`./.cache/query-engine`)

const engine = new GraphQLEngine({
  dbPath: process.cwd() + `/.cache/data/datastore`,
})

async function run() {
  const query = `
    {
      allTest( limit: 15, filter: { nodeNum: { gt: 5 }}) {
        nodes {
          nodeNum
          text
        }
        totalCount
      }
    }
  `
  const result = await engine.runQuery(query)
  console.log(
    require(`util`).inspect(
      { query, ...result },
      { depth: Infinity, color: true }
    )
  )
}

run()
