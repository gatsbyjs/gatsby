const _ = require(`lodash`)

const {
  nodeFromData,
  downloadFile,
  isFileNode,
  createNodeIdWithVersion,
} = require(`./normalize`)

const { getOptions } = require(`./plugin-options`)

import { getGatsbyVersion } from "gatsby-core-utils"
import { lt, prerelease } from "semver"

let backRefsNamesLookup = new Map()
let referencedNodesLookup = new Map()

const initRefsLookups = async ({ cache }) => {
  const backRefsNamesLookupStr = await cache.get(`backRefsNamesLookup`)
  const referencedNodesLookupStr = await cache.get(`referencedNodesLookup`)

  if (backRefsNamesLookupStr) {
    backRefsNamesLookup = new Map(JSON.parse(backRefsNamesLookupStr))
  }

  if (referencedNodesLookupStr) {
    referencedNodesLookup = new Map(JSON.parse(referencedNodesLookupStr))
  }
}

exports.initRefsLookups = initRefsLookups

const storeRefsLookups = async ({ cache }) => {
  await Promise.all([
    cache.set(
      `backRefsNamesLookup`,
      JSON.stringify(Array.from(backRefsNamesLookup.entries()))
    ),
    cache.set(
      `referencedNodesLookup`,
      JSON.stringify(Array.from(referencedNodesLookup.entries()))
    ),
  ])
}

exports.storeRefsLookups = storeRefsLookups

