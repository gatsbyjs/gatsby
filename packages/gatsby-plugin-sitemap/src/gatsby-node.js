import path from "path"
import minimatch from "minimatch"
import { simpleSitemapAndIndex } from "sitemap"
import { validateOptions } from "./options-validation"
import {
  withoutTrailingSlash,
  prefixPath,
  defaultFilterPages,
  defaultExcludes,
} from "./internals"

const PublicPath = `./public`

const ReporterPrefix = `[gatsby-plugin-sitemap]:`

exports.onPreInit = async ({ reporter }, pluginOptions) => {
  try {
    await validateOptions(pluginOptions)
    reporter.verbose(`${ReporterPrefix} Plugin options passed validation.`)
  } catch (err) {
    reporter.panic(err)
  }
}

exports.onPostBuild = async (
  { graphql, reporter, pathPrefix },
  pluginOptions
) => {
  // Schema was already validated in preInit but we use joi to get our pluginOptions with default options.
  const {
    output,
    entryLimit,
    query,
    excludes,
    resolveSiteUrl,
    resolvePagePath,
    resolvePages,
    filterPages,
    serialize,
  } = await validateOptions(pluginOptions).catch(err => {
    reporter.panic(err)
  })

  const { data: queryRecords } = await graphql(query)

  reporter.verbose(
    `${ReporterPrefix} Query Results:\n${JSON.stringify(queryRecords, null, 2)}`
  )

  // resolvePages and resolveSuteUrl are allowed to be sync or async. The IIFE handles each possibility
  const allPages = await (async () => resolvePages(queryRecords))().catch(err =>
    reporter.panic(`Error resolving Pages`, err)
  )

  const siteUrl = await (async () =>
    resolveSiteUrl(queryRecords))().catch(err =>
    reporter.panic(`Error resolving Site URL`, err)
  )

  if (!Array.isArray(allPages)) {
    reporter.panic(`The \`resolvePages\` function did not return an array.`)
  }

  reporter.verbose(
    `${ReporterPrefix} Filtering ${allPages.length} pages based on ${excludes.length} excludes`
  )

  // Improve filter performance
  const filteredPages = allPages
    .filter(page => {
      // eslint-disable-next-line consistent-return
      const result = !defaultExcludes.some(exclude => {
        try {
          return defaultFilterPages(page, exclude, {
            minimatch,
            withoutTrailingSlash,
            resolvePagePath,
            reporter,
          })
        } catch (err) {
          reporter.panic(err.message)
        }
      })

      if (!result) {
        reporter.verbose(
          `${ReporterPrefix} Default filter excluded page ${resolvePagePath(
            page
          )}`
        )
      }

      return result
    })
    .filter(page => {
      // eslint-disable-next-line consistent-return
      const result = !excludes.some(exclude => {
        try {
          return filterPages(page, exclude, {
            minimatch,
            withoutTrailingSlash,
            resolvePagePath,
          })
        } catch (err) {
          reporter.panic(
            `${ReporterPrefix} custom page filtering failed.
            If you've customized your excludes you may need to provide a custom "filterPages" function in your config.
            https://www.gatsbyjs.com/plugins/gatsby-plugin-sitemap/#api-reference
            `
          )
        }
      })

      if (!result) {
        reporter.verbose(
          `${ReporterPrefix} Custom filtering excluded page ${resolvePagePath(
            page
          )}`
        )
      }

      return result
    })

  reporter.verbose(
    `${ReporterPrefix} ${filteredPages.length} pages remain after filtering`
  )

  // eslint-disable-next-line consistent-return
  const serializedPages = filteredPages.map(page => {
    try {
      const { url, ...rest } = serialize(page, { resolvePagePath })
      return { url: prefixPath({ url, siteUrl, pathPrefix }), ...rest }
    } catch (err) {
      reporter.panic(`Error serializing pages`, err)
    }
  })

  const sitemapPath = path.join(PublicPath, output)

  return simpleSitemapAndIndex({
    hostname: siteUrl,
    destinationDir: sitemapPath,
    sourceData: serializedPages,
    limit: entryLimit,
    gzip: false,
  })
}
