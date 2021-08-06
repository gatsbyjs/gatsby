/* eslint-disable @typescript-eslint/naming-convention */

import * as path from "path"
const rollup = require(`rollup`)
import replace from "@rollup/plugin-replace"
import * as fs from "fs-extra"

import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import { visualizer } from "rollup-plugin-visualizer"
import nativePlugin from "rollup-plugin-natives"

import moduleModule from "module"

const { builtinModules, createRequire } = moduleModule

const outputDir = path.join(process.cwd(), `.cache`, `query-engine`)

const outputOptions = {
  file: path.join(outputDir, `index.js`),
  format: `cjs`, // required
  strict: false, // lmdb-store is not strict :(
}

const extensions = [`.mjs`, `.js`, `.json`, `.node`, `.ts`, `.tsx`]

const allowedPackages = [
  `gatsby`, // def want to bundle whatever `gatsby` internals we use

  `@babel/runtime`, // for transpiled packages

  // for reporter
  `gatsby-cli`,
  `convert-hrtime`,
  `progress`,
  `yurnalist`,
  `pretty-error`,
  `chalk`,
  `ansi-styles`,
  `renderkid`, // dep of pretty-error
  `css-select`, // dep of renderkid
  `is-ci`, // shimmed
  `source-map`,
  `supports-color`,

  // for jobs
  `p-defer`,

  // graphql eco
  `graphql`,
  `graphql-compose`,
  `graphql-type-json`,

  `lodash`, // everywhere
  `bluebird`, // everywhere
  `gatsby-worker`, // shimmed
  `cache-manager`, // shimmed as we use LMDB anyway and that wouldn't be used
  `lru-cache`, // shimmed
  `webpack-merge`, // shimmed
  `invariant`, // used by gatsby somewhere - seems small
  `moment`, // ... used by gatsby for Date related resolvers :S
  `true-case-path`, // shimmed
  `fs-extra`, // everywhere, tho we probably shouldn't need this at all (maybe refactor could get rid of this)
  `graceful-fs`, // dep of fs-extra

  // schema building uses redux, query execution uses it - bundling for now, but would be nice to untangle it at some point
  `redux`,
  `redux-thunk`,

  `@babel/code-frame`, // used in couple places ...
  `@babel/highlight`, // dep of @babel/code-grame
  `@babel/helper-validator-identifier`, // dep of @babel/highlight

  `uuid`, // use to generate uuid for activities and jobs

  // used for node,page,config validation (that could be skipped/shimmed as it won't be used), but also to validate structured error (maybe we could just shim there to always pass validation without doing validation)
  // below `joi` are its deps
  `joi`,
  `@hapi/hoek`,
  `@hapi/topo`,
  `@sideway/address`,
  `@sideway/formula`,
  `@sideway/pinpoint`,

  `opentracing`, // shimmed
  `glob`,

  `lmdb-store-0.9`, // shimmed
  `cbor-x`, // shimmed
]

const skipDedupe = [`joi`, `@hapi/topo`]

const forSureExternals = [
  // https://github.com/rollup/rollup/issues/1507#issuecomment-340550539
  `readable-stream`,
  `readable-stream/transform`,
  ...builtinModules,
]

