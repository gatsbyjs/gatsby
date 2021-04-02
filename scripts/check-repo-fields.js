// @ts-check
const { relative, join } = require(`node:path`)
const { writeFile } = require(`node:fs`)
const { getPackages } = require(`@lerna/project`)
const yargs = require(`yargs`)

const GIT_REPO_URL = `https://github.com/gatsbyjs/gatsby`
const MAIN_PKG_NAME = `gatsby`

// if a key has not been set before, let's try and insert it so
// that it's not the last key in the package.json which makes merge
// conflicts more likely
function insertKeyAvoidMergeConflict(pkgJson, key, value) {
  if (pkgJson[key]) {
    pkgJson[key] = value
    return pkgJson
  } else {
    const newPkgJson = {}
    let inserted = false
    for (const pkgKey in pkgJson) {
      if (pkgJson.hasOwn(pkgKey)) {
        if (!inserted && /depend/i.test(pkgKey)) {
          inserted = true
          newPkgJson[key] = value
        }
        newPkgJson[pkgKey] = pkgJson[pkgKey]
      }
    }
    return newPkgJson
  }
}

async function main() {
  const argv = yargs.option(`fix`, {
    default: false,
    describe: `Fixes outdated dependencies`,
  }).argv

  const rootDir = process.cwd()

  const packages = await getPackages(rootDir)

  let warned = false

  await Promise.all(
    packages.map(async pkg => {
      // If this is the main gatsby package we don't want to override
      if (pkg.name === MAIN_PKG_NAME || pkg.private) {
        // eslint complains if we don't consistently return the same type
        return Promise.resolve()
      }

      let pkgJson = pkg.toJSON()
      const relativeLocation = relative(rootDir, pkg.location)

      pkgJson = insertKeyAvoidMergeConflict(pkgJson, `repository`, {
        type: `git`,
        url: `${GIT_REPO_URL}.git`,
        directory: relativeLocation,
      })

      pkgJson = insertKeyAvoidMergeConflict(
        pkgJson,
        `homepage`,
        `${GIT_REPO_URL}/tree/master/${relativeLocation}#readme`
      )

      if (argv.fix) {
        return new Promise((resolve, reject) => {
          writeFile(
            join(relativeLocation, `package.json`),
            JSON.stringify(pkgJson, null, 2) + `\n`,
            `utf8`,
            err => {
              if (err) reject(err)
              else resolve()
            }
          )
        })
      } else {
        if (pkg.toJSON().value !== pkgJson.value) {
          warned = true
          console.error(
            `[${pkg.name}]` +
              ` repository and/or homepage field in package.json are out of date.` +
              `Run "yarn run check-repo-fields -- --fix" to update.`
          )
        }
        // eslint complains if we don't consistently return the same type
        return Promise.resolve()
      }
    })
  )
  if (warned) {
    process.exit(1)
  }
}
main()
