const axios = require(`axios`)
const _ = require(`lodash`)

const { nodeFromData, downloadFile, isFileNode } = require(`./normalize`)
const { handleReferences, handleWebhookUpdate } = require(`./utils`)

const asyncPool = require(`tiny-async-pool`)
const bodyParser = require(`body-parser`)

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

  // Download all files (await for each pool to complete to fix concurrency issues)
  const fileNodes = [...nodes.values()].filter(isFileNode)
  if (fileNodes.length) {
    const downloadingFilesActivity = reporter.activityTimer(
      `Remote file download`
    )
    downloadingFilesActivity.start()
    await asyncPool(concurrentFileRequests, fileNodes, async node => {
      await downloadFile(
        { node, store, cache, createNode, createNodeId },
        pluginOptions
      )
    })
    downloadingFilesActivity.end()
  }

  // Create each node
  for (const node of nodes.values()) {
    node.internal.contentDigest = createContentDigest(node)
    createNode(node)
  }
}

exports.onCreateDevServer = (
  {
    app,
    createNodeId,
    getNode,
    actions,
    store,
    cache,
    createContentDigest,
    reporter,
  },
  pluginOptions
) => {
  app.use(
    `/___updatePreview/`,
    bodyParser.text({
      type: `application/json`,
    }),
    async (req, res) => {
      if (!_.isEmpty(req.body)) {
        const requestBody = JSON.parse(JSON.parse(req.body))
        const { secret, action, id } = requestBody
        if (pluginOptions.secret && pluginOptions.secret !== secret) {
          return reporter.warn(
            `The secret in this request did not match your plugin options secret.`
          )
        }
        if (action === `delete`) {
          actions.deleteNode({ node: getNode(createNodeId(id)) })
          return reporter.log(`Deleted node: ${id}`)
        }
        const nodeToUpdate = JSON.parse(JSON.parse(req.body)).data
        return await handleWebhookUpdate(
          {
            nodeToUpdate,
            actions,
            cache,
            createNodeId,
            createContentDigest,
            getNode,
            reporter,
            store,
          },
          pluginOptions
        )
      } else {
        res.status(400).send(`Received body was empty!`)
        return reporter.log(`Received body was empty!`)
      }
    }
  )
}
