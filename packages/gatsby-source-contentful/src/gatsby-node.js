const contentful = require(`contentful`)
const crypto = require(`crypto`)
const stringify = require(`json-stringify-safe`)
const _ = require(`lodash`)

const digest = str => crypto.createHash(`md5`).update(str).digest(`hex`)

const typePrefix = `contentful__`
const conflictFieldPrefix = `contentful`
const makeTypeName = type => `${typePrefix}${type}`
// restrictedNodeFields from here https://www.gatsbyjs.org/docs/node-interface/
const restrictedNodeFields = [`id`, `children`, `parent`, `fields`, `internal`]

exports.sourceNodes = async (
  { boundActionCreators, getNode, hasNodeChanged, store },
  { spaceId, accessToken }
) => {
  const { createNode } = boundActionCreators

  // Fetch articles.
  console.time(`fetch Contentful data`)
  console.log(`Starting to fetch data from Contentful`)

  const client = contentful.createClient({
    space: spaceId,
    accessToken,
  })

  let contentTypes
  try {
    contentTypes = await client.getContentTypes({ limit: 1000 })
  } catch (e) {
    console.log(`error fetching content types`, e)
  }
  console.log(`contentTypes fetched`, contentTypes.items.length)
  if (contentTypes.total > 1000) {
    console.log(
      `HI! gatsby-source-plugin isn't setup yet to paginate over 1000 content types (the max we can fetch in one go). Please help out the project and contribute a PR fixing this.`
    )
  }

  const entryList = await Promise.all(
    contentTypes.items.map(async contentType => {
      const contentTypeId = contentType.sys.id
      let entries
      try {
        entries = await client.getEntries({
          content_type: contentTypeId,
          limit: 1000,
        })
      } catch (e) {
        console.log(`error fetching entries`, e)
      }
      console.log(
        `entries fetched for content type ${contentType.name} (${contentTypeId})`,
        entries.items.length
      )
      if (entries.total > 1000) {
        console.log(
          `HI! gatsby-source-plugin isn't setup yet to paginate over 1000 entries (the max we can fetch in one go). Please help out the project and contribute a PR fixing this.`
        )
      }

      return entries
    })
  )

  let assets
  try {
    assets = await client.getAssets({ limit: 1000 })
  } catch (e) {
    console.log(`error fetching assets`, e)
  }
  if (assets.total > 1000) {
    console.log(
      `HI! gatsby-source-plugin isn't setup yet to paginate over 1000 assets (the max we can fetch in one go). Please help out the project and contribute a PR fixing this.`
    )
  }
  console.log(`assets fetched`, assets.items.length)
  console.timeEnd(`fetch Contentful data`)

  // Create map of not resolvable ids so we can filter them out while creating
  // links.
  const notResolvable = new Map()
  entryList.forEach(ents => {
    if (ents.errors) {
      ents.errors.forEach(error => {
        if (error.sys.id === `notResolvable`) {
          notResolvable.set(error.details.id, error.details)
        }
      })
    }
  })

  const contentTypeItems = contentTypes.items

  // Build foreign reference map before starting to insert any nodes
  const foreignReferenceMap = {}
  contentTypeItems.forEach((contentTypeItem, i) => {
    const contentTypeItemId = contentTypeItem.sys.id
    entryList[i].items.forEach(entryItem => {
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

  function createTextNode(node, key, text, createNode) {
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

  contentTypeItems.forEach((contentTypeItem, i) => {
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
    const entryNodes = entryList[i].items.map(entryItem => {
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
          f => f.id === entryItemFieldKey
        ).type
        if (fieldType === `Text`) {
          entryItemFields[`${entryItemFieldKey}___NODE`] = createTextNode(
            entryNode,
            entryItemFieldKey,
            entryItemFields[entryItemFieldKey],
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
    const contentTypeItemStr = stringify(contentTypeItem)

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
  })

  assets.items.forEach(assetItem => {
    // Create a node for each asset. They may be referenced by Entries
    const assetItemStr = stringify(assetItem)

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
  })

  return
}
