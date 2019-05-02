// this is very hacky (don't hate me), but at least it's not in [JSFuck](http://www.jsfuck.com/)

const childProcess = require(`child_process`)

const originalConsoleError = console.error
const restoreConsoleError = () => {
  console.error = originalConsoleError
}

const handleMessage = msg => {
  if (msg.includes(`Incompatible library version: sharp.node requires`)) {
    restoreConsoleError()

    let msg = [`Gatsby specific instructions here\n`]

    try {
      // npm list seems to work in yarn installed projects as well
      const { dependencies } = JSON.parse(
        childProcess.execSync(`npm list sharp --json`, {
          encoding: `utf-8`,
        })
      )

      const findSharpVersion = dependency => {
        if (dependency.dependencies.sharp) {
          return dependency.dependencies.sharp.version
        }

        for (let depName of Object.keys(dependency.dependencies)) {
          const v = findSharpVersion(dependency.dependencies[depName])
          if (v) {
            return v
          }
        }

        return null
      }

      // list top level dependencies
      msg = msg.concat([
        `List of packages that depend on sharp:`,
        ...Object.keys(dependencies).map(depName => {
          const sharpVersion = findSharpVersion(dependencies[depName])
          return ` - ${depName}${sharpVersion ? ` (${sharpVersion})` : ``}`
        }),
      ])
    } catch {
      // wat
    }

    console.error(msg.join(`\n`))
  }
}

let sharp
try {
  // sharp@0.22.1 uses console.error and then process.exit and doesn't throw
  // so to capture error and provide meaningful troubleshooting guide
  // we intercept console.error calls and add special handling.
  console.error = (msg, ...args) => {
    originalConsoleError(msg, ...args)
    handleMessage(msg)
  }
  sharp = require(`sharp`)
} catch (e) {
  handleMessage(e.toString())
  throw e
} finally {
  restoreConsoleError()
}

module.exports = sharp
