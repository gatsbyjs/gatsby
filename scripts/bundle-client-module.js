const microbundle = require(`microbundle`)
const { prependDirective } = require(`./prepend-directive`)

/**
 * Base config for bundling client modules.
 */
async function bundleClientModule(args) {
  const { input, output, format, watch = false } = args || {}

  if (!input || !output || !format) {
    throw new Error(
      `Missing some arguments, "input", "output" and "format" are required`
    )
  }

  try {
    await microbundle({
      compress: !watch,
      cwd: process.cwd(),
      jsx: `React.createElement`,
      generateTypes: false,
      // Used only when watch mode is enabled
      onBuild: () => {
        prependDirective({
          directive: `client export`,
          files: [output],
        })
      },
      ...args,
    })

    if (!watch) {
      prependDirective({
        directive: `client export`,
        files: [output],
      })
    }
  } catch (cause) {
    throw new Error(`Failed to bundle client module`, { cause })
  }
}

module.exports = {
  bundleClientModule,
}
