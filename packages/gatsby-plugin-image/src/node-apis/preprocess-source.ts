import { PreprocessSourceArgs } from "gatsby"
import { babelParseToAst } from "./parser"
import path from "path"
import { extractStaticImageProps } from "./parser"
import { writeImages } from "./image-processing"
import { getCacheDir } from "./node-utils"
const extensions: Array<string> = [`.js`, `.jsx`, `.tsx`]

export async function preprocessSource({
  filename,
  contents,
  pathPrefix,
  cache,
  reporter,
  store,
  createNodeId,
  actions: { createNode },
}: PreprocessSourceArgs): Promise<void> {
  if (
    !contents.includes(`StaticImage`) ||
    !contents.includes(`gatsby-plugin-image`) ||
    !extensions.includes(path.extname(filename))
  ) {
    return
  }
  const root = store.getState().program.directory

  const cacheDir = getCacheDir(root)

  const ast = babelParseToAst(contents, filename)

  const images = extractStaticImageProps(ast)

  const sourceDir = path.dirname(filename)
  await writeImages({
    images,
    pathPrefix,
    cache,
    reporter,
    cacheDir,
    sourceDir,
    createNodeId,
    createNode,
    store,
  })

  return
}
