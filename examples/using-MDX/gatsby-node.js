const runtime = require("react/jsx-runtime")
const { compileMDX } = require("gatsby-plugin-mdx")
const { renderToStaticMarkup } = require("react-dom/server")

exports.onCreateNode = async ({ node, actions, getNode, reporter, cache }) => {
  const { createNodeField } = actions
  if (node.internal.type === `Mdx`) {
    const fileNode = getNode(node.parent)

    if (!fileNode) {
      return null
    }

    const result = await compileMDX(
      {
        source: fileNode.internal.content,
        absolutePath: fileNode.absolutePath,
      },
      {
        // These options are requried to allow rendering to string
        outputFormat: "function-body",
        useDynamicImport: true,
        // Add any custom options or plugins here
      },
      cache,
      reporter
    )

    if (result.processedMDX) {
      createNodeField({
        node,
        name: `processed`,
        value: result.processedMDX,
      })

      const { run } = await import("@mdx-js/mdx")

      const { default: Content } = await run(result.processedMDX, runtime)

      const value = renderToStaticMarkup(Content(runtime))

      createNodeField({
        node,
        name: `html`,
        value,
      })
    }
  }
}
