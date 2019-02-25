const Promise = require(`bluebird`)
const glob = require(`glob`)
const _ = require(`lodash`)
const chalk = require(`chalk`)

const tracer = require(`opentracing`).globalTracer()
const reporter = require(`gatsby-cli/lib/reporter`)
const getCache = require(`./get-cache`)
const apiList = require(`./api-node-docs`)
const createNodeId = require(`./create-node-id`)
const createContentDigest = require(`./create-content-digest`)
const { getNonGatsbyCodeFrame } = require(`./stack-trace-utils`)

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

const runAPI = (plugin, api, args) => {
  const gatsbyNode = require(`${plugin.resolve}/gatsby-node`)
  if (gatsbyNode[api]) {
    const parentSpan = args && args.parentSpan
    const spanOptions = parentSpan ? { childOf: parentSpan } : {}
    const pluginSpan = tracer.startSpan(`run-plugin`, spanOptions)

    pluginSpan.setTag(`api`, api)
    pluginSpan.setTag(`plugin`, plugin.name)

    let pathPrefix = ``
    const { store, emitter } = require(`../redux`)
    const {
      loadNodeContent,
      getNodes,
      getNode,
      getNodesByType,
      hasNodeChanged,
      getNodeAndSavePathDependency,
    } = require(`../db/nodes`)
    const { boundActionCreators } = require(`../redux/actions`)

    const doubleBoundActionCreators = doubleBind(
      boundActionCreators,
      api,
      plugin,
      { ...args, parentSpan: pluginSpan }
    )

    if (store.getState().program.prefixPaths) {
      pathPrefix = store.getState().config.pathPrefix
    }

    const namespacedCreateNodeId = id => createNodeId(id, plugin.name)

    const tracing = initAPICallTracing(pluginSpan)

    const cache = getCache(plugin.name)

    // Ideally this would be more abstracted and applied to more situations, but right now
    // this can be potentially breaking so targeting `createPages` API and `createPage` action
    let apiFinished = false
    if (api === `createPages`) {
      let alreadyDisplayed = false
      const createPageAction = doubleBoundActionCreators.createPage
      doubleBoundActionCreators.createPage = async (...args) => {
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
                `https://gatsby.app/sync-actions`
              )}
            `),
          ]

          const possiblyCodeFrame = getNonGatsbyCodeFrame()
          if (possiblyCodeFrame) {
            warning.push(possiblyCodeFrame)
          }

          reporter.warn(warning.join(`\n\n`))
          alreadyDisplayed = true
        }
        return createPageAction(...args)
      }
    }

    const apiCallArgs = [
      {
        ...args,
        pathPrefix,
        boundActionCreators: doubleBoundActionCreators,
        actions: doubleBoundActionCreators,
        loadNodeContent,
        store,
        emitter,
        getCache,
        getNodes,
        getNode,
        getNodesByType,
        hasNodeChanged,
        reporter,
        getNodeAndSavePathDependency,
        cache,
        createNodeId: namespacedCreateNodeId,
        createContentDigest,
        tracing,
      },
      plugin.pluginOptions,
    ]

    // If the plugin is using a callback use that otherwise
    // expect a Promise to be returned.
    if (gatsbyNode[api].length === 3) {
      return Promise.fromCallback(callback => {
        const cb = (err, val) => {
          pluginSpan.finish()
          callback(err, val)
          apiFinished = true
        }
        gatsbyNode[api](...apiCallArgs, cb)
      })
    } else {
      const result = gatsbyNode[api](...apiCallArgs)
      pluginSpan.finish()
      return Promise.resolve(result).then(res => {
        apiFinished = true
        return res
      })
    }
  }

  return Promise.resolve()
}

let filteredPlugins
const hasAPIFile = plugin => glob.sync(`${plugin.resolve}/gatsby-node*`)[0]

module.exports = async (api, args = {}, pluginSource) => {
  const { parentSpan } = args
  const apiSpanArgs = parentSpan ? { childOf: parentSpan } : {}
  const apiSpan = tracer.startSpan(`run-api`, apiSpanArgs)

  apiSpan.setTag(`api`, api)
  _.forEach(args.traceTags, (value, key) => {
    apiSpan.setTag(key, value)
  })

  // Check that the API is documented.
  // "FAKE_API_CALL" is used when code needs to trigger something to happen
  // once the the API queue is empty. Ideally of course we'd have an API
  // (returning a promise) for that. But this works nicely in the meantime.
  if (!apiList[api] && api !== `FAKE_API_CALL`) {
    reporter.panic(`api: "${api}" is not a valid Gatsby api`)
  }

  const { store } = require(`../redux`)
  const plugins = store.getState().flattenedPlugins
  // Get the list of plugins that implement gatsby-node.
  if (!filteredPlugins) {
    filteredPlugins = plugins.filter(plugin => hasAPIFile(plugin))
  }

  // Break infinite loops.
  // Sometimes a plugin will implement an API and call an action which will
  // trigger the same API being called. `onCreatePage` is the only example
  // right now. In these cases, we should avoid calling the originating plugin
  // again.
  const noSourcePluginPlugins = pluginSource
    ? filteredPlugins.filter(p => p.name !== pluginSource)
    : filteredPlugins

  const results = []
  for (const plugin of noSourcePluginPlugins) {
    try {
      const result = await runAPI(plugin, api, { ...args, parentSpan: apiSpan })
      results.push(result)
    } catch (err) {
      const pluginName =
        plugin.name === `default-site-plugin`
          ? `gatsby-node.js`
          : `Plugin ${plugin.name}`
      reporter.panicOnBuild(`${pluginName} returned an error`, err)
    }
  }

  const { emitter } = require(`../redux`)
  emitter.emit(`API_RUNNING_QUEUE_EMPTY`)
  apiSpan.finish()

  return results.filter(result => !_.isEmpty(result))
}
