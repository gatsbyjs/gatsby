const { dd } = require(`dumper.js`)
const checkPluginRequirements = require(`../../utils/check-plugin-requirements`)
const { fetchNodeUpdates } = require(`./fetch-node-updates`)
const { fetchAndCreateAllNodes } = require(`./fetch-nodes`)

const { CREATED_NODE_IDS, LAST_COMPLETED_SOURCE_TIME } = require(`../constants`)

const sourceNodes = async (helpers, pluginOptions) => {
  const api = [helpers, pluginOptions]

  // this potentially exits the node process
  await checkPluginRequirements(...api)

  const { cache } = helpers

  const cachedNodeIds = await cache.get(CREATED_NODE_IDS)
  const lastCompletedSourceTime = await cache.get(LAST_COMPLETED_SOURCE_TIME)

  // If we've already successfully pulled everything from WPGraphQL
  // just pull the latest changes
  if (cachedNodeIds && lastCompletedSourceTime) {
    await fetchNodeUpdates({ since: lastCompletedSourceTime }, ...api)
  }

  // If we don't have cached nodes or
  // our initial build to fetch and cache everything didn't complete
  if (!cachedNodeIds || !lastCompletedSourceTime) {
    // pull everything from WPGQL
    await fetchAndCreateAllNodes(...api)
  }

  await cache.set(LAST_COMPLETED_SOURCE_TIME, Date.now())
}

module.exports = sourceNodes
