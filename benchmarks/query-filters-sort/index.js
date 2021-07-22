const { GraphQLEngine } = require(`./.cache/query-engine`)

const engine = new GraphQLEngine({
  dbPath: process.cwd() + `/.cache/data/datastore`,
})

async function run() {
  const result = await engine.runQuery(`
    {
      allTest( limit: 100) {
        nodes {
          nodeNum
          text
        }
        totalCount
      }
    }
  `)
  console.log(result)
}

run()
