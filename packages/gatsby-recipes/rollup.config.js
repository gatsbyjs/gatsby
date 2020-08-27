import resolve from "@rollup/plugin-node-resolve"
import babel from "@rollup/plugin-babel"
import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import autoExternal from "rollup-plugin-auto-external"
import internal from "rollup-plugin-internal"
import path from "path"

// Rollup hoists Ink's dynamic require of react-devtools-core which causes
// a window not found error so we exclude Ink's devtools file for now.
function excludeDevTools() {
  const re = /ink/
  return {
    name: "ignoreDevTools",

    load(id) {
      if (id.match(re)) {
        if (path.parse(id).name === `devtools`) {
          return { code: `` }
        }
      }
    },
  }
}

export default {
  input: "src/index.js",
  output: {
    file: "dist/index.js",
    format: "cjs",
  },
  plugins: [
    excludeDevTools(),
    json(),
    babel({
      babelHelpers: "runtime",
      skipPreflightCheck: true,
      exclude: "node_modules/**",
    }),
    resolve(),
    commonjs(),
    autoExternal(),
    internal([
      "ink",
      "ink-select-input",
      "ink-spinner",
      "terminal-link",
      "react-reconcilier",
      "@mdx-js/react",
      "@mdx-js/mdx",
      "@mdx-js/runtime"
    ]),
  ],
  external: [
    `yoga-layout-prebuilt`,
    `ws`,
    `urql`,
    `node-fetch`,
    `react`,
    `react-devtools-core`,
    `graphql-server`,
  ],
}
