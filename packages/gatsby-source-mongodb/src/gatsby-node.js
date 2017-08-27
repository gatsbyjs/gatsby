const Db = require(`mongodb`).Db,
  MongoClient = require(`mongodb`).MongoClient,
  ObjectID = require(`mongodb`).ObjectID,
  crypto = require(`crypto`),
  createMappingChildNodes = require(`./mapping`),
  _ = require(`lodash`)

exports.sourceNodes = (
  { boundActionCreators, getNode, hasNodeChanged },
  pluginOptions,
  done
) => {
  const { createNode, deleteNode } = boundActionCreators

  let serverOptions = pluginOptions.server || {
    address: `localhost`,
    port: 27017,
  }
  let dbName = pluginOptions.dbName || `local`,
    authUrlPart = ``
  if (pluginOptions.auth)
    authUrlPart = `${pluginOptions.auth.user}:${pluginOptions.auth.password}@`

  MongoClient.connect(
    `mongodb://${authUrlPart}${serverOptions.address}:${serverOptions.port}/${dbName}`,
    function(err, db) {
      // Establish connection to db
      if (err) {
        console.warn(err)
        return
      }
      let collection = pluginOptions.collection || `documents`
      if( Object.prototype.toString.call( collection ) === '[object Array]' ) {
        for (col of collection) {
          createNodes(db, pluginOptions, dbName, createNode, col, done);
        }
      } else {
          createNodes(db, pluginOptions, dbName, createNode, collection, done);
      }
    }
  )
}

function createNodes(db, pluginOptions, dbName, createNode, collectionName, done) {
  let collection = db.collection(collectionName)
  let cursor = collection.find()

  // Execute the each command, triggers for each document
  cursor.each(function(err, item) {
    // If the item is null then the cursor is exhausted/empty and closed
    if (item == null) {
      // Let's close the db
      db.close()
      done()
    } else {
      var id = item._id.toString()
      delete item._id

      var node = {
        // Data for the node.
        ...item,
        id: `${id}`,
        parent: `__${collectionName}__`,
        children: [],
        internal: {
          type: `mongodb${caps(dbName)}${caps(collectionName)}`,
          content: JSON.stringify(item),
          contentDigest: crypto
            .createHash(`md5`)
            .update(JSON.stringify(item))
            .digest(`hex`),
        },
      }
      if (pluginOptions.map) {
        // We need to map certain fields to a contenttype.
        var keys = Object.keys(pluginOptions.map).forEach(mediaItemFieldKey => {
          node[`${mediaItemFieldKey}___NODE`] = createMappingChildNodes(
            node,
            mediaItemFieldKey,
            node[mediaItemFieldKey],
            pluginOptions.map[mediaItemFieldKey],
            createNode
          )

          delete node[mediaItemFieldKey]
        })
      }
      createNode(node)
    }
  })
}

function caps(s) {
  return s.replace(/\b\w/g, l => l.toUpperCase())
}
