const grayMatter = require(`gray-matter`)
const crypto = require(`crypto`)
const _ = require(`lodash`)

module.exports = async function onCreateNode({
  node,
  getNode,
  loadNodeContent,
  boundActionCreators,
}) {
  const { createNode, createParentChildLink } = boundActionCreators

  // We only care about markdown content.
  if (
    node.internal.mediaType !== `text/markdown` &&
    node.internal.mediaType !== `text/x-markdown`
  ) {
    return
  }

  const content = await loadNodeContent(node)
  let data = grayMatter(content)

  // Convert date objects to string. Otherwise there's type mismatches
  // during inference as some dates are strings and others date objects.
  if (data.data) {
    data.data = _.mapValues(data.data, v => {
      if (_.isDate(v)) {
        return v.toJSON()
      } else {
        return v
      }
    })
  }

  const contentDigest = crypto
    .createHash(`md5`)
    .update(JSON.stringify(data))
    .digest(`hex`)
  const markdownNode = {
    id: `${node.id} >>> MarkdownRemark`,
    children: [],
    parent: node.id,
    internal: {
      content,
      contentDigest,
      type: `MarkdownRemark`,
    },
  }

  // Add _PARENT to sub-object in the frontmatter so we can
  // use this to find the root markdown node when running GraphQL
  // queries. Yes this is lame. But it's because in GraphQL child nodes
  // can't access their parent nodes so we use this _PARENT convention
  // to get around this.
  _.each(data.data, (v, k) => {
    if (_.isArray(v) && _.isObject(v[0])) {
      data.data[k] = v.map(o => {
        return { ...o, _PARENT: node.id }
      })
    }
  })

  markdownNode.frontmatter = {
    title: ``, // always include a title
    ...data.data,
    _PARENT: node.id,
    // TODO Depreciate this at v2 as much larger chance of conflicting with a
    // user supplied field.
    parent: node.id,
  }

  // Add path to the markdown file path
  if (node.internal.type === `File`) {
    markdownNode.fileAbsolutePath = node.absolutePath
  }

  createNode(markdownNode)
  createParentChildLink({ parent: node, child: markdownNode })
}
