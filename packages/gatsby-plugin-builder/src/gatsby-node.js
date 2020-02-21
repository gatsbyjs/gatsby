const uuidv4 = require(`uuid/v4`)
const fs = require(`fs`)
const { buildSchema, printSchema } = require(`gatsby/graphql`)
const {
  transformSchema,
  introspectSchema,
  RenameTypes,
} = require(`graphql-tools-fork`)
const { createHttpLink } = require(`apollo-link-http`)
const fetch = require(`node-fetch`)
const invariant = require(`invariant`)

const {
  NamespaceUnderFieldTransform,
  StripNonQueryTransform,
} = require(`./transforms`)
const { getGQLOptions, defaultOptions } = require(`./builder-config`)

exports.sourceNodes = async (
  { actions, createNodeId, cache, createContentDigest },
  options
) => {
  const { addThirdPartySchema, createNode } = actions
  const config = getGQLOptions(options)
  const { url, typeName, fieldName } = config

  const link = createHttpLink({
    uri: url,
    fetch,
  })

  const cacheKey = `gatsby-plugin-builder-schema-${typeName}-${fieldName}`
  let sdl = await cache.get(cacheKey)
  let introspectionSchema

  if (!sdl) {
    introspectionSchema = await introspectSchema(link)
    sdl = printSchema(introspectionSchema)
  } else {
    introspectionSchema = buildSchema(sdl)
  }

  await cache.set(cacheKey, sdl)

  const nodeId = createNodeId(`gatsby-plugin-builder-${typeName}`)
  const node = createSchemaNode({
    id: nodeId,
    typeName,
    fieldName,
    createContentDigest,
  })
  createNode(node)

  const resolver = (_, __, context) => {
    const { path, nodeModel } = context
    nodeModel.createPageDependency({
      path,
      nodeId,
    })
    return {}
  }

  const schema = transformSchema(
    {
      schema: introspectionSchema,
      link,
    },
    [
      new StripNonQueryTransform(),
      new RenameTypes(name => `${typeName}_${name}`),
      new NamespaceUnderFieldTransform({
        typeName,
        fieldName,
        resolver,
      }),
    ]
  )

  addThirdPartySchema({ schema })
}

function createSchemaNode({ id, typeName, fieldName, createContentDigest }) {
  const contentDigest = createContentDigest(uuidv4())
  return {
    id,
    typeName,
    fieldName,
    parent: null,
    children: [],
    internal: {
      type: `BuilderPlugin`,
      contentDigest,
      ignoreType: true,
    },
  }
}

exports.createPages = async ({ graphql, actions }, options) => {
  const config = {
    ...defaultOptions,
    ...options,
  }
  const { createPage } = actions
  const models = Object.keys(config.templates)
  const result = await graphql(`
    query {
      ${config.fieldName} {
        ${models
          .map(
            model => `${model} {
            everything
          }`
          )
          .join(` `)}
      }
    }
  `)

  models.forEach(modelName => {
    const component = config.templates[modelName]
    invariant(
      fs.existsSync(component),
      `gatsby-plugin-builder requires a valid template path for each model`
    )
    result.data[config.fieldName][modelName].forEach(entry => {
      if (
        entry.everything.data.url &&
        entry.everything.published === `published`
      ) {
        createPage({
          path: entry.everything.data.url,
          component,
        })
      }
    })
  })
}
