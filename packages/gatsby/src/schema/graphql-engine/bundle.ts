import * as path from "path"
const rollup = require(`rollup`)
import replace from "@rollup/plugin-replace"
import * as fs from "fs-extra"

const outputOptions = {
  // core output options
  // dir,
  file: path.join(process.cwd(), `.cache`, `query-engine.js`),
  format: `cjs`, // required
  // globals,
  // name,
  // plugins,

  // advanced output options
  // assetFileNames,
  // banner,
  // chunkFileNames,
  // compact,
  // entryFileNames,
  // extend,
  // externalLiveBindings,
  // footer,
  // hoistTransitiveImports,
  // inlineDynamicImports,
  // interop,
  // intro,
  // manualChunks,
  // minifyInternalExports,
  // outro,
  // paths,
  // preserveModules,
  // preserveModulesRoot,
  // sourcemap,
  // sourcemapExcludeSources,
  // sourcemapFile,
  // sourcemapPathTransform,
  // validate,

  // danger zone
  // amd,
  // esModule,
  // exports,
  // freeze,
  // indent,
  // namespaceToStringTag,
  // noConflict,
  // preferConst,
  // sanitizeFileName,
  // strict,
  // systemNullSetters,
}

export async function createGraphqlEngineBundle(): Promise<void> {
  const schemaSnapshotString = await fs.readFile(
    process.cwd() + `/.cache/schema.gql`,
    `utf-8`
  )

  const inputOptions = {
    // core input options
    // external,
    input: path.join(__dirname, `entry.js`), // conditionally required
    plugins: [
      replace({
        values: {
          SCHEMA_SNAPSHOT: JSON.stringify(schemaSnapshotString),
        },
      }),
    ],

    // advanced input options
    // cache,
    // onwarn,
    // preserveEntrySignatures,
    // strictDeprecations,

    // danger zone
    // acorn,
    // acornInjectPlugins,
    // context,
    // moduleContext,
    // preserveSymlinks,
    // shimMissingExports,
    // treeshake,

    // experimental
    // experimentalCacheExpiry,
    // perf,
  }

  const bundle = await rollup.rollup(inputOptions)

  console.log(bundle.watchFiles) // an array of file names this bundle depends on

  console.log({ outputOptions })

  // generate output specific code in-memory
  // you can call this function multiple times on the same bundle object
  const { output } = await bundle.write(outputOptions)

  // bundle.

  console.log({ output })
}
