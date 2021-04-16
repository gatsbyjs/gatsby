const uuidv4 = require(`uuid/v4`)
const { buildSchema, printSchema } = require(`gatsby/graphql`)
const {
  wrapSchema,
  introspectSchema,
  RenameTypes,
} = require(`@graphql-tools/wrap`)
const { linkToExecutor } = require(`@graphql-tools/links`)
const { createHttpLink } = require(`apollo-link-http`)
const invariant = require(`invariant`)
const { fetchWrapper } = require(`./fetch`)
const { createDataloaderLink } = require(`./batching/dataloader-link`)

const {
  NamespaceUnderFieldTransform,
  StripNonQueryTransform,
} = require(`./transforms`)

exports.sourceNodes = async (
  { actions, createNodeId, cache, createContentDigest },
  options
) => {
  const { addThirdPartySchema, createNode } = actions
  const {
    url,
    typeName,
    fieldName,
    headers = {},
    fetch = fetchWrapper,
    fetchOptions = {},
    createLink,
    createSchema,
    refetchInterval,
    batch = false,
    transformSchema,
  } = options

  invariant(
    typeName && typeName.length > 0,
    `gatsby-source-graphql requires option \`typeName\` to be specified`
  )
  invariant(
    fieldName && fieldName.length > 0,
    `gatsby-source-graphql requires option \`fieldName\` to be specified`
  )
  invariant(
    (url && url.length > 0) || createLink,
    `gatsby-source-graphql requires either option \`url\` or \`createLink\` callback`
  )

  let link
  if (createLink) {
    link = await createLink(options)
  } else {
    const options = {
      uri: url,
      fetch,
      fetchOptions,
      headers: typeof headers === `function` ? await headers() : headers,
    }
    link = batch ? createDataloaderLink(options) : createHttpLink(options)
  }

  let introspectionSchema

  if (createSchema) {
    introspectionSchema = await createSchema(options)
  } else {
    const cacheKey = `gatsby-source-graphql-schema-${typeName}-${fieldName}`
    let sdl = await cache.get(cacheKey)

    if (!sdl) {
      introspectionSchema = await introspectSchema(linkToExecutor(link))
      sdl = printSchema(introspectionSchema)
    } else {
      introspectionSchema = buildSchema(sdl)
    }

    await cache.set(cacheKey, sdl)
  }

  const nodeId = createNodeId(`gatsby-source-graphql-${typeName}`)
  const node = createSchemaNode({
    id: nodeId,
    typeName,
    fieldName,
    createContentDigest,
  })
  createNode(node)

  const resolver = (parent, args, context) => {
    context.nodeModel.createPageDependency({
      path: context.path,
      nodeId: nodeId,
    })
    return {}
  }

  const defaultTransforms = [
    new StripNonQueryTransform(),
    new RenameTypes(name => `${typeName}_${name}`),
    new NamespaceUnderFieldTransform({
      typeName,
      fieldName,
      resolver,
    }),
  ]

  const schema = transformSchema
    ? transformSchema({
        schema: introspectionSchema,
        link,
        resolver,
        defaultTransforms,
        options,
      })
    : wrapSchema({
        schema: introspectionSchema,
        executor: linkToExecutor(link),
        transforms: defaultTransforms,
      })

  addThirdPartySchema({ schema })

  if (process.env.NODE_ENV !== `production`) {
    if (refetchInterval) {
      const msRefetchInterval = refetchInterval * 1000
      const refetcher = () => {
        createNode(
          createSchemaNode({
            id: nodeId,
            typeName,
            fieldName,
            createContentDigest,
          })
        )
        setTimeout(refetcher, msRefetchInterval)
      }
      setTimeout(refetcher, msRefetchInterval)
    }
  }
}

function createSchemaNode({ id, typeName, fieldName, createContentDigest }) {
  const nodeContent = uuidv4()
  const nodeContentDigest = createContentDigest(nodeContent)
  return {
    id,
    typeName: typeName,
    fieldName: fieldName,
    parent: null,
    children: [],
    internal: {
      type: `GraphQLSource`,
      contentDigest: nodeContentDigest,
      ignoreType: true,
    },
  }
}
