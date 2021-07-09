import chunk from "lodash/chunk"
import PQueue from "p-queue"

import { createGatsbyNodesFromWPGQLContentNodes } from "../create-nodes/create-nodes"
import { paginatedWpNodeFetch } from "./fetch-nodes-paginated"
import { formatLogMessage } from "~/utils/format-log-message"
import { CREATED_NODE_IDS } from "~/constants"

import store from "~/store"
import { getGatsbyApi, getPluginOptions } from "~/utils/get-gatsby-api"

import {
  getHardCachedNodes,
  restoreHardCachedNodes,
  setHardCachedNodes,
  setPersistentCache,
} from "~/utils/cache"

import fetchGraphql from "~/utils/fetch-graphql"

const nodesByTypeById = {}

const fetchNodesByIds = async () => {
  const fetchNodesByIdQueue = new PQueue({
    concurrency: 10,
  })

  const { helpers } = getGatsbyApi()
  const { reporter } = helpers

  const timer = reporter.activityTimer(formatLogMessage(`Fetch Nodes by ID`))

  timer.start()

  const typeNamesToQueryInfos = getContentTypeQueryInfos().reduce(
    (accumulator, current) => {
      accumulator[current.typeInfo.nodesTypeName] = current

      return accumulator
    },
    {}
  )

  const {
    data: {
      wpGatsby: { allIDs },
    },
  } = await fetchGraphql({
    query: /* GraphQL */ `
      query {
        wpGatsby {
          allIDs {
            type
            ids
          }
        }
      }
    `,
  })

  const fetchedTypeNames = allIDs.map(({ type }) => type)

  const pluginOptions = getPluginOptions()
  const {
    schema: { perPage },
  } = pluginOptions

  const idsSortedByIdCount = allIDs.sort((a, b) => a.ids.length - b.ids.length)

  for (const { type, ids } of idsSortedByIdCount) {
    const queryInfo = typeNamesToQueryInfos[type]

    const query = queryInfo.nodeListByIdsQuery

    const idChunks = chunk(ids, perPage)

    nodesByTypeById[type] = []

    const startedTimers = {}

    idChunks.map(async (idChunk, index) => {
      fetchNodesByIdQueue.add(async () => {
        if (!startedTimers[type]) {
          store.dispatch.logger.createActivityTimer({
            typeName: type,
            pluginOptions,
            reporter,
          })
          startedTimers[type] = true
        }

        const response = await fetchGraphql({
          query,
          variables: {
            ids: idChunk,
            first: perPage,
          },
        })

        const nodes = response.data?.[queryInfo.typeInfo.pluralName]?.nodes

        if (nodes.length) {
          nodes.forEach(node => nodesByTypeById[type].push(node))

          store.dispatch.logger.incrementActivityTimer({
            typeName: type,
            by: nodes.length,
          })
        }

        if (idChunks.length === index + 1) {
          store.dispatch.logger.stopActivityTimer({ typeName: type })
        }
      })
    })
  }

  const fetchNodesByIdFinishedPromise = fetchNodesByIdQueue.onIdle()

  fetchNodesByIdFinishedPromise.then(() => timer.end())

  return { fetchNodesByIdFinishedPromise, fetchedTypeNames }
}

/**
 * fetchWPGQLContentNodes
 *
 * fetches and paginates remote nodes by post type while reporting progress
 */
export const fetchWPGQLContentNodes = async ({ queryInfo }) => {
  const { pluginOptions, helpers } = store.getState().gatsbyApi
  const { reporter } = helpers
  const {
    url,
    schema: { perPage },
  } = pluginOptions

  const { nodeListQueries, typeInfo, settings } = queryInfo

  const typeName = typeInfo.nodesTypeName

  store.dispatch.logger.createActivityTimer({
    typeName,
    pluginOptions,
    reporter,
  })

  let allNodesOfContentType = []

  // there's normally just one query here, but more can be added using the settings.nodeListQueries api
  for (const nodeListQuery of nodeListQueries) {
    const contentNodes = await paginatedWpNodeFetch({
      first: perPage,
      after: null,
      contentTypePlural: typeInfo.pluralName,
      nodeTypeName: typeInfo.nodesTypeName,
      query: nodeListQuery,
      url,
      settings,
      helpers,
    })

    allNodesOfContentType = [...allNodesOfContentType, ...contentNodes]
  }

  store.dispatch.logger.stopActivityTimer({ typeName })

  if (allNodesOfContentType && allNodesOfContentType.length) {
    return {
      singular: queryInfo.typeInfo.singularName,
      plural: queryInfo.typeInfo.pluralName,
      allNodesOfContentType,
    }
  }

  return false
}

