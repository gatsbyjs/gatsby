const { dd } = require(`dumper.js`)
const checkPluginRequirements = require(`../../utils/check-plugin-requirements`)
const fetchAndApplyNodeUpdates = require(`./fetch-node-updates`)
const startIntervalRefetcher = require(`./interval-refetcher`)
const { fetchAndCreateAllNodes } = require(`./fetch-nodes`)

const { LAST_COMPLETED_SOURCE_TIME } = require(`../constants`)

const sourceNodes = async (helpers, pluginOptions) => {
  const api = [helpers, pluginOptions]

  // this potentially exits the node process
  await checkPluginRequirements(...api)

  const { cache } = helpers

  const lastCompletedSourceTime = await cache.get(LAST_COMPLETED_SOURCE_TIME)

  // If we've already successfully pulled everything from WPGraphQL
  // just pull the latest changes
  if (lastCompletedSourceTime) {
    await fetchAndApplyNodeUpdates(
      {
        since: lastCompletedSourceTime,
      },
      ...api
    )
  }

  // If our initial build to fetch and cache everything didn't complete,
  // or this is an uncached build, pull everything from WPGQL
  if (!lastCompletedSourceTime) {
    await fetchAndCreateAllNodes({}, ...api)
  }

  await cache.set(LAST_COMPLETED_SOURCE_TIME, Date.now())

  startIntervalRefetcher({}, ...api)
}

module.exports = sourceNodes
