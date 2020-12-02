import path from "path"
import { simpleSitemapAndIndex } from "sitemap"
import { pluginOptionsSchema } from "./options-validation"
import { prefixPath, pageFilter, reporterPrefix } from "./internals"

exports.pluginOptionsSchema = pluginOptionsSchema

exports.onPostBuild = async (
  { graphql, reporter, pathPrefix },
  {
    output,
    entryLimit,
    query,
    excludes,
    resolveSiteUrl,
    resolvePagePath,
    resolvePages,
    filterPages,
    serialize,
  }
) => {
  const { data: queryRecords } = await graphql(query)

  reporter.verbose(
    `${reporterPrefix} Query Results:\n${JSON.stringify(queryRecords, null, 2)}`
  )

  // resolvePages and resolveSuteUrl are allowed to be sync or async. The Promise.resolve handles each possibility
  const allPages = await Promise.resolve(
    resolvePages(queryRecords)
  ).catch(err => reporter.panic(`${reporterPrefix} Error resolving Pages`, err))

  const siteUrl = await Promise.resolve(
    resolveSiteUrl(queryRecords)
  ).catch(err =>
    reporter.panic(`${reporterPrefix} Error resolving Site URL`, err)
  )

  if (!Array.isArray(allPages)) {
    reporter.panic(
      `${reporterPrefix} The \`resolvePages\` function did not return an array.`
    )
  }

  reporter.verbose(
    `${reporterPrefix} Filtering ${allPages.length} pages based on ${excludes.length} excludes`
  )

  const { filteredPages, messages } = pageFilter(
    {
      allPages,
      filterPages,
      excludes,
    },
    { reporter }
  )

  messages.forEach(message => reporter.verbose(message))

  reporter.verbose(
    `${reporterPrefix} ${filteredPages.length} pages remain after filtering`
  )

  const serializedPages = []

  filteredPages.forEach(page => {
    try {
      const { url, ...rest } = serialize(page, { resolvePagePath })
      serializedPages.push({
        url: prefixPath({ url, siteUrl, pathPrefix }),
        ...rest,
      })
    } catch (err) {
      reporter.panic(`${reporterPrefix} Error serializing pages`, err)
    }
  })

  const sitemapPath = path.join(`public`, output)

  return simpleSitemapAndIndex({
    hostname: siteUrl,
    destinationDir: sitemapPath,
    sourceData: serializedPages,
    limit: entryLimit,
    gzip: false,
  })
}
