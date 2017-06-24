const _ = require(`lodash`)
const crypto = require(`crypto`)
const stringify = require(`json-stringify-safe`)

const digest = str => crypto.createHash(`md5`).update(str).digest(`hex`)
const typePrefix = `Contentful`
const makeTypeName = type => _.upperFirst(_.camelCase(`${typePrefix} ${type}`))

exports.buildForeignReferenceMap = ({
  contentTypeItems,
  entryList,
  notResolvable,
}) => {
  const foreignReferenceMap = {}
  contentTypeItems.forEach((contentTypeItem, i) => {
    const contentTypeItemId = contentTypeItem.sys.id
    entryList[i].forEach(entryItem => {
      const entryItemFields = entryItem.fields
      Object.keys(entryItemFields).forEach(entryItemFieldKey => {
        const entryItemFieldValue = entryItemFields[entryItemFieldKey]
        if (Array.isArray(entryItemFieldValue)) {
          if (
            entryItemFieldValue[0].sys &&
            entryItemFieldValue[0].sys.type &&
            entryItemFieldValue[0].sys.id
          ) {
            entryItemFieldValue.forEach(v => {
              // Don't create link to an unresolvable field.
              if (notResolvable.has(v.sys.id)) {
                return
              }

              if (!foreignReferenceMap[v.sys.id]) {
                foreignReferenceMap[v.sys.id] = []
              }
              foreignReferenceMap[v.sys.id].push({
                name: `${contentTypeItemId}___NODE`,
                id: entryItem.sys.id,
              })
            })
          }
        } else if (
          entryItemFieldValue.sys &&
          entryItemFieldValue.sys.type &&
          entryItemFieldValue.sys.id &&
          !notResolvable.has(entryItemFieldValue.sys.id)
        ) {
          if (!foreignReferenceMap[entryItemFieldValue.sys.id]) {
            foreignReferenceMap[entryItemFieldValue.sys.id] = []
          }
          foreignReferenceMap[entryItemFieldValue.sys.id].push({
            name: `${contentTypeItemId}___NODE`,
            id: entryItem.sys.id,
          })
        }
      })
    })
  })

  return foreignReferenceMap
}

function createTextNode(node, key, text, createNode) {
  if (!text) throw new Error('text empty')
  const textNode = {
    id: `${node.id}${key}TextNode`,
    parent: node.id,
    children: [],
    [key]: text,
    internal: {
      type: _.camelCase(`${node.internal.type} ${key} TextNode`),
      mediaType: `text/x-markdown`,
      content: text,
      contentDigest: digest(text),
    },
  }

  node.children = node.children.concat([textNode.id])
  createNode(textNode)

  return textNode.id
}
exports.createTextNode = createTextNode

