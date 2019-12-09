const _ = require(`lodash`)
const chalk = require(`chalk`)
const { bindActionCreators } = require(`redux`)

const tracer = require(`opentracing`).globalTracer()
const reporter = require(`gatsby-cli/lib/reporter`)
const getCache = require(`./get-cache`)
const createNodeId = require(`./create-node-id`)
const { createContentDigest } = require(`gatsby-core-utils`)
const {
  buildObjectType,
  buildUnionType,
  buildInterfaceType,
  buildInputObjectType,
  buildEnumType,
  buildScalarType,
} = require(`../schema/types/type-builders`)
const { emitter, store } = require(`../redux`)
const getPublicPath = require(`./get-public-path`)
const { getNonGatsbyCodeFrameFormatted } = require(`./stack-trace-utils`)
const { trackBuildError, decorateEvent } = require(`gatsby-telemetry`)

// Bind action creators per plugin so we can auto-add
// metadata to actions they create.
const boundPluginActionCreators = {}
const doubleBind = (boundActionCreators, api, plugin, actionOptions) => {
  const { traceId } = actionOptions
  if (boundPluginActionCreators[plugin.name + api + traceId]) {
    return boundPluginActionCreators[plugin.name + api + traceId]
  } else {
    const keys = Object.keys(boundActionCreators)
    const doubleBoundActionCreators = {}
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const boundActionCreator = boundActionCreators[key]
      if (typeof boundActionCreator === `function`) {
        doubleBoundActionCreators[key] = (...args) => {
          // Let action callers override who the plugin is. Shouldn't be
          // used that often.
          if (args.length === 1) {
            return boundActionCreator(args[0], plugin, actionOptions)
          } else if (args.length === 2) {
            return boundActionCreator(args[0], args[1], actionOptions)
          }
          return undefined
        }
      }
    }
    boundPluginActionCreators[
      plugin.name + api + traceId
    ] = doubleBoundActionCreators
    return doubleBoundActionCreators
  }
}

const initAPICallTracing = parentSpan => {
  const startSpan = (spanName, spanArgs = {}) => {
    const defaultSpanArgs = { childOf: parentSpan }

    return tracer.startSpan(spanName, _.merge(defaultSpanArgs, spanArgs))
  }

  return {
    tracer,
    parentSpan,
    startSpan,
  }
}

const getLocalReporter = (activity, reporter) =>
  activity
    ? { ...reporter, panicOnBuild: activity.panicOnBuild.bind(activity) }
    : reporter

