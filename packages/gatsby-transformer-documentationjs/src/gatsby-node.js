const documentation = require(`documentation`)
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

const docId = (parentId, docsJson) => {
  const lineNumber = docsJson.loc
    ? docsJson.loc.start.line
    : docsJson.lineNumber

  return `documentationJS ${parentId} path #${JSON.stringify(
    docsJson.path
  )} line ${lineNumber}`
}

const descriptionId = (parentId, name) =>
  `${parentId}--DocumentationJSComponentDescription--${name}`

function prepareDescriptionNode(node, markdownStr, name, helpers) {
  const { createNodeId, createContentDigest } = helpers

  const descriptionNode = {
    id: createNodeId(descriptionId(node.id, name)),
    parent: node.id,
    children: [],
    internal: {
      type: `DocumentationJSComponentDescription`,
      mediaType: `text/markdown`,
      content: markdownStr,
      contentDigest: createContentDigest(markdownStr),
    },
  }

  return descriptionNode
}

/**
 * Implement the onCreateNode API to create documentation.js nodes
 * @param {Object} super this is a super param
 */
exports.onCreateNode = async ({ node, actions, ...helpers }) => {
  const { createNodeId, createContentDigest } = helpers
  const { createNode, createParentChildLink } = actions

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
    const handledDocs = new WeakMap()
    const typeDefs = new Map()

    const getNodeIDForType = typeName => {
      if (typeDefs.has(typeName)) {
        return typeDefs.get(typeName)
      }

      const index = documentationJson.findIndex(
        docsJson =>
          docsJson.name === typeName &&
          [`typedef`, `constant`].includes(docsJson.kind)
      )

      if (index !== -1) {
        return prepareNodeForDocs(documentationJson[index], {
          commentNumber: index,
        }).node.id
      }

      return null
    }

    const tryToAddTypeDef = type => {
      if (type.applications) {
        type.applications.forEach(tryToAddTypeDef)
      }

      if (type.expression) {
        tryToAddTypeDef(type.expression)
      }

      if (type.elements) {
        type.elements.forEach(tryToAddTypeDef)
      }

      if (type.type === `NameExpression` && type.name) {
        type.typeDef___NODE = getNodeIDForType(type.name)
      }
    }

    /**
     * Prepare Gatsby node from JsDoc object.
     *  - set description and deprecated fields as markdown
     *  - recursively process params, properties, returns
     *  - link types to type definitions
     *  - unwrap optional types to top level optional field
     * @param {Object} docsJson JsDoc object. See https://documentation.js.org/html-example/index.json for example of JsDoc objects shape.
     * @param {Object} args
     * @param {Number} [args.commentNumber] Index of JsDoc in root of module
     * @param {Number} args.level Nesting level
     * @param {string} args.parent Id of parent node
     */
    const prepareNodeForDocs = (
      docsJson,
      { commentNumber = null, level = 0, parent = node.id } = {}
    ) => {
      if (handledDocs.has(docsJson)) {
        // this was already handled
        return handledDocs.get(docsJson)
      }

      const docSkeletonNode = {
        commentNumber,
        level,
        id: createNodeId(docId(node.id, docsJson)),
        parent,
        children: [],
        internal: {
          type: `DocumentationJs`,
        },
      }

      const children = []

      const picked = _.pick(docsJson, [
        `kind`,
        `memberof`,
        `name`,
        `scope`,
        `type`,
        `default`,
      ])

      picked.optional = false
      if (docsJson.loc) {
        // loc is instance of SourceLocation class, and Gatsby doesn't support
        // class instances at this moment when inferring schema. Serializing
        // and desirializing converts class instance to plain object.
        picked.docsLocation = JSON.parse(JSON.stringify(docsJson.loc))
      }
      if (docsJson.context && docsJson.context.loc) {
        picked.codeLocation = JSON.parse(JSON.stringify(docsJson.context.loc))
      }

      if (picked.type) {
        if (picked.type.type === `OptionalType` && picked.type.expression) {
          picked.optional = true
          picked.type = picked.type.expression
        }

        tryToAddTypeDef(picked.type)
      }

      const mdFields = [`description`, `deprecated`]

      mdFields.forEach(fieldName => {
        if (docsJson[fieldName]) {
          const childNode = prepareDescriptionNode(
            docSkeletonNode,
            stringifyMarkdownAST(docsJson[fieldName]),
            `comment.${fieldName}`,
            helpers
          )

          picked[`${fieldName}___NODE`] = childNode.id
          children.push({
            node: childNode,
          })
        }
      })

      const docsSubfields = [`params`, `properties`, `returns`]
      docsSubfields.forEach(fieldName => {
        if (docsJson[fieldName] && docsJson[fieldName].length > 0) {
          picked[`${fieldName}___NODE`] = docsJson[fieldName].map(
            (docObj, fieldIndex) => {
              // When documenting destructured parameters, the name
              // is parent.child where we just want the child.
              if (docObj.name && docObj.name.split(`.`).length > 1) {
                docObj.name = docObj.name
                  .split(`.`)
                  .slice(-1)
                  .join(`.`)
              }

              const adjustedObj = {
                ...docObj,
                path: [...docsJson.path, { fieldName, fieldIndex }],
              }

              const nodeHierarchy = prepareNodeForDocs(adjustedObj, {
                level: level + 1,
                parent: docSkeletonNode.id,
              })
              children.push(nodeHierarchy)
              return nodeHierarchy.node.id
            }
          )
        }
      })

      if (_.isPlainObject(docsJson.members)) {
        /*
        docsJson.members = {
          events: [],
          global: [],
          inner: [],
          instance: [],
          static: [],
        }
        each member type has array of jsdocs in same shape as top level jsdocs
        so we use same transformation as top level ones
        */
        picked.members = _.reduce(
          docsJson.members,
          (acc, membersOfType, key) => {
            if (membersOfType.length > 0) {
              acc[`${key}___NODE`] = membersOfType.map(member => {
                const nodeHierarchy = prepareNodeForDocs(member, {
                  level: level + 1,
                  parent: docSkeletonNode.id,
                })
                children.push(nodeHierarchy)
                return nodeHierarchy.node.id
              })
            }
            return acc
          },
          {}
        )
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

      const docNode = {
        ...docSkeletonNode,
        ...picked,
      }
      docNode.internal.contentDigest = createContentDigest(docNode)

      if (docNode.kind === `typedef`) {
        typeDefs.set(docNode.name, docNode.id)
      }

      const nodeHierarchy = {
        node: docNode,
        children,
      }
      handledDocs.set(docsJson, nodeHierarchy)
      return nodeHierarchy
    }

    const rootNodes = documentationJson.map((docJson, index) =>
      prepareNodeForDocs(docJson, { commentNumber: index })
    )

    const createChildrenNodesRecursively = ({ node: parent, children }) => {
      if (children) {
        children.forEach(nodeHierarchy => {
          createNode(nodeHierarchy.node)
          createParentChildLink({
            parent,
            child: nodeHierarchy.node,
          })
          createChildrenNodesRecursively(nodeHierarchy)
        })
      }
    }

    createChildrenNodesRecursively({
      node,
      children: rootNodes,
    })

    return true
  } else {
    return null
  }
}
