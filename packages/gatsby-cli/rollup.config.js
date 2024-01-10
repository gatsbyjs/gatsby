import resolve from "@rollup/plugin-node-resolve"
import babel from "@rollup/plugin-babel"
import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import replace from "@rollup/plugin-replace";
import autoExternal from "rollup-plugin-auto-external"
import internal from "rollup-plugin-internal"

import path from "path"

// Rollup hoists Ink's dynamic require of react-devtools-core which causes
// a window not found error so we exclude Ink's devtools file for now.
function excludeDevTools() {
  const re = /ink/
  return {
    name: `ignoreDevTools`,

    load(id) {
      if (id.match(re)) {
        if (path.parse(id).name === `devtools`) {
          return { code: `` }
        }
      }
    },
  }
}

const extensions = [`.mjs`, `.js`, `.json`, `.node`, `.ts`, `.tsx`]

export default {
  input: `src/reporter/loggers/ink/index.tsx`,
  output: {
    file: `lib/reporter/loggers/ink/index.js`,
    format: `cjs`,
  },
  cache: false,
  plugins: [
    replace({
      values: {
        "process.env.NODE_ENV": JSON.stringify(`production`)
      }
    }),
    excludeDevTools(),
    json(),
    babel({
      extensions,
      babelHelpers: `bundled`,
      skipPreflightCheck: true,
      exclude: `node_modules/**`,
      babelrc: false,
      presets: [
        [
          "@babel/env",
          {
            "modules": false,
            "shippedProposals": true,
            "targets": { "node": "18.0.0" }
          }
        ],
        "@babel/preset-react"
      ],
      plugins: ["@babel/plugin-transform-runtime", "@sigmacomputing/babel-plugin-lodash"],
      overrides: [
        {
          "test": ["**/*.ts", "**/*.tsx"],
          "plugins": [["@babel/plugin-transform-typescript", { "isTSX": true }]]
        }
      ]
    }),
    resolve({
      extensions,
      dedupe: [ `react`, `ink` ]
    }),
    commonjs(),
    autoExternal(),
    internal([
      `react`,
      `ink`,
      `ink-spinner`
    ]),
  ],
  external: [
    `yoga-layout-prebuilt`,
    // Next one deserve explanation: ... it's because ink logger imports
    // getStore, onLogAction from higher up (../../redux). But we don't want
    // two copies of it - one bundled and one not, because it would result
    // in multiple store copies
    `../../redux`
  ]
}
