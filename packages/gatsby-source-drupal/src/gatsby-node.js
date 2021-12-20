const got = require(`got`)
const _ = require(`lodash`)
const urlJoin = require(`url-join`)
import HttpAgent from "agentkeepalive"
// const http2wrapper = require(`http2-wrapper`)
const opentracing = require(`opentracing`)
const { SemanticAttributes } = require(`@opentelemetry/semantic-conventions`)

const { HttpsAgent } = HttpAgent

const { setOptions, getOptions } = require(`./plugin-options`)

const { nodeFromData, downloadFile, isFileNode } = require(`./normalize`)
const {
  initRefsLookups,
  storeRefsLookups,
  handleReferences,
  handleWebhookUpdate,
  createNodeIfItDoesNotExist,
  handleDeletedNode,
  drupalCreateNodeManifest,
} = require(`./utils`)

const agent = {
  http: new HttpAgent(),
  https: new HttpsAgent(),
  // http2: new http2wrapper.Agent(),
}

let start
let apiRequestCount = 0
let initialSourcing = true
let globalReporter
async function worker([url, options]) {
  const tracer = opentracing.globalTracer()
  const httpSpan = tracer.startSpan(`http.get`, {
    childOf: options.parentSpan,
  })
  const parsedUrl = new URL(url)
  httpSpan.setTag(SemanticAttributes.HTTP_URL, url)
  httpSpan.setTag(SemanticAttributes.HTTP_HOST, parsedUrl.host)
  httpSpan.setTag(
    SemanticAttributes.HTTP_SCHEME,
    parsedUrl.protocol.replace(/:$/, ``)
  )
  httpSpan.setTag(SemanticAttributes.HTTP_TARGET, parsedUrl.pathname)
  httpSpan.setTag(`plugin`, `gatsby-source-drupal`)

  // Log out progress during the initial sourcing.
  if (initialSourcing) {
    apiRequestCount += 1
    if (!start) {
      start = Date.now()
    }
    const queueLength = requestQueue.length()
    if (apiRequestCount % 50 === 0) {
      globalReporter.verbose(
        `gatsby-source-drupal has ${queueLength} API requests queued and the current request rate is ${(
          apiRequestCount /
          ((Date.now() - start) / 1000)
        ).toFixed(2)} requests / second`
      )
    }
  }

  if (typeof options.searchParams === `object`) {
    url = new URL(url)
    const searchParams = new URLSearchParams(options.searchParams)
    const searchKeys = Array.from(searchParams.keys())
    searchKeys.forEach(searchKey => {
      // Only add search params to url if it has not already been
      // added.
      if (!url.searchParams.has(searchKey)) {
        url.searchParams.set(searchKey, searchParams.get(searchKey))
      }
    })
    url = url.toString()
  }
  delete options.searchParams

  const response = await got(url, {
    agent,
    cache: false,
    timeout: {
      // Occasionally requests to Drupal stall. Set a 30s timeout to retry in this case.
      request: 30000,
    },
    // request: http2wrapper.auto,
    // http2: true,
    ...options,
  })

  httpSpan.setTag(SemanticAttributes.HTTP_STATUS_CODE, response?.statusCode)
  httpSpan.setTag(SemanticAttributes.HTTP_METHOD, `GET`)
  httpSpan.setTag(SemanticAttributes.NET_PEER_IP, response?.ip)
  httpSpan.setTag(
    SemanticAttributes.HTTP_RESPONSE_CONTENT_LENGTH,
    response?.rawBody?.length
  )

  httpSpan.finish()

  return response
}

const requestQueue = require(`fastq`).promise(worker, 20)

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

