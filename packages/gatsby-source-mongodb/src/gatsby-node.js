var Db = require(`mongodb`).Db,
  MongoClient = require(`mongodb`).MongoClient,
  Server = require(`mongodb`).Server,
  ObjectID = require(`mongodb`).ObjectID,
  Binary = require(`mongodb`).Binary,
  GridStore = require(`mongodb`).GridStore,
  Grid = require(`mongodb`).Grid,
  Code = require(`mongodb`).Code,
  assert = require(`assert`),
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
  let dbName = pluginOptions.dbName || `local`;
  let db = new Db(
    dbName,
    new Server(serverOptions.address, serverOptions.port)
  )
  // Establish connection to db
  db.open(function(err, db) {
    if (err) {
      console.warn(err)
      return
    }

    let collectionName = pluginOptions.collection || `documents`;
    let collection = db.collection(collectionName);
    let cursor = collection.find();
    
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
          collection: collectionName,
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
  })
}

function caps(s) {
  return s.replace(/\b\w/g, l => l.toUpperCase())
}