/**
 * getContentTypeQueryInfos
 *
 * returns query infos (Type info & GQL query strings) filtered to
 * remove types that are excluded in the plugin options
 *
 * @returns {Array} Type info & GQL query strings
 */
export const getContentTypeQueryInfos = () => {
  const { nodeQueries } = store.getState().remoteSchema
  const queryInfos = Object.values(nodeQueries).filter(
    ({ settings }) => !settings.exclude
  )
  return queryInfos
}

export const getGatsbyNodeTypeNames = () => {
  const { typeMap } = store.getState().remoteSchema

  const queryableTypenames = getContentTypeQueryInfos().map(
    query => query.typeInfo.nodesTypeName
  )

  const implementingNodeTypes = queryableTypenames.reduce(
    (accumulator, typename) => {
      const type = typeMap.get(typename)

      if (type.possibleTypes?.length) {
        accumulator = [
          ...accumulator,
          ...type.possibleTypes.map(({ name }) => name),
        ]
      }

      return accumulator
    },
    []
  )

  return [...new Set([...queryableTypenames, ...implementingNodeTypes])]
}

/**
 * fetchWPGQLContentNodesByContentType
 *
 * fetches nodes from the remote WPGQL server and groups them by post type
 *
 * @returns {Array}
 */
export const runFnForEachNodeQuery = async fn => {
  const nodeQueries = getContentTypeQueryInfos()

  const chunkSize = getPluginOptions()?.schema?.requestConcurrency || 15
  const chunkedQueries = chunk(nodeQueries, chunkSize)

  for (const queries of chunkedQueries) {
    await Promise.all(
      queries.map(async queryInfo => {
        if (
          // if the type settings call for lazyNodes, don't fetch them upfront here
          queryInfo.settings.lazyNodes ||
          // if this is a media item and the nodes aren't lazy, we only want to fetch referenced nodes, so we don't fetch all of them here.
          (!queryInfo.settings.lazyNodes &&
            queryInfo.typeInfo.nodesTypeName === `MediaItem`)
        ) {
          return
        }

        await fn({ queryInfo })
      })
    )
  }
}

export const fetchWPGQLContentNodesByContentType = async () => {
  const {
    fetchNodesByIdFinishedPromise,
    fetchedTypeNames,
  } = await fetchNodesByIds()

  const contentNodeGroups = []

  await runFnForEachNodeQuery(async ({ queryInfo }) => {
    if (fetchedTypeNames.includes(queryInfo.typeInfo.nodesTypeName)) {
      await fetchNodesByIdFinishedPromise

      const previousNodes = nodesByTypeById[queryInfo.typeInfo.nodesTypeName]
      const { singularName, pluralName } = queryInfo.typeInfo

      const contentNodeGroup = {
        singular: singularName,
        plural: pluralName,
        allNodesOfContentType: previousNodes,
      }

      contentNodeGroups.push(contentNodeGroup)
    } else {
      const contentNodeGroup = await fetchWPGQLContentNodes({ queryInfo })

      if (contentNodeGroup) {
        contentNodeGroups.push(contentNodeGroup)
      }
    }
  })

  return contentNodeGroups
}

/**
 * fetchAndCreateAllNodes
 *
 * uses query info (generated from introspection in onPreBootstrap) to
 * fetch and create Gatsby nodes from any lists of nodes in the remote schema
 */
export const fetchAndCreateAllNodes = async () => {
  const { helpers } = getGatsbyApi()
  const { reporter } = helpers

  //
  // fetch nodes from WPGQL
  const activity = reporter.activityTimer(formatLogMessage(`fetching nodes`))
  activity.start()

  store.subscribe(() => {
    activity.setStatus(`${store.getState().logger.entityCount} total`)
  })

  let createdNodeIds

  const hardCachedNodes = await getHardCachedNodes()

  if (!hardCachedNodes) {
    const wpgqlNodesByContentType = await fetchWPGQLContentNodesByContentType()

    const createNodesActivity = reporter.activityTimer(
      formatLogMessage(`creating nodes`)
    )
    createNodesActivity.start()

    //
    // Create Gatsby nodes from WPGQL response
    createdNodeIds = await createGatsbyNodesFromWPGQLContentNodes({
      wpgqlNodesByContentType,
      createNodesActivity,
    })

    await setHardCachedNodes({ helpers })

    createNodesActivity.end()
    activity.end()
  } else if (hardCachedNodes) {
    createdNodeIds = await restoreHardCachedNodes({
      hardCachedNodes,
    })
  }

  // save the node id's so we can touch them on the next build
  // so that we don't have to refetch all nodes
  await setPersistentCache({ key: CREATED_NODE_IDS, value: createdNodeIds })
}