exports.onPreBootstrap = (_, pluginOptions) => {
  setOptions(pluginOptions)
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
  const tracer = opentracing.globalTracer()

  globalReporter = reporter
  const {
    baseUrl,
    apiBase = `jsonapi`,
    basicAuth = {},
    filters,
    headers,
    params = {},
    concurrentFileRequests = 20,
    concurrentAPIRequests = 20,
    disallowedLinkTypes = [
      `self`,
      `describedby`,
      `contact_message--feedback`,
      `contact_message--personal`,
    ],
    skipFileDownloads = false,
    fastBuilds = false,
    entityReferenceRevisions = [],
    languageConfig = {
      defaultLanguage: `und`,
      enabledLanguages: [`und`],
      translatableEntities: [],
      nonTranslatableEntities: [],
    },
  } = pluginOptions
  const {
    createNode,
    setPluginStatus,
    touchNode,
    unstable_createNodeManifest,
  } = actions

  await initRefsLookups({ cache, getNode })

  // Update the concurrency limit from the plugin options
  requestQueue.concurrency = concurrentAPIRequests

  if (webhookBody && Object.keys(webhookBody).length) {
    const changesActivity = reporter.activityTimer(
      `loading Drupal content changes`,
      {
        parentSpan,
      }
    )
    changesActivity.start()

    try {
      const { secret, action, data } = webhookBody
      if (pluginOptions.secret && pluginOptions.secret !== secret) {
        reporter.warn(
          `The secret in this request did not match your plugin options secret.`
        )
        changesActivity.end()
        return
      }

      if (!action || !data) {
        reporter.warn(
          `The webhook body was malformed

${JSON.stringify(webhookBody, null, 4)}`
        )

        changesActivity.end()
        return
      }

      if (action === `delete`) {
        let nodesToDelete = data
        if (!Array.isArray(data)) {
          nodesToDelete = [data]
        }

        for (const nodeToDelete of nodesToDelete) {
          const deletedNode = await handleDeletedNode({
            actions,
            getNode,
            node: nodeToDelete,
            createNodeId,
            createContentDigest,
            entityReferenceRevisions,
          })
          reporter.log(`Deleted node: ${deletedNode.id}`)
        }

        changesActivity.end()
        await storeRefsLookups({ cache })
        return
      }

      let nodesToUpdate = data
      if (!Array.isArray(data)) {
        nodesToUpdate = [data]
      }

      for (const nodeToUpdate of nodesToUpdate) {
        await createNodeIfItDoesNotExist({
          nodeToUpdate,
          actions,
          createNodeId,
          createContentDigest,
          getNode,
          reporter,
        })
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
    await storeRefsLookups({ cache })
    return
  }

  if (fastBuilds) {
    const fastBuildsSpan = tracer.startSpan(`sourceNodes.fetch`, {
      childOf: parentSpan,
    })
    fastBuildsSpan.setTag(`plugin`, `gatsby-source-drupal`)
    fastBuildsSpan.setTag(`sourceNodes.fetch.type`, `delta`)

    const lastFetched =
      store.getState().status.plugins?.[`gatsby-source-drupal`]?.lastFetched

    reporter.verbose(
      `[gatsby-source-drupal]: value of lastFetched for fastbuilds "${lastFetched}"`
    )

    let requireFullRebuild = false

    // lastFetched isn't set so do a full rebuild.
    if (!lastFetched) {
      setPluginStatus({ lastFetched: Math.floor(new Date().getTime() / 1000) })
      requireFullRebuild = true
    } else {
      const drupalFetchIncrementalActivity = reporter.activityTimer(
        `Fetch incremental changes from Drupal`,
        { parentSpan: fastBuildsSpan }
      )

      drupalFetchIncrementalActivity.start()

      try {
        // Hit fastbuilds endpoint with the lastFetched date.
        const res = await requestQueue.push([
          urlJoin(
            baseUrl,
            `gatsby-fastbuilds/sync/`,
            Math.floor(lastFetched).toString()
          ),
          {
            username: basicAuth.username,
            password: basicAuth.password,
            headers,
            searchParams: params,
            responseType: `json`,
            parentSpan: fastBuildsSpan,
          },
        ])

        // Fastbuilds returns a -1 if:
        // - the timestamp has expired
        // - if old fastbuild logs were purged
        // - it's been a really long time since you synced so you just do a full fetch.
        if (res.body.status === -1) {
          // The incremental data is expired or this is the first fetch.
          reporter.info(`Unable to pull incremental data changes from Drupal`)
          setPluginStatus({ lastFetched: res.body.timestamp })
          requireFullRebuild = true
        } else {
          // Touch nodes so they are not garbage collected by Gatsby.
          if (initialSourcing) {
            const touchNodesSpan = tracer.startSpan(`sourceNodes.touchNodes`, {
              childOf: fastBuildsSpan,
            })
            touchNodesSpan.setTag(`plugin`, `gatsby-source-drupal`)
            let touchCount = 0
            getNodes().forEach(node => {
              if (node.internal.owner === `gatsby-source-drupal`) {
                touchCount += 1
                touchNode(node)
              }
            })
            touchNodesSpan.setTag(`sourceNodes.touchNodes.count`, touchCount)
            touchNodesSpan.finish()
          }

          const createNodesSpan = tracer.startSpan(`sourceNodes.createNodes`, {
            childOf: parentSpan,
          })
          createNodesSpan.setTag(`plugin`, `gatsby-source-drupal`)
          createNodesSpan.setTag(`sourceNodes.fetch.type`, `delta`)
          createNodesSpan.setTag(
            `sourceNodes.createNodes.count`,
            res.body.entities?.length
          )

          // Process sync data from Drupal.
          const nodesToSync = res.body.entities

          // First create all nodes that we haven't seen before. That
          // way we can create relationships correctly next as the nodes
          // will exist in Gatsby.
          for (const nodeSyncData of nodesToSync) {
            if (nodeSyncData.action === `delete`) {
              continue
            }

            let nodesToUpdate = nodeSyncData.data
            if (!Array.isArray(nodeSyncData.data)) {
              nodesToUpdate = [nodeSyncData.data]
            }
            for (const nodeToUpdate of nodesToUpdate) {
              createNodeIfItDoesNotExist({
                nodeToUpdate,
                actions,
                createNodeId,
                createContentDigest,
                getNode,
                reporter,
              })
            }
          }

          for (const nodeSyncData of nodesToSync) {
            if (nodeSyncData.action === `delete`) {
              handleDeletedNode({
                actions,
                getNode,
                node: nodeSyncData,
                createNodeId,
                createContentDigest,
                entityReferenceRevisions,
              })
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

          createNodesSpan.finish()
          setPluginStatus({ lastFetched: res.body.timestamp })
        }
      } catch (e) {
        gracefullyRethrow(drupalFetchIncrementalActivity, e)

        drupalFetchIncrementalActivity.end()
        fastBuildsSpan.finish()
        await storeRefsLookups({ cache })
        return
      }

      drupalFetchIncrementalActivity.end()
      fastBuildsSpan.finish()

      // We're now done with the initial (fastbuilds flavored) sourcing.
      initialSourcing = false

      if (!requireFullRebuild) {
        await storeRefsLookups({ cache })
        return
      }
    }
  }

  const drupalFetchActivity = reporter.activityTimer(
    `Fetch all data from Drupal`,
    { parentSpan }
  )
  const fullFetchSpan = tracer.startSpan(`sourceNodes.fetch`, {
    childOf: parentSpan,
  })
  fullFetchSpan.setTag(`plugin`, `gatsby-source-drupal`)
  fullFetchSpan.setTag(`sourceNodes.fetch.type`, `full`)

  // Fetch articles.
  reporter.info(`Starting to fetch all data from Drupal`)

  drupalFetchActivity.start()

  let allData
  const typeRequestsQueued = new Set()
  try {
    const res = await requestQueue.push([
      urlJoin(baseUrl, apiBase),
      {
        username: basicAuth.username,
        password: basicAuth.password,
        headers,
        searchParams: params,
        responseType: `json`,
        parentSpan: fullFetchSpan,
      },
    ])
    allData = await Promise.all(
      _.map(res.body.links, async (url, type) => {
        const dataArray = []
        if (disallowedLinkTypes.includes(type)) return
        if (!url) return
        if (!type) return

        // Lookup this type in our list of language alterable entities.
        const isTranslatable = languageConfig.translatableEntities.some(
          entityType => entityType === type
        )

        const getNext = async (url, currentLanguage) => {
          if (typeof url === `object`) {
            // url can be string or object containing href field
            url = url.href

            // Apply any filters configured in gatsby-config.js. Filters
            // can be any valid JSON API filter query string.
            // See https://www.drupal.org/docs/8/modules/jsonapi/filtering
            if (typeof filters === `object`) {
              if (filters.hasOwnProperty(type)) {
                url = new URL(url)
                const filterParams = new URLSearchParams(filters[type])
                const filterKeys = Array.from(filterParams.keys())
                filterKeys.forEach(filterKey => {
                  // Only add filter params to url if it has not already been
                  // added.
                  if (!url.searchParams.has(filterKey)) {
                    url.searchParams.set(filterKey, filterParams.get(filterKey))
                  }
                })
                url = url.toString()
              }
            }
          }

          let d
          try {
            d = await requestQueue.push([
              url,
              {
                username: basicAuth.username,
                password: basicAuth.password,
                headers,
                searchParams: params,
                responseType: `json`,
                parentSpan: fullFetchSpan,
              },
            ])
          } catch (error) {
            if (error.response && error.response.statusCode == 405) {
              // The endpoint doesn't support the GET method, so just skip it.
              return
            } else {
              console.error(`Failed to fetch ${url}`, error.message)
              console.log(error)
              throw error
            }
          }
          dataArray.push(...d.body.data)
          // Add support for includes. Includes allow entity data to be expanded
          // based on relationships. The expanded data is exposed as `included`
          // in the JSON API response.
          // See https://www.drupal.org/docs/8/modules/jsonapi/includes
          if (d.body.included) {
            dataArray.push(...d.body.included)
          }

          // If JSON:API extras is configured to add the resource count, we can queue
          // all API requests immediately instead of waiting for each request to return
          // the next URL. This lets us request resources in parallel vs. sequentially
          // which is much faster.
          if (d.body.meta?.count) {
            const typeLangKey = type + currentLanguage
            // If we hadn't added urls yet
            if (
              d.body.links.next?.href &&
              !typeRequestsQueued.has(typeLangKey)
            ) {
              typeRequestsQueued.add(typeLangKey)

              // Get count of API requests
              // We round down as we've already gotten the first page at this point.
              const pageSize = new URL(d.body.links.next.href).searchParams.get(
                `page[limit]`
              )
              const requestsCount = Math.floor(d.body.meta.count / pageSize)

              reporter.verbose(
                `queueing ${requestsCount} API requests for type ${type} which has ${d.body.meta.count} entities.`
              )

              const newUrl = new URL(d.body.links.next.href)
              await Promise.all(
                _.range(requestsCount).map(pageOffset => {
                  // We're starting 1 ahead.
                  pageOffset += 1
                  // Construct URL with new pageOffset.
                  newUrl.searchParams.set(`page[offset]`, pageOffset * pageSize)
                  return getNext(newUrl.toString(), currentLanguage)
                })
              )
            }
          } else if (d.body.links?.next) {
            await getNext(d.body.links.next, currentLanguage)
          }
        }

        if (isTranslatable === false) {
          await getNext(url, ``)
        } else {
          for (let i = 0; i < languageConfig.enabledLanguages.length; i++) {
            let currentLanguage = languageConfig.enabledLanguages[i]
            const urlPath = url.href.split(`${apiBase}/`).pop()
            const baseUrlWithoutTrailingSlash = baseUrl.replace(/\/$/, ``)
            // The default language's JSON API is at the root.
            if (
              currentLanguage === getOptions().languageConfig.defaultLanguage ||
              baseUrlWithoutTrailingSlash.slice(-currentLanguage.length) ==
                currentLanguage
            ) {
              currentLanguage = ``
            }

            const joinedUrl = urlJoin(
              baseUrlWithoutTrailingSlash,
              currentLanguage,
              apiBase,
              urlPath
            )

            await getNext(joinedUrl, currentLanguage)
          }
        }

        const result = {
          type,
          data: dataArray,
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
  fullFetchSpan.finish()

  const createNodesSpan = tracer.startSpan(`sourceNodes.createNodes`, {
    childOf: parentSpan,
  })
  createNodesSpan.setTag(`plugin`, `gatsby-source-drupal`)
  createNodesSpan.setTag(`sourceNodes.fetch.type`, `full`)

  const nodes = new Map()

  // first pass - create basic nodes
  _.each(allData, contentType => {
    if (!contentType) return
    _.each(contentType.data, datum => {
      if (!datum) return
      const node = nodeFromData(datum, createNodeId, entityReferenceRevisions)
      drupalCreateNodeManifest({
        attributes: datum?.attributes,
        gatsbyNode: node,
        unstable_createNodeManifest,
      })
      nodes.set(node.id, node)
    })
  })

  createNodesSpan.setTag(`sourceNodes.createNodes.count`, nodes.size)

  // second pass - handle relationships and back references
  nodes.forEach(node => {
    handleReferences(node, {
      getNode: nodes.get.bind(nodes),
      mutateNode: true,
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
        `Remote file download`,
        { parentSpan }
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

  // We're now done with the initial sourcing.
  initialSourcing = false

  createNodesSpan.finish()
  await storeRefsLookups({ cache, getNodes })
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

exports.pluginOptionsSchema = ({ Joi }) =>
  Joi.object({
    baseUrl: Joi.string()
      .required()
      .description(`The URL to root of your Drupal instance`),
    apiBase: Joi.string().description(
      `The path to the root of the JSONAPI — defaults to "jsonapi"`
    ),
    basicAuth: Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
    }).description(`Enables basicAuth`),
    filters: Joi.object().description(
      `Pass filters to the JSON API for specific collections`
    ),
    headers: Joi.object().description(
      `Set request headers for requests to the JSON API`
    ),
    params: Joi.object().description(`Append optional GET params to requests`),
    concurrentFileRequests: Joi.number().integer().default(20).min(1),
    concurrentAPIRequests: Joi.number().integer().default(20).min(1),
    disallowedLinkTypes: Joi.array().items(Joi.string()),
    skipFileDownloads: Joi.boolean(),
    fastBuilds: Joi.boolean(),
    entityReferenceRevisions: Joi.array().items(Joi.string()),
    secret: Joi.string().description(
      `an optional secret token for added security shared between your Drupal instance and Gatsby preview`
    ),
    languageConfig: Joi.object({
      defaultLanguage: Joi.string().required(),
      enabledLanguages: Joi.array().items(Joi.string()).required(),
      translatableEntities: Joi.array().items(Joi.string()).required(),
      nonTranslatableEntities: Joi.array().items(Joi.string()).required(),
    }),
  })
