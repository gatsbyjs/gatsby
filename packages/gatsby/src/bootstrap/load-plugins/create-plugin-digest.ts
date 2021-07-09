import { buildDepTreeFromFiles } from "snyk-nodejs-lockfile-parser"
import crypto from "crypto"
import { getCache } from "../../utils/get-cache"
import fs from "fs-extra"
import path from "path"
import getDependenciesForLocalFile from "./get-dependencies-for-local-file"

const cache = getCache(`plugin-digest`)

const isLocalFile = filePath => filePath.slice(0, 1) === `.`
function recurse(dep, set) {
  set.add(`${dep.name}@${dep.version}`)
  if (dep.dependencies) {
    Object.keys(dep.dependencies).forEach(d =>
      recurse(dep.dependencies[d], set)
    )
  }

  return set
}

async function getDependencies(root, dep, isYarn) {
  // let file = fs.readFileSync('yarn.lock', 'utf8');
  const json = await buildDepTreeFromFiles(
    root,
    `package.json`,
    isYarn ? `yarn.lock` : `package-lock.json`
  )
  const dependencies = recurse(json.dependencies[dep], new Set())
  return dependencies
}

async function hasFileChanged(filePath) {
  const cachedMTime = await cache.get(filePath)
  const stat = await fs.stat(filePath)
  await cache.set(filePath, stat.mtimeMs)
  return cachedMTime === stat.mtimeMs ? false : true
}

function getLockFile(root) {
  const yarnLockPath = path.join(root, `yarn.lock`)
  const packageLockPath = path.join(root, `package-lock.json`)
  let isYarn
  let isNpm
  try {
    isYarn = fs.statSync(yarnLockPath)
  } catch (e) {
    // ignore
  }

  try {
    isNpm = fs.statSync(packageLockPath)
  } catch (e) {
    // ignore
  }

  if (isYarn) {
    return { lockFilePath: yarnLockPath, isYarn }
  } else if (isNpm) {
    return { lockFilePath: packageLockPath, isYarn: false }
  } else {
    return false
  }
}

async function createPluginDigest(root, dep) {
  const isPackage = !isLocalFile(dep)
  const cachedResult = await cache.get(root + dep)

  const { lockFilePath, isYarn } = getLockFile(root)

  // Check if the lock file has changed
  const lockFileChanged = await hasFileChanged(lockFilePath)

  if (isPackage) {
    if (lockFileChanged || !cachedResult) {
      const dependencies = await getDependencies(root, dep, isYarn)
      const str = Array.from(dependencies).sort().join(``)
      const shasum = crypto.createHash(`sha1`)
      shasum.update(str)
      const result = { digest: shasum.digest(`hex`), isCached: false }
      await cache.set(root + dep, result)

      return result
    } else {
      cachedResult.isCached = true

      return cachedResult
    }
  } else {
    // This is a local file
    // so to create a digest, we hash all its src files + get the dependency tree
    // of each of its npm dependencies.

    let localFiles = await cache.get(root + dep + `localFiles`)
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

    if (filesChanged || lockFileChanged) {
      let combinedDependencies = new Set()
      const dependencies = await getDependenciesForLocalFile(root, dep)
      await Promise.all(
        Object.keys(dependencies).map(async dep => {
          if (dep.slice(0, 1) === `.`) {
            // This is a local file
            combinedDependencies.add(`${dep}-${dependencies[dep]}`)
            // Call hasFileChanged to cache its last modified time.
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
      const result = { digest: shasum.digest(`hex`), isCached: false }
      cache.set(root + dep, result)
      return result
    } else {
      const result = await cache.get(root + dep)
      result.isCached = true
      return result
    }
  }
}

export default createPluginDigest
