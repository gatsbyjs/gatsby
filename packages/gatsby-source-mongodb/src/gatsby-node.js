const MongoClient = require(`mongodb`).MongoClient
const prepareMappingChildNode = require(`./mapping`)
const sanitizeName = require(`./sanitize-name`)
const queryString = require(`query-string`)
const stringifyObjectIds = require(`./stringify-object-ids`)
const preprocessAggregations = require(`./preprocess-aggregations`)

exports.sourceNodes = (
  { actions, getNode, createNodeId, hasNodeChanged, createContentDigest },
  pluginOptions
) => {
  const { createNode } = actions

  let serverOptions = pluginOptions.server || {
    address: `localhost`,
    port: 27017,
  }
  let dbName = pluginOptions.dbName || `local`,
    authUrlPart = ``
  if (pluginOptions.auth)
    authUrlPart = `${pluginOptions.auth.user}:${pluginOptions.auth.password}@`

  let connectionExtraParams = getConnectionExtraParams(
    pluginOptions.extraParams
  )
  const clientOptions = pluginOptions.clientOptions || {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
  const connectionURL = pluginOptions.connectionString
    ? `${pluginOptions.connectionString}/${dbName}${connectionExtraParams}`
    : `mongodb://${authUrlPart}${serverOptions.address}:${serverOptions.port}/${dbName}${connectionExtraParams}`
  const mongoClient = new MongoClient(connectionURL, clientOptions)
  return mongoClient
    .connect()
    .then(client => {
      const db = client.db(dbName)

      let collection = pluginOptions.collection || [`documents`]
      if (!Array.isArray(collection)) {
        collection = [collection]
      }

      // Format aggregations & Determine whether to use `collection.find` or `collection.aggregate`
      const aggregations = preprocessAggregations(pluginOptions.aggregations || {})
      const useCollection = !Object.keys(aggregations).length

      return Promise
        .all(
          Object.entries(useCollection ? collection : aggregations)
            .reduce((acc, [key, value]) => {
              if (useCollection) {
                // Map to `createNodes` calls for collection
                return [...acc, createNodes(
                  db,
                  pluginOptions,
                  dbName,
                  createNode,
                  createNodeId,
                  value,
                  createContentDigest
                )]

              } else {
                // Flatten & map to `createNodes` calls for aggregation
                return [...acc, ...Object.entries(value).map(aggregation => createNodes(
                  db,
                  pluginOptions,
                  dbName,
                  createNode,
                  createNodeId,
                  key,
                  createContentDigest,
                  aggregation
                ))]
              }
            }, [])
        )
        .then(() => {
          mongoClient.close()
        })
        .catch(err => {
          console.warn(err)
          mongoClient.close()
          return err
        })
    })
    .catch(err => {
      console.warn(err)
      return err
    })
}

function mongoIdToString(id) {
  return id.hasOwnProperty(`toHexString`) ? id.toHexString() : String(id)
}

function createNodes(
  db,
  pluginOptions,
  dbName,
  createNode,
  createNodeId,
  collectionName,
  createContentDigest,
  aggregation
) {
  const { preserveObjectIds = false, query = {} } = pluginOptions
  return new Promise((resolve, reject) => {
    let collection = db.collection(collectionName)

    // Create cursor via `find` or `aggregate` depending on if `aggregation` is given
    let cursor = !!aggregation
      ? collection.aggregate(aggregation[1])
      : collection.find(
        query[collectionName] ? query[collectionName] : {}
      )

    // Execute the each command, triggers for each document
    cursor.toArray((err, documents) => {
      if (err) {
        reject(err)
      }

      documents.forEach(({ _id, ...item }) => {
        // only call recursive function to preserve relations represented by objectids if pluginoption set.
        if (preserveObjectIds) {
          for (let key in item) {
            item[key] = stringifyObjectIds(item[key])
          }
        }

        const mongodb_id = mongoIdToString(_id)
        const id = `${!!aggregation ? aggregation[0] : ''}${dbName}${collectionName}${mongodb_id}`
        const sanitizedAggregationName = !!aggregation ? sanitizeName(aggregation[0]) : ''
        const internalType = `mongodb${sanitizedAggregationName}${sanitizeName(dbName)}${sanitizeName(collectionName)}`
        const node = {
          // Data for the node.
          ...item,
          id: createNodeId(`${id}`),
          mongodb_id: mongodb_id,
          parent: `__${collectionName}__`,
          children: [],
          internal: {
            type: internalType,
            content: JSON.stringify(item),
            contentDigest: createContentDigest(item),
          },
        }
        const childrenNodes = []
        if (pluginOptions.map) {
          let mapObj = pluginOptions.map
          if (pluginOptions.map[collectionName]) {
            mapObj = pluginOptions.map[collectionName]
          }
          // We need to map certain fields to a contenttype.
          Object.keys(mapObj).forEach(mediaItemFieldKey => {
            if (
              node[mediaItemFieldKey] &&
              (typeof mapObj[mediaItemFieldKey] === `string` ||
                mapObj[mediaItemFieldKey] instanceof String)
            ) {
              const mappingChildNode = prepareMappingChildNode(
                node,
                mediaItemFieldKey,
                node[mediaItemFieldKey],
                mapObj[mediaItemFieldKey],
                createContentDigest
              )

              node[`${mediaItemFieldKey}___NODE`] = mappingChildNode.id
              childrenNodes.push(mappingChildNode)

              delete node[mediaItemFieldKey]
            }
          })
        }
        createNode(node)
        childrenNodes.forEach(node => {
          createNode(node)
        })
      })
      resolve()
    })
  })
}

function getConnectionExtraParams(extraParams) {
  let connectionSuffix
  if (extraParams) {
    connectionSuffix = queryString.stringify(extraParams, { sort: false })
  }

  return connectionSuffix ? `?` + connectionSuffix : ``
}
