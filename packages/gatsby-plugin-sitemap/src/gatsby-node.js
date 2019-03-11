import sitemap from "sitemap"
import { defaultOptions, runQuery, writeFile } from "./internals"

exports.onPostBuild = async ({ graphql, pathPrefix, cache }, pluginOptions) => {
  const options = { ...pluginOptions }
  delete options.plugins
  delete options.createLinkInHead

  const { query, serialize, output, exclude, ...rest } = {
    ...defaultOptions,
    ...options,
  }

  const map = sitemap.createSitemap(rest)
  const saved = cache.publicPath(output)

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
