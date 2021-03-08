import path from "path"
import sitemap from "sitemap"
import {
  defaultOptions,
  filterQuery,
  writeFile,
  renameFile,
  withoutTrailingSlash,
} from "./internals"
import { stripIndent } from "common-tags"
import { parse } from "gatsby/graphql"

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
  const urls = await serialize(filteredRecords)

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
      sitemapSize: Joi.number().description(
        `The number of entries per sitemap file.`
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
