const {
  createGraphqlEngineBundle,
} = require(`gatsby/dist/schema/graphql-engine/bundle`);

// just for debugging dep tree
const fs = require(`fs-extra`);
const v8 = require(`v8`);

async function run() {
  const out = await createGraphqlEngineBundle();
  await fs.outputFile(`dep-tree.json`, v8.serialize(out));
}

run();
