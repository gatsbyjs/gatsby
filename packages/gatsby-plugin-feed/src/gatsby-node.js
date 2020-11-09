import fs from "fs-extra"
import path from "path"
import RSS from "rss"
import merge from "lodash.merge"

import { defaultOptions, runQuery } from "./internals"
import pluginOptionsSchema from "./plugin-options"

const publicPath = `./public`

exports.pluginOptionsSchema = pluginOptionsSchema

// TODO: remove in the next major release
// A default function to transform query data into feed entries.
const serialize = ({ query: { site, allMarkdownRemark } }) =>
  allMarkdownRemark.edges.map(edge => {
    return {
      ...edge.node.frontmatter,
      description: edge.node.excerpt,
      url: site.siteMetadata.siteUrl + edge.node.fields.slug,
      guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
      custom_elements: [{ "content:encoded": edge.node.html }],
    }
  })

exports.onPostBuild = async ({ graphql }, pluginOptions) => {
  /*
   * Run the site settings query to gather context, then
   * then run the corresponding feed for each query.
   */
  const options = {
    ...defaultOptions,
    ...pluginOptions,
  }

  const baseQuery = await runQuery(graphql, options.query)

  for (let { ...feed } of options.feeds) {
    if (feed.query) {
      feed.query = await runQuery(graphql, feed.query).then(result =>
        merge({}, baseQuery, result)
      )
    }

    const { setup, ...locals } = {
      ...options,
      ...feed,
    }

    const serializer =
      feed.serialize && typeof feed.serialize === `function`
        ? feed.serialize
        : serialize

    const rssFeed = (await serializer(locals)).reduce((merged, item) => {
      merged.item(item)
      return merged
    }, new RSS(setup(locals)))

    const outputPath = path.join(publicPath, feed.output)
    const outputDir = path.dirname(outputPath)
    if (!(await fs.exists(outputDir))) {
      await fs.mkdirp(outputDir)
    }
    await fs.writeFile(outputPath, rssFeed.xml())
  }
}