export async function createGraphqlEngineBundle(): Promise<any> {
  const schemaSnapshotString = await fs.readFile(
    process.cwd() + `/.cache/schema.gql`,
    `utf-8`
  )

  const inputOptions = {
    external: (id: string): boolean => {
      const match = id.match(/node_modules[\\/](.+)$/)
      if (match && Array.isArray(match) && match.length >= 2) {
        // const pkgName = match[1]

        for (const external of forSureExternals) {
          if (id.includes(path.join(`node_modules`, external) + path.sep)) {
            // console.log(`marking ${id} as internal (because "${allowed}")`)
            return true
          }
        }

        for (const allowed of allowedPackages) {
          if (id.includes(path.join(`node_modules`, allowed) + path.sep)) {
            // console.log(`marking ${id} as internal (because "${allowed}")`)
            return false
          }
        }
      }

      return false
    },
    input: path.join(__dirname, `entry.js`), // conditionally required
    plugins: [
      replace({
        values: {
          SCHEMA_SNAPSHOT: JSON.stringify(schemaSnapshotString),
          "process.env.GATSBY_EXPERIMENTAL_LMDB_STORE": `true`,
          "process.env.GATSBY_LOGGER": JSON.stringify(`yurnalist`),

          // https://github.com/rollup/rollup/issues/1507#issuecomment-340550539
          "require('readable-stream/transform')": `require('stream').Transform`,
          'require("readable-stream/transform")': `require("stream").Transform`,
          "readable-stream": `stream`,

          // silly glob - https://github.com/isaacs/node-glob/pull/438
          "var Glob = require('./glob.js').Glob": ``,

          "require.resolve('./dict/dict.txt')": `__dirname + '/dict/dict.txt'`, // transform so next replacement doesn't break this completely
          // require.resolve is not touched - I'm not sure how to handle it yet :/ but for demo we shouldn't need this code to function, just not to crash
          "require.resolve": ``,
          "process.env.GATSBY_SKIP_WRITING_SCHEMA_TO_FILE": `true`,
        },
        preventAssignment: true,
        // FIXME - replace plugin by default will not replace if we try to access something nested
        // (for example `process.env.GATSBY_LOGGER.includes('yurnalist')`). This pretty much disable
        // delimiters but it rather should be set to something correct
        // ref: https://github.com/rollup/plugins/tree/master/packages/replace#word-boundaries
        delimiters: [``, ``],
      }),
      {
        name: `null-and-shim-loader`,
        resolveId(source, importer): any {
          if (
            source === `babel-runtime/helpers/asyncToGenerator` &&
            importer &&
            importer.includes(`node_modules/yurnalist`)
          ) {
            return `null`
          }

          return null
        },
        load(id): any {
          if (id === `null`) {
            return { code: `` }
          }

          if (
            id === `electron` ||
            id === `electron?commonjs-external` ||
            id.includes(`electron`)
          ) {
            return { code: `export default null` }
          }

          if (id.includes(path.join(`loggers`, `ink`, `index.js`))) {
            return {
              code: `export function initializeINKLogger() {}; export default { initializeINKLogger }`,
            }
          }

          if (id.includes(`gatsby-worker`)) {
            return {
              code: `export function getMessenger() { return null }; export default { getMessenger }`,
            }
          }

          if (id.includes(`is-ci`)) {
            return {
              code: `export default true`,
            }
          }

          if (id.includes(`cache-manager`)) {
            return {
              code: `export default true`,
            }
          }

          if (id.includes(`webpack-merge`)) {
            return {
              code: `export default true`,
            }
          }

          if (id.includes(`true-case-path`)) {
            return {
              code: `export const trueCasePathSync = true; export default { trueCasePathSync } `,
            }
          }

          if (id.includes(`opentracing`)) {
            return {
              code: `export function globalTracer() { return { startSpan() { return { finish() {} } } } } ; export default {globalTracer}`,
            }
          }

          if (id.includes(`show-analytics-notification`)) {
            return {
              code: `export function showAnalyticsNotification() {} ; export default {showAnalyticsNotification}`,
            }
          }

          if (id.includes(`lmdb-store-0.9`)) {
            // https://github.com/DoctorEvidence/lmdb-store/blob/ab756d45e0e6b92542d9d8885ef783215c5368a6/util/upgrade-lmdb.js#L7
            return {
              code: `export default true`,
            }
          }

          if (id.includes(`cbor-x`)) {
            // https://github.com/DoctorEvidence/lmdb-store/blob/1df114fc8f59db6174fa32d35f7e79cf0e7e12ef/index.js#L211
            // we don't use it so shimming
            return {
              code: `export const Encoder = true; export default { Encoder }`,
            }
          }

          return null
        },
        transform(code, id): any {
          if (code.indexOf(`require('node-gyp-build')(__dirname)`) > -1) {
            // massage node-gyp-build to work with `rollup-plugin-natives` (it doesn't support node-gyp-build :()
            // we will just execute it at bundle time to find .node file to bundle

            const load = createRequire(id)(`node-gyp-build`)
            const dirname = path.dirname(id)
            const dotNodePath = `./${path.relative(
              dirname,
              load.path(dirname)
            )}`

            return code.replace(
              `require('node-gyp-build')(__dirname)`,
              `require('./${dotNodePath}')`
            )
          }
          return null
        },
        buildEnd(): any {
          // used when compression enabled for lmdb - https://github.com/DoctorEvidence/lmdb-store/blob/7eb1333bb40bb3e8438133b98896f9f5218ec3b3/README.md#compression
          // this is default dictionary that is read with `readFile`, so isn't auto-discovered by rollup
          fs.copySync(
            path.join(
              path.dirname(require.resolve(`lmdb-store`)),
              `dict/dict.txt`
            ),
            path.join(outputDir, `dict/dict.txt`)
          )
        },
      },
      json({ namedExports: false }),
      nativePlugin({
        copyTo: path.join(outputDir, `libs`),
        destDir: `./libs/`,
      }),
      resolve({
        // extensions,
        preferBuiltins: true,
        dedupe: allowedPackages.filter(
          pkgName => !skipDedupe.includes(pkgName)
        ),
      }),
      commonjs({
        extensions,
        transformMixedEsModules: true,
        requireReturnsDefault: id => {
          if (id && id.includes(path.join(`ci-info`, `vendors.json`))) {
            return true
          }
          return false
        },
        dynamicRequireTargets: [
          `**/node_modules/joi/lib/**/*.js`, // https://github.com/rollup/plugins/issues/731
        ],
      }),
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

  const { output } = await bundle.write(outputOptions)

  // console.log({
  //   imports: output[0].imports,
  //   unknownExternalImports: Array.from(unknownExternalImports).sort(),
  // })
  return { modulesMap, modules: output[0].modules }
}
