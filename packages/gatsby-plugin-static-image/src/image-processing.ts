import { Node, GatsbyCache, Reporter, ParentSpanPluginArgs } from "gatsby"
import { fluid as fluidSharp, fixed as fixedSharp } from "gatsby-plugin-sharp"
import { createFileNode } from "gatsby-source-filesystem/create-file-node"
import fs from "fs-extra"
import path from "path"
import { ImageProps } from "./utils"

export interface IImageMetadata {
  isFixed: boolean
  contentDigest?: string
  args: Record<string, unknown>
  cacheFilename: string
}

export async function writeImages({
  images,
  cacheDir,
  reporter,
  cache,
  sourceDir,
  createNodeId,
}: {
  images: Map<string, ImageProps>
  cacheDir: string
  reporter: Reporter
  cache: GatsbyCache
  sourceDir: string
  createNodeId: ParentSpanPluginArgs["createNodeId"]
}): Promise<void> {
  const promises = [...images.entries()].map(
    async ([hash, { src, fluid, fixed, ...args }]) => {
      // Default to fixed, but allow specifying either
      const isFixed = !!(fixed ?? !fluid)
      const fullPath = path.resolve(sourceDir, src)

      if (!fs.existsSync(fullPath)) {
        reporter.warn(`Could not find image "${src}". Looked for ${fullPath}`)
        return
      }
      const file = await createFileNode(fullPath, createNodeId, {})

      if (!file) {
        reporter.warn(`Could not create node for image ${src}`)
        return
      }

      // This is a cache of file node to static image mappings
      const cacheKey = `ref-${file.id}`

      const imageRefs: Map<string, IImageMetadata> =
        (await cache.get(cacheKey)) || {}

      const cacheFilename = path.join(cacheDir, `${hash}.json`)
      imageRefs[hash] = {
        isFixed,
        contentDigest: file.internal?.contentDigest,
        args,
        cacheFilename,
      }
      await cache.set(cacheKey, imageRefs)

      await writeImage(file, args, reporter, cache, isFixed, cacheFilename)
    }
  )

  return Promise.all(promises).then(() => {})
}

export async function writeImage(
  file: Node,
  args: Omit<ImageProps, "src" | "fixed" | "fluid">,
  reporter: Reporter,
  cache: GatsbyCache,
  isFixed: boolean,
  filename: string
): Promise<void> {
  try {
    const options = { file, args, reporter, cache }
    const data = await (isFixed ? fixedSharp(options) : fluidSharp(options))

    if (data) {
      await fs.writeJSON(filename, data)
    } else {
      console.log(`Could not process image`)
    }
  } catch (e) {
    // TODO: Report errors properly
    console.log(`Error processing image`, e)
  }
}
