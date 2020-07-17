import path from "path"
import minimatch from "minimatch"
import { simpleSitemapAndIndex } from "sitemap"
import { validateOptions, withoutTrailingSlash, prefixPath } from "./internals"

const publicPath = `./public`

const reporterPrefix = `[plugin-sitemap]:`

exports.onPreInit = async ({ reporter }, pluginOptions) => {
  await validateOptions(pluginOptions).catch(err => reporter.panic(err))
  reporter.verbose(`${reporterPrefix} Plugin options valid`)
}

exports.onPostBuild = async (
  { graphql, reporter, pathPrefix },
  pluginOptions
) => {
  global.reporter = reporter

  const {
    output,
    sitemapSize,
    query,
    excludes,
    resolveSiteUrl,
    resolvePagePath,
    resolvePages,
    filterPages,
    serialize,
  } = await validateOptions(pluginOptions).catch(err => reporter.panic(err))
  console.log(`PathPrefix: `, pathPrefix)
  const { data: queryRecords } = await graphql(query)

  reporter.verbose(
    `${reporterPrefix}Query Results` + JSON.stringify(queryRecords, null, 2)
  )

  const allPages = resolvePages(queryRecords)
  const siteUrl = resolveSiteUrl(queryRecords)

  reporter.verbose(
    `${reporterPrefix} Filtering ${allPages.length} pages based on ${excludes.length} excludes`
  )
  const filteredPages = allPages.filter(page => {
    const result = !excludes.some(exclude => {
      try {
        return filterPages(page, exclude, {
          minimatch,
          withoutTrailingSlash,
          resolvePagePath,
        })
      } catch (err) {
        reporter.panic(
          `${reporterPrefix} filering pages failed. If you've customized your query or excludes you may need to customize the "filterPages" function.`
        )
      }
    })

    if (!result) {
      reporter.verbose(
        `${reporterPrefix} Excluded page ${resolvePagePath(page)}`
      )
    }

    return result
  })

  reporter.verbose(
    `${reporterPrefix} pages remainig after filtering ${filteredPages.length} pages`
  )

  const serializedPages = filteredPages.map(page => {
    const { url, ...rest } = serialize(page, { resolvePagePath })

    return { url: prefixPath({ url, siteUrl, pathPrefix }), ...rest }
  })

  const saved = path.join(publicPath, output)

  return simpleSitemapAndIndex({
    hostname: siteUrl,
    destinationDir: saved,
    sourceData: serializedPages,
    limit: sitemapSize,
  })
}
