import * as path from "path"
import * as fs from "fs-extra"
import { createServiceLock, getService } from "./service-lock"
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

function getConfigPath(root: string): string {
  return path.join(root, `gatsby-config.js`)
}

async function readConfigFile(root: string): Promise<string> {
  let src
  try {
    src = await fs.readFile(getConfigPath(root), `utf8`)
  } catch (e) {
    if (e.code === `ENOENT`) {
      src = `
module.exports = {
  siteMetadata: {
    siteUrl: \`https://www.yourdomain.tld\`,
  },
  plugins: [],
}
`
    } else {
      throw e
    }
  }

  return src
}

function addField(
  src: string,
  { name, value }: { name: string; value: string }
): string {
  // TODO Use simple string replace or something
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
