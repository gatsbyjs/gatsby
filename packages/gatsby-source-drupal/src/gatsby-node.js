const axios = require(`axios`)
const _ = require(`lodash`)

const {
  nodeFromData,
  downloadFile,
  isFileNode,
  createNodeIdWithVersion,
} = require(`./normalize`)
const {
  handleReferences,
  handleWebhookUpdate,
  fetchLanguageConfig,
} = require(`./utils`)

const asyncPool = require(`tiny-async-pool`)
const bodyParser = require(`body-parser`)

function gracefullyRethrow(activity, error) {
  // activity.panicOnBuild was implemented at some point in gatsby@2
  // but plugin can still be used with older version of gatsby core
  // so need to do some checking here
  if (activity.panicOnBuild) {
    activity.panicOnBuild(error)
  }

  activity.end()

  if (!activity.panicOnBuild) {
    throw error
  }
}

exports.sourceNodes = async (
  {
    actions,
    store,
    cache,
    createNodeId,
    createContentDigest,
    getCache,
    getNode,
    getNodes,
    parentSpan,
    reporter,
    webhookBody,
  },
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
    disallowedLinkTypes,
    skipFileDownloads,
    fastBuilds,
    translation,
    entityReferenceRevisions = [],
  } = pluginOptions
  const { createNode, setPluginStatus, touchNode } = actions

  // Default apiBase to `jsonapi`
  apiBase = apiBase || `jsonapi`

  // Default disallowedLinkTypes to self, describedby.
  disallowedLinkTypes = disallowedLinkTypes || [`self`, `describedby`]

  // Default concurrentFileRequests to `20`
  concurrentFileRequests = concurrentFileRequests || 20

  // Default skipFileDownloads to false.
  skipFileDownloads = skipFileDownloads || false

  // Determine what entities can be translated and what languages are enabled.
  let languageConfig = store.getState().status.plugins?.[`gatsby-source-drupal`]
    ?.languageConfig

  if (!languageConfig) {
    languageConfig = await fetchLanguageConfig({
      translation,
      baseUrl,
      apiBase,
      basicAuth,
      headers,
      params,
    })

    if (translation && !languageConfig.enabledLanguages.length) {
      reporter.warn(
        `The translation option is enabled but no enabled languages were retrieved from Drupal. Make sure your basicAuth credentials in the Gatsby config file are populated with a user that has the "administer languages" permission.`
      )
    }
  }

  setPluginStatus({ languageConfig })

  if (webhookBody && Object.keys(webhookBody).length) {
    const changesActivity = reporter.activityTimer(
      `loading Drupal content changes`,
      {
        parentSpan,
      }
    )
    changesActivity.start()

    try {
      const { secret, action, id, data } = webhookBody
      if (pluginOptions.secret && pluginOptions.secret !== secret) {
        reporter.warn(
          `The secret in this request did not match your plugin options secret.`
        )
        changesActivity.end()
        return
      }
      if (action === `delete`) {
        actions.deleteNode(getNode(createNodeId(id)))
        reporter.log(`Deleted node: ${id}`)
        changesActivity.end()
        return
      }

      let nodesToUpdate = data
      if (!Array.isArray(data)) {
        nodesToUpdate = [data]
      }

      for (const nodeToUpdate of nodesToUpdate) {
        await handleWebhookUpdate(
          {
            nodeToUpdate,
            actions,
            cache,
            createNodeId,
            createContentDigest,
            getCache,
            getNode,
            reporter,
            store,
            languageConfig,
          },
          pluginOptions
        )
      }
    } catch (e) {
      gracefullyRethrow(changesActivity, e)
      return
    }
    changesActivity.end()
    return
  }

  fastBuilds = fastBuilds || false
  if (fastBuilds) {
    const lastFetched =
      store.getState().status.plugins?.[`gatsby-source-drupal`]?.lastFetched ??
      0

    const drupalFetchIncrementalActivity = reporter.activityTimer(
      `Fetch incremental changes from Drupal`
    )
    let requireFullRebuild = false

    drupalFetchIncrementalActivity.start()

    try {
      // Hit fastbuilds endpoint with the lastFetched date.
      const data = await axios.get(
        `${baseUrl}/gatsby-fastbuilds/sync/${lastFetched}`,
        {
          auth: basicAuth,
          headers,
          params,
        }
      )

      if (data.data.status === -1) {
        // The incremental data is expired or this is the first fetch.
        reporter.info(`Unable to pull incremental data changes from Drupal`)
        setPluginStatus({ lastFetched: data.data.timestamp })
        requireFullRebuild = true
      } else {
        // Touch nodes so they are not garbage collected by Gatsby.
        getNodes().forEach(node => {
          if (node.internal.owner === `gatsby-source-drupal`) {
            touchNode(node)
          }
        })

        // Process sync data from Drupal.
        const nodesToSync = data.data.entities
        for (const nodeSyncData of nodesToSync) {
          if (nodeSyncData.action === `delete`) {
            actions.deleteNode(
              getNode(
                createNodeId(
                  createNodeIdWithVersion(
                    nodeSyncData.id,
                    nodeSyncData.type,
                    nodeSyncData.langcode,
                    nodeSyncData.attributes?.drupal_internal__revision_id,
                    entityReferenceRevisions
                  )
                )
              )
            )
          } else {
            // The data could be a single Drupal entity or an array of Drupal
            // entities to update.
            let nodesToUpdate = nodeSyncData.data
            if (!Array.isArray(nodeSyncData.data)) {
              nodesToUpdate = [nodeSyncData.data]
            }

            for (const nodeToUpdate of nodesToUpdate) {
              await handleWebhookUpdate(
                {
                  nodeToUpdate,
                  actions,
                  cache,
                  createNodeId,
                  createContentDigest,
                  getCache,
                  getNode,
                  reporter,
                  store,
                  languageConfig,
                },
                pluginOptions
              )
            }
          }
        }

        setPluginStatus({ lastFetched: data.data.timestamp })
      }
    } catch (e) {
      gracefullyRethrow(drupalFetchIncrementalActivity, e)
      return
    }

    drupalFetchIncrementalActivity.end()

    if (!requireFullRebuild) {
      return
    }
  }

  const drupalFetchActivity = reporter.activityTimer(
    `Fetch all data from Drupal`
  )

  // Fetch articles.
  reporter.info(`Starting to fetch all data from Drupal`)

  drupalFetchActivity.start()

  let allData
  try {
    const data = await axios.get(`${baseUrl}/${apiBase}`, {
      auth: basicAuth,
      headers,
      params,
    })
    allData = await Promise.all(
      _.map(data.data.links, async (url, type) => {
        if (disallowedLinkTypes.includes(type)) return
        if (!url) return
        if (!type) return

        // Lookup this type in our list of language alterable entities.
        const isTranslatable = languageConfig.translatableEntities.some(
          entity => entity.id === type
        )

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
          // Add support for includes. Includes allow entity data to be expanded
          // based on relationships. The expanded data is exposed as `included`
          // in the JSON API response.
          // See https://www.drupal.org/docs/8/modules/jsonapi/includes
          if (d.data.included) {
            data = data.concat(d.data.included)
          }
          if (d.data.links && d.data.links.next) {
            data = await getNext(d.data.links.next, data)
          }

          return data
        }

        let data = []
        if (isTranslatable === false) {
          data = await getNext(url)
        } else {
          for (let i = 0; i < languageConfig.enabledLanguages.length; i++) {
            const currentLanguage = languageConfig.enabledLanguages[i]
            const urlPath = url.href.split(`${apiBase}/`).pop()
            const baseUrlWithoutTrailingSlash = baseUrl.replace(/\/$/, ``)
            const dataForLanguage = await getNext(
              `${baseUrlWithoutTrailingSlash}/${currentLanguage}/${apiBase}/${urlPath}`
            )

            data = data.concat(dataForLanguage)
          }
        }

        const result = {
          type,
          data,
        }

        // eslint-disable-next-line consistent-return
        return result
      })
    )
  } catch (e) {
    gracefullyRethrow(drupalFetchActivity, e)
    return
  }

  drupalFetchActivity.end()

  const nodes = new Map()

  // first pass - create basic nodes
  _.each(allData, contentType => {
    if (!contentType) return
    _.each(contentType.data, datum => {
      if (!datum) return
      const node = nodeFromData(datum, createNodeId, entityReferenceRevisions)
      nodes.set(node.id, node)
    })
  })

  // second pass - handle relationships and back references
  nodes.forEach(node => {
    handleReferences(node, {
      getNode: nodes.get.bind(nodes),
      createNodeId,
      entityReferenceRevisions,
    })
  })

  if (skipFileDownloads) {
    reporter.info(`Skipping remote file download from Drupal`)
  } else {
    reporter.info(`Downloading remote files from Drupal`)

    // Download all files (await for each pool to complete to fix concurrency issues)
    const fileNodes = [...nodes.values()].filter(isFileNode)

    if (fileNodes.length) {
      const downloadingFilesActivity = reporter.activityTimer(
        `Remote file download`
      )
      downloadingFilesActivity.start()
      try {
        await asyncPool(concurrentFileRequests, fileNodes, async node => {
          await downloadFile(
            {
              node,
              store,
              cache,
              createNode,
              createNodeId,
              getCache,
              reporter,
            },
            pluginOptions
          )
        })
      } catch (e) {
        gracefullyRethrow(downloadingFilesActivity, e)
        return
      }
      downloadingFilesActivity.end()
    }
  }

  // Create each node
  for (const node of nodes.values()) {
    node.internal.contentDigest = createContentDigest(node)
    createNode(node)
  }

  return
}

// This is maintained for legacy reasons and will eventually be removed.
exports.onCreateDevServer = (
  {
    app,
    createNodeId,
    getNode,
    actions,
    store,
    cache,
    createContentDigest,
    getCache,
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
      console.warn(
        `The ___updatePreview callback is now deprecated and will be removed in the future. Please use the __refresh callback instead.`
      )
      if (!_.isEmpty(req.body)) {
        const requestBody = JSON.parse(JSON.parse(req.body))
        const { secret, action, id } = requestBody
        if (pluginOptions.secret && pluginOptions.secret !== secret) {
          return reporter.warn(
            `The secret in this request did not match your plugin options secret.`
          )
        }
        if (action === `delete`) {
          actions.deleteNode(getNode(createNodeId(id)))
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
            getCache,
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
