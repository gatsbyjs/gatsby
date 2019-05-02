// this is very hacky (don't hate me), but at least it's not in [JSFuck](http://www.jsfuck.com/)

const childProcess = require(`child_process`)
const semver = require(`semver`)

const originalConsoleError = console.error
const restoreConsoleError = () => {
  console.error = originalConsoleError
}

const handleMessage = msg => {
  if (msg.includes(`Incompatible library version: sharp.node requires`)) {
    restoreConsoleError()

    let msg = [
      `It looks like there are multiple versions of "sharp" module installed.`,
      `Please update packages that depend on "sharp".`,
      ``,
    ]

    try {
      let tmpMsg = []
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

      const { latestVersion, topLevelPackages } = Object.keys(
        dependencies
      ).reduce(
        (acc, depName) => {
          const sharpVersion = findSharpVersion(dependencies[depName])
          if (sharpVersion) {
            acc.topLevelPackages[depName] = sharpVersion

            if (
              !acc.latestVersion ||
              semver.gt(sharpVersion, acc.latestVersion)
            ) {
              acc.latestVersion = sharpVersion
            }
          }

          return acc
        },
        {
          latestVersion: undefined,
          topLevelPackages: {},
        }
      )

      let packagesToUpdate = []
      // list top level dependencies
      tmpMsg = tmpMsg.concat([
        `List of installed packages that depend on sharp:`,
        ...Object.keys(topLevelPackages).map(depName => {
          const sharpVersion = topLevelPackages[depName]
          if (sharpVersion !== latestVersion) {
            packagesToUpdate.push(depName)
          }
          return ` - ${depName}${
            sharpVersion
              ? ` (${sharpVersion})${
                  sharpVersion !== latestVersion ? ` - needs update` : ``
                }`
              : ``
          }`
        }),
      ])

      if (packagesToUpdate.length > 0) {
        tmpMsg = tmpMsg.concat([
          ``,
          `If you are using npm, run:`,
          ``,
          `npm install ${packagesToUpdate.join(` `)}`,
          ``,
          `If you are using yarn, run:`,
          ``,
          `yarn add ${packagesToUpdate.join(` `)}`,
        ])
      }

      msg = msg.concat(tmpMsg)
    } catch {
      msg = msg.concat([
        `To get list of installed packages that depend on sharp try running:`,
        ` - npm list sharp (if you use npm)`,
        ` - yarn why sharp (if you use yarn)`,
        ` and update packages that depend on version older than latest listed in output of above command.`,
      ])
    }

    msg = msg.concat([
      ``,
      `If after updating packages, older version of "sharp" is still showing up, please contact package maintainer and request updating "sharp" dependency.`,
    ])

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
