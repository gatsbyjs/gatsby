const { bundleClientModule } = require(`../../../scripts/bundle-client-module`)

let key
let watch = false

for (const arg of process.argv.slice(2)) {
  const [flagKey, value] = arg.split(`=`)
  switch (flagKey) {
    case `--key`:
      key = value
      break
    case `--watch`:
      watch = value
      break
  }
}

const modules = {
  cjs: {
    input: `src/index-cjs.js`,
    output: `dist/index.js`,
    format: `cjs`,
    watch
  },
  esm: {
    input: `src/index.js`,
    output: `dist/index.modern.js`,
    format: `es`,
    watch
  }
}

bundleClientModule(modules[key])