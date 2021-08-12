import { buildDepTreeFromFiles } from "snyk-nodejs-lockfile-parser"
import crypto from "crypto"
import { getCache } from "../../utils/get-cache"
import fs from "fs-extra"
import path from "path"
import getDependenciesForLocalFile from "./get-dependencies-for-local-file"

const cache = getCache(`plugin-digest`)

// function isLocalPlugin(filePath: string): boolean {
// return filePath.slice(0, 1) === `.`
// }

type dependencies = Set<string>

let lockFileJson
let loadingLockFilePromise
async function loadLockFile(root, isYarn) {
  if (lockFileJson) {
    return lockFileJson
  } else if (!loadingLockFilePromise) {
    loadingLockFilePromise = new Promise(async resolve => {
      console.time(`load lock file`)
      lockFileJson = await buildDepTreeFromFiles(
        root,
        `package.json`,
        isYarn ? `yarn.lock` : `package-lock.json`
      )
      console.timeEnd(`load lock file`)
      resolve(lockFileJson)
    })

    return loadingLockFilePromise
  } else {
    return loadingLockFilePromise
  }
}

function recurse(depObject: any, set: dependencies) {
  set.add(`${depObject.name}@${depObject.version}`)
  if (depObject.dependencies) {
    Object.keys(depObject.dependencies).forEach(d =>
      recurse(depObject.dependencies[d], set)
    )
  }

  return set
}

async function getDependencies(
  root: string,
  dep: string,
  parentDep: string,
  isYarn: boolean
): Promise<dependencies> {
  // let file = fs.readFileSync('yarn.lock', 'utf8');
  // console.log(json, { dep })
  const lockFileJson = await loadLockFile(root, isYarn)
  let childDepTree
  if (parentDep !== ``) {
    console.log({ parentDep, dep })
    childDepTree = lockFileJson.dependencies[parentDep].dependencies[dep]
  } else {
    childDepTree = lockFileJson.dependencies[dep]
  }
  if (childDepTree) {
    const dependencies = recurse(childDepTree, new Set())
    return dependencies
  } else {
    console.log(`MISSING DEPENDENCY`, { dep, parentDep })
    return new Set()
  }
}

async function hasFileChanged(filePath: string): Promise<boolean> {
  if (filePath === ``) {
    return false
  }

  const cachedMTime = await cache.get(filePath)
  const stat = await fs.stat(filePath)
  await cache.set(filePath, stat.mtimeMs)
  return cachedMTime === stat.mtimeMs ? false : true
}

interface ILockFileInfo {
  isYarn: boolean
  isNpm: boolean
  lockFilePath: string
}

function getLockFile(root: string): ILockFileInfo {
  const yarnLockPath = path.join(root, `yarn.lock`)
  const packageLockPath = path.join(root, `package-lock.json`)
  let isYarn = false
  let isNpm = false
  try {
    isYarn = !!fs.statSync(yarnLockPath)
  } catch (e) {
    // ignore
  }

  try {
    isNpm = !!fs.statSync(packageLockPath)
  } catch (e) {
    // ignore
  }

  if (isYarn) {
    return { lockFilePath: yarnLockPath, isYarn, isNpm }
  } else if (isNpm) {
    return { lockFilePath: packageLockPath, isYarn, isNpm }
  } else {
    return { isNpm, isYarn, lockFilePath: `` }
  }
}

interface IPluginDigest {
  digest: string
  isCached: boolean
}

type ILocalFiles = Array<string>

