import * as fs from "fs-extra"
import { createServiceLock, getService } from "./service-lock"
import { readConfigFile, getConfigPath } from "./utils"
import { lock } from "./lock"

export interface ISiteMetadata {
  sitePath: string
  name?: string
  pid?: number
  lastRun?: number
}

export async function getInternalSiteMetadata(
  sitePath: string
): Promise<ISiteMetadata | null> {
  return getService(sitePath, `metadata`, true)
}

export async function updateInternalSiteMetadata(
  metadata: ISiteMetadata,
  merge = true
): Promise<void> {
  if (merge) {
    const oldMetadata = await getInternalSiteMetadata(metadata.sitePath)
    if (oldMetadata) {
      metadata = { ...oldMetadata, ...metadata }
    }
  }

  return createServiceLock(metadata.sitePath, `metadata`, metadata).then(
    unlock => unlock?.()
  )
}

// TODO(v5): Remove again - Necessary because of renaming in https://github.com/gatsbyjs/gatsby/pull/34094
export { updateInternalSiteMetadata as updateSiteMetadata }

/**
 * Does a string replace by searching for beginning of "siteMetadata"
 * Then it adds the name + value as the next key of that object
 */
function addField(
  src: string,
  { name, value }: { name: string; value: string }
): string {
  const FIND = `  siteMetadata: {\n`
  const REPLACE = `  siteMetadata: {\n    ${name}: \`${value}\`,\n`
  const modifiedConfig = src.replace(FIND, REPLACE)
  return modifiedConfig
}

export async function addFieldToMinimalSiteMetadata(
  { root }: { root: string },
  { name, value }: { name: string; value: string }
): Promise<void> {
  const release = await lock(`gatsby-config.js`)
  const configSrc = await readConfigFile(root)

  const code = addField(configSrc, { name, value })

  await fs.writeFile(getConfigPath(root), code)
  release()
}
