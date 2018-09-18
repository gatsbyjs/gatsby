const defaultOptions = require("../utils/default-options");
const createMDXNode = require("../utils/create-mdx-node");

module.exports = async (
  { node, loadNodeContent, actions, createNodeId },
  pluginOptions
) => {
  const { createNode, createParentChildLink } = actions;
  const options = defaultOptions(pluginOptions);

  if (
    !(node.internal.type === "File" && options.extensions.includes(node.ext)) &&
    !(
      node.internal.type !== "File" &&
      options.mediaTypes.includes(node.internal.mediaType)
    )
  ) {
    return;
  }

  const content = await loadNodeContent(node);

  const mdxNode = await createMDXNode({
    id: createNodeId(`${node.id} >>> Mdx`),
    node,
    content
  });

  createNode(mdxNode);
  createParentChildLink({ parent: node, child: mdxNode });
};