async function createPluginDigest(
  root: string,
  plugin: any
): Promise<IPluginDigest> {
  let dep = plugin.resolve
  if (dep === ``) {
    return { digest: ``, isCached: false }
  }

  // Just return Gatsby's version number for internal plugins
  if (
    /gatsby.dist.internal-plugins/.test(dep) ||
    /gatsby-plugin-page-creator/.test(dep)
  ) {
    const gatsbyVersion = require(`gatsby/package.json`).version
    return { digest: gatsbyVersion, isCached: true }
  }

  const cachedResult: IPluginDigest = (await cache.get(
    root + dep
  )) as IPluginDigest

  const { lockFilePath, isYarn } = getLockFile(root)

  if (lockFilePath === ``) {
    return { digest: ``, isCached: false }
  }

  const packageJson = require(path.join(root, `package.json`))

  // gatsby-plugin-typescript is often a dependency of gatsby and added by it.
  // Work around this.
  let parentDep = ``
  // gatsby-plugin-typescript can be installed directly or as a dependency of gatsby, found out which
  if (/gatsby-plugin-typescript/.test(dep)) {
    // Check if it's a direct dependency
    if (!packageJson.dependencies[`gatsby-plugin-typescript`]) {
      console.log(`typescript isn't direct dependency`)
      // It's not so set the parent to gatsby
      parentDep = `gatsby`
    } else {
      console.log(`typescript is a direct dependency`)
    }
  }

  // Check if the lock file has changed
  const lockFileChanged = await hasFileChanged(lockFilePath)

  // Is this plugin a direct dependency of the project?
  const isPackage =
    !!packageJson.dependencies[parentDep] ||
    packageJson.dependencies[plugin.name]

  if (isPackage) {
    console.log(`isPackage`, {
      dep,
      parentDep,
      hasCache: !!cachedResult,
      lockFileChanged,
    })
    if (lockFileChanged || !cachedResult) {
      const dependencies = await getDependencies(
        root,
        plugin.name,
        parentDep,
        isYarn
      )
      const str = Array.from(dependencies).sort().join(``)
      const shasum = crypto.createHash(`sha1`)
      shasum.update(str)
      const result: IPluginDigest = {
        digest: shasum.digest(`hex`),
        isCached: false,
      }
      await cache.set(root + dep, result)

      return result
    } else {
      cachedResult.isCached = true

      return cachedResult
    }
  } else {
    dep = path.relative(root, path.join(dep, `gatsby-node.js`))
    // This is a local plugin
    // so to create a digest, we hash all its src files + get the dependency tree
    // of each of its npm dependencies.

    let localFiles = (await cache.get(root + dep + `localFiles`)) as ILocalFiles
    let filesChanged = true

    // If a listing of the local files exists, let's check if any of them have changed.
    if (localFiles && localFiles.length > 0) {
      console.log({ localFiles })
      const changes = await Promise.all(
        localFiles.map(file => hasFileChanged(path.join(root, file)))
      )
      filesChanged = changes.some(changed => changed)
    }

    // Reset as the files might have changed.
    localFiles = []

    if (filesChanged || lockFileChanged) {
      let combinedDependencies = new Set()
      const dependencies = await getDependenciesForLocalFile(root, dep)
      console.log(`getDependenciesForLocalFile`, { dependencies })
      await Promise.all(
        Object.keys(dependencies).map(async dep => {
          if (
            // It's a local dependency found by getDependenciesForLocalFile
            dep.slice(0, 1) === `.` ||
            // This is the gatsby-node.js file for the plugin.
            /node_modules/.test(dep) ||
            // This is the site's gatsby-node
            dep.slice(0, 11) === `gatsby-node`
          ) {
            // This is a local file
            combinedDependencies.add(`${dep}-${dependencies[dep]}`)
            // Call hasFileChanged to cache its last modified time.
            // console.log({ root, dep })
            await hasFileChanged(path.join(root, dep))
            localFiles.push(dep)
          } else {
            const packageDependencies = await getDependencies(
              root,
              dep,
              parentDep,
              isYarn
            )
            combinedDependencies = new Set([
              ...combinedDependencies,
              ...packageDependencies,
            ])
          }
        })
      )
      console.log({ combinedDependencies })
      await cache.set(root + dep + `localFiles`, localFiles)
      const str = Array.from(combinedDependencies).sort().join(``)
      const shasum = crypto.createHash(`sha1`)
      shasum.update(str)
      const result: IPluginDigest = {
        digest: shasum.digest(`hex`),
        isCached: false,
      }
      cache.set(root + dep, result)
      return result
    } else {
      const result: IPluginDigest = (await cache.get(
        root + dep
      )) as IPluginDigest
      result.isCached = true
      return result
    }
  }
}

export default createPluginDigest
