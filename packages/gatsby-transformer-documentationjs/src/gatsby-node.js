const documentation = require(`documentation`)
const crypto = require(`crypto`)
const digest = str => crypto.createHash(`md5`).update(str).digest(`hex`)
const remark = require(`remark`)
const _ = require(`lodash`)
const Prism = require(`prismjs`)

const stringifyMarkdownAST = (node = ``) => {
  if (_.isString(node)) {
    return node
  } else {
    return remark().stringify(node)
  }
}

const commentId = (parentId, commentNumber) =>
  `documentationJS ${parentId} comment #${commentNumber}`
const descriptionId = (parentId, name) =>
  `${parentId}--DocumentationJSComponentDescription--${name}`

function createDescriptionNode(
  node,
  docNodeId,
  markdownStr,
  name,
  boundActionCreators
) {
  const { createNode } = boundActionCreators

  const descriptionNode = {
    id: descriptionId(docNodeId, name),
    parent: node.id,
    children: [],
    internal: {
      type: `DocumentationJSComponentDescription`,
      mediaType: `text/x-markdown`,
      content: markdownStr,
      contentDigest: digest(markdownStr),
    },
  }

  node.children = node.children.concat([descriptionNode.id])
  createNode(descriptionNode)

  return descriptionNode.id
}

/**
 * Implement the onCreateNode API to create documentation.js nodes
 * @param {Object} super this is a super param
 */
exports.onCreateNode = async ({
  node,
  loadNodeContent,
  boundActionCreators,
}) => {
  const { createNode, createParentChildLink } = boundActionCreators

  if (
    node.internal.mediaType !== `application/javascript` ||
    node.internal.type !== `File`
  ) {
    return null
  }

  let documentationJson
  try {
    documentationJson = await documentation.build(node.absolutePath, {
      shallow: true,
    })
  } catch (e) {
    // Ignore as there'll probably be other tooling already checking for errors
    // and an error here kills Gatsby.
  }

  if (documentationJson && documentationJson.length > 0) {
    documentationJson.forEach((docsJson, i) => {
      const picked = _.pick(docsJson, [`kind`, `memberof`, `name`, `scope`])

      // Defaults
      picked.params = [{ name: ``, type: { type: ``, name: `` } }]
      picked.returns = [{ type: { type: ``, name: `` } }]
      picked.examples = [{ raw: ``, highlighted: `` }]

      // Prepare various sub-pieces.
      if (docsJson.description) {
        picked.description___NODE = createDescriptionNode(
          node,
          commentId(node.id, i),
          stringifyMarkdownAST(docsJson.description),
          `comment.description`,
          boundActionCreators
        )
      }

      const transformParam = param => {
        if (param.description) {
          param.description___NODE = createDescriptionNode(
            node,
            commentId(node.id, i),
            stringifyMarkdownAST(param.description),
            param.name,
            boundActionCreators
          )
          delete param.description
        }
        delete param.lineNumber

        // When documenting destructured parameters, the name
        // is parent.child where we just want the child.
        if (param.name.split(`.`).length > 1) {
          param.name = param.name.split(`.`).slice(-1).join(`.`)
        }

        if (param.properties) {
          param.properties = param.properties.map(transformParam)
        }

        return param
      }

      if (docsJson.params) {
        picked.params = docsJson.params.map(transformParam)
      }

      if (docsJson.returns) {
        picked.returns = docsJson.returns.map(ret => {
          if (ret.description) {
            ret.description___NODE = createDescriptionNode(
              node,
              commentId(node.id, i),
              stringifyMarkdownAST(ret.description),
              ret.title,
              boundActionCreators
            )
          }

          return ret
        })
      }

      if (docsJson.examples) {
        picked.examples = docsJson.examples.map(example => {
          return {
            raw: example.description,
            highlighted: Prism.highlight(
              example.description,
              Prism.languages.javascript
            ),
          }
        })
      }

      const strContent = JSON.stringify(picked, null, 4)

      const docNode = {
        ...picked,
        commentNumber: i,
        id: commentId(node.id, i),
        parent: node.id,
        children: [],
        internal: {
          contentDigest: digest(strContent),
          content: strContent,
          type: `DocumentationJs`,
          mediaType: `text/x-javascript-metadata`,
        },
      }

      createParentChildLink({ parent: node, child: docNode })
      createNode(docNode)
    })

    return true
  } else {
    return null
  }
}
