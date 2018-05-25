import path from "path"
import sitemap from "sitemap"
import { defaultOptions, runQuery, writeFile } from "./internals"

const buildDirectory = process.env.GATSBY_BUILD_DIR || `public`
const publicPath = `./${buildDirectory}`

exports.onPostBuild = async ({ graphql, pathPrefix }, pluginOptions) => {
  const options = { ...pluginOptions }
  delete options.plugins
  delete options.createLinkInHead

  const { query, serialize, output, exclude, ...rest } = {
    ...defaultOptions,
    ...options,
  }

  const map = sitemap.createSitemap(rest)
  const saved = path.join(publicPath, output)

  // Paths we're excluding...
  const excludeOptions = exclude.concat(defaultOptions.exclude)

  const queryRecords = await runQuery(
    graphql,
    query,
    excludeOptions,
    pathPrefix
  )
  serialize(queryRecords).forEach(u => map.add(u))

  return await writeFile(saved, map.toString())
}
