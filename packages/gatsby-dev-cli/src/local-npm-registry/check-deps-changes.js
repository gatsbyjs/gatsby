const fs = require(`fs-extra`)
const _ = require(`lodash`)
const { getMonorepoPackageJsonPath } = require(`./utils`)

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

const checkDepsChanges = ({ newPath, packageName, root, isInitialScan }) => {
  const monoRepoPackageJsonPath = getMonorepoPackageJsonPath({
    packageName,
    root,
  })
  const monorepoPKGjson = JSON.parse(fs.readFileSync(monoRepoPackageJsonPath))

  let localPKGjson
  try {
    localPKGjson = JSON.parse(fs.readFileSync(newPath))
  } catch {
    // caught if there is no local package - so we still need to install deps
    // this is nice because devs won't need to do initial package installation - we can handle this.
    console.log(
      `'${packageName}' doesn't seem to be installed. Will install it`
    )
    return true
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
    const depChangeLog = _.uniq(Object.keys({ ...diff, ...diff2 }))
      .reduce((acc, key) => {
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

    console.log(`Dependencies of '${packageName}' changed:\n${depChangeLog}\n`)
    if (isInitialScan) {
      console.log(
        `Will ${!needPublishing ? `not ` : ``} publish to local npm registry.`
      )
    }
    return needPublishing
  }
  return false
}

exports.checkDepsChanges = checkDepsChanges
