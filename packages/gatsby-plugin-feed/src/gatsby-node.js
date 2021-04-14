import fs from "fs-extra"
import path from "path"
import RSS from "rss"
import merge from "lodash.merge"

import { defaultOptions, runQuery } from "./internals"
import pluginOptionsSchema from "./plugin-options"

const publicPath = `./public`

exports.pluginOptionsSchema = pluginOptionsSchema

exports.onPostBuild = async ({ graphql, reporter }, pluginOptions) => {
  /*
   * Run the site settings query to gather context, then
   * then run the corresponding feed for each query.
   */
  const options = {
    ...defaultOptions,
    ...pluginOptions,
  }

  const baseQuery = await runQuery(graphql, options.query)

  for (const { ...feed } of options.feeds) {
    if (feed.query) {
      feed.query = await runQuery(graphql, feed.query).then(result =>
        merge({}, baseQuery, result)
      )
    }

    const { setup, ...locals } = {
      ...options,
      ...feed,
    }

    if (!feed.serialize || typeof feed.serialize !== `function`) {
      reporter.warn(
        `You did not pass in a valid serialize function. Your feed will not be generated.`
      )
    } else {
      const rssFeed = (await feed.serialize(locals)).reduce((merged, item) => {
        merged.item(item)
        return merged
      }, new RSS(setup(locals)))

      const outputPath = path.join(publicPath, feed.output)
      const outputDir = path.dirname(outputPath)
      if (!(await fs.pathExists(outputDir))) {
        await fs.mkdirp(outputDir)
      }
      await fs.writeFile(outputPath, rssFeed.xml())
    }
  }
}
