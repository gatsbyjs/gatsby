import { buildDepTreeFromFiles } from "snyk-nodejs-lockfile-parser"
import crypto from "crypto"
import { getCache } from "../../utils/get-cache"
import fs from "fs-extra"
import path from "path"
import getDependenciesForLocalFile from "./get-dependencies-for-local-file"
import resolveFrom from "resolve-from"
import { store } from "../../redux"

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
      lockFileJson = await buildDepTreeFromFiles(
        root,
        `package.json`,
        isYarn ? `yarn.lock` : `package-lock.json`
      )
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
  const lockFileJson = await loadLockFile(root, isYarn)
  let childDepTree
  if (parentDep !== ``) {
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

let hasLockfileChangedBool: boolean
let inflightLockfileCheckPromise: Promise<boolean>
async function hasLockfileChanged(filePath: string): Promise<boolean> {
  if (typeof hasLockfileChangedBool !== `undefined`) {
    return hasLockfileChangedBool
  } else {
    if (inflightLockfileCheckPromise) {
      return inflightLockfileCheckPromise
    } else {
      let resolve
      inflightLockfileCheckPromise = new Promise(resolveVar => {
        resolve = resolveVar
      })
      hasLockfileChangedBool = await hasFileChanged(filePath)
      return resolve(hasLockfileChangedBool)
    }
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
  noLockfileFallback?: string
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
    const state = store.getState()
    const pluginsHash = state?.status?.PLUGINS_HASH || `NO_SITE_DIGEST`
    return { isNpm, isYarn, lockFilePath: ``, noLockfileFallback: pluginsHash }
  }
}

interface IPluginDigest {
  digest: string
  isCached: boolean
}

type ILocalFiles = Array<string>

async function createPluginDependencyDigest(
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
    const gatsbyVersion = require(resolveFrom(
      root,
      `gatsby/package.json`
    )).version
    return { digest: gatsbyVersion, isCached: true }
  }

  const cachedResult: IPluginDigest = (await cache.get(
    root + dep
  )) as IPluginDigest

  const { lockFilePath, isYarn, noLockfileFallback } = getLockFile(root)

  if (lockFilePath === `` && noLockfileFallback) {
    return { digest: noLockfileFallback, isCached: false }
  }

  const packageJson = require(path.join(root, `package.json`))

  // gatsby-plugin-typescript is often a dependency of gatsby and added by it.
  // Work around this.
  let parentDep = ``
  // gatsby-plugin-typescript can be installed directly or as a dependency of gatsby, found out which
  if (/gatsby-plugin-typescript/.test(dep)) {
    // Check if it's a direct dependency
    if (!packageJson.dependencies[`gatsby-plugin-typescript`]) {
      // It's not so set the parent to gatsby
      parentDep = `gatsby`
    }
  }

  // Check if the lock file has changed
  const lockFileChanged = await hasLockfileChanged(lockFilePath)
  // const lockFileChanged = false

  // Is this plugin a direct dependency of the project?
  const isPackage =
    !!packageJson.dependencies[parentDep] ||
    packageJson.dependencies[plugin.name]

  if (isPackage) {
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
    const depDir = dep
    dep = path.relative(root, path.join(dep, `gatsby-node.js`))

    // If there's no gatsby-node.js, the plugin can't cache anything
    // so a digest isn't meaningful. So we'll just return a unique
    // string of the path to the (non-existant) gatsby-node.js.
    if (!fs.existsSync(path.join(depDir, `gatsby-node.js`))) {
      return {
        digest: dep,
        isCached: false,
      }
    }
    // This is a local plugin
    // so to create a digest, we hash all its src files + get the dependency tree
    // of each of its npm dependencies.

    let localFiles = (await cache.get(root + dep + `localFiles`)) as ILocalFiles
    let filesChanged = true

    // If a listing of the local files exists, let's check if any of them have changed.
    if (localFiles && localFiles.length > 0) {
      const changes = await Promise.all(
        localFiles.map(file => hasFileChanged(path.join(root, file)))
      )
      filesChanged = changes.some(changed => changed)
    }

    // Reset as the files might have changed.
    localFiles = []

    const cachedResult: IPluginDigest = (await cache.get(
      root + dep
    )) as IPluginDigest

    if (!cachedResult || filesChanged || lockFileChanged) {
      let combinedDependencies = new Set()
      const dependencies = await getDependenciesForLocalFile(root, dep)
      await Promise.all(
        Object.keys(dependencies).map(async dep => {
          if (
            // It's a local dependency found by getDependenciesForLocalFile
            dep.slice(0, 1) === `.` ||
            // This is the gatsby-node.js file for the plugin.
            /node_modules/.test(dep) ||
            dep.slice(0, 8) === `plugins/` ||
            // This is the site's gatsby-node
            dep.slice(0, 11) === `gatsby-node`
          ) {
            // This is a local file
            combinedDependencies.add(`${dep}-${dependencies[dep]}`)
            // Call hasFileChanged to cache its last modified time.
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
      cachedResult.isCached = true
      return cachedResult
    }
  }
}

export default createPluginDependencyDigest
