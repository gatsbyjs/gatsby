const crypto = require(`crypto`)

module.exports = async function onCreateNode(
  { node, getNode, loadNodeContent, boundActionCreators },
  pluginOptions
) {
  const { createNode, createParentChildLink } = boundActionCreators

  // Filter out non-ipynb content by file extension and checkpoint notebooks
  if (
    node.extension !== `ipynb` ||
    String(node.absolutePath).includes(`.ipynb_checkpoints`)
  ) {
    return
  }
  // see: http://jupyter.readthedocs.io/en/latest/reference/mimetype.html
  // if (node.internal.mediaType !== `application/x-ipynb+json`) {
  //   return
  // }

  const content = await loadNodeContent(node)

  const jupyterNode = {
    id: `${node.id} >>> JupyterNotebook`,
    children: [],
    parent: node.id,
    internal: {
      content,
      type: `JupyterNotebook`,
    },
  }

  jupyterNode.json = JSON.parse(content)

  jupyterNode.metadata = jupyterNode.json.metadata

  // Add path to the file path
  if (node.internal.type === `File`) {
    jupyterNode.fileAbsolutePath = node.absolutePath
  }

  jupyterNode.internal.contentDigest = crypto
    .createHash(`md5`)
    .update(JSON.stringify(jupyterNode))
    .digest(`hex`)
  createNode(jupyterNode)
  createParentChildLink({
    parent: node,
    child: jupyterNode,
  })
}
