import { Node, GatsbyCache } from "gatsby"
import type { reporter } from "gatsby-cli/lib/reporter"
type Reporter = typeof reporter
import { fluid as fluidSharp, fixed as fixedSharp } from "gatsby-plugin-sharp"
const fileCache = new Map<string, Node>()
import fs from "fs-extra"
import path from "path"

export async function writeImages({
  images,
  cacheDir,
  files,
  reporter,
  cache,
}: {
  images: Map<string, Record<string, unknown>>
  cacheDir: string
  files: Array<Node>
  reporter: Reporter
  cache: GatsbyCache
}): Promise<void> {
  const promises = [...images.entries()].map(
    async ([hash, { src, fluid, fixed, ...args }]) => {
      const isFixed = fixed ?? !fluid

      let file = fileCache.get(src as string)
      if (!file) {
        // Is there a more efficient way to search for a fileNode by relativePath?
        file = files.find(node => node.relativePath === src)
      }
      if (!file) {
        reporter.warn(`Image not found ${src}`)
        return
      }
      const filename = path.join(cacheDir, `${hash}.json`)
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
  )

  return Promise.all(promises).then(() => {})
}
