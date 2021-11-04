const _ = require(`lodash`)

const {
  nodeFromData,
  downloadFile,
  isFileNode,
  createNodeIdWithVersion,
} = require(`./normalize`)

const { getOptions } = require(`./plugin-options`)

function makeBackRefsKey(id) {
  return `backrefs-${id}`
}

function makeRefNodesKey(id) {
  return `refnodes-${id}`
}

const handleReferences = async (
  node,
  {
    getNode,
    mutateNode = false,
    createNodeId,
    entityReferenceRevisions = [],
    cache,
  }
) => {
  const relationships = node.relationships
  const rootNodeLanguage = getOptions().languageConfig ? node.langcode : `und`

  const backReferencedNodes = []
  if (node.drupal_relationships) {
    const referencedNodes = []
    _.each(node.drupal_relationships, (v, k) => {
      if (!v.data) return
      const nodeFieldName = `${k}___NODE`
      if (_.isArray(v.data)) {
        relationships[nodeFieldName] = _.compact(
          v.data.map(data => {
            const referencedNodeId = createNodeId(
              createNodeIdWithVersion(
                data.id,
                data.type,
                rootNodeLanguage,
                data.meta?.target_version,
                entityReferenceRevisions
              )
            )
            if (!getNode(referencedNodeId)) {
              return null
            }

            referencedNodes.push(referencedNodeId)
            return referencedNodeId
          })
        )

        const meta = _.compact(
          v.data.map(data => (!_.isEmpty(data.meta) ? data.meta : null))
        )
        // If there's meta on the field and it's not an existing/internal one
        // create a new node's field with that meta. It can't exist on both
        // @see https://jsonapi.org/format/#document-resource-object-fields
        if (!_.isEmpty(meta) && !(k in node)) {
          node[k] = meta
        }
      } else {
        const referencedNodeId = createNodeId(
          createNodeIdWithVersion(
            v.data.id,
            v.data.type,
            rootNodeLanguage,
            v.data.meta?.target_revision_id,
            entityReferenceRevisions
          )
        )
        if (getNode(referencedNodeId)) {
          relationships[nodeFieldName] = referencedNodeId
          referencedNodes.push(referencedNodeId)
        }

        // If there's meta on the field and it's not an existing/internal one
        // create a new node's field with that meta. It can't exist on both
        // @see https://jsonapi.org/format/#document-resource-object-fields
        if (!_.isEmpty(v.data.meta) && !(k in node)) {
          node[k] = v.data.meta
        }
      }
    })

    delete node.drupal_relationships
    cache.set(makeRefNodesKey(node.id), referencedNodes)
    if (referencedNodes.length) {
      const nodeFieldName = `${node.internal.type}___NODE`
      await Promise.all(
        referencedNodes.map(async nodeID => {
          let referencedNode
          if (mutateNode) {
            referencedNode = getNode(nodeID)
          } else {
            referencedNode = _.cloneDeep(getNode(nodeID))
          }
          if (!referencedNode.relationships[nodeFieldName]) {
            referencedNode.relationships[nodeFieldName] = []
          }

          if (!referencedNode.relationships[nodeFieldName].includes(node.id)) {
            referencedNode.relationships[nodeFieldName].push(node.id)
          }

          let backRefsNames = await cache.get(
            makeBackRefsKey(referencedNode.id)
          )
          if (!backRefsNames) {
            backRefsNames = []
            cache.set(makeBackRefsKey(referencedNode.id), backRefsNames)
          }

          if (!backRefsNames.includes(nodeFieldName)) {
            backRefsNames.push(nodeFieldName)
          }
          backReferencedNodes.push(referencedNode)
        })
      )
    }
  }

  node.relationships = relationships

  return backReferencedNodes
}

exports.handleReferences = handleReferences

const handleDeletedNode = async ({
  actions,
  node,
  getNode,
  createNodeId,
  createContentDigest,
  cache,
  entityReferenceRevisions,
}) => {
  let deletedNode = getNode(
    createNodeId(
      createNodeIdWithVersion(
        node.id,
        node.type,
        getOptions().languageConfig ? node.attributes?.langcode : `und`,
        node.attributes?.drupal_internal__revision_id,
        entityReferenceRevisions
      )
    )
  )

  // Perhaps the node was already deleted and Drupal is sending us references
  // to old nodes.
  if (!deletedNode) {
    return deletedNode
  }

  // Clone node so we're not mutating the original node.
  deletedNode = _.cloneDeep(deletedNode)

  cache.del(makeBackRefsKey(deletedNode.id))
  cache.del(makeRefNodesKey(deletedNode.id))

  // Remove relationships from other nodes and re-create them.
  Object.keys(deletedNode.relationships).forEach(key => {
    let ids = deletedNode.relationships[key]
    ids = [].concat(ids)
    ids.forEach(async id => {
      let node = getNode(id)

      // The referenced node might have already been deleted.
      if (node) {
        // Clone node so we're not mutating the original node.
        node = _.cloneDeep(node)
        let referencedNodes = await cache.get(makeRefNodesKey(node.id))

        if (referencedNodes?.includes(deletedNode.id)) {
          // Loop over relationships and cleanup references.
          Object.entries(node.relationships).forEach(([key, value]) => {
            // If a string ref matches, delete it.
            if (_.isString(value) && value === deletedNode.id) {
              delete node.relationships[key]
            }

            // If it's an array, filter, then check if the array is empty and then delete
            // if so
            if (_.isArray(value)) {
              value = value.filter(v => v !== deletedNode.id)

              if (value.length === 0) {
                delete node.relationships[key]
              } else {
                node.relationships[key] = value
              }
            }
          })

          // Remove deleted node from array of referencedNodes
          referencedNodes = referencedNodes.filter(
            nId => nId !== deletedNode.id
          )
          cache.set(makeRefNodesKey(node.id), referencedNodes)
        }

        // Recreate the referenced node with its now cleaned-up relationships.
        if (node.internal.owner) {
          delete node.internal.owner
        }
        if (node.fields) {
          delete node.fields
        }
        node.internal.contentDigest = createContentDigest(node)
        actions.createNode(node)
      }
    })
  })

  actions.deleteNode(deletedNode)

  return deletedNode
}

