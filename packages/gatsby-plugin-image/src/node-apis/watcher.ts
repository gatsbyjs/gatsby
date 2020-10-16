import chokidar, { FSWatcher } from "chokidar"
import {
  Actions,
  ParentSpanPluginArgs,
  GatsbyCache,
  Reporter,
  Node,
} from "gatsby"
import { createImageNode, IImageMetadata, writeImage } from "./image-processing"

let watcher: FSWatcher | undefined

/**
 * Watch a static source image for changes during develop
 */
export function watchImage({
  fullPath,
  pathPrefix,
  createNodeId,
  createNode,
  cache,
  reporter,
}: {
  fullPath: string
  pathPrefix: string
  createNodeId: ParentSpanPluginArgs["createNodeId"]
  createNode: Actions["createNode"]
  cache: GatsbyCache
  reporter: Reporter
}): void {
  // We use a shared watcher, but only create it if needed
  if (!watcher) {
    watcher = chokidar.watch(fullPath)
    watcher.on(
      `change`,
      async (path: string): Promise<void> => {
        reporter.verbose(`Image changed: ${path}`)
        const node = await createImageNode({
          fullPath: path,
          createNodeId,
          createNode,
        })
        if (!node) {
          reporter.warn(`Could not process image ${path}`)
          return
        }
        await updateImages({ node, pathPrefix, cache, reporter })
      }
    )
  } else {
    // If we already have a watcher, just add this image to it
    watcher.add(fullPath)
  }
}
/**
 * Update any static image instances that use a source image
 */
async function updateImages({
  cache,
  pathPrefix,
  node,
  reporter,
}: {
  cache: GatsbyCache
  pathPrefix: string
  node: Node
  reporter: Reporter
}): Promise<void> {
  // See if any static image instances use this source image file
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
        await writeImage(
          node,
          pathPrefix,
          args,
          reporter,
          cache,
          isFixed,
          cacheFilename
        )
      }
    )
  )
}
