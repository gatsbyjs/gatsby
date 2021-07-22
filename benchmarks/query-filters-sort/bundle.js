const {
  createGraphqlEngineBundle,
} = require(`gatsby/dist/schema/graphql-engine/bundle`)

async function run() {
  await createGraphqlEngineBundle()
}

run()
