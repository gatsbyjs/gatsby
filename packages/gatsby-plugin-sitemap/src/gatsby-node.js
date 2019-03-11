import sitemap from "sitemap"
import {
  defaultOptions,
  runQuery,
  writeFile,
  renameFile,
  withoutTrailingSlash,
} from "./internals"

exports.onPostBuild = async ({ graphql, pathPrefix, cache }, pluginOptions) => {
  const options = { ...pluginOptions }
  delete options.plugins
  delete options.createLinkInHead

  const { query, serialize, output, exclude, hostname, ...rest } = {
    ...defaultOptions,
    ...options,
  }

  const saved = cache.publicPath(output)

  // Paths we're excluding...
  const excludeOptions = exclude.concat(defaultOptions.exclude)

  const queryRecords = await runQuery(
    graphql,
    query,
    excludeOptions,
    pathPrefix
  )
  const urls = serialize(queryRecords)

  if (!rest.sitemapSize || urls.length <= rest.sitemapSize) {
    const map = sitemap.createSitemap(rest)
    urls.forEach(u => map.add(u))
    return writeFile(saved, map.toString())
  }

  const {
    site: {
      siteMetadata: { siteUrl },
    },
  } = queryRecords
  return new Promise(resolve => {
    // sitemapv-index.xml is default file name. (https://git.io/fhNgG)
    const indexFilePath = cache.publicPath(
      `${rest.sitemapName || `sitemap`}-index.xml`
    )
    const sitemapIndexOptions = {
      ...rest,
      hostname: hostname || withoutTrailingSlash(siteUrl),
      targetFolder: cache.publicPath(),
      urls,
      callback: error => {
        if (error) throw new Error(error)
        renameFile(indexFilePath, saved).then(resolve)
      },
    }
    sitemap.createSitemapIndex(sitemapIndexOptions)
  })
}
