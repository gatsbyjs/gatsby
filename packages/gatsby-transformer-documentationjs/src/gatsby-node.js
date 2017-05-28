const documentation = require("documentation")
const crypto = require("crypto")
const digest = str => crypto.createHash(`md5`).update(str).digest(`hex`)
const remark = require(`remark`)
const _ = require("lodash")
const Prism = require(`prismjs`)

const stringifyMarkdownAST = (node = ``) => {
  if (_.isString(node)) {
    return node
  } else {
    return remark().stringify(node)
  }
}

const descId = parentId => `${parentId}--ComponentDescription`

function createDescriptionNode(node, markdownStr, boundActionCreators) {
  const { createNode } = boundActionCreators

  const descriptionNode = {
    id: descId(node.id),
    parent: node.id,
    children: [],
    internal: {
      type: `ComponentDescription`,
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
 * Implement the onNodeCreate API to create documentation.js nodes
 * @param {Object} super this is a super param
 */
exports.onNodeCreate = async ({
  node,
  loadNodeContent,
  boundActionCreators,
}) => {
  const { createNode, addNodeToParent } = boundActionCreators

  if (
    node.internal.mediaType !== `application/javascript` ||
    node.internal.type !== `File`
  ) {
    return null
  }

  const documentationJson = await documentation.build(node.absolutePath, {
    shallow: true,
  })

  if (documentationJson.length > 0) {
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
          stringifyMarkdownAST(docsJson.description),
          boundActionCreators
        )
      }

      if (docsJson.params) {
        picked.params = docsJson.params.map(param => {
          if (param.description) {
            param.description___NODE = createDescriptionNode(
              node,
              stringifyMarkdownAST(param.description),
              boundActionCreators
            )
            delete param.description
          }
          return param
        })
      }

      if (docsJson.returns) {
        picked.returns = docsJson.returns.map(ret => {
          if (ret.description) {
            ret.description___NODE = createDescriptionNode(
              node,
              stringifyMarkdownAST(ret.description),
              boundActionCreators
            )
          }

          // TODO add tests for ___node and linking to files
          // and figure out why this isn't working, ughh, why doing this not
          // on critical path ugh.
          //
          // Then make all plugins respond when done so fix timing bugs ugh.

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
        id: `documentationJS ${node.id} comment #${i}`,
        parent: node.id,
        children: [],
        internal: {
          contentDigest: digest(strContent),
          content: strContent,
          type: `DocumentationJs`,
          mediaType: `text/x-javascript-metadata`,
        },
      }

      addNodeToParent({ parent: node, child: docNode })
      createNode(docNode)
      // TODO clean things up, make each description a subnode that's markdown
      // so we handle it.
      //
      // examples should have highlighted version of code w/ prismjs
      //
      // throw away all the other data and have people add them back
      // if they want to
    })
  }
}
