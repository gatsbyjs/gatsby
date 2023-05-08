import _ from "lodash"

import {
  nodeFromData,
  downloadFile,
  isFileNode,
  createNodeIdWithVersion,
} from "./normalize"

import { getOptions } from "./plugin-options"

import { getGatsbyVersion } from "gatsby-core-utils"
import { lt, prerelease } from "semver"

function makeBackRefsKey(id) {
  return `backrefs-${id}`
}

function makeRefNodesKey(id) {
  return `refnodes-${id}`
}

export async function handleReferences(
  node,
  {
    getNode,
    mutateNode = false,
    createNodeId,
    entityReferenceRevisions = [],
    cache,
    pluginOptions,
  }
) {
  const relationships = node.relationships
  const rootNodeLanguage = getOptions().languageConfig ? node.langcode : `und`

  const backReferencedNodes: Array<string> = []
  if (node.drupal_relationships) {
    const referencedNodes: Array<string> = []
    _.each(node.drupal_relationships, (v, k) => {
      if (!v.data) return

      const nodeFieldName = `${k}___NODE`
      if (_.isArray(v.data)) {
        relationships[nodeFieldName] = _.compact(
          v.data.map(data => {
            const referencedNodeId = createNodeId(
              createNodeIdWithVersion({
                id: data.id,
                type: data.type,
                langcode: rootNodeLanguage,
                revisionId: data.meta?.target_version,
                entityReferenceRevisions,
                typePrefix: pluginOptions.typePrefix,
              })
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
          createNodeIdWithVersion({
            id: v.data.id,
            type: v.data.type,
            langcode: rootNodeLanguage,
            revisionId: v.data.meta?.target_revision_id,
            entityReferenceRevisions,
            typePrefix: pluginOptions.typePrefix,
          })
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
    await cache.set(makeRefNodesKey(node.id), referencedNodes)
    if (referencedNodes.length) {
      const nodeFieldName = `${node.internal.type}___NODE`
      for (const nodeId of referencedNodes) {
        let referencedNode
        if (mutateNode) {
          referencedNode = getNode(nodeId)
        } else {
          referencedNode = _.cloneDeep(getNode(nodeId))
        }
        if (!referencedNode.relationships[nodeFieldName]) {
          referencedNode.relationships[nodeFieldName] = []
        }

        if (!referencedNode.relationships[nodeFieldName].includes(node.id)) {
          referencedNode.relationships[nodeFieldName].push(node.id)
        }

        let backRefsNames = await cache.get(makeBackRefsKey(referencedNode.id))
        if (!backRefsNames) {
          backRefsNames = []
          await cache.set(makeBackRefsKey(referencedNode.id), backRefsNames)
        }

        if (!backRefsNames.includes(nodeFieldName)) {
          backRefsNames.push(nodeFieldName)
          await cache.set(makeBackRefsKey(referencedNode.id), backRefsNames)
        }
        backReferencedNodes.push(referencedNode)
      }
    }
  }

  node.relationships = relationships

  return backReferencedNodes
}

export const handleDeletedNode = async ({
  actions,
  node,
  getNode,
  createNodeId,
  createContentDigest,
  cache,
  entityReferenceRevisions,
  pluginOptions,
}) => {
  let deletedNode = getNode(
    createNodeId(
      createNodeIdWithVersion({
        id: node.id,
        type: node.type,
        langcode: getOptions().languageConfig
          ? node.attributes?.langcode
          : `und`,
        revisionId: node.attributes?.drupal_internal__revision_id,
        entityReferenceRevisions,
        typePrefix: pluginOptions.typePrefix,
      })
    )
  )

  // Perhaps the node was already deleted and Drupal is sending us references
  // to old nodes.
  if (!deletedNode) {
    return deletedNode
  }

  // Clone node so we're not mutating the original node.
  deletedNode = _.cloneDeep(deletedNode)

  await cache.del(makeBackRefsKey(deletedNode.id))
  await cache.del(makeRefNodesKey(deletedNode.id))

  // Remove relationships from other nodes and re-create them.
  Object.keys(deletedNode.relationships).forEach(async key => {
    let ids = deletedNode.relationships[key]
    ids = [].concat(ids)
    for (const id of ids) {
      let node = getNode(id)

      // The referenced node might have already been deleted.
      if (node) {
        // Clone node so we're not mutating the original node.
        node = _.cloneDeep(node)
        let referencedNodes = await cache.get(makeRefNodesKey(node.id))

        if (referencedNodes?.includes(deletedNode.id)) {
          // Loop over relationships and cleanup references.
          Object.entries(
            node.relationships as Record<string, string | Array<string>>
          ).forEach(([key, value]) => {
            // If a string ref matches, delete it.
            if (_.isString(value) && value === deletedNode.id) {
              delete node.relationships[key]
            }

            // If it's an array, filter, then check if the array is empty and then delete
            // if so
            if (Array.isArray(value)) {
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
          await cache.set(makeRefNodesKey(node.id), referencedNodes)
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
    }
  })

  actions.deleteNode(deletedNode)

  return deletedNode
}

export async function createNodeIfItDoesNotExist({
  nodeToUpdate,
  actions,
  createNodeId,
  createContentDigest,
  getNode,
  reporter,
  pluginOptions,
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
    createNodeIdWithVersion({
      id: nodeToUpdate.id,
      type: nodeToUpdate.type,
      langcode: getOptions().languageConfig ? nodeToUpdate.langcode : `und`,
      revisionId: nodeToUpdate.meta?.target_version,
      entityReferenceRevisions: getOptions().entityReferenceRevisions,
      typePrefix: pluginOptions.typePrefix,
    })
  )

  const oldNode = getNode(newNodeId)
  // Node doesn't yet exist so we'll create it now.
  if (!oldNode) {
    const newNode = await nodeFromData(
      nodeToUpdate,
      createNodeId,
      getOptions().entityReferenceRevisions,
      pluginOptions,
      null,
      reporter
    )

    newNode.internal.contentDigest = createContentDigest(newNode)
    createNode(newNode)
  }
}

export const handleWebhookUpdate = async (
  {
    nodeToUpdate,
    actions,
    cache,
    createNodeId,
    createContentDigest,
    getCache,
    getNode,
    reporter,
  },
  pluginOptions: Record<string, any> = {}
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

  const newNode = await nodeFromData(
    nodeToUpdate,
    createNodeId,
    pluginOptions.entityReferenceRevisions,
    pluginOptions,
    null,
    reporter
  )

  drupalCreateNodeManifest({
    attributes: nodeToUpdate.attributes,
    gatsbyNode: newNode,
    unstable_createNodeManifest,
  })

  const nodesToUpdate = [newNode]

  const oldNodeReferencedNodes = await cache.get(makeRefNodesKey(newNode.id))
  const backReferencedNodes = await handleReferences(newNode, {
    getNode,
    mutateNode: false,
    createNodeId,
    cache,
    entityReferenceRevisions: pluginOptions.entityReferenceRevisions,
    pluginOptions,
  })

  nodesToUpdate.push(...backReferencedNodes)

  let oldNode = getNode(newNode.id)
  if (oldNode) {
    // Clone node so we're not mutating the original node.
    oldNode = _.cloneDeep(oldNode)
    // copy over back references from old node
    const backRefsNames = await cache.get(makeBackRefsKey(oldNode.id))
    if (backRefsNames) {
      await cache.set(makeBackRefsKey(newNode.id), backRefsNames)
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
  const { skipFileDownloads, typePrefix } = pluginOptions
  if (isFileNode(newNode, typePrefix) && !skipFileDownloads) {
    await downloadFile(
      {
        node: newNode,
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
  const langcode = attributes?.langcode

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
    const manifestId = `${id}-${updatedAt}-${langcode}`

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

/**
 * This FN returns a Map with additional file node information that Drupal doesn't return on actual file nodes (namely the width/height of images)
 */
export const getExtendedFileNodeData = allData => {
  const fileNodesExtendedData = new Map()

  for (const contentType of allData) {
    if (!contentType) {
      continue
    }

    contentType.data.forEach(node => {
      if (!node) {
        return
      }

      const { relationships } = node

      if (relationships) {
        for (const relationship of Object.values<any>(relationships)) {
          const relationshipNodes = Array.isArray(relationship.data)
            ? relationship.data
            : [relationship.data]

          relationshipNodes.forEach(relationshipNode => {
            if (!relationshipNode) {
              return
            }

            if (
              relationshipNode.type === `file--file` &&
              relationshipNode.meta
            ) {
              const existingExtendedData = fileNodesExtendedData.get(
                relationshipNode.id
              )

              // if we already have extended data for this file node, we need to merge the new data with it
              if (existingExtendedData) {
                const existingImageDerivativeLinks =
                  existingExtendedData?.imageDerivatives?.links || {}

                const imageDerivativeLinks = {
                  ...existingImageDerivativeLinks,
                  ...(relationshipNode.meta?.imageDerivatives?.links || {}),
                }

                const newMeta = {
                  ...existingExtendedData,
                  ...relationshipNode.meta,
                }

                newMeta.imageDerivatives = {
                  ...newMeta.imageDerivatives,
                  links: imageDerivativeLinks,
                }

                fileNodesExtendedData.set(relationshipNode.id, newMeta)
              } else {
                // otherwise we just add the extended data to the map
                fileNodesExtendedData.set(
                  relationshipNode.id,
                  relationshipNode.meta
                )
              }
            }
          })
        }
      }
    })
  }

  return fileNodesExtendedData
}
