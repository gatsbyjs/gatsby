import path from 'path'
import deepmerge from 'deepmerge'

import { defaultOptions, runQuery, writeFile } from './internals'
import createFeed from './createFeed'
import serialize from './serialize'

const publicPath = `./public`

exports.onPostBuild = async ({ graphql }, pluginOptions) => {
  delete pluginOptions.plugins

  // Merge default options with user options,
  // overriding the defaults.
  const options = {
    ...defaultOptions,
    ...pluginOptions,
  }

  // If there is a top-level query to execute, do so,
  // and replace the original query with the result.
  // The resulting data will be used to generate the default
  // no-configuration-required feed, or will be deep-merged
  // with the result of any custom feed's query.
  if (options.query) {
    options.query = await runQuery(graphql, options.query)
  }

  return Promise.all(options.feeds.map(async (feed) => {
    // Each feed's inherits the result of the global query
    const feedOptions = {
      ...feed,
      query: options.query,
    }

    // Each feed may specify a query of its own. If this
    // one has one, run it and deep merge it into the
    // global query result.
    if (feed.query) {
      const feedQuery = await runQuery(graphql, feed.query)
      feedOptions.query = deepmerge(feedOptions.query, feedQuery)
    }

    // Create the feed instance
    const outputFeed = createFeed(feedOptions)

    // Then serialize each feed item and add it to the feed
    const items = serialize(feedOptions)
    items.forEach(i => outputFeed.item(i))

    // Finally, write the feed file to disk
    await writeFile(path.join(publicPath, feed.output), outputFeed.xml())
  }))
}
