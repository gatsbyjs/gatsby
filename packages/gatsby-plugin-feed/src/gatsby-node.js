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
  let siteUrl =
    baseQuery.site.siteMetadata.site_url || baseQuery.site.siteMetadata.siteUrl
  // Remove the last slash of the url
  if (siteUrl) {
    siteUrl = siteUrl.replace(/\/$/, ``)
  }
  // Match any string that is:
  // - preceded by href or src followed by an equal sign and a double quote
  // - contains a slash one one or more characters
  // - succeeded by a double quote
  const regexForHrefAndSrc = /(?<=(?:href|src)=")\/.+?(?=")/g
  // Match any string that is:
  // - preceded by srcset=" or a comma and zero or more whitespaces
  // - contains a slash and a dot
  // - ends with either of jpeg, jpg, png, svg, or gif
  const regexForSrcSet = /(?<=srcset="|,\s*)\/.+?\.(?:jpe?g|png|svg|gif)/g
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
        const { custom_elements: customElems } = item
        if (
          customElems &&
          customElems.length &&
          customElems[0][`content:encoded`]
        ) {
          let html = item.custom_elements[0][`content:encoded`]
          html = html.replace(regexForHrefAndSrc, `${siteUrl}$&`)
          html = html.replace(regexForSrcSet, `${siteUrl}$&`)
          customElems[0][`content:encoded`] = html
        }
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
