var Db = require(`mongodb`).Db,
  MongoClient = require(`mongodb`).MongoClient,
  ObjectID = require(`mongodb`).ObjectID,
  crypto = require(`crypto`)

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

      createNodes(db, pluginOptions, dbName, createNode, done)
    }
  )
}

function createNodes(db, pluginOptions, dbName, createNode, done) {
  let collectionName = pluginOptions.collection || `documents`
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
      createNode({
        // Data for the node.
        ...item,
        id: `${item._id}`,
        parent: item.parent || `__${collectionName}__`,
        children: item.children || [],
        internal: {
          mediaType: `application/json`,
          type: `mongodb${caps(dbName)}${caps(collectionName)}`,
          content: JSON.stringify(item),
          contentDigest: crypto
            .createHash(`md5`)
            .update(JSON.stringify(item))
            .digest(`hex`),
        },
      })
    }
  })
}

function caps(s) {
  return s.replace(/\b\w/g, l => l.toUpperCase())
}
