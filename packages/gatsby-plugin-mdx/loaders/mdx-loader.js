const { getOptions } = require(`loader-utils`)
const babel = require(`@babel/core`)

const debugMore = require(`debug`)(`gatsby-plugin-mdx-info:mdx-loader`)

const genMdx = require(`../utils/gen-mdx`)
const withDefaultOptions = require(`../utils/default-options`)
const createMDXNode = require(`../utils/create-mdx-node`)
const { createFileNode } = require(`../utils/create-fake-file-node`)
const slash = require(`slash`)

module.exports = async function(content) {
  const callback = this.async()
  const {
    getNode: rawGetNode,
    getNodes,
    reporter,
    cache,
    pathPrefix,
    pluginOptions,
  } = getOptions(this)

  const options = withDefaultOptions(pluginOptions)

  let fileNode = getNodes().find(
    node =>
      node.internal.type === `File` &&
      node.absolutePath === slash(this.resourcePath)
  )
  let isFakeFileNode = false
  if (!fileNode) {
    fileNode = await createFileNode(
      this.resourcePath,
      pth => `fakeFileNodeMDX${pth}`
    )
    isFakeFileNode = true
  }

  let mdxNode
  try {
    mdxNode = await createMDXNode({
      id: `fakeNodeIdMDXFileABugIfYouSeeThis`,
      node: fileNode,
      content,
    })
  } catch (e) {
    return callback(e)
  }

  const getNode = id => {
    if (isFakeFileNode && id === fileNode.id) {
      return fileNode
    } else {
      return rawGetNode(id)
    }
  }

  const { rawMDXOutput } = await genMdx({
    isLoader: true,
    options,
    node: { ...mdxNode, rawBody: content },
    getNode,
    getNodes,
    reporter,
    cache,
    pathPrefix,
  })

  try {
    const result = babel.transform(rawMDXOutput, {
      configFile: false,
      plugins: [
        require(`@babel/plugin-syntax-jsx`),
        require(`@babel/plugin-syntax-object-rest-spread`),
        require(`../utils/babel-plugin-html-attr-to-jsx-attr`),
      ],
    })
    debugMore(`transformed code`, result.code)
    return callback(
      null,
      `import React from 'react'
  ${result.code}
      `
    )
  } catch (e) {
    return callback(e)
  }
}
