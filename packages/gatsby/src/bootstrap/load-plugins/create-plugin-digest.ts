import { buildDepTreeFromFiles } from "snyk-nodejs-lockfile-parser"
import crypto from "crypto"
import { getCache } from "../../utils/get-cache"
import fs from "fs-extra"
import path from "path"
import getDependenciesForLocalFile from "./get-dependencies-for-local-file"

const cache = getCache(`plugin-digest`)

function isLocalPlugin(filePath: string): boolean {
  return filePath.slice(0, 1) === `.`
}

type dependencies = Set<string>

function recurse(depObject: any, set: dependencies) {
  console.log({ depObject })
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
  isYarn: boolean
): Promise<dependencies> {
  // let file = fs.readFileSync('yarn.lock', 'utf8');
  const json = await buildDepTreeFromFiles(
    root,
    `package.json`,
    isYarn ? `yarn.lock` : `package-lock.json`
  )
  console.log(json, { dep })
  const dependencies = recurse(json.dependencies[dep], new Set())
  return dependencies
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
  dep: string
): Promise<IPluginDigest> {
  if (dep === ``) {
    return { digest: ``, isCached: false }
  }

  // Just return Gatsby's version number for internal plugins
  if (/gatsby.dist.internal-plugins/.test(dep)) {
    const gatsbyVersion = require(`gatsby/package.json`).version
    console.log({ gatsbyVersion })
    return { digest: gatsbyVersion, isCached: true }
  }

  const cachedResult: IPluginDigest = (await cache.get(
    root + dep
  )) as IPluginDigest

  const { lockFilePath, isYarn } = getLockFile(root)

  if (lockFilePath === ``) {
    return { digest: ``, isCached: false }
  }

  // Check if the lock file has changed
  const lockFileChanged = await hasFileChanged(lockFilePath)

  const dependencyTree = await buildDepTreeFromFiles(
    root,
    `package.json`,
    isYarn ? `yarn.lock` : `package-lock.json`
  )

  const isPackage = !!dependencyTree.dependencies[dep]

  if (isPackage) {
    if (lockFileChanged || !cachedResult) {
      const dependencies = await getDependencies(root, dep, isYarn)
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
      await Promise.all(
        Object.keys(dependencies).map(async dep => {
          if (dep.slice(0, 1) === `.`) {
            // This is a local file
            combinedDependencies.add(`${dep}-${dependencies[dep]}`)
            // Call hasFileChanged to cache its last modified time.
            console.log({ root, dep })
            await hasFileChanged(path.join(root, dep))
            localFiles.push(dep)
          } else {
            const packageDependencies = await getDependencies(root, dep, isYarn)
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
      const result: IPluginDigest = (await cache.get(
        root + dep
      )) as IPluginDigest
      result.isCached = true
      return result
    }
  }
}

export default createPluginDigest
