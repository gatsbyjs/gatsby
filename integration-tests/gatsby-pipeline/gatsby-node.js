const { fetchRemoteFile } = require("gatsby-core-utils/fetch-remote-file")
const { slash } = require("gatsby-core-utils")
const path = require("path")
const fs = require("fs-extra")

/** @type{import('gatsby').createSchemaCustomization} */
exports.createSchemaCustomization = ({ actions, schema, cache }) => {
  actions.createTypes(
    schema.buildObjectType({
      name: "MyRemoteFile",
      fields: {
        url: "String!",
        publicUrl: {
          type: "String!",
          async resolve(source) {
            const filePath = await fetchRemoteFile({
              name: path.basename(source.name, path.extname(source.name)),
              ext: path.extname(source.name),
              url: source.url,
              directory: "./public/images",
            })

            const dir = path.join(global.__GATSBY.root, ".cache", "workers")
            await fs.ensureDir(dir)
            await fs.createFile(
              `${path.join(dir, `worker-${process.env.GATSBY_WORKER_ID}`)}`
            )

            const workers = (await cache.get("workers")) ?? []
            workers.push(process.env.GATSBY_WORKER_ID)

            return `${slash(filePath.replace(/^public/, ""))}`
          },
        },
      },
      interfaces: ["Node"],
    })
  )
}

/** @type {imporg('gatsby').sourceNodes} */
exports.sourceNodes = ({ actions, createNodeId, createContentDigest }) => {
  const items = [
    {
      name: "photoA.jpg",
      url: "https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "photoB.jpg",
      url: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "photoC.jpg",
      url: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
    },
  ]

  items.forEach((item, index) => {
    actions.createNode({
      id: createNodeId(`remote-file-${index}`),
      name: item.name,
      url: item.url,
      internal: {
        type: "MyRemoteFile",
        contentDigest: createContentDigest(item.url),
      },
    })
  })
}
