import { PreprocessSourceArgs } from "gatsby"
import { babelParseToAst } from "./babel-parse-to-ast"
import path from "path"
import { extractStaticImageProps } from "./parser"
import { writeImages } from "./image-processing"
const extensions: Array<string> = [`.js`, `.jsx`, `.tsx`]

export async function preprocessSource({
  filename,
  contents,
  cache,
  reporter,
  store,
  createNodeId,
}: PreprocessSourceArgs): Promise<string> {
  if (
    !contents.includes(`StaticImage`) ||
    !contents.includes(`gatsby-plugin-static-image`) ||
    !extensions.includes(path.extname(filename))
  ) {
    return contents
  }
  const root = store.getState().program.directory

  const cacheDir = path.join(
    root,
    `.cache`,
    `caches`,
    `gatsby-plugin-static-image`
  )

  const ast = babelParseToAst(contents, filename)

  const images = extractStaticImageProps(ast)

  const sourceDir = path.dirname(filename)
  await writeImages({
    images,
    cache,
    reporter,
    cacheDir,
    sourceDir,
    createNodeId,
  })

  return contents
}
