const axios = require(`axios`)
const _ = require(`lodash`)

const { nodeFromData, downloadFile, isFileNode } = require(`./normalize`)
const asyncPool = require(`tiny-async-pool`)
const bodyParser = require(`body-parser`)

const backRefsNamesLookup = new WeakMap()
const referencedNodesLookup = new WeakMap()

exports.sourceNodes = async (
  { actions, store, cache, createNodeId, createContentDigest, reporter },
  pluginOptions
) => {
  let {
    baseUrl,
    apiBase,
    basicAuth,
    filters,
    headers,
    params,
    concurrentFileRequests,
  } = pluginOptions
  const { createNode } = actions
  const drupalFetchActivity = reporter.activityTimer(`Fetch data from Drupal`)
  const downloadingFilesActivity = reporter.activityTimer(
    `Remote file download`
  )

  // Default apiBase to `jsonapi`
  apiBase = apiBase || `jsonapi`

  // Default concurrentFileRequests to `20`
  concurrentFileRequests = concurrentFileRequests || 20

  // Touch existing Drupal nodes so Gatsby doesn't garbage collect them.
  // _.values(store.getState().nodes)
  // .filter(n => n.internal.type.slice(0, 8) === `drupal__`)
  // .forEach(n => touchNode({ nodeId: n.id }))

  // Fetch articles.
  // console.time(`fetch Drupal data`)
  reporter.info(`Starting to fetch data from Drupal`)

  // TODO restore this
  // let lastFetched
  // if (
  // store.getState().status.plugins &&
  // store.getState().status.plugins[`gatsby-source-drupal`]
  // ) {
  // lastFetched = store.getState().status.plugins[`gatsby-source-drupal`].status
  // .lastFetched
  // }

  drupalFetchActivity.start()

  const data = await axios.get(`${baseUrl}/${apiBase}`, {
    auth: basicAuth,
    headers,
    params,
  })
  const allData = await Promise.all(
    _.map(data.data.links, async (url, type) => {
      if (type === `self`) return
      if (!url) return
      if (!type) return
      const getNext = async (url, data = []) => {
        if (typeof url === `object`) {
          // url can be string or object containing href field
          url = url.href

          // Apply any filters configured in gatsby-config.js. Filters
          // can be any valid JSON API filter query string.
          // See https://www.drupal.org/docs/8/modules/jsonapi/filtering
          if (typeof filters === `object`) {
            if (filters.hasOwnProperty(type)) {
              url = url + `?${filters[type]}`
            }
          }
        }

        let d
        try {
          console.log(`get`, url, params)
          d = await axios.get(url, {
            auth: basicAuth,
            headers,
            params,
          })
        } catch (error) {
          if (error.response && error.response.status == 405) {
            // The endpoint doesn't support the GET method, so just skip it.
            return []
          } else {
            console.error(`Failed to fetch ${url}`, error.message)
            console.log(error.data)
            throw error
          }
        }
        data = data.concat(d.data.data)
        if (d.data.links.next) {
          data = await getNext(d.data.links.next, data)
        }

        return data
      }

      const data = await getNext(url)

      const result = {
        type,
        data,
      }

      // eslint-disable-next-line consistent-return
      return result
    })
  )

  drupalFetchActivity.end()

  const nodes = new Map()

  // first pass - create basic nodes
  _.each(allData, contentType => {
    if (!contentType) return
    _.each(contentType.data, datum => {
      const node = nodeFromData(datum, createNodeId)
      nodes.set(node.id, node)
    })
  })

  // second pass - handle relationships and back references
  nodes.forEach(node => {
    handleReferences(node, {
      getNode: nodes.get.bind(nodes),
      createNodeId,
    })
  })

  reporter.info(`Downloading remote files from Drupal`)
  downloadingFilesActivity.start()

  // Download all files (await for each pool to complete to fix concurrency issues)
  await asyncPool(
    concurrentFileRequests,
    [...nodes.values()].filter(isFileNode),
    async node => {
      await downloadFile(
        { node, store, cache, createNode, createNodeId },
        pluginOptions
      )
    }
  )

  downloadingFilesActivity.end()

  // Create each node
  for (const node of nodes.values()) {
    node.internal.contentDigest = createContentDigest(node)
    createNode(node)
  }
}