exports.createContentTypeNodes = ({
  contentTypeItem,
  restrictedNodeFields,
  conflictFieldPrefix,
  entries,
  createNode,
  notResolvable,
  foreignReferenceMap,
  defaultLocal,
}) => {
  const contentTypeItemId = contentTypeItem.sys.id

  // Warn about any field conflicts
  const conflictFields = []
  contentTypeItem.fields.forEach(contentTypeItemField => {
    const fieldName = contentTypeItemField.id
    if (restrictedNodeFields.includes(fieldName)) {
      console.log(
        `Restricted field found for ContentType ${contentTypeItemId} and field ${fieldName}. Prefixing with ${conflictFieldPrefix}.`
      )
      conflictFields.push(fieldName)
    }
  })

  // First create nodes for each of the entries of that content type
  const entryNodes = entries.map(entryItem => {
    // Prefix any conflicting fields
    // https://github.com/gatsbyjs/gatsby/pull/1084#pullrequestreview-41662888
    const entryItemFields = Object.assign({}, entryItem.fields)
    conflictFields.forEach(conflictField => {
      entryItemFields[`${conflictFieldPrefix}${conflictField}`] =
        entryItemFields[conflictField]
      delete entryItemFields[conflictField]
    })

    // Add linkages to other nodes based on foreign references
    Object.keys(entryItemFields).forEach(entryItemFieldKey => {
      const entryItemFieldValue = entryItemFields[entryItemFieldKey]
      if (Array.isArray(entryItemFieldValue)) {
        if (
          entryItemFieldValue[0].sys &&
          entryItemFieldValue[0].sys.type &&
          entryItemFieldValue[0].sys.id
        ) {
          entryItemFields[
            `${entryItemFieldKey}___NODE`
          ] = entryItemFieldValue
            .filter(v => !notResolvable.has(v.sys.id))
            .map(v => v.sys.id)

          delete entryItemFields[entryItemFieldKey]
        }
      } else if (
        entryItemFieldValue.sys &&
        entryItemFieldValue.sys.type &&
        entryItemFieldValue.sys.id &&
        !notResolvable.has(entryItemFieldValue.sys.id)
      ) {
        entryItemFields[`${entryItemFieldKey}___NODE`] =
          entryItemFieldValue.sys.id
        delete entryItemFields[entryItemFieldKey]
      }
    })

    // Add reverse linkages if there are any for this node
    const foreignReferences = foreignReferenceMap[entryItem.sys.id]
    if (foreignReferences) {
      foreignReferences.forEach(foreignReference => {
        const existingReference = entryItemFields[foreignReference.name]
        if (existingReference) {
          entryItemFields[foreignReference.name].push(foreignReference.id)
        } else {
          // If is one foreign reference, there can always be many.
          // Best to be safe and put it in an array to start with.
          entryItemFields[foreignReference.name] = [foreignReference.id]
        }
      })
    }

    let entryNode = {
      id: entryItem.sys.id,
      parent: contentTypeItemId,
      children: [],
      internal: {
        type: `${makeTypeName(contentTypeItemId)}`,
        mediaType: `application/json`,
      },
    }

    // Replace text fields with text nodes so we can process their markdown
    // into HTML.
    Object.keys(entryItemFields).forEach(entryItemFieldKey => {
      // Ignore fields with "___node" as they're already handled
      // and won't be a text field.
      if (entryItemFieldKey.split(`___`).length > 1) {
        return
      }

      const fieldType = contentTypeItem.fields.find(
        f =>
          (restrictedNodeFields.includes(f.id)
            ? `${conflictFieldPrefix}${f.id}`
            : f.id) === entryItemFieldKey
      ).type
      if (fieldType === `Text`) {
        console.log(`TEXT: `, entryItemFields[entryItemFieldKey])
        entryItemFields[`${entryItemFieldKey}___NODE`] = createTextNode(
          entryNode,
          entryItemFieldKey,
          entryItemFields[entryItemFieldKey][defaultLocal],
          createNode
        )

        delete entryItemFields[entryItemFieldKey]
      }
    })

    entryNode = { ...entryItemFields, ...entryNode }

    // Get content digest of node.
    const contentDigest = digest(stringify(entryNode))

    entryNode.internal.contentDigest = contentDigest

    return entryNode
  })

  // Create a node for each content type
  const contentTypeNode = {
    id: contentTypeItemId,
    parent: `__SOURCE__`,
    children: [],
    name: contentTypeItem.name,
    displayField: contentTypeItem.displayField,
    description: contentTypeItem.description,
    internal: {
      type: `${makeTypeName(`ContentType`)}`,
      mediaType: `text/x-contentful`,
    },
  }

  // Get content digest of node.
  const contentDigest = digest(stringify(contentTypeNode))

  contentTypeNode.internal.contentDigest = contentDigest

  createNode(contentTypeNode)
  entryNodes.forEach(entryNode => {
    createNode(entryNode)
  })
}

exports.createAssetNodes = ({ assetItem, createNode, defaultLocal }) => {
  // Create a node for each asset. They may be referenced by Entries
  // default locale workaround for now
  assetItem.fields.file = assetItem.fields.file[defaultLocal]
  assetItem.fields.title = assetItem.fields.title[defaultLocal]
  assetItem.fields.description = assetItem.fields.description[defaultLocal]

  console.log(defaultLocal)
  console.log(assetItem.fields)
  const assetNode = {
    id: assetItem.sys.id,
    parent: `__SOURCE__`,
    children: [],
    ...assetItem.fields,
    internal: {
      type: `${makeTypeName(`Asset`)}`,
      mediaType: `text/x-contentful`,
    },
  }

  // Get content digest of node.
  const contentDigest = digest(stringify(assetNode))

  assetNode.internal.contentDigest = contentDigest

  createNode(assetNode)
}
