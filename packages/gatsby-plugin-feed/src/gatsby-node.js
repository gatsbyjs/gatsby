import path from "path"
import RSS from "rss"
import merge from "lodash.merge"
import { defaultOptions, runQuery, writeFile } from "./internals"

const publicPath = `./public`

// A default function to transform query data into feed entries.
const serialize = ({ query: { site, allMarkdownRemark } }) =>
  allMarkdownRemark.edges.map(edge => {
    return {
      ...edge.node.frontmatter,
      description: edge.node.excerpt || edge.node.frontmatter.excerpt,
      url: site.siteMetadata.siteUrl + edge.node.fields.slug,
      guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
      custom_elements: [{ "content:encoded": edge.node.html }],
    }
  })

exports.onPostBuild = async ({ graphql }, pluginOptions) => {
  delete pluginOptions.plugins

  /*
   * Run the site settings query to gather context, then
   * then run the corresponding feed for each query.
   */
  const options = {
    ...defaultOptions,
    ...pluginOptions,
  }

  if (`query` in options) {
    options.query = await runQuery(graphql, options.query)
  }

  for (let f of options.feeds) {
    if (f.query) {
      f.query = await runQuery(graphql, f.query)

      if (options.query) {
        f.query = merge(options.query, f.query)
        delete options.query
      }
    }

    const { setup, ...locals } = {
      ...options,
      ...f,
    }

    const feed = new RSS(setup(locals))
    const serializer =
      f.serialize && typeof f.serialize === `function` ? f.serialize : serialize
    const items = serializer(locals)

    items.forEach(i => feed.item(i))
    await writeFile(path.join(publicPath, f.output), feed.xml())
  }

  return Promise.resolve()
}
