const fs = require(`fs`)
const path = require(`path`)
const babel = require(`@babel/core`)
const { createContentDigest, slash } = require(`gatsby-core-utils`)

const defaultOptions = require(`../utils/default-options`)
const {
  createMdxNodeExtraBabel,
  createMdxNodeLessBabel,
} = require(`../utils/create-mdx-node`)
const { MDX_SCOPES_LOCATION } = require(`../constants`)
const { findImports } = require(`../utils/gen-mdx`)

const contentDigest = val => createContentDigest(val)

function unstable_shouldOnCreateNode({ node }, pluginOptions) {
  const options = defaultOptions(pluginOptions)

  return _unstable_shouldOnCreateNode({ node }, options)
}

// eslint-disable-next-line camelcase
function _unstable_shouldOnCreateNode({ node }, options) {
  // options check to stop transformation of the node
  if (options.shouldBlockNodeFromTransformation(node)) {
    return false
  }

  return node.internal.type === `File`
    ? options.extensions.includes(node.ext)
    : options.mediaTypes.includes(node.internal.mediaType)
}

module.exports.unstable_shouldOnCreateNode = unstable_shouldOnCreateNode

async function onCreateNode(api, pluginOptions) {
  const options = defaultOptions(pluginOptions)

  if (!_unstable_shouldOnCreateNode({ node: api.node }, options)) {
    return
  }

  /** @type string */
  const content = await api.loadNodeContent(api.node)

  /** Captures the import name when used on a file with an extension up to 4 chars long. e.g
   * `import pic from file.jpeg` or `import * as pic from file.jpeg` */
  const importFinderRegexp = `import {?(?:\\*\\s+as\\s+)?(.*)(?:}?\\s*from\\s+['"].*\\.(?:avif|bmp|jpe?g|gif|png|svg|webp)['"])`
  /** An array of file imports, e.g. `import pic from file.jpeg`
   * @type RegExpMatchArray */
  const fileImports = []
  /** @type string[] */
  const namedImports = []
  Array.from(
    content.matchAll(RegExp(importFinderRegexp, `gm`)),
    (search, idx) => {
      fileImports[idx] = search[0]
      namedImports[idx] = search[1]
    }
  )
  const importId = api.node.id.replace(/-/g, ``)

  const renamedImports = fileImports?.map((fileImport, index) =>
    fileImport.replace(
      namedImports[index],
      `${namedImports[index].trim()}_${importId} `
    )
  )

  /** @type string */
  let fixedContent = content
  if (fileImports?.length !== renamedImports?.length) {
    // Throw error
    api.reporter.error(
      `Error: the number of namespaced imports and found imports do not match in gatsby-plugin-mdx's onCreateNode`
    )
  } else {
    try {
      if (fileImports.length > 0) {
        fileImports.forEach((item, index) => {
          const namedImport = namedImports[index].trim()
          fixedContent = fixedContent
            // 1st replacement: replace given import, with uid postfixed imports
            .replace(item, renamedImports[index])
            // 2nd replacement: check for src={importName} and globally replace it regardless of surrounding space
            .replace(
              RegExp(`src={ *?${namedImport} *?}`, `gm`),
              `src={${namedImport}_${importId}}`
            )
        })
      }
    } catch (err) {
      api.reporter.error(
        `Error when creating namespaced imports in gatsby-plugin-mdx`
      )
    }
  }

  if (options.lessBabel) {
    await onCreateNodeLessBabel(fixedContent, api, options)
  } else {
    await onCreateNodeExtraBabel(fixedContent, api, options)
  }
}

module.exports.onCreateNode = onCreateNode

async function onCreateNodeExtraBabel(
  content,
  {
    node,
    loadNodeContent,
    actions,
    createNodeId,
    getNode,
    getNodes,
    getNodesByType,
    reporter,
    cache,
    pathPrefix,
    ...helpers
  },
  options
) {
  const { createNode, createParentChildLink } = actions

  const mdxNode = await createMdxNodeExtraBabel({
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
    getNodesByType,
    reporter,
    cache,
    pathPrefix,
    options,
    loadNodeContent,
    actions,
    createNodeId,
    ...helpers,
  })

  // write scope files into .cache for later consumption
  await cacheScope({
    cache,
    scopeIdentifiers,
    scopeImports,
    createContentDigest: contentDigest,
    parentNode: node,
  })
}

async function onCreateNodeLessBabel(
  content,
  {
    node,
    loadNodeContent,
    actions,
    createNodeId,
    getNode,
    getNodes,
    getNodesByType,
    reporter,
    cache,
    pathPrefix,
    ...helpers
  },
  options
) {
  const { createNode, createParentChildLink } = actions

  const { mdxNode, scopeIdentifiers, scopeImports } =
    await createMdxNodeLessBabel({
      id: createNodeId(`${node.id} >>> Mdx`),
      node,
      content,
      getNode,
      getNodes,
      getNodesByType,
      reporter,
      cache,
      pathPrefix,
      options,
      loadNodeContent,
      actions,
      createNodeId,
      ...helpers,
    })

  createNode(mdxNode)
  createParentChildLink({ parent: node, child: mdxNode })

  // write scope files into .cache for later consumption
  await cacheScope({
    cache,
    scopeIdentifiers,
    scopeImports,
    createContentDigest: contentDigest,
    parentNode: node,
  })
}

const writeCache = new Set()

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

  // Multiple files sharing the same imports/exports will lead to the same file writes.
  // Prevent writing the same content to the same file over and over again (reduces io pressure).
  // This also prevents an expensive babel step whose outcome is based on this same value
  if (writeCache.has(scopeFileContent)) {
    return
  }

  // Make sure other calls see this value being processed during async time
  writeCache.add(scopeFileContent)

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
            const split = node.value.split(`!`)
            const nodePath = split.pop()
            const loaders = `${split.join(`!`)}${split.length > 0 ? `!` : ``}`
            if (nodePath.startsWith(`.`)) {
              const valueAbsPath = path.resolve(parentFilepath, nodePath)
              const replacementPath =
                loaders +
                slash(
                  path.relative(
                    path.join(cache.directory, MDX_SCOPES_LOCATION),
                    valueAbsPath
                  )
                )
              node.value = replacementPath
            }
          },
        },
      }
    })
  }
}
