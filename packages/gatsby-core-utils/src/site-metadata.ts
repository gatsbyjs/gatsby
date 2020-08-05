import { createServiceLock, getService } from "./service-lock"

export interface ISiteMetadata {
  sitePath: string
  name?: string
  pid?: number
  lastRun?: number
}

export async function getSiteMetadata(
  sitePath: string
): Promise<ISiteMetadata | null> {
  return getService(sitePath, `metadata`, true)
}

export async function updateSiteMetadata(
  metadata: ISiteMetadata,
  merge = true
): Promise<void> {
  if (merge) {
    const oldMetadata = (await getSiteMetadata(metadata.sitePath)) || {}
    metadata = { ...oldMetadata, ...metadata }
  }

  return createServiceLock(
    metadata.sitePath,
    `metadata`,
    metadata
  ).then(unlock => unlock?.())
}
