import {
  Node,
  GatsbyCache,
  Reporter,
  ParentSpanPluginArgs,
  Actions,
} from "gatsby"
import { fluid as fluidSharp, fixed as fixedSharp } from "gatsby-plugin-sharp"
import { createFileNode } from "gatsby-source-filesystem/create-file-node"
import fs from "fs-extra"
import path from "path"
import { ImageProps, SharpProps } from "../utils"
import { getCustomSharpFields } from "./get-custom-sharp-fields"
import { watchImage } from "./watcher"

export interface IImageMetadata {
  isFixed: boolean
  contentDigest?: string
  args: Record<string, unknown>
  cacheFilename: string
}

export async function createImageNode({
  fullPath,
  createNodeId,
  createNode,
}: {
  fullPath: string
  createNodeId: ParentSpanPluginArgs["createNodeId"]
  createNode: Actions["createNode"]
}): Promise<Node | undefined> {
  if (!fs.existsSync(fullPath)) {
    return undefined
  }
  const file: Node = await createFileNode(fullPath, createNodeId, {})

  if (!file) {
    return undefined
  }

  file.internal.type = `StaticImage`

  createNode(file)

  return file
}

export async function writeImages({
  images,
  pathPrefix,
  cacheDir,
  reporter,
  cache,
  sourceDir,
  createNodeId,
  createNode,
}: {
  images: Map<string, ImageProps>
  pathPrefix: string
  cacheDir: string
  reporter: Reporter
  cache: GatsbyCache
  sourceDir: string
  createNodeId: ParentSpanPluginArgs["createNodeId"]
  createNode: Actions["createNode"]
}): Promise<void> {
  const promises = [...images.entries()].map(
    async ([hash, { src, layout, ...args }]) => {
      const isFixed = layout !== `responsive`
      const fullPath = path.resolve(sourceDir, src)

      if (!fs.existsSync(fullPath)) {
        reporter.warn(`Could not find image "${src}". Looked for ${fullPath}`)
        return
      }
      const file: Node = await createFileNode(fullPath, createNodeId, {})

      if (!file) {
        reporter.warn(`Could not create node for image ${src}`)
        return
      }

      // We need our own type, because `File` belongs to the filesystem plugin
      file.internal.type = `StaticImage`

      createNode(file)

      const cacheKey = `ref-${file.id}`

      // This is a cache of file node to static image mappings
      const imageRefs: Map<string, IImageMetadata> =
        (await cache.get(cacheKey)) || {}

      // Different cache: this is the one with the image properties
      const cacheFilename = path.join(cacheDir, `${hash}.json`)
      imageRefs[hash] = {
        isFixed,
        contentDigest: file.internal?.contentDigest,
        args,
        cacheFilename,
      }
      await cache.set(cacheKey, imageRefs)

      await writeImage(
        file,
        pathPrefix,
        args,
        reporter,
        cache,
        isFixed,
        cacheFilename
      )

      if (process.env.NODE_ENV === `development`) {
        // Watch the source image for changes
        watchImage({
          createNode,
          pathPrefix,
          createNodeId,
          fullPath,
          cache,
          reporter,
        })
      }
    }
  )

  return Promise.all(promises).then(() => {})
}

export async function writeImage(
  file: Node,
  pathPrefix: string,
  args: SharpProps,
  reporter: Reporter,
  cache: GatsbyCache,
  isFixed: boolean,
  filename: string
): Promise<void> {
  try {
    if (args.tracedSVG) {
      // These are mutually-exclusive options
      args.base64 = false
    }
    const options = { file, args, reporter, cache }

    // get standard set of fields from sharp
    const sharpData = await (isFixed
      ? fixedSharp(options)
      : fluidSharp(options))
    if (sharpData) {
      // get the equivalent webP and tracedSVG fields gatsby-transformer-sharp handles normally
      const customSharpFields = await getCustomSharpFields({
        isFixed,
        file,
        pathPrefix,
        args,
        reporter,
        cache,
      })
      const data = { ...sharpData, ...customSharpFields }
      // Write the image properties to the cache
      await fs.writeJSON(filename, data)
    } else {
      reporter.warn(`Could not process image`)
    }
  } catch (e) {
    reporter.warn(`Error processing image`)
  }
}