const handleReferences = (
  node,
  { getNode, mutateNode = false, createNodeId, entityReferenceRevisions = [] }
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
    referencedNodesLookup.set(node.id, referencedNodes)
    if (referencedNodes.length) {
      const nodeFieldName = `${node.internal.type}___NODE`
      referencedNodes.forEach(nodeID => {
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

        let backRefsNames = backRefsNamesLookup.get(referencedNode.id)
        if (!backRefsNames) {
          backRefsNames = []
          backRefsNamesLookup.set(referencedNode.id, backRefsNames)
        }

        if (!backRefsNames.includes(nodeFieldName)) {
          backRefsNames.push(nodeFieldName)
        }
        backReferencedNodes.push(referencedNode)
      })
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

  // Remove the deleted node from backRefsNamesLookup and referencedNodesLookup
  backRefsNamesLookup.delete(deletedNode.id)
  referencedNodesLookup.delete(deletedNode.id)

  // Remove relationships from other nodes and re-create them.
  Object.keys(deletedNode.relationships).forEach(key => {
    let ids = deletedNode.relationships[key]
    ids = [].concat(ids)
    ids.forEach(id => {
      let node = getNode(id)

      // The referenced node might have already been deleted.
      if (node) {
        // Clone node so we're not mutating the original node.
        node = _.cloneDeep(node)
        let referencedNodes = referencedNodesLookup.get(node.id)
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
          referencedNodesLookup.set(node.id, referencedNodes)
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

function createNodeIfItDoesNotExist({
  nodeToUpdate,
  actions,
  createNodeId,
  createContentDigest,
  getNode,
  reporter,
}) {
  if (!nodeToUpdate) {
    reporter.warn(
      `The updated node was empty. The fact you're seeing this warning means there's probably a bug in how we're creating and processing updates from Drupal.

${JSON.stringify(nodeToUpdate, null, 4)}
      `
    )

    return
  }

  const { createNode } = actions
  const newNodeId = createNodeId(
    createNodeIdWithVersion(
      nodeToUpdate.id,
      nodeToUpdate.type,
      getOptions().languageConfig ? nodeToUpdate.langcode : `und`,
      nodeToUpdate.meta?.target_version,
      getOptions().entityReferenceRevisions
    )
  )

  const oldNode = getNode(newNodeId)
  // Node doesn't yet exist so we'll create it now.
  if (!oldNode) {
    const newNode = nodeFromData(
      nodeToUpdate,
      createNodeId,
      getOptions().entityReferenceRevisions
    )

    newNode.internal.contentDigest = createContentDigest(newNode)
    createNode(newNode)
  }
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

  const { createNode, unstable_createNodeManifest } = actions

  const newNode = nodeFromData(
    nodeToUpdate,
    createNodeId,
    pluginOptions.entityReferenceRevisions
  )

  drupalCreateNodeManifest({
    attributes: nodeToUpdate.attributes,
    gatsbyNode: newNode,
    unstable_createNodeManifest,
  })

  const nodesToUpdate = [newNode]

  const oldNodeReferencedNodes = referencedNodesLookup.get(newNode.id)
  const backReferencedNodes = handleReferences(newNode, {
    getNode,
    mutateNode: false,
    createNodeId,
    entityReferenceRevisions: pluginOptions.entityReferenceRevisions,
  })

  nodesToUpdate.push(...backReferencedNodes)

  let oldNode = getNode(newNode.id)
  if (oldNode) {
    // Clone node so we're not mutating the original node.
    oldNode = _.cloneDeep(oldNode)
    // copy over back references from old node
    const backRefsNames = backRefsNamesLookup.get(oldNode.id)
    if (backRefsNames) {
      backRefsNamesLookup.set(newNode.id, backRefsNames)
      backRefsNames.forEach(backRefFieldName => {
        newNode.relationships[backRefFieldName] =
          oldNode.relationships[backRefFieldName]
      })
    }

    const newNodeReferencedNodes = referencedNodesLookup.get(newNode.id)

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
    if (node.internal.owner) {
      delete node.internal.owner
    }
    if (node.fields) {
      delete node.fields
    }
    node.internal.contentDigest = createContentDigest(node)
    createNode(node)
    reporter.log(
      `Updated Gatsby node — id: ${node.id} type: ${node.internal.type}`
    )
  }
}

const GATSBY_VERSION_MANIFEST_V2 = `4.3.0`
const gatsbyVersion =
  (typeof getGatsbyVersion === `function` && getGatsbyVersion()) || `0.0.0`
const gatsbyVersionIsPrerelease = prerelease(gatsbyVersion)
const shouldUpgradeGatsbyVersion =
  lt(gatsbyVersion, GATSBY_VERSION_MANIFEST_V2) && !gatsbyVersionIsPrerelease

let warnOnceForNoSupport = false
let warnOnceToUpgradeGatsby = false

/**
 * This fn creates node manifests which are used for Gatsby Cloud Previews via the Content Sync API/feature.
 * Content Sync routes a user from Drupal to a page created from the entry data they're interested in previewing.
 */
export function drupalCreateNodeManifest({
  attributes,
  gatsbyNode,
  unstable_createNodeManifest,
}) {
  const isPreview =
    (process.env.NODE_ENV === `development` &&
      process.env.ENABLE_GATSBY_REFRESH_ENDPOINT) ||
    process.env.GATSBY_IS_PREVIEW === `true`

  const updatedAt = attributes?.revision_timestamp
  const id = attributes?.drupal_internal__nid

  const supportsContentSync = typeof unstable_createNodeManifest === `function`
  const shouldCreateNodeManifest =
    id && updatedAt && supportsContentSync && isPreview

  if (shouldCreateNodeManifest) {
    if (shouldUpgradeGatsbyVersion && !warnOnceToUpgradeGatsby) {
      console.warn(
        `Your site is doing more work than it needs to for Preview, upgrade to Gatsby ^${GATSBY_VERSION_MANIFEST_V2} for better performance`
      )
      warnOnceToUpgradeGatsby = true
    }
    const manifestId = `${id}-${updatedAt}`

    unstable_createNodeManifest({
      manifestId,
      node: gatsbyNode,
      updatedAtUTC: updatedAt,
    })
  } else if (!supportsContentSync && !warnOnceForNoSupport) {
    warnOnceForNoSupport = true
    console.warn(
      `Drupal: Your version of Gatsby core doesn't support Content Sync (via the unstable_createNodeManifest action). Please upgrade to the latest version to use Content Sync in your site.`
    )
  }
}

exports.handleWebhookUpdate = handleWebhookUpdate
exports.handleDeletedNode = handleDeletedNode
exports.createNodeIfItDoesNotExist = createNodeIfItDoesNotExist
