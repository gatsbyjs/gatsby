const { URL } = require(`url`)
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

const nodeFromData = (datum, createNodeId) => {
  const { attributes: { id: _attributes_id, ...attributes } = {} } = datum
  const preservedId =
    typeof _attributes_id !== `undefined` ? { _attributes_id } : {}
  return {
    id: createNodeId(datum.id),
    drupal_id: datum.id,
    parent: null,
    drupal_parent_menu_item: attributes.parent,
    children: [],
    ...attributes,
    ...preservedId,
    drupal_relationships: datum.relationships,
    relationships: {},
    internal: {
      type: datum.type.replace(/-|__|:|\.|\s/g, `_`),
    },
  }
}

exports.nodeFromData = nodeFromData

const isFileNode = node =>
  node.internal.type === `files` || node.internal.type === `file__file`

exports.isFileNode = isFileNode

exports.downloadFile = async (
  { node, store, cache, createNode, createNodeId, getCache, reporter },
  { basicAuth, baseUrl }
) => {
  // handle file downloads
  if (isFileNode(node)) {
    let fileNode
    try {
      let fileUrl = node.url
      if (typeof node.uri === `object`) {
        // Support JSON API 2.x file URI format https://www.drupal.org/node/2982209
        fileUrl = node.uri.url
      }
      // Resolve w/ baseUrl if node.uri isn't absolute.
      const url = new URL(fileUrl, baseUrl)
      // If we have basicAuth credentials, add them to the request.
      const auth =
        typeof basicAuth === `object`
          ? {
              htaccess_user: basicAuth.username,
              htaccess_pass: basicAuth.password,
            }
          : {}
      fileNode = await createRemoteFileNode({
        url: url.href,
        store,
        cache,
        createNode,
        createNodeId,
        getCache,
        parentNodeId: node.id,
        auth,
        reporter,
      })
    } catch (e) {
      // Ignore
    }
    if (fileNode) {
      node.localFile___NODE = fileNode.id
    }
  }
}
