import {
  GatsbyCache,
  Reporter,
  ParentSpanPluginArgs,
  Actions,
  Store,
} from "gatsby"
import fs from "fs-extra"
import path from "path"
import { watchImage } from "./watcher"
import type { FileSystemNode } from "gatsby-source-filesystem"
import { IStaticImageProps } from "../components/static-image.server"
import { ISharpGatsbyImageArgs } from "../image-utils"

const supportedTypes = new Set([`image/png`, `image/jpeg`, `image/webp`])
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
  reporter,
}: {
  fullPath: string
  createNodeId: ParentSpanPluginArgs["createNodeId"]
  createNode: Actions["createNode"]
  reporter: Reporter
}): Promise<FileSystemNode | undefined> {
  if (!fs.existsSync(fullPath)) {
    return undefined
  }

  let file: FileSystemNode
  try {
    const {
      createFileNode,
    } = require(`gatsby-source-filesystem/create-file-node`)
    file = await createFileNode(fullPath, createNodeId, {})
  } catch (e) {
    reporter.panic(`Please install gatsby-source-filesystem`)
    return undefined
  }

  if (!file) {
    return undefined
  }

  file.internal.type = `StaticImage`

  createNode(file)

  return file
}

export const isRemoteURL = (url: string): boolean =>
  url.startsWith(`http://`) || url.startsWith(`https://`)

export async function writeImages({
  images,
  pathPrefix,
  cacheDir,
  reporter,
  cache,
  sourceDir,
  createNodeId,
  createNode,
  filename,
}: {
  images: Map<string, IStaticImageProps>
  pathPrefix: string
  cacheDir: string
  reporter: Reporter
  cache: GatsbyCache
  sourceDir: string
  createNodeId: ParentSpanPluginArgs["createNodeId"]
  createNode: Actions["createNode"]
  filename: string
}): Promise<void> {
  const promises = [...images.entries()].map(
    async ([hash, { src, ...args }]) => {
      let file: FileSystemNode | undefined
      let fullPath
      if (!src) {
        reporter.warn(`Missing StaticImage "src" in ${filename}.`)
        return
      }
      if (isRemoteURL(src)) {
        let createRemoteFileNode
        try {
          createRemoteFileNode =
            require(`gatsby-source-filesystem`).createRemoteFileNode
        } catch (e) {
          reporter.panic(`Please install gatsby-source-filesystem`)
        }

        try {
          file = await createRemoteFileNode({
            url: src,
            cache,
            createNode,
            createNodeId,
          })
        } catch (err) {
          reporter.error(`Error loading image ${src}`, err)
          return
        }
        if (
          !file?.internal.mediaType ||
          !supportedTypes.has(file.internal.mediaType)
        ) {
          reporter.error(
            `The file loaded from ${src} is not a valid image type. Found "${
              file?.internal.mediaType || `unknown`
            }"`
          )
          return
        }
      } else {
        fullPath = path.resolve(sourceDir, src)

        if (!fs.existsSync(fullPath)) {
          reporter.warn(
            `Could not find image "${src}" in "${filename}". Looked for ${fullPath}.`
          )
          return
        }

        try {
          const {
            createFileNode,
          } = require(`gatsby-source-filesystem/create-file-node`)

          file = await createFileNode(fullPath, createNodeId, {})
        } catch (e) {
          reporter.panic(`Please install gatsby-source-filesystem`)
        }
      }

      if (!file) {
        reporter.warn(`Could not create node for image ${src}`)
        return
      }

      // We need our own type, because `File` belongs to the filesystem plugin
      file.internal.type = `StaticImage`
      delete (file.internal as any).owner
      createNode(file)

      const cacheKey = `ref-${file.id}`

      // This is a cache of file node to static image mappings
      const imageRefs: Map<string, IImageMetadata> =
        (await cache.get(cacheKey)) || {}

      // Different cache: this is the one with the image properties
      const cacheFilename = path.join(cacheDir, `${hash}.json`)
      imageRefs[hash] = {
        contentDigest: file.internal?.contentDigest,
        args,
        cacheFilename,
      }
      await cache.set(cacheKey, imageRefs)

      await writeImage(file, args, pathPrefix, reporter, cache, cacheFilename)

      if (fullPath && process.env.NODE_ENV === `development`) {
        // Watch the source image for changes
        watchImage({
          createNode,
          createNodeId,
          fullPath,
          pathPrefix,
          cache,
          reporter,
        })
      }
    }
  )

  return Promise.all(promises).then(() => {})
}

export async function writeImage(
  file: FileSystemNode,
  args: ISharpGatsbyImageArgs,
  pathPrefix: string,
  reporter: Reporter,
  cache: GatsbyCache,
  filename: string
): Promise<void> {
  let generateImageData
  try {
    generateImageData = require(`gatsby-plugin-sharp`).generateImageData
  } catch (e) {
    reporter.panic(`Please install gatsby-plugin-sharp`)
  }
  try {
    const options = { file, args, pathPrefix, reporter, cache }

    if (!generateImageData) {
      reporter.warn(`Please upgrade gatsby-plugin-sharp`)
      return
    }
    // get standard set of fields from sharp
    const sharpData = await generateImageData(options)

    if (sharpData) {
      // Write the image properties to the cache
      await fs.writeJSON(filename, sharpData)
    } else {
      reporter.warn(`Could not process image ${file.relativePath}`)
    }
  } catch (e) {
    reporter.warn(`Error processing image ${file.relativePath}. \n${e.message}`)
  }
}
