import { PreprocessSourceArgs } from "gatsby"
import { babelParseToAst } from "./babel-parse-to-ast"
import path from "path"
import { extractStaticImageProps } from "./parser"
import { writeImages } from "./image-processing"
const extensions: Array<string> = [`.js`, `.jsx`, `.tsx`]

export async function preprocessSource({
  filename,
  contents,
  getNodesByType,
  cache,
  reporter,
  store,
}: PreprocessSourceArgs): Promise<string> {
  console.log(`preprocess`)
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

  const files = getNodesByType(`File`)

  await writeImages({ images, cache, reporter, files, cacheDir })

  return contents
}
