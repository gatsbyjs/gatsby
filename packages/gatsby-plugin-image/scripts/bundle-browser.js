const { bundleClientModule } = require(`../../../scripts/bundle-client-module`)

let watch = false

for (const arg of process.argv.slice(2)) {
  const [flagKey, value] = arg.split(`=`)
  switch (flagKey) {
    case `--watch`:
      watch = value
      break
  }
}

const modules = [
  {
    format: `cjs`,
    output: `dist/gatsby-image.browser.js`,
  },
  {
    format: `es`,
    output: `dist/gatsby-image.browser.modern.js`,
  }
]

for (const { format, output } of modules) {
  bundleClientModule({
    input: `src/index.browser.ts`,
    output,
    format,
    watch,
    jsxFragment: `React.Fragment`,
    define: `SERVER=false`,
  })
}

