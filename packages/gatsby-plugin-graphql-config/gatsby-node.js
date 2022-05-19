"use strict";

exports.__esModule = true;
exports.onPostBootstrap = onPostBootstrap;

var fs = _interopRequireWildcard(require("fs-extra"));

var _path = require("path");

var _graphql = require("gatsby/graphql");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

async function cacheGraphQLConfig(program) {
  try {
    const base = program.directory;
    const configJSONString = JSON.stringify({
      schema: (0, _path.resolve)(base, `.cache/schema.graphql`),
      documents: [(0, _path.resolve)(base, `src/**/**.{ts,js,tsx,jsx,esm}`), (0, _path.resolve)(base, `.cache/fragments.graphql`)],
      extensions: {
        endpoints: {
          default: {
            url: `${program.https ? `https://` : `http://`}${program.host}:${program.port}/___graphql`
          }
        }
      }
    }, null, 2);
    fs.writeFileSync((0, _path.resolve)(base, `.cache`, `graphql.config.json`), configJSONString);
    console.log(`[gatsby-plugin-graphql-config] wrote config file to .cache`);
  } catch (err) {
    console.error(`[gatsby-plugin-graphql-config] failed to write config file to .cache`);
    console.error(err);
  }
}

const createFragmentCacheHandler = (cacheDirectory, store) => async () => {
  try {
    const currentDefinitions = store.getState().definitions;
    const fragmentString = Array.from(currentDefinitions.entries()).filter(([_, def]) => def.isFragment).map(([_, def]) => `# ${def.filePath}\n${def.printedAst}`).join(`\n`);
    await fs.writeFile((0, _path.join)(cacheDirectory, `fragments.graphql`), fragmentString);
    console.log(`[gatsby-plugin-graphql-config] wrote fragments file to .cache`);
  } catch (err) {
    console.error(`[gatsby-plugin-graphql-config] failed writing fragments file to .cache`);
    console.error(err);
  }
};

const cacheSchema = async (cacheDirectory, schema) => {
  try {
    console.log(`printing schema`);
    const schemaSDLString = (0, _graphql.printSchema)(schema, {
      commentDescriptions: true
    });
    await fs.writeFile((0, _path.join)(cacheDirectory, `schema.graphql`), schemaSDLString);
    console.log(`[gatsby-plugin-graphql-config] wrote SDL file to .cache`);
  } catch (err) {
    console.error(`[gatsby-plugin-graphql-config] failed writing schema file to .cache`);
    console.error(err);
  }
};

const createSchemaCacheHandler = (cacheDirectory, store) => async () => {
  const {
    schema
  } = store.getState();
  await cacheSchema(cacheDirectory, schema);
};

async function onPostBootstrap({
  store,
  emitter
}) {
  const {
    program,
    schema
  } = store.getState();
  const cacheDirectory = (0, _path.resolve)(program.directory, `.cache`);

  if (!fs.existsSync(cacheDirectory)) {
    return;
  } // cache initial schema


  await cacheSchema(cacheDirectory, schema); // cache graphql config file

  await cacheGraphQLConfig(program); // Important! emitter.on is an internal Gatsby API. It is highly discouraged to use in plugins and can break without a notice.
  // FIXME: replace it with a more appropriate API call when available.

  emitter.on(`SET_GRAPHQL_DEFINITIONS`, createFragmentCacheHandler(cacheDirectory, store));
  emitter.on(`SET_SCHEMA`, createSchemaCacheHandler(cacheDirectory, store));
}