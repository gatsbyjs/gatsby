const fs = require(`fs-extra`)
const path = require(`path`)

const slugify = require(`@sindresorhus/slugify`)
const { compileMDX } = require("gatsby-plugin-mdx")
const React = require(`react`)
const runtime = require("react/jsx-runtime")
const { renderToStaticMarkup } = require("react-dom/server")

exports.onPostBuild = async ({ graphql }) => {
  const results = await graphql(`
    {
      file(base: { eq: "html.mdx" }) {
        name
        sourceInstanceName
        root
        base
        childMdx {
          fields {
            slug
            html
          }
        }
      }
    }
  `)

  await fs.outputJSON(
    path.join(__dirname, `public`, `html-queried-like-feed-plugin.json`),
    results,
    { spaces: 2 }
  )
}

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions

  createTypes(`
    type Mdx implements Node {
      frontmatter: Frontmatter
    }
    type Frontmatter {
      title: String
    }
  `)
}

// Add a HTML field for the RSS plugin
exports.onCreateNode = async ({ node, actions, getNode, reporter, cache }) => {
  const { createNodeField } = actions
  if (node.internal.type === `Mdx`) {
    // Set slug based on frontmatter, fall back to filename
    const fileNode = getNode(node.parent)

    if (!fileNode) {
      return
    }

    const slug = []
    if (fileNode.relativeDirectory) {
      slug.push(fileNode.relativeDirectory)
    }

    if (node.frontmatter.slug) {
      slug.push(slugify(node.frontmatter.slug))
    } else if (fileNode.name !== `index`) {
      slug.push(slugify(fileNode.name))
    }

    createNodeField({
      node,
      name: `slug`,
      value: `/${slug.join(`/`)}`,
    })

    createNodeField({
      node,
      name: `date`,
      value: fileNode.ctime,
    })

    // Render as HTML for the RSS feed
    if (fileNode.sourceInstanceName !== `posts`) {
      return
    }

    const result = await compileMDX(
      {
        source: node.body,
        absolutePath: fileNode.absolutePath,
      },
      {
        // These options are requried to allow rendering to string
        outputFormat: `function-body`,
        useDynamicImport: true,
        // Add any custom options or plugins here
      },
      cache,
      reporter
    )

    if (result && result.processedMDX) {
      const { run } = await import("@mdx-js/mdx")
      const runRes = await run(result.processedMDX, runtime)

      const elem = React.createElement(runRes.default, {
        components: {
          // @todo how to get external components working? Do we need bundler context?
          Example: props => React.createElement("span", props, "!"),
        },
      })

      const value = renderToStaticMarkup(elem)

      createNodeField({
        node,
        name: `html`,
        value,
      })
    }
  }
}
