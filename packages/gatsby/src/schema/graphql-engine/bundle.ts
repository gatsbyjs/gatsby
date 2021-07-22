import * as path from "path"
const rollup = require(`rollup`)
import replace from "@rollup/plugin-replace"
import * as fs from "fs-extra"

import resolve from "@rollup/plugin-node-resolve"
import babel from "@rollup/plugin-babel"
import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import { visualizer } from "rollup-plugin-visualizer"
import autoExternal from "rollup-plugin-auto-external"
import internal from "rollup-plugin-internal"

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

const extensions = [`.mjs`, `.js`, `.json`, `.node`, `.ts`, `.tsx`]

export async function createGraphqlEngineBundle(): Promise<void> {
  const schemaSnapshotString = await fs.readFile(
    process.cwd() + `/.cache/schema.gql`,
    `utf-8`
  )

  const inputOptions = {
    // core input options
    // external: [`lmdb-store`, `yoga-layout-prebuilt`, `gatsby-cli`],
    external: id =>
      /node_modules/.test(id) && !/node_modules\/gatsby\//.test(id),
    input: path.join(__dirname, `entry.js`), // conditionally required
    plugins: [
      replace({
        values: {
          SCHEMA_SNAPSHOT: JSON.stringify(schemaSnapshotString),
        },
        preventAssignment: true,
      }),
      {
        name: `null-loader`,
        load(id): any {
          if (
            id === `electron` ||
            id === `electron?commonjs-external` ||
            id.includes(`electron`) ||
            id.includes(`yurnalist`) ||
            id.includes(`fetch-remote-file`)
          ) {
            console.log(`--- null-loading "${id}"`)
            return { code: `export default null` }
          }

          return null
        },
      },
      json({ namedExports: false }),
      // {
      //   name: `graphql-test`,
      //   resolveId(source, importer) {
      //     if (importer && importer.includes(`graphqlVersion`)) {
      //       debugger
      //     }

      //     console.log({ source, importer })

      //     if (source === `../graphql`) {
      //       debugger
      //     }
      //   },
      // },
      resolve({
        // extensions,
        preferBuiltins: true,
      }),
      commonjs({
        extensions,
        transformMixedEsModules: true,
        requireReturnsDefault: id => {
          // console.log(`requireReturnsDefault`, { id })
          if (id && id.includes(`ci-info/vendors.json`)) {
            return true
          }
          return false
        },
      }),
      // autoExternal({
      //   packagePath: path.resolve("./node_modules/gatsby/package.json"),
      // }),
      visualizer(),
    ],

    // advanced input options
    // cache,
    // onwarn,
    // onwarn({ loc, frame, message }) {
    //   if (loc) {
    //     console.warn(`${loc.file} (${loc.line}:${loc.column}) ${message}`)
    //     if (frame) console.warn(frame)
    //   } else {
    //     console.warn(message)
    //   }
    // },
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

  const modulesMap = bundle.cache.modules.reduce((acc, o) => {
    acc[o.id] = o
    return acc
  }, {})

  for (const mod of bundle.cache.modules) {
    mod.depModules = {}
    for (const dep of mod.dependencies) {
      const depModule = modulesMap[dep]

      if (!depModule) {
        // throw new Error(`"${dep}" is not in module map`)
        continue
      }

      mod.depModules[dep] = depModule

      if (!depModule.dependants) {
        depModule.dependants = []
        depModule.dependantModules = {}
      }

      depModule.dependants.push(mod.id)
      depModule.dependantModules[mod.id] = mod
    }
  }

  // console.log(bundle.watchFiles) // an array of file names this bundle depends on

  // console.log({ outputOptions })

  // generate output specific code in-memory
  // you can call this function multiple times on the same bundle object
  const { output } = await bundle.write(outputOptions)
  // bundle.

  console.log({ imports: output[0].imports })
  debugger
}
