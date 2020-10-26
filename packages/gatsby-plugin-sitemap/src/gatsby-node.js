import path from "path"
import { simpleSitemapAndIndex } from "sitemap"
import { validateOptions } from "./options-validation"
import { prefixPath, pageFilter, ReporterPrefix } from "./internals"
import { stripIndent } from "common-tags"
import { parse } from "gatsby/graphql"

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
    reporter.panic(`${ReporterPrefix} Error resolving Pages`, err)
  )

  const siteUrl = await (async () =>
    resolveSiteUrl(queryRecords))().catch(err =>
    reporter.panic(`${ReporterPrefix} Error resolving Site URL`, err)
  )

  if (!Array.isArray(allPages)) {
    reporter.panic(
      `${ReporterPrefix} The \`resolvePages\` function did not return an array.`
    )
  }

  reporter.verbose(
    `${ReporterPrefix} Filtering ${allPages.length} pages based on ${excludes.length} excludes`
  )

  // eslint-disable-next-line consistent-return
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
    `${ReporterPrefix} ${filteredPages.length} pages remain after filtering`
  )

  // eslint-disable-next-line consistent-return
  const serializedPages = filteredPages.map(page => {
    try {
      const { url, ...rest } = serialize(page, { resolvePagePath })
      return { url: prefixPath({ url, siteUrl, pathPrefix }), ...rest }
    } catch (err) {
      reporter.panic(`${ReporterPrefix} Error serializing pages`, err)
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

if (process.env.GATSBY_EXPERIMENTAL_PLUGIN_OPTION_VALIDATION) {
  exports.pluginOptionsSchema = ({ Joi }) =>
    Joi.object()
      .keys({
        output: Joi.string()
          .default(`/sitemap.xml`)
          .description(`The filepath and name`),
        exclude: Joi.array()
          .items(Joi.string())
          .description(`An array of paths to exclude from the sitemap`),
        createLinkInHead: Joi.boolean()
          .default(true)
          .description(
            `Whether to populate the \`<head>\` of your site with a link to the sitemap.`
          ),
        serialize: Joi.function().description(
          `Takes the output of the data query and lets you return an array of sitemap entries.`
        ),
        resolveSiteUrl: Joi.function().description(
          `Takes the output of the data query and lets you return the site URL.`
        ),
        query: Joi.string().description(
          stripIndent`
      The query for the data you need to generate the sitemap. It’s required to get the site’s URL, 
      if you are not fetching it from site.siteMetadata.siteUrl, you will need to set a custom resolveSiteUrl function. 
      If you override the query, you probably will also need to set a serializer to return the correct data for the sitemap. 
      Due to how this plugin was built it is currently expected/required to fetch the page paths from allSitePage, 
      but you may use the allSitePage.edges.node or allSitePage.nodes query structure.`
        ),
      })
      .external(({ query }) => {
        if (query) {
          try {
            parse(query)
          } catch (e) {
            throw new Error(
              stripIndent`
            Invalid plugin options for "gatsby-plugin-sitemap":
            "query" must be a valid GraphQL query. Received the error "${e.message}"`
            )
          }
        }
      })
}
