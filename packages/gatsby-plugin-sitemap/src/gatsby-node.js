import path from "path"
import sitemap from "sitemap"
import { defaultOptions, runQuery, writeFile } from "./internals"

const publicPath = `./public`

exports.onPostBuild = async ({ graphql }, pluginOptions) => {
  delete pluginOptions.plugins

  const { query, serialize, output, exclude, ...rest } = {
    ...defaultOptions,
    ...pluginOptions,
  }

  const map = sitemap.createSitemap(rest)
  const saved = path.join(publicPath, output)

  // Paths we're excluding...
  const excludeOptions = exclude.concat(defaultOptions.exclude)

  const queryRecords = await runQuery(graphql, query, excludeOptions)
  serialize(queryRecords).forEach(u => map.add(u))

  return await writeFile(saved, map.toString())
}
