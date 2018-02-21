import path from 'path'
import deepmerge from 'deepmerge'

import {
  defaultOptions,
  isFunction,
  runQuery,
  writeFile,
} from './internals'
import createFeed from './createFeed'
import serialize from './serialize'
import setup from './setup'

const publicPath = `./public`

exports.onPostBuild = async ({ graphql }, userOptions) => {
  delete userOptions.plugins

  // Merge default options with user options,
  // overriding the defaults.
  const pluginOptions = {
    ...defaultOptions,
    ...userOptions,
  }

  // If there is a top-level query to execute, do so,
  // and replace the original query with the result.
  // The resulting data will be used to generate the default
  // no-configuration-required feed, or will be deep-merged
  // with the result of any custom feed's query.
  if (pluginOptions.query) {
    pluginOptions.query = await runQuery(graphql, pluginOptions.query)
  }

  return Promise.all(pluginOptions.feeds.map(async (feed) => {
    // Each feed's inherits the result of the global query
    let feedOptions = {
      ...feed,
      query: pluginOptions.query,
    }

    // Each feed may specify a query of its own. If this
    // one has one, run it and deep merge it into the
    // global query result.
    if (feed.query) {
      const feedQuery = await runQuery(graphql, feed.query)
      feedOptions.query = deepmerge(feedOptions.query, feedQuery)
    }

    // Each feed may provide a `setup` function for the purpose
    // of remapping feed options before they are passed to node-rss
    const metadata = isFunction(feed.setup) ?
      feed.setup(feedOptions.query) :
      setup(feedOptions.query)

    // Create the feed instance
    const outputFeed = createFeed({
      metadata,
      entries: feedOptions.query.entries,
      output: feedOptions.output,
    })

    // Then serialize each feed item and add it to the feed
    const items = isFunction(feed.serialize) ?
      feed.serialize(feedOptions.query) :
      serialize(feedOptions.query)

    items.forEach(i => outputFeed.item(i))

    // Finally, write the feed file to disk
    await writeFile(path.join(publicPath, feed.output), outputFeed.xml())
  }))
}
