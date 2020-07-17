const fs = require(`fs`)
const path = require(`path`)
const { createContentDigest } = require(`gatsby-core-utils`)

const defaultOptions = require(`../utils/default-options`)
const createMDXNode = require(`../utils/create-mdx-node`)
const { MDX_SCOPES_LOCATION } = require(`../constants`)
const { findImports } = require(`../utils/gen-mdx`)

const fileCache = new Set()

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
  const { scopeImports, scopeIdentifiers } = await findImports({
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
  })
  await cacheScope({
    cache,
    scopeIdentifiers,
    scopeImports,
    parentNode: node,
  })
}

async function cacheScope({
  cache,
  scopeImports,
  scopeIdentifiers,
  parentNode,
}) {
  const scopeIdentList = scopeIdentifiers.join(`, `)

  // It's (kinda micro) faster to check this fast digest than to compute the
  // actual digest and do this check on scopeFileContent or filePath.
  // Note: if your mdx files all import the same things as a template then
  // this check should save you a bit on redundant writes.
  const fastDigest = scopeImports.join(`\n`) + `\n` + scopeIdentList
  if (fileCache.has(fastDigest)) {
    return
  }
  fileCache.add(fastDigest)

  const fixedImports =
    parentNode.internal.type === `File`
      ? scopeImports.map(code => scrubLocalImportPaths(code, parentNode, cache))
      : scopeImports

  // scope files are the imports from an MDX file pulled out and re-exported.
  const scopeFileContent = `
    ${fixedImports.join(`\n`)}

    export default { ${scopeIdentList} }
  `

  const filePath = path.join(
    cache.directory,
    MDX_SCOPES_LOCATION,
    `${createContentDigest(scopeFileContent)}.js`
  )

  fs.writeFileSync(filePath, scopeFileContent)
}

function scrubLocalImportPaths(importCode, parentNode, cache) {
  // All imports end with `from 'some/path'` so match on that and normalize
  // the paths. They might be prefixed with `!`, a webpack feature,
  return importCode.replace(/from\s*['"]([^'"]+?)['"]/g, (match, p) => {
    let split = p.split(`!`)
    const nodePath = split.pop()
    if (nodePath.startsWith(`.`)) {
      const loaders = `${split.join(`!`)}${split.length > 0 ? `!` : ``}`
      const valueAbsPath = path.resolve(parentNode.dir, nodePath)
      return (
        loaders +
        path.relative(
          path.join(cache.directory, MDX_SCOPES_LOCATION),
          valueAbsPath
        )
      )
    }
    return match
  })
}
