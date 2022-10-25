const microbundle = require(`microbundle`)
const prependDirective = require(`prepend-directive`)

/**
 * Extension of microbundle since we need to prepend a directive to client modules in build and watch mode.
 */

let input
let output
let format
let compress = true
let watch = false

for (const arg of process.argv.slice(2)) {
  const [key, value] = arg.split(`=`)
  switch (key) {
    case `--input`:
      input = value
      break
    case `--output`:
      output = value
      break
    case `--format`:
      format = value
      break
    case `--watch`:
      watch = value === `true` || value === `1`
      break
    case `--compress`:
      compress = value === `true` || value === `1`
      break
  }
}

if (!input || !output || !format) {
  throw new Error(
    `Missing some arguments, "--input", "--output" and "--format" are required`
  )
}

async function bundleClientPackages() {
  const options = {
    output,
    format,
    compress,
    watch,
    cwd: process.cwd(),
    jsx: `React.createElement`,
    generateTypes: false,
    // Used only when watch mode is enabled
    onBuild: () => {
      prependDirective({
        directive: `use client`,
        files: [output],
      })
    },
  }

  if (input) {
    options.input = input
  }

  await microbundle(options)

  if (!watch) {
    prependDirective({
      directive: `use client`,
      files: [output],
    })
  }
}

bundleClientPackages()
