import path from "path"
import sitemap from "sitemap"
import { defaultOptions, runQuery, writeFile } from "./internals"

const publicPath = `./public`

exports.onPostBuild = async ({ graphql }, pluginOptions) => {
  delete pluginOptions.plugins

  const { query, serialize, output, ...rest } = {
    ...defaultOptions,
    ...pluginOptions,
  }

  const map = sitemap.createSitemap(rest)
  const records = await runQuery(graphql, query)
  const saved = path.join(publicPath, output)

  serialize(records).forEach(u => map.add(u))
  return await writeFile(saved, map.toString())
}
