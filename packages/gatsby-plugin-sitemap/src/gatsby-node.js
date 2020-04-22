import path from "path"
import sitemap from "sitemap"
import {
  defaultOptions,
  filterQuery,
  writeFile,
  renameFile,
  withoutTrailingSlash,
} from "./internals"

const publicPath = `./public`

exports.onPostBuild = async (
  { graphql, pathPrefix, basePath = pathPrefix },
  pluginOptions
) => {
  const options = { ...pluginOptions }
  delete options.plugins
  delete options.createLinkInHead

  const {
    query,
    serialize,
    output,
    exclude,
    hostname,
    resolveSiteUrl,
    ...rest
  } = {
    ...defaultOptions,
    ...options,
  }

  const saved = path.join(publicPath, output)

  // Paths we're excluding...
  const excludeOptions = exclude.concat(defaultOptions.exclude)

  const queryRecords = await graphql(query)

  const filteredRecords = filterQuery(
    queryRecords,
    excludeOptions,
    basePath,
    resolveSiteUrl
  )
  const urls = serialize(filteredRecords)

  if (!rest.sitemapSize || urls.length <= rest.sitemapSize) {
    const map = sitemap.createSitemap(rest)
    urls.forEach(u => map.add(u))
    return writeFile(saved, map.toString())
  }

  const {
    site: {
      siteMetadata: { siteUrl },
    },
  } = filteredRecords
  return new Promise(resolve => {
    // sitemap-index.xml is default file name. (https://git.io/fhNgG)
    const indexFilePath = path.join(
      publicPath,
      `${rest.sitemapName || `sitemap`}-index.xml`
    )
    const sitemapIndexOptions = {
      ...rest,
      hostname:
        (hostname || withoutTrailingSlash(siteUrl)) +
        withoutTrailingSlash(pathPrefix || ``),
      targetFolder: publicPath,
      urls,
      callback: error => {
        if (error) throw new Error(error)
        renameFile(indexFilePath, saved).then(resolve)
      },
    }
    sitemap.createSitemapIndex(sitemapIndexOptions)
  })
}