const handleWebhookUpdate = async (
  {
    nodeToUpdate,
    actions,
    cache,
    createNodeId,
    createContentDigest,
    getCache,
    getNode,
    reporter,
    store,
  },
  pluginOptions = {}
) => {
  if (!nodeToUpdate) {
    reporter.warn(
      `The updated node was empty. The fact you're seeing this warning means there's probably a bug in how we're creating and processing updates from Drupal.

${JSON.stringify(nodeToUpdate, null, 4)}
      `
    )

    return
  }

  reporter.log(
    `[drupal]: handling update to:
    - entity href: ${nodeToUpdate.links?.self?.href}
    - node id: ${nodeToUpdate.attributes?.drupal_internal__nid}
`
  )

  const { createNode } = actions

  const newNode = nodeFromData(
    nodeToUpdate,
    createNodeId,
    pluginOptions.entityReferenceRevisions
  )

  const nodesToUpdate = [newNode]

  const oldNodeReferencedNodes = await cache.get(makeRefNodesKey(newNode.id))
  const backReferencedNodes = await handleReferences(newNode, {
    getNode,
    mutateNode: false,
    createNodeId,
    cache,
    entityReferenceRevisions: pluginOptions.entityReferenceRevisions,
  })

  nodesToUpdate.push(...backReferencedNodes)

  let oldNode = getNode(newNode.id)
  if (oldNode) {
    // Clone node so we're not mutating the original node.
    oldNode = _.cloneDeep(oldNode)
    // copy over back references from old node
    const backRefsNames = await cache.get(makeBackRefsKey(oldNode.id))
    if (backRefsNames) {
      cache.set(makeBackRefsKey(newNode.id), backRefsNames)
      backRefsNames.forEach(backRefFieldName => {
        newNode.relationships[backRefFieldName] =
          oldNode.relationships[backRefFieldName]
      })
    }

    const newNodeReferencedNodes = await cache.get(makeRefNodesKey(newNode.id))
    // see what nodes are no longer referenced and remove backRefs from them
    let removedReferencedNodes = _.difference(
      oldNodeReferencedNodes,
      newNodeReferencedNodes
    ).map(id => getNode(id))

    removedReferencedNodes = removedReferencedNodes.map(node => {
      if (node) {
        return _.cloneDeep(node)
      } else {
        return node
      }
    })

    nodesToUpdate.push(...removedReferencedNodes)

    const nodeFieldName = `${newNode.internal.type}___NODE`
    removedReferencedNodes.forEach(referencedNode => {
      if (
        referencedNode.relationships &&
        referencedNode.relationships[nodeFieldName]
      ) {
        referencedNode.relationships[nodeFieldName] =
          referencedNode.relationships[nodeFieldName].filter(
            id => id !== newNode.id
          )
      }
    })
  }

  // Download file.
  const { skipFileDownloads } = pluginOptions
  if (isFileNode(newNode) && !skipFileDownloads) {
    await downloadFile(
      {
        node: newNode,
        store,
        cache,
        createNode,
        createNodeId,
        getCache,
      },
      pluginOptions
    )
  }

  for (const node of nodesToUpdate) {
    const oldNode = getNode(node.id)
    const oldDigest = oldNode?.internal?.contentDigest
    node.internal.contentDigest = createContentDigest(node)

    if (
      process.env.NODE_ENV === `test` ||
      oldDigest !== node.internal.contentDigest
    ) {
      if (node.internal.owner) {
        delete node.internal.owner
      }
      if (node.fields) {
        delete node.fields
      }

      createNode(node)
      reporter.log(
        `Updated Gatsby node: id: ${node.id} — type: ${node.internal.type}`
      )
    }
  }
}

exports.handleWebhookUpdate = handleWebhookUpdate
exports.handleDeletedNode = handleDeletedNode
