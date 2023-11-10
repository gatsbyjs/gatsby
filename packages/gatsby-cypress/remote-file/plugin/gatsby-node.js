const { addRemoteFilePolyfillInterface } = require(`gatsby-plugin-utils/polyfill-remote-file`)

/** @type {import("gatsby").GatsbyNode["createSchemaCustomization"]} */
const createSchemaCustomization =
  function createSchemaCustomization({ actions, schema, store }) {
    actions.createTypes(
      addRemoteFilePolyfillInterface(
        schema.buildObjectType({
          name: `MyRemoteFile`,
          fields: {},
          interfaces: [`Node`, `RemoteFile`],
        }),
        {
          schema,
          actions,
          store,
        }
      )
    )
  }

exports.createSchemaCustomization = createSchemaCustomization

/** @type {import("gatsby").GatsbyNode["sourceNodes"]} */
const sourceNodes = function sourceNodes({
  actions,
  createNodeId,
  createContentDigest,
}) {
  const items = [
    {
      name: `photoA.jpg`,
      url: `https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2000&q=80`,
      placeholderUrl:
        `https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=%width%&h=%height%`,
      mimeType: `image/jpg`,
      filename: `photo-1517849845537.jpg`,
      width: 2000,
      height: 2667,
    },
    {
      name: `photoB.jpg`,
      url: `https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&h=2000&q=10`,
      mimeType: `image/jpg`,
      filename: `photo-1552053831.jpg`,
      width: 1247,
      height: 2000,
    },
    {
      name: `photoC.jpg`,
      url: `https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2000&q=80`,
      placeholderUrl:
        `https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=%width%&h=%height%`,
      mimeType: `image/jpg`,
      filename: `photo-1561037404.jpg`,
      width: 2000,
      height: 1333,
    },
  ]

  items.forEach((item, index) => {
    actions.createNode({
      id: createNodeId(`remote-file-${index}`),
      ...item,
      internal: {
        type: `MyRemoteFile`,
        contentDigest: createContentDigest(item.url),
      },
    })
  })
}

exports.sourceNodes = sourceNodes