const runAPI = async (plugin, api, args, activity) => {
  const gatsbyNode = require(`${plugin.resolve}/gatsby-node`)
  if (gatsbyNode[api]) {
    const parentSpan = args && args.parentSpan
    const spanOptions = parentSpan ? { childOf: parentSpan } : {}
    const pluginSpan = tracer.startSpan(`run-plugin`, spanOptions)

    pluginSpan.setTag(`api`, api)
    pluginSpan.setTag(`plugin`, plugin.name)

    const {
      loadNodeContent,
      getNodes,
      getNode,
      getNodesByType,
      hasNodeChanged,
      getNodeAndSavePathDependency,
    } = require(`../db/nodes`)
    const {
      publicActions,
      restrictedActionsAvailableInAPI,
    } = require(`../redux/actions`)
    const availableActions = {
      ...publicActions,
      ...(restrictedActionsAvailableInAPI[api] || {}),
    }
    const boundActionCreators = bindActionCreators(
      availableActions,
      store.dispatch
    )
    const doubleBoundActionCreators = doubleBind(
      boundActionCreators,
      api,
      plugin,
      { ...args, parentSpan: pluginSpan, activity }
    )

    const { config, program } = store.getState()

    const pathPrefix = (program.prefixPaths && config.pathPrefix) || ``
    const publicPath = getPublicPath({ ...config, ...program }, ``)

    const namespacedCreateNodeId = id => createNodeId(id, plugin.name)

    const tracing = initAPICallTracing(pluginSpan)

    const cache = getCache(plugin.name)

    // Ideally this would be more abstracted and applied to more situations, but right now
    // this can be potentially breaking so targeting `createPages` API and `createPage` action
    let actions = doubleBoundActionCreators
    let apiFinished = false
    if (api === `createPages`) {
      let alreadyDisplayed = false
      const createPageAction = actions.createPage
      // create new actions object with wrapped createPage action
      // doubleBoundActionCreators is memoized, so we can't just
      // reassign createPage field as this would cause this extra logic
      // to be used in subsequent APIs and we only want to target this `createPages` call.
      actions = {
        ...actions,
        createPage: (...args) => {
          createPageAction(...args)
          if (apiFinished && !alreadyDisplayed) {
            const warning = [
              reporter.stripIndent(`
              Action ${chalk.bold(
                `createPage`
              )} was called outside of its expected asynchronous lifecycle ${chalk.bold(
                `createPages`
              )} in ${chalk.bold(plugin.name)}.
              Ensure that you return a Promise from ${chalk.bold(
                `createPages`
              )} and are awaiting any asynchronous method invocations (like ${chalk.bold(
                `graphql`
              )} or http requests).
              For more info and debugging tips: see ${chalk.bold(
                `https://gatsby.dev/sync-actions`
              )}
            `),
            ]

            const possiblyCodeFrame = getNonGatsbyCodeFrameFormatted()
            if (possiblyCodeFrame) {
              warning.push(possiblyCodeFrame)
            }

            reporter.warn(warning.join(`\n\n`))
            alreadyDisplayed = true
          }
        },
      }
    }
    let localReporter = getLocalReporter(activity, reporter)

    const apiCallArgs = [
      {
        ...args,
        basePath: pathPrefix,
        pathPrefix: publicPath,
        boundActionCreators: actions,
        actions,
        loadNodeContent,
        store,
        emitter,
        getCache,
        getNodes,
        getNode,
        getNodesByType,
        hasNodeChanged,
        reporter: localReporter,
        getNodeAndSavePathDependency,
        cache,
        createNodeId: namespacedCreateNodeId,
        createContentDigest,
        tracing,
        schema: {
          buildObjectType,
          buildUnionType,
          buildInterfaceType,
          buildInputObjectType,
          buildEnumType,
          buildScalarType,
        },
      },
      plugin.pluginOptions,
    ]

    // If the plugin is using a callback use that otherwise
    // expect a Promise to be returned.
    if (gatsbyNode[api].length === 3) {
      return new Promise((resolve, reject) => {
        const cb = (err, val) => {
          pluginSpan.finish()
          apiFinished = true
          if (err) reject(err)
          else resolve(val)
        }

        try {
          gatsbyNode[api](...apiCallArgs, cb)
        } catch (e) {
          trackBuildError(api, {
            error: e,
            pluginName: `${plugin.name}@${plugin.version}`,
          })
          throw e
        }
      })
    }

    const result = await gatsbyNode[api](...apiCallArgs)
    pluginSpan.finish()
    apiFinished = true
    return result
  }

  return null
}

let apiRunnersActive = 0
let apisRunningByTraceId = new Map()
let waitingForCasacadeToFinish = []

module.exports = async (api, args = {}, { pluginSource, activity } = {}) => {
  let resolve
  let promise = new Promise(res => (resolve = res)) // This is guaranteed to assign to `resolve` in sync

  const { parentSpan, traceId, traceTags, waitForCascadingActions } = args

  const apiSpanArgs = parentSpan ? { childOf: parentSpan } : {}
  const apiSpan = tracer.startSpan(`run-api`, apiSpanArgs)

  apiSpan.setTag(`api`, api)
  _.forEach(traceTags, (value, key) => {
    apiSpan.setTag(key, value)
  })

  const plugins = store.getState().flattenedPlugins

  // Get the list of plugins that implement this API.
  // Also: Break infinite loops. Sometimes a plugin will implement an API and
  // call an action which will trigger the same API being called.
  // `onCreatePage` is the only example right now. In these cases, we should
  // avoid calling the originating plugin again.
  const implementingPlugins = plugins.filter(
    plugin => plugin.nodeAPIs.includes(api) && plugin.name !== pluginSource
  )

  const apiRunInstance = {
    api,
    resolve,
    span: apiSpan,
    traceId,
  }

  if (waitForCascadingActions) {
    waitingForCasacadeToFinish.push(apiRunInstance)
  }

  if (apiRunnersActive === 0) {
    emitter.emit(`API_RUNNING_START`)
  }
  ++apiRunnersActive

  if (apisRunningByTraceId.has(apiRunInstance.traceId)) {
    const currentCount = apisRunningByTraceId.get(apiRunInstance.traceId)
    apisRunningByTraceId.set(apiRunInstance.traceId, currentCount + 1)
  } else {
    apisRunningByTraceId.set(apiRunInstance.traceId, 1)
  }

  let stopQueuedApiRuns = false
  let onAPIRunComplete = null
  if (api === `onCreatePage`) {
    const path = args.page.path
    const actionHandler = action => {
      if (action.payload.path === path) {
        stopQueuedApiRuns = true
      }
    }
    emitter.on(`DELETE_PAGE`, actionHandler)
    onAPIRunComplete = () => {
      emitter.off(`DELETE_PAGE`, actionHandler)
    }
  }

  let results = []
  for (const plugin of implementingPlugins) {
    if (stopQueuedApiRuns) {
      break
    }
    let result = await runPlugin(
      api,
      plugin,
      args,
      stopQueuedApiRuns,
      activity,
      apiSpan
    )
    results.push(result)
  }

  if (onAPIRunComplete) {
    onAPIRunComplete()
  }
  // Remove runner instance
  const currentCount = apisRunningByTraceId.get(apiRunInstance.traceId)
  apisRunningByTraceId.set(apiRunInstance.traceId, currentCount - 1)

  --apiRunnersActive
  if (apiRunnersActive === 0) {
    emitter.emit(`API_RUNNING_QUEUE_EMPTY`)
  }

  // Filter empty results
  apiRunInstance.results = results.filter(result => !_.isEmpty(result))

  // Filter out empty responses and return if the
  // api caller isn't waiting for cascading actions to finish.
  if (!waitForCascadingActions) {
    apiSpan.finish()
    resolve(apiRunInstance.results)
  }

  // Check if any of our waiters are done.
  waitingForCasacadeToFinish = waitingForCasacadeToFinish.filter(instance => {
    // If none of its trace IDs are running, it's done.
    const apisByTraceIdCount = apisRunningByTraceId.get(instance.traceId)
    if (apisByTraceIdCount === 0) {
      instance.span.finish()
      instance.resolve(instance.results)
      return false
    } else {
      return true
    }
  })

  // This promise will resolve with the results for all the plugin calls for this particular api call.
  // If args.waitForCascadingActions is true, it will wait for all concurrent calls with the same api to resolve.
  // If args.waitForCascadingActions is false, it should be resolved by the time the code reaches here
  return promise
}

function runPlugin(api, plugin, args, stopQueuedApiRuns, activity, apiSpan) {
  return new Promise(resolve => {
    resolve(runAPI(plugin, api, { ...args, parentSpan: apiSpan }, activity))
  }).catch(err => {
    let pluginName =
      plugin.name === `default-site-plugin` ? `gatsby-node.js` : plugin.name

    decorateEvent(`BUILD_PANIC`, {
      pluginName: `${plugin.name}@${plugin.version}`,
    })

    let localReporter = getLocalReporter(activity, reporter)

    localReporter.panicOnBuild({
      id: `11321`,
      context: {
        pluginName,
        api,
        message: err instanceof Error ? err.message : err,
      },
      error: err instanceof Error ? err : undefined,
    })

    return null
  })
}
