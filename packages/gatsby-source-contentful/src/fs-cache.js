import fs from "fs-extra"

export async function getFileSystemCachePath({ suffix = null } = {}) {
  if (!process.env.GATSBY_CONTENTFUL_EXPERIMENTAL_FORCE_CACHE) {
    return {
      fsForceCache: false,
      fsCacheFileExists: false,
      fsCacheFilePath: null,
    }
  }

  const fsCacheFilePath = [
    process.env.GATSBY_CONTENTFUL_EXPERIMENTAL_FORCE_CACHE,
    suffix,
  ]
    .filter(Boolean)
    .join(`-`)

  const fsCacheFileExists = await fs.exists(fsCacheFilePath)

  return {
    fsForceCache: true,
    fsCacheFileExists,
    fsCacheFilePath,
  }
}
