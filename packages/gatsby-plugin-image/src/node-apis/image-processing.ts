import fs from "fs-extra";
import path from "node:path";
import { watchImage } from "./watcher";
import type { FileSystemNode } from "gatsby-source-filesystem";
import type { IStaticImageProps } from "../components/static-image.server";
import type { ISharpGatsbyImageArgs } from "../image-utils";
import { createFileNode } from "gatsby-source-filesystem/create-file-node";
// import { Actions, GatsbyCache } from "gatsby";
// import { Reporter } from "gatsby-cli/lib/reporter/reporter";

const supportedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
export type IImageMetadata = {
  isFixed: boolean;
  contentDigest?: string | undefined;
  args: Record<string, unknown>;
  cacheFilename: string;
};

export async function createImageNode({
  fullPath,
  createNodeId,
  createNode,
  reporter,
}: {
  fullPath: string;
  createNodeId: (this: void, input: string) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createNode: any; // Actions["createNode"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reporter: any; // Reporter;
}): Promise<FileSystemNode | undefined> {
  if (!fs.existsSync(fullPath)) {
    return undefined;
  }

  let file: FileSystemNode | undefined;

  try {
    // @ts-ignore Property 'gid' is missing in type '{ dev: number; mode: number; nlink: number; uid: number; rdev: number; blksize: number; ino: number; size: number; blocks: number; atimeMs: number; mtimeMs: number; ctimeMs: number; birthtimeMs: number; ... 22 more ...; birthTime: string; }' but required in type 'FileSystemNode'.ts(2741)
    file = await createFileNode(fullPath, createNodeId, {});
  } catch (e) {
    reporter.panic("Please install gatsby-source-filesystem");
    return undefined;
  }

  if (!file) {
    return undefined;
  }

  if (file.internal) {
    file.internal.type = "StaticImage";
  }

  createNode(file);

  return file;
}

export function isRemoteURL(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
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
  filename,
}: {
  images: Map<string, IStaticImageProps>;
  pathPrefix?: string | undefined;
  cacheDir: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reporter: any; // Reporter;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cache: any; // GatsbyCache;
  sourceDir: string;
  createNodeId: (this: void, input: string) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createNode: any; // Actions["createNode"];
  filename: string;
}): Promise<void> {
  const promises = [...images.entries()].map(
    async ([hash, { src, ...args }]) => {
      let file: FileSystemNode | undefined;
      let fullPath;
      if (!src) {
        reporter.warn(`Missing StaticImage "src" in ${filename}.`);
        return;
      }
      if (isRemoteURL(src)) {
        let createRemoteFileNode;
        try {
          createRemoteFileNode =
            require("gatsby-source-filesystem").createRemoteFileNode;
        } catch (e) {
          reporter.panic("Please install gatsby-source-filesystem");
        }

        try {
          file = await createRemoteFileNode({
            url: src,
            cache,
            createNode,
            createNodeId,
          });
        } catch (err) {
          reporter.error(`Error loading image ${src}`, err);
          return;
        }
        if (
          !file?.internal?.mediaType ||
          !supportedTypes.has(file.internal.mediaType)
        ) {
          reporter.error(
            `The file loaded from ${src} is not a valid image type. Found "${
              file?.internal?.mediaType || "unknown"
            }"`,
          );
          return;
        }
      } else {
        fullPath = path.resolve(sourceDir, src);

        if (!fs.existsSync(fullPath)) {
          reporter.warn(
            `Could not find image "${src}" in "${filename}". Looked for ${fullPath}.`,
          );
          return;
        }

        try {
          const {
            createFileNode,
          } = require("gatsby-source-filesystem/create-file-node");

          file = await createFileNode(fullPath, createNodeId, {});
        } catch (e) {
          reporter.panic("Please install gatsby-source-filesystem");
        }
      }

      if (!file) {
        reporter.warn(`Could not create node for image ${src}`);
        return;
      }

      if (file.internal) {
        // We need our own type, because `File` belongs to the filesystem plugin
        file.internal.type = "StaticImage";
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (file.internal as any).owner;
      createNode(file);

      const cacheKey = `ref-${file.id}`;

      // This is a cache of file node to static image mappings
      const imageRefs: Map<string, IImageMetadata> =
        (await cache.get(cacheKey)) || {};

      // Different cache: this is the one with the image properties
      const cacheFilename = path.join(cacheDir, `${hash}.json`);
      imageRefs[hash] = {
        contentDigest: file.internal?.contentDigest,
        args,
        cacheFilename,
      };
      await cache.set(cacheKey, imageRefs);

      await writeImage(file, args, pathPrefix, reporter, cache, cacheFilename);

      if (fullPath && process.env.NODE_ENV === "development") {
        // Watch the source image for changes
        watchImage({
          createNode,
          createNodeId,
          fullPath,
          pathPrefix,
          cache,
          reporter,
        });
      }
    },
  );

  return Promise.all(promises).then(() => {});
}

export async function writeImage(
  file: FileSystemNode,
  args: ISharpGatsbyImageArgs,
  pathPrefix: string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reporter: any, // Reporter,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cache: any, // GatsbyCache,
  filename: string,
): Promise<void> {
  let generateImageData;
  try {
    generateImageData = require("gatsby-plugin-sharp").generateImageData;
  } catch (e) {
    reporter.panic("Please install gatsby-plugin-sharp");
  }
  try {
    const options = { file, args, pathPrefix, reporter, cache };

    if (!generateImageData) {
      reporter.warn("Please upgrade gatsby-plugin-sharp");
      return;
    }
    // get standard set of fields from sharp
    const sharpData = await generateImageData(options);

    if (sharpData) {
      // Write the image properties to the cache
      await fs.writeJSON(filename, sharpData);
    } else {
      reporter.warn(`Could not process image ${file.relativePath}`);
    }
  } catch (e) {
    reporter.warn(
      `Error processing image ${file.relativePath}. \n${e.message}`,
    );
  }
}
