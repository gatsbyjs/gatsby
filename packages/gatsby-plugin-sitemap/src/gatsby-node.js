import path from "path"
import fs from "fs"
import minimatch from "minimatch"
import { simpleSitemapAndIndex } from "./sitemap-writer"
import { validateOptions } from "./options-validation"
import {
  withoutTrailingSlash,
  prefixPath,
  defaultFilterPages,
  defaultExcludes,
} from "./internals"

const publicPath = `./public`

const reporterPrefix = `[plugin-sitemap]:`

exports.onPreInit = async ({ reporter }, pluginOptions) => {
  try {
    await validateOptions(pluginOptions)
    reporter.verbose(`${reporterPrefix} Plugin options passed validation.`)
  } catch (err) {
    reporter.panic(err)
  }
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
  } = await validateOptions(pluginOptions).catch(err => {
    reporter.panic(err)
  })

  const { data: queryRecords } = await graphql(query)

  reporter.verbose(
    `${reporterPrefix} Query Results` + JSON.stringify(queryRecords, null, 2)
  )

  const allPages = resolvePages(queryRecords)
  const siteUrl = resolveSiteUrl(queryRecords)

  reporter.verbose(
    `${reporterPrefix} Filtering ${allPages.length} pages based on ${excludes.length} excludes`
  )

  const filteredPages = allPages
    .filter(page => {
      const result = !defaultExcludes.some(exclude => {
        try {
          return defaultFilterPages(page, exclude, {
            minimatch,
            withoutTrailingSlash,
            resolvePagePath,
          })
        } catch (err) {
          reporter.panic(
            `${reporterPrefix} default filtering of pages failed. This shouldn't really be possible, please report a bug.`
          )

          return err
        }
      })

      if (!result) {
        reporter.verbose(
          `${reporterPrefix} Default filter excluded page ${resolvePagePath(
            page
          )}`
        )
      }

      return result
    })
    .filter(page => {
      const result = !excludes.some(exclude => {
        try {
          return filterPages(page, exclude, {
            minimatch,
            withoutTrailingSlash,
            resolvePagePath,
          })
        } catch (err) {
          reporter.panic(
            `${reporterPrefix} custom page filtering failed. If you've customized your excludes you may need to customize the "filterPages" function.`
          )

          return err
        }
      })

      if (!result) {
        reporter.verbose(
          `${reporterPrefix} Custom Filter excluded page ${resolvePagePath(
            page
          )}`
        )
      }

      return result
    })

  reporter.verbose(
    `${reporterPrefix} ${filteredPages.length} pages remain after filtering`
  )

  const serializedPages = filteredPages.map(page => {
    const { url, ...rest } = serialize(page, { resolvePagePath })

    return { url: prefixPath({ url, siteUrl, pathPrefix }), ...rest }
  })

  const sitemapPath = path.join(publicPath, output)

  //create destination directory if it doesn't exist
  if (!fs.existsSync(sitemapPath)) {
    fs.mkdirSync(sitemapPath)
  }

  return simpleSitemapAndIndex({
    hostname: siteUrl,
    destinationDir: sitemapPath,
    sourceData: serializedPages,
    limit: sitemapSize,
  })
}
