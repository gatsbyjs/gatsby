const _ = require(`lodash`)
const axios = require(`axios`)

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

const fetchLanguageConfig = async ({
  translation,
  baseUrl,
  apiBase,
  basicAuth,
  headers,
  params,
}) => {
  if (!translation) {
    return {
      defaultLanguage: `und`,
      enabledLanguages: [`und`],
      translatableEntities: [],
    }
  }

  let next = `${baseUrl}/${apiBase}/configurable_language/configurable_language?sort=weight`
  let availableLanguagesResponses = []
  let translatableEntitiesResponses = []

  while (next) {
    const response = await axios.get(next, {
      auth: basicAuth,
      headers,
      params,
    })

    availableLanguagesResponses = availableLanguagesResponses.concat(
      response.data.data
    )
    next = getHref(response.data.links.next)
  }

  next = `${baseUrl}/${apiBase}/language_content_settings/language_content_settings?filter[language_alterable]=true`
  while (next) {
    const response = await axios.get(next, {
      auth: basicAuth,
      headers,
      params,
    })

    translatableEntitiesResponses = translatableEntitiesResponses.concat(
      response.data.data
    )
    next = getHref(response.data.links.next)
  }

  const enabledLanguages = availableLanguagesResponses
    .filter(
      language =>
        [`und`, `zxx`].indexOf(language.attributes.drupal_internal__id) === -1
    )
    .map(language => language.attributes.drupal_internal__id)

  const defaultLanguage = enabledLanguages[0]

  const translatableEntities = translatableEntitiesResponses.map(entity => {
    return {
      type: entity.attributes.target_entity_type_id,
      bundle: entity.attributes.target_bundle,
      id: `${entity.attributes.target_entity_type_id}--${entity.attributes.target_bundle}`,
    }
  })

  return {
    defaultLanguage,
    enabledLanguages,
    translatableEntities,
  }
}

exports.fetchLanguageConfig = fetchLanguageConfig

const handleReferences = (
  node,
  { getNode, createNodeId, entityReferenceRevisions = [] }
) => {
  const relationships = node.relationships
  const rootNodeLanguage = getOptions().translation ? node.langcode : `und`

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
      referencedNode.relationships[
        nodeFieldName
      ] = referencedNode.relationships[nodeFieldName].filter(
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
