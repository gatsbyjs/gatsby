const fs = require(`fs`)
const path = require(`path`)
const babel = require(`@babel/core`)
const { createContentDigest } = require(`gatsby-core-utils`)

const defaultOptions = require(`../utils/default-options`)
const createMDXNode = require(`../utils/create-mdx-node`)
const { MDX_SCOPES_LOCATION } = require(`../constants`)
const genMDX = require(`../utils/gen-mdx`)

const contentDigest = val => createContentDigest(val)

module.exports = async (
  {
    node,
    loadNodeContent,
    actions,
    createNodeId,
    getNode,
    getNodes,
    reporter,
    cache,
    pathPrefix,
    ...helpers
  },
  pluginOptions
) => {
  const { createNode, createParentChildLink } = actions
  const options = defaultOptions(pluginOptions)

  // options check to stop transformation of the node
  if (options.shouldBlockNodeFromTransformation(node)) {
    return
  }

  // if we shouldn't process this node, then return
  if (
    !(node.internal.type === `File` && options.extensions.includes(node.ext)) &&
    !(
      node.internal.type !== `File` &&
      options.mediaTypes.includes(node.internal.mediaType)
    )
  ) {
    return
  }

  const content = await loadNodeContent(node)

  const mdxNode = await createMDXNode({
    id: createNodeId(`${node.id} >>> Mdx`),
    node,
    content,
  })

  createNode(mdxNode)
  createParentChildLink({ parent: node, child: mdxNode })

  // write scope files into .cache for later consumption
  const { scopeImports, scopeIdentifiers } = await genMDX(
    {
      node: mdxNode,
      getNode,
      getNodes,
      reporter,
      cache,
      pathPrefix,
      options,
      loadNodeContent,
      actions,
      createNodeId,
      ...helpers,
    },
    { forceDisableCache: true }
  )
  await cacheScope({
    cache,
    scopeIdentifiers,
    scopeImports,
    createContentDigest: contentDigest,
    parentNode: node,
  })
}

async function cacheScope({
  cache,
  scopeImports,
  scopeIdentifiers,
  createContentDigest,
  parentNode,
}) {
  // scope files are the imports from an MDX file pulled out and re-exported.
  let scopeFileContent = `${scopeImports.join(`\n`)}

export default { ${scopeIdentifiers.join(`, `)} }`

  // if parent node is a file, convert relative imports to be
  // relative to new .cache location
  if (parentNode.internal.type === `File`) {
    const instance = new BabelPluginTransformRelativeImports({
      parentFilepath: parentNode.dir,
      cache: cache,
    })
    const result = babel.transform(scopeFileContent, {
      configFile: false,
      plugins: [instance.plugin],
    })
    scopeFileContent = result.code
  }

  const filePath = path.join(
    cache.directory,
    MDX_SCOPES_LOCATION,
    `${createContentDigest(scopeFileContent)}.js`
  )

  fs.writeFileSync(filePath, scopeFileContent)
}

const declare = require(`@babel/helper-plugin-utils`).declare

class BabelPluginTransformRelativeImports {
  constructor({ parentFilepath, cache }) {
    this.plugin = declare(api => {
      api.assertVersion(7)

      return {
        visitor: {
          StringLiteral({ node }) {
            let split = node.value.split(`!`)
            const nodePath = split.pop()
            const loaders = `${split.join(`!`)}${split.length > 0 ? `!` : ``}`
            if (nodePath.startsWith(`.`)) {
              const valueAbsPath = path.resolve(parentFilepath, nodePath)
              const replacementPath =
                loaders +
                path.relative(
                  path.join(cache.directory, MDX_SCOPES_LOCATION),
                  valueAbsPath
                )
              node.value = replacementPath
            }
          },
        },
      }
    })
  }
}
