const fs = require(`fs-extra`)
const _ = require(`lodash`)
const { getMonorepoPackageJsonPath } = require(`./utils`)
const request = require(`request`)

function difference(object, base) {
  function changes(object, base) {
    return _.transform(object, function(result, value, key) {
      if (!_.isEqual(value, base[key])) {
        result[key] =
          _.isObject(value) && _.isObject(base[key])
            ? changes(value, base[key])
            : value
      }
    })
  }
  return changes(object, base)
}

const checkDepsChanges = async ({
  newPath,
  packageName,
  root,
  isInitialScan,
  ignoredPackageJSON,
}) => {
  const monoRepoPackageJsonPath = getMonorepoPackageJsonPath({
    packageName,
    root,
  })
  const monorepoPKGjsonString = fs.readFileSync(
    monoRepoPackageJsonPath,
    `utf-8`
  )
  const monorepoPKGjson = JSON.parse(monorepoPKGjsonString)
  if (ignoredPackageJSON.has(packageName)) {
    if (ignoredPackageJSON.get(packageName).includes(monorepoPKGjsonString)) {
      // we are in middle of publishing and content of package.json is one set during publish process,
      // so we need to not cause false positives
      return false
    }
  }

  let localPKGjson
  try {
    localPKGjson = JSON.parse(fs.readFileSync(newPath))
  } catch {
    // there is no local package - so we still need to install deps
    // this is nice because devs won't need to do initial package installation - we can handle this.
    if (isInitialScan) {
      // if package is not installed, we will do http GET request to
      // unkpg to check if dependency in package published in public
      // npm repository are different

      // this allow us to not publish to local repository
      // and save some time/work

      try {
        localPKGjson = await new Promise((resolve, reject) => {
          request(`https://unpkg.com/${packageName}/package.json`, function(
            error,
            response,
            body
          ) {
            if (response && response.statusCode === 200) {
              resolve(JSON.parse(body))
              return
            }

            reject(error)
          })
        })
      } catch {
        console.log(
          `'${packageName}' doesn't seem to be installed. Will publish it`
        )
        return true
      }
    } else {
      console.log(
        `'${packageName}' doesn't seem to be installed. Restart gatsby-dev to publish it`
      )
      return false
    }
  }

  const areDepsEqual = _.isEqual(
    monorepoPKGjson.dependencies,
    localPKGjson.dependencies
  )

  if (!areDepsEqual) {
    const diff = difference(
      monorepoPKGjson.dependencies,
      localPKGjson.dependencies
    )

    const diff2 = difference(
      localPKGjson.dependencies,
      monorepoPKGjson.dependencies
    )

    let needPublishing = false
    let isPublishing = false
    const depChangeLog = _.uniq(Object.keys({ ...diff, ...diff2 }))
      .reduce((acc, key) => {
        if (monorepoPKGjson.dependencies[key] === `gatsby-dev `) {
          // if we are in middle of publishing to local repository - ignore
          isPublishing = true
          return acc
        }

        if (localPKGjson.dependencies[key] === `gatsby-dev`) {
          // monorepo packages will restore version, but after installation
          // in local site - it will use `gatsby-dev` dist tag - we need
          // to ignore changes that
          return acc
        }

        if (
          localPKGjson.dependencies[key] &&
          monorepoPKGjson.dependencies[key]
        ) {
          acc.push(
            ` - '${key}' changed version from ${
              localPKGjson.dependencies[key]
            } to ${monorepoPKGjson.dependencies[key]}`
          )
          needPublishing = true
        } else if (monorepoPKGjson.dependencies[key]) {
          acc.push(` - '${key}@${monorepoPKGjson.dependencies[key]}' was added`)
          needPublishing = true
        } else {
          acc.push(` - '${key}@${localPKGjson.dependencies[key]}' was removed`)
          // this doesn't need publishing really, so will skip this
        }
        return acc
      }, [])
      .join(`\n`)

    if (!isPublishing && depChangeLog.length > 0) {
      console.log(
        `Dependencies of '${packageName}' changed:\n${depChangeLog}\n`
      )
      if (isInitialScan) {
        console.log(
          `Will ${!needPublishing ? `not ` : ``} publish to local npm registry.`
        )
      } else {
        console.warn(
          `Installation of depenencies after initial scan is not implemented`
        )
      }
      return needPublishing
    }
  }
  return false
}

exports.checkDepsChanges = checkDepsChanges
