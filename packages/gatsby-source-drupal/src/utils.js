const _ = require(`lodash`)

const {
  nodeFromData,
  downloadFile,
  isFileNode,
  getHref,
  createNodeIdWithVersion,
} = require(`./normalize`)

const { getOptions } = require(`./plugin-options`)

const backRefsNamesLookup = new WeakMap()
const referencedNodesLookup = new WeakMap()

const handleReferences = (
  node,
  { getNode, createNodeId, entityReferenceRevisions = [] }
) => {
  const relationships = node.relationships
  const rootNodeLanguage = getOptions().languageConfig ? node.langcode : `und`

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
    referencedNodesLookup.set(node, referencedNodes)
    if (referencedNodes.length) {
      const nodeFieldName = `${node.internal.type}___NODE`
      referencedNodes.forEach(nodeID => {
        const referencedNode = getNode(nodeID)
        if (!referencedNode.relationships[nodeFieldName]) {
          referencedNode.relationships[nodeFieldName] = []
        }

        if (!referencedNode.relationships[nodeFieldName].includes(node.id)) {
          referencedNode.relationships[nodeFieldName].push(node.id)
        }

        let backRefsNames = backRefsNamesLookup.get(referencedNode)
        if (!backRefsNames) {
          backRefsNames = []
          backRefsNamesLookup.set(referencedNode, backRefsNames)
        }

        if (!backRefsNames.includes(nodeFieldName)) {
          backRefsNames.push(nodeFieldName)
        }
      })
    }
  }

  node.relationships = relationships
}

exports.handleReferences = handleReferences

const handleDeletedNode = async ({
  actions,
  node,
  getNode,
  createNodeId,
  createContentDigest,
  entityReferenceRevisions,
}) => {
  const deletedNode = getNode(
    createNodeId(
      createNodeIdWithVersion(
        node.id,
        node.type,
        getOptions().languageConfig ? node.attributes.langcode : `und`,
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

  // Remove the deleted node from backRefsNamesLookup
  backRefsNamesLookup.delete(deletedNode)

  // Remove relationships from other nodes and re-create them.
  Object.keys(deletedNode.relationships).forEach(key => {
    let ids = deletedNode.relationships[key]
    ids = [].concat(ids)
    ids.forEach(id => {
      const node = getNode(id)
      let referencedNodes = referencedNodesLookup.get(node)
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
        referencedNodes = referencedNodes.filter(nId => nId !== deletedNode.id)
        referencedNodesLookup.set(node, referencedNodes)
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
  if (!nodeToUpdate || !nodeToUpdate.attributes) {
    reporter.warn(
      `The updated node was empty or is missing the required attributes field. The fact you're seeing this warning means there's probably a bug in how we're creating and processing updates from Drupal.

${JSON.stringify(nodeToUpdate, null, 4)}
      `
    )

    return
  }

  const { createNode } = actions

  const newNode = nodeFromData(
    nodeToUpdate,
    createNodeId,
    pluginOptions.entityReferenceRevisions
  )

  const nodesToUpdate = [newNode]

  handleReferences(newNode, {
    getNode,
    createNodeId,
    entityReferenceRevisions: pluginOptions.entityReferenceRevisions,
  })

  const oldNode = getNode(newNode.id)
  if (oldNode) {
    // copy over back references from old node
    const backRefsNames = backRefsNamesLookup.get(oldNode)
    if (backRefsNames) {
      backRefsNamesLookup.set(newNode, backRefsNames)
      backRefsNames.forEach(backRefFieldName => {
        newNode.relationships[backRefFieldName] =
          oldNode.relationships[backRefFieldName]
      })
    }

    const oldNodeReferencedNodes = referencedNodesLookup.get(oldNode)
    const newNodeReferencedNodes = referencedNodesLookup.get(newNode)

    // see what nodes are no longer referenced and remove backRefs from them
    const removedReferencedNodes = _.difference(
      oldNodeReferencedNodes,
      newNodeReferencedNodes
    ).map(id => getNode(id))

    nodesToUpdate.push(...removedReferencedNodes)

    const nodeFieldName = `${newNode.internal.type}___NODE`
    removedReferencedNodes.forEach(referencedNode => {
      referencedNode.relationships[nodeFieldName] =
        referencedNode.relationships[nodeFieldName].filter(
          id => id !== newNode.id
        )
    })

    // see what nodes are newly referenced, and make sure to call `createNode` on them
    const addedReferencedNodes = _.difference(
      newNodeReferencedNodes,
      oldNodeReferencedNodes
    ).map(id => getNode(id))

    nodesToUpdate.push(...addedReferencedNodes)
  } else {
    // if we are inserting new node, we need to update all referenced nodes
    const newNodes = referencedNodesLookup.get(newNode)
    if (typeof newNodes !== `undefined`) {
      newNodes.forEach(id => nodesToUpdate.push(getNode(id)))
    }
  }

  // download file
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
    if (node.internal.owner) {
      delete node.internal.owner
    }
    if (node.fields) {
      delete node.fields
    }
    node.internal.contentDigest = createContentDigest(node)
    createNode(node)
    reporter.log(`Updated node: ${node.id}`)
  }
}

exports.handleWebhookUpdate = handleWebhookUpdate
exports.handleDeletedNode = handleDeletedNode
