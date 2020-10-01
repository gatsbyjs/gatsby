import { CreateNodeArgs } from "gatsby"
import { IImageMetadata, writeImage } from "./image-processing"
export async function onCreateNode({
  node,
  cache,
  reporter,
}: CreateNodeArgs): Promise<void> {
  if (node.internal.type !== `File`) {
    return
  }

  // See if any static image instances use this source file
  const imageRefs: Record<string, IImageMetadata> = await cache.get(
    `ref-${node.id}`
  )

  if (!imageRefs) {
    return
  }

  await Promise.all(
    Object.values(imageRefs).map(
      async ({ isFixed, contentDigest, args, cacheFilename }) => {
        if (contentDigest && contentDigest === node.internal.contentDigest) {
          // Skipping, because the file is unchanged
          return
        }
        // Update the image
        await writeImage(node, args, reporter, cache, isFixed, cacheFilename)
      }
    )
  )
}
