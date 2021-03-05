const { URL } = require(`url`)
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

const nodeFromData = (datum, createNodeId) => {
  const { attributes: { id: attributeId, ...attributes } = {} } = datum
  const preservedId =
    typeof attributeId !== `undefined` ? { _attributes_id: attributeId } : {}
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
    let fileType

    let fileUrl = node.url
    if (typeof node.uri === `object`) {
      // Support JSON API 2.x file URI format https://www.drupal.org/node/2982209
      fileUrl = node.uri.url
      // get file type from uri prefix ("S3:", "public:", etc.)
      const uriPrefix = node.uri.value.match(/^\w*:/)
      fileType = uriPrefix ? uriPrefix[0] : null
    }
    // Resolve w/ baseUrl if node.uri isn't absolute.
    const url = new URL(fileUrl, baseUrl)
    // If we have basicAuth credentials, add them to the request.
    const basicAuthFileSystems = [`public:`, `private:`, `temporary:`]
    const auth =
      typeof basicAuth === `object` && basicAuthFileSystems.includes(fileType)
        ? {
            htaccess_user: basicAuth.username,
            htaccess_pass: basicAuth.password,
          }
        : {}
    const fileNode = await createRemoteFileNode({
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
    if (fileNode) {
      node.localFile___NODE = fileNode.id
    }
  }
}