exports.onCreateDevServer = (
  { app, createNodeId, getNode, actions, store, cache, createContentDigest },
  pluginOptions
) => {
  app.use(
    `/___updatePreview/`,
    bodyParser.text({
      type: `application/json`,
    }),
    async (req, res) => {
      const { createNode } = actions

      // we are missing handling of node deletion
      const nodeToUpdate = JSON.parse(JSON.parse(req.body)).data

      const newNode = nodeFromData(nodeToUpdate, createNodeId)

      const nodesToUpdate = [newNode]

      handleReferences(newNode, {
        getNode,
        createNodeId,
      })

      const oldNode = getNode(newNode.id)
      if (oldNode) {
        // copy over back references from old node
        const backRefsNames = backRefsNamesLookup.get(oldNode)
        if (backRefsNames) {
          backRefsNamesLookup.set(newNode, backRefsNames)
          backRefsNames.forEach(backRefFieldName => {
            newNode.relationships[backRefFieldName] =
              oldNode.relationships[backRefFieldName]
          })
        }

        const oldNodeReferencedNodes = referencedNodesLookup.get(oldNode)
        const newNodeReferencedNodes = referencedNodesLookup.get(newNode)

        // see what nodes are no longer referenced and remove backRefs from them
        const removedReferencedNodes = _.difference(
          oldNodeReferencedNodes,
          newNodeReferencedNodes
        ).map(id => getNode(id))

        nodesToUpdate.push(...removedReferencedNodes)

        const nodeFieldName = `${newNode.internal.type}___NODE`
        removedReferencedNodes.forEach(referencedNode => {
          referencedNode.relationships[
            nodeFieldName
          ] = referencedNode.relationships[nodeFieldName].filter(
            id => id !== newNode.id
          )
        })

        // see what nodes are newly referenced, and make sure to call `createNode` on them
        const addedReferencedNodes = _.difference(
          newNodeReferencedNodes,
          oldNodeReferencedNodes
        ).map(id => getNode(id))

        nodesToUpdate.push(...addedReferencedNodes)
      }

      // download file
      if (isFileNode(newNode)) {
        await downloadFile(
          {
            node: newNode,
            store,
            cache,
            createNode,
            createNodeId,
          },
          pluginOptions
        )
      }

      for (const node of nodesToUpdate) {
        if (node.internal.owner) {
          delete node.internal.owner
        }
        node.internal.contentDigest = createContentDigest(node)
        createNode(node)
        console.log(`\x1b[32m`, `Updated node: ${node.id}`)
      }
    }
  )
}

const handleReferences = (node, { getNode, createNodeId }) => {
  const relationships = node.relationships

  if (node.drupal_relationships) {
    const referencedNodes = []
    _.each(node.drupal_relationships, (v, k) => {
      if (!v.data) return
      const nodeFieldName = `${k}___NODE`
      if (_.isArray(v.data)) {
        relationships[nodeFieldName] = _.compact(
          v.data.map(data => {
            const referencedNodeId = createNodeId(data.id)
            if (!getNode(referencedNodeId)) {
              return null
            }

            referencedNodes.push(referencedNodeId)
            return referencedNodeId
          })
        )
      } else {
        const referencedNodeId = createNodeId(v.data.id)
        if (getNode(referencedNodeId)) {
          relationships[nodeFieldName] = referencedNodeId
          referencedNodes.push(referencedNodeId)
        }
      }
    })

    delete node.drupal_relationships
    referencedNodesLookup.set(node, referencedNodes)
    if (referencedNodes.length) {
      const nodeFieldName = `${node.internal.type}___NODE`
      referencedNodes.forEach(nodeID => {
        const referencedNode = getNode(nodeID)
        if (!referencedNode.relationships[nodeFieldName]) {
          referencedNode.relationships[nodeFieldName] = []
        }

        if (!referencedNode.relationships[nodeFieldName].includes(node.id)) {
          referencedNode.relationships[nodeFieldName].push(node.id)
        }

        let backRefsNames = backRefsNamesLookup.get(referencedNode)
        if (!backRefsNames) {
          backRefsNames = []
          backRefsNamesLookup.set(referencedNode, backRefsNames)
        }

        if (!backRefsNames.includes(nodeFieldName)) {
          backRefsNames.push(nodeFieldName)
        }
      })
    }
  }

  node.relationships = relationships
}
