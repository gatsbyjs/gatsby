const v8 = require(`v8`)
const fs = require(`fs-extra`)
const { createContentDigest } = require(`gatsby-core-utils`)
const path = require(`path`)
const slash = require(`slash`)

const sanitizePageCreatorPluginOptions = options => {
  if (options && options.path) {
    return {
      ...options,
      path: slash(path.relative(process.cwd(), options.path)),
    }
  }
  return options
}

// TODO: Make this not mutate the passed in value
const sanitiseNode = value => {
  if (value && value.internal && value.internal.contentDigest) {
    if (value.internal.type === `SiteBuildMetadata`) {
      delete value.buildTime
      delete value.internal.contentDigest
    }
    if (value.internal.type === `SitePlugin`) {
      delete value.packageJson
      delete value.internal.contentDigest
      delete value.version
      if (value.name === `gatsby-plugin-page-creator`) {
        // make id more stable
        value.id = createContentDigest(
          `${value.name}${JSON.stringify(
            sanitizePageCreatorPluginOptions(value.pluginOptions)
          )}`
        )
      }
    }
    if (value.internal.type === `SitePage`) {
      delete value.internal.contentDigest
      delete value.internal.description
      delete value.pluginCreatorId
      delete value.pluginCreator___NODE
    }
  }

  // we don't care about order of node creation at this point
  delete value.internal.counter

  return value
}

const loadState = path => {
  const state = v8.deserialize(fs.readFileSync(path))

  const sanitisedState = state.nodes.map(sanitiseNode)

  const newState = new Map()
  sanitisedState
    .sort((a, b) => a.id.localeCompare(b.id))
    .forEach(sanitisedNode => {
      newState.set(sanitisedNode.id, sanitisedNode)
    })

  return {
    nodes: newState,
    diskCacheSnapshot: state.diskCacheSnapshot,
    queryResults: state.queryResults,
  }
}

exports.loadState = loadState
