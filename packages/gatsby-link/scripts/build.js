const { bundleClientModule } = require(`../../../scripts/bundle-client-module`)

let watch = false

for (const arg of process.argv.slice(2)) {
  const [key, value] = arg.split(`=`)
  switch (key) {
    case `--watch`:
      watch = value
      break
  }
}

const modules = [
  {
    input: `src/index-cjs.js`,
    output: `dist/index.js`,
    format: `cjs`,
    watch
  },
  {
    input: `src/index.js`,
    output: `dist/index.modern.mjs`,
    format: `es`,
    watch
  }
]

for (const module of modules) {
  bundleClientModule(module)
}