const MongoClient = require(`mongodb`).MongoClient
const prepareMappingChildNode = require(`./mapping`)
const sanitizeName = require(`./sanitize-name`)
const queryString = require(`query-string`)
const stringifyObjectIds = require(`./stringify-object-ids`)

exports.sourceNodes = (
  { actions, getNode, createNodeId, hasNodeChanged, createContentDigest },
  pluginOptions
) => {
  const { createNode, deleteNode } = actions

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
  const clientOptions = pluginOptions.clientOptions || { useNewUrlParser: true }
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

      return Promise.all(
        collection.map(col =>
          createNodes(
            db,
            pluginOptions,
            dbName,
            createNode,
            createNodeId,
            col,
            createContentDigest,
            getNode,
            deleteNode
          )
        )
      )
      // .then(() => {
      //   mongoClient.close()
      // })
      // .catch(err => {
      //   console.warn(err)
      //   mongoClient.close()
      //   return err
      // })
    })
    .catch(err => {
      console.warn(err)
      return err
    })
}

// exports.onPostBootstrap = ({ actions, store }) => {
//   console.log(store.getState().nodes)
// }

function idToString(id) {
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
  getNode,
  deleteNode
) {
  const { preserveObjectIds = false } = pluginOptions
  let collection = db.collection(collectionName)
  return new Promise((resolve, reject) => {
    let cursor = collection.find()

    // Execute the each command, triggers for each document
    cursor.toArray((err, documents) => {
      if (err) {
        reject(err)
      }

      documents.forEach(({ _id, ...item }) => {
        const id = idToString(_id)

        // only call recursive function to preserve relations represented by objectids if pluginoption set.
        if (preserveObjectIds) {
          for (let key in item) {
            item[key] = stringifyObjectIds(item[key])
          }
        }

        const node = {
          // Data for the node.
          ...item,
          id: createNodeId(`${id}`),
          mongodb_id: id,
          parent: `__${collectionName}__`,
          children: [],
          internal: {
            type: `mongodb${sanitizeName(dbName)}${sanitizeName(
              collectionName
            )}`,
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
  }).then(() => {
    const changeStream = collection.watch()

    changeStream.on(
      `change`,
      ({ operationType, documentKey, fullDocument }) => {
        switch (operationType) {
          case `replace`:
          case `insert`: {
            const id = idToString(documentKey._id)
            const nodeId = createNodeId(id)

            // if (preserveObjectIds) {
            //   for (let key in item) {
            //     item[key] = stringifyObjectIds(item[key])
            //   }
            // }

            const node = {
              // Data for the node.
              ...fullDocument,
              id: nodeId,
              mongodb_id: id,
              parent: `__${collectionName}__`,
              children: [],
              internal: {
                type: `mongodb${sanitizeName(dbName)}${sanitizeName(
                  collectionName
                )}`,
                content: JSON.stringify(fullDocument),
                contentDigest: createContentDigest(fullDocument),
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

            delete node._id

            // Create the Node itself
            createNode(node)

            // Create children
            childrenNodes.forEach(node => {
              createNode(node)
            })
            break
          }
          case `delete`: {
            const nodeId = createNodeId(idToString(documentKey._id))
            const node = getNode(nodeId)
            // Delete the Node itself
            deleteNode({ node: node })
            // TODO: Delete all references to it
            break
          }
        }
      }
    )
  })
}

function getConnectionExtraParams(extraParams) {
  let connectionSuffix
  if (extraParams) {
    connectionSuffix = queryString.stringify(extraParams, { sort: false })
  }

  return connectionSuffix ? `?` + connectionSuffix : ``
}
