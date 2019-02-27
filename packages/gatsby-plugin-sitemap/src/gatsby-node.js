import path from "path"
import sitemap from "sitemap"
import {
  defaultOptions,
  runQuery,
  writeFile,
  renameFile,
  withoutTrailingSlash,
} from "./internals"

const publicPath = `./public`

exports.onPostBuild = async ({ graphql, pathPrefix }, pluginOptions) => {
  const options = { ...pluginOptions }
  delete options.plugins
  delete options.createLinkInHead

  const {
    query,
    serialize,
    output,
    exclude,
    hostname,
    targetFolder,
    ...rest
  } = {
    ...defaultOptions,
    ...options,
  }

  const distDir = targetFolder || publicPath
  const saved = path.join(distDir, output)

  // Paths we're excluding...
  const excludeOptions = exclude.concat(defaultOptions.exclude)

  const queryRecords = await runQuery(
    graphql,
    query,
    excludeOptions,
    pathPrefix
  )
  const urls = serialize(queryRecords)

  if (!(rest.sitemapSize && urls.length > rest.sitemapSize)) {
    const map = sitemap.createSitemap(rest)
    serialize(queryRecords).forEach(u => map.add(u))
    return await writeFile(saved, map.toString())
  } else {
    const {
      site: {
        siteMetadata: { siteUrl },
      },
    } = queryRecords
    return new Promise((resolve, reject) => {
      // sitemapv-index.xml is default file name. (https://git.io/fhNgG)
      const indexFilePath = path.join(
        distDir,
        `${rest.sitemapName || `sitemap`}-index.xml`
      )
      const sitemapIndexOptions = {
        ...rest,
        ...{
          hostname: hostname || withoutTrailingSlash(siteUrl),
          targetFolder: distDir,
          urls,
          callback: error => {
            if (error) reject()
            renameFile(indexFilePath, saved).then(resolve)
          },
        },
      }
      sitemap.createSitemapIndex(sitemapIndexOptions)
    })
  }
}
