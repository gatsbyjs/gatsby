const _ = require(`lodash`)
const crypto = require(`crypto`)
const stringify = require(`json-stringify-safe`)
const deepMap = require(`deep-map`)

const digest = str =>
  crypto
    .createHash(`md5`)
    .update(str)
    .digest(`hex`)
const typePrefix = `Contentful`
const makeTypeName = type => _.upperFirst(_.camelCase(`${typePrefix} ${type}`))

const getLocalizedField = ({ field, locale, localesFallback }) => {
  if (!_.isUndefined(field[locale.code])) {
    return field[locale.code]
  } else if (
    !_.isUndefined(locale.code) &&
    !_.isUndefined(localesFallback[locale.code])
  ) {
    return getLocalizedField({
      field,
      locale: { code: localesFallback[locale.code] },
      localesFallback,
    })
  } else {
    return null
  }
}
const buildFallbackChain = locales => {
  const localesFallback = {}
  _.each(
    locales,
    locale => (localesFallback[locale.code] = locale.fallbackCode)
  )
  return localesFallback
}
const makeGetLocalizedField = ({ locale, localesFallback }) => field =>
  getLocalizedField({ field, locale, localesFallback })

exports.getLocalizedField = getLocalizedField
exports.buildFallbackChain = buildFallbackChain

// If the id starts with a number, left-pad it with a c (for Contentful of
// course :-))
const fixId = id => {
  if (!_.isString(id)) {
    id = id.toString()
  }
  if (!isNaN(id.slice(0, 1))) {
    return `c${id}`
  }
  return id
}
exports.fixId = fixId

exports.fixIds = object => {
  const out = deepMap(object, (v, k) => (k === `id` ? fixId(v) : v))

  return {
    ...out,
    sys: {
      ...out.sys,
      contentful_id: object.sys.id,
    },
  }
}

const makeId = ({ id, currentLocale, defaultLocale }) =>
  currentLocale === defaultLocale ? id : `${id}___${currentLocale}`

exports.makeId = makeId

const makeMakeId = ({ currentLocale, defaultLocale, createNodeId }) => id =>
  createNodeId(makeId({ id, currentLocale, defaultLocale }))

exports.buildEntryList = ({ contentTypeItems, currentSyncData }) =>
  contentTypeItems.map(contentType =>
    currentSyncData.entries.filter(
      entry => entry.sys.contentType.sys.id === contentType.sys.id
    )
  )

exports.buildResolvableSet = ({
  entryList,
  existingNodes = [],
  assets = [],
  locales,
  defaultLocale,
}) => {
  const resolvable = new Set()
  existingNodes.forEach(n => {
    if (n.contentful_id) {
      // We need to add only root level resolvable (assets and entries)
      // derived nodes (markdown or JSON) will be recreated if needed.
      // We also need to apply `fixId` as some objects will have ids
      // prefixed with `c` and fixIds will recursively apply that
      // and resolvable ids need to match that.
      resolvable.add(fixId(n.contentful_id))
    }
  })

  entryList.forEach(entries => {
    entries.forEach(entry => {
      resolvable.add(entry.sys.id)
    })
  })
  assets.forEach(assetItem => resolvable.add(assetItem.sys.id))

  return resolvable
}

exports.buildForeignReferenceMap = ({
  contentTypeItems,
  entryList,
  resolvable,
  defaultLocale,
  locales,
}) => {
  const foreignReferenceMap = {}
  contentTypeItems.forEach((contentTypeItem, i) => {
    const contentTypeItemId = contentTypeItem.name.toLowerCase()
    entryList[i].forEach(entryItem => {
      const entryItemFields = entryItem.fields
      Object.keys(entryItemFields).forEach(entryItemFieldKey => {
        if (entryItemFields[entryItemFieldKey]) {
          let entryItemFieldValue =
            entryItemFields[entryItemFieldKey][defaultLocale]
          // If this is an array of single reference object
          // add to the reference map, otherwise ignore.
          if (Array.isArray(entryItemFieldValue)) {
            if (
              entryItemFieldValue[0] &&
              entryItemFieldValue[0].sys &&
              entryItemFieldValue[0].sys.type &&
              entryItemFieldValue[0].sys.id
            ) {
              entryItemFieldValue.forEach(v => {
                // Don't create link to an unresolvable field.
                if (!resolvable.has(v.sys.id)) {
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
            entryItemFieldValue &&
            entryItemFieldValue.sys &&
            entryItemFieldValue.sys.type &&
            entryItemFieldValue.sys.id &&
            resolvable.has(entryItemFieldValue.sys.id)
          ) {
            if (!foreignReferenceMap[entryItemFieldValue.sys.id]) {
              foreignReferenceMap[entryItemFieldValue.sys.id] = []
            }
            foreignReferenceMap[entryItemFieldValue.sys.id].push({
              name: `${contentTypeItemId}___NODE`,
              id: entryItem.sys.id,
            })
          }
        }
      })
    })
  })

  return foreignReferenceMap
}

function prepareTextNode(node, key, text, createNodeId) {
  const str = _.isString(text) ? text : ` `
  const textNode = {
    id: createNodeId(`${node.id}${key}TextNode`),
    parent: node.id,
    children: [],
    [key]: str,
    internal: {
      type: _.camelCase(`${node.internal.type} ${key} TextNode`),
      mediaType: `text/markdown`,
      content: str,
      contentDigest: digest(str),
    },
  }

  node.children = node.children.concat([textNode.id])

  return textNode
}

function prepareRichTextNode(node, key, content, createNodeId) {
  const str = stringify(content)
  const richTextNode = {
    ...content,
    id: createNodeId(`${node.id}${key}RichTextNode`),
    parent: node.id,
    children: [],
    [key]: str,
    internal: {
      type: _.camelCase(`${node.internal.type} ${key} RichTextNode`),
      mediaType: `text/richtext`,
      content: str,
      contentDigest: digest(str),
    },
  }

  node.children = node.children.concat([richTextNode.id])

  return richTextNode
}
function prepareJSONNode(node, key, content, createNodeId, i = ``) {
  const str = JSON.stringify(content)
  const JSONNode = {
    ...(_.isPlainObject(content) ? { ...content } : { content: content }),
    id: createNodeId(`${node.id}${key}${i}JSONNode`),
    parent: node.id,
    children: [],
    internal: {
      type: _.camelCase(`${node.internal.type} ${key} JSONNode`),
      mediaType: `application/json`,
      content: str,
      contentDigest: digest(str),
    },
  }

  node.children = node.children.concat([JSONNode.id])

  return JSONNode
}

exports.createContentTypeNodes = ({
  contentTypeItem,
  restrictedNodeFields,
  conflictFieldPrefix,
  entries,
  createNode,
  createNodeId,
  resolvable,
  foreignReferenceMap,
  defaultLocale,
  locales,
}) => {
  const contentTypeItemId = contentTypeItem.name
  locales.forEach(locale => {
    const localesFallback = buildFallbackChain(locales)
    const mId = makeMakeId({
      currentLocale: locale.code,
      defaultLocale,
      createNodeId,
    })
    const getField = makeGetLocalizedField({
      locale,
      localesFallback,
    })

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

    const childrenNodes = []

    // First create nodes for each of the entries of that content type
    const entryNodes = entries.map(entryItem => {
      // Get localized fields.
      const entryItemFields = _.mapValues(entryItem.fields, (v, k) => {
        const fieldProps = contentTypeItem.fields.find(field => field.id === k)
        if (fieldProps.localized) {
          return getField(v)
        }
        return v[defaultLocale]
      })

      // Prefix any conflicting fields
      // https://github.com/gatsbyjs/gatsby/pull/1084#pullrequestreview-41662888
      conflictFields.forEach(conflictField => {
        entryItemFields[`${conflictFieldPrefix}${conflictField}`] =
          entryItemFields[conflictField]
        delete entryItemFields[conflictField]
      })

      // Add linkages to other nodes based on foreign references
      Object.keys(entryItemFields).forEach(entryItemFieldKey => {
        if (entryItemFields[entryItemFieldKey]) {
          const entryItemFieldValue = entryItemFields[entryItemFieldKey]
          if (Array.isArray(entryItemFieldValue)) {
            if (
              entryItemFieldValue[0] &&
              entryItemFieldValue[0].sys &&
              entryItemFieldValue[0].sys.type &&
              entryItemFieldValue[0].sys.id
            ) {
              // Check if there are any values in entryItemFieldValue to prevent
              // creating an empty node field in case when original key field value
              // is empty due to links to missing entities
              const resolvableEntryItemFieldValue = entryItemFieldValue
                .filter(function(v) {
                  return resolvable.has(v.sys.id)
                })
                .map(function(v) {
                  return mId(v.sys.id)
                })
              if (resolvableEntryItemFieldValue.length !== 0) {
                entryItemFields[
                  `${entryItemFieldKey}___NODE`
                ] = resolvableEntryItemFieldValue
              }

              delete entryItemFields[entryItemFieldKey]
            }
          } else if (
            entryItemFieldValue &&
            entryItemFieldValue.sys &&
            entryItemFieldValue.sys.type &&
            entryItemFieldValue.sys.id
          ) {
            if (resolvable.has(entryItemFieldValue.sys.id)) {
              entryItemFields[`${entryItemFieldKey}___NODE`] = mId(
                entryItemFieldValue.sys.id
              )
            }
            delete entryItemFields[entryItemFieldKey]
          }
        }
      })

      // Add reverse linkages if there are any for this node
      const foreignReferences = foreignReferenceMap[entryItem.sys.id]
      if (foreignReferences) {
        foreignReferences.forEach(foreignReference => {
          const existingReference = entryItemFields[foreignReference.name]
          if (existingReference) {
            entryItemFields[foreignReference.name].push(
              mId(foreignReference.id)
            )
          } else {
            // If there is one foreign reference, there can be many.
            // Best to be safe and put it in an array to start with.
            entryItemFields[foreignReference.name] = [mId(foreignReference.id)]
          }
        })
      }

      let entryNode = {
        id: mId(entryItem.sys.id),
        contentful_id: entryItem.sys.contentful_id,
        createdAt: entryItem.sys.createdAt,
        updatedAt: entryItem.sys.updatedAt,
        parent: contentTypeItemId,
        children: [],
        internal: {
          type: `${makeTypeName(contentTypeItemId)}`,
        },
      }

      // Use default locale field.
      Object.keys(entryItemFields).forEach(entryItemFieldKey => {
        // Ignore fields with "___node" as they're already handled
        // and won't be a text field.
        if (entryItemFieldKey.split(`___`).length > 1) {
          return
        }
      })

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
          const textNode = prepareTextNode(
            entryNode,
            entryItemFieldKey,
            entryItemFields[entryItemFieldKey],
            createNodeId
          )

          childrenNodes.push(textNode)
          entryItemFields[`${entryItemFieldKey}___NODE`] = textNode.id

          delete entryItemFields[entryItemFieldKey]
        } else if (
          fieldType === `RichText` &&
          _.isPlainObject(entryItemFields[entryItemFieldKey])
        ) {
          const richTextNode = prepareRichTextNode(
            entryNode,
            entryItemFieldKey,
            entryItemFields[entryItemFieldKey],
            createNodeId
          )

          childrenNodes.push(richTextNode)
          entryItemFields[`${entryItemFieldKey}___NODE`] = richTextNode.id

          delete entryItemFields[entryItemFieldKey]
        } else if (
          fieldType === `Object` &&
          _.isPlainObject(entryItemFields[entryItemFieldKey])
        ) {
          const jsonNode = prepareJSONNode(
            entryNode,
            entryItemFieldKey,
            entryItemFields[entryItemFieldKey],
            createNodeId
          )

          childrenNodes.push(jsonNode)
          entryItemFields[`${entryItemFieldKey}___NODE`] = jsonNode.id

          delete entryItemFields[entryItemFieldKey]
        } else if (
          fieldType === `Object` &&
          _.isArray(entryItemFields[entryItemFieldKey])
        ) {
          entryItemFields[`${entryItemFieldKey}___NODE`] = []

          entryItemFields[entryItemFieldKey].forEach((obj, i) => {
            const jsonNode = prepareJSONNode(
              entryNode,
              entryItemFieldKey,
              obj,
              createNodeId,
              i
            )

            childrenNodes.push(jsonNode)
            entryItemFields[`${entryItemFieldKey}___NODE`].push(jsonNode.id)
          })

          delete entryItemFields[entryItemFieldKey]
        }
      })

      entryNode = { ...entryItemFields, ...entryNode, node_locale: locale.code }

      // Get content digest of node.
      const contentDigest = digest(stringify(entryNode))

      entryNode.internal.contentDigest = contentDigest

      return entryNode
    })

    // Create a node for each content type
    const contentTypeNode = {
      id: createNodeId(contentTypeItemId),
      parent: null,
      children: [],
      name: contentTypeItem.name,
      displayField: contentTypeItem.displayField,
      description: contentTypeItem.description,
      internal: {
        type: `${makeTypeName(`ContentType`)}`,
      },
    }

    // Get content digest of node.
    const contentDigest = digest(stringify(contentTypeNode))

    contentTypeNode.internal.contentDigest = contentDigest

    createNode(contentTypeNode)
    entryNodes.forEach(entryNode => {
      createNode(entryNode)
    })
    childrenNodes.forEach(entryNode => {
      createNode(entryNode)
    })
  })
}

exports.createAssetNodes = ({
  assetItem,
  createNode,
  createNodeId,
  defaultLocale,
  locales,
}) => {
  locales.forEach(locale => {
    const localesFallback = buildFallbackChain(locales)
    const mId = makeMakeId({
      currentLocale: locale.code,
      defaultLocale,
      createNodeId,
    })
    const getField = makeGetLocalizedField({
      locale,
      localesFallback,
    })

    const localizedAsset = { ...assetItem }
    // Create a node for each asset. They may be referenced by Entries
    //
    // Get localized fields.
    localizedAsset.fields = {
      file: localizedAsset.fields.file
        ? getField(localizedAsset.fields.file)
        : null,
      title: localizedAsset.fields.title
        ? getField(localizedAsset.fields.title)
        : ``,
      description: localizedAsset.fields.description
        ? getField(localizedAsset.fields.description)
        : ``,
    }
    const assetNode = {
      contentful_id: localizedAsset.sys.contentful_id,
      id: mId(localizedAsset.sys.id),
      parent: null,
      children: [],
      ...localizedAsset.fields,
      node_locale: locale.code,
      internal: {
        type: `${makeTypeName(`Asset`)}`,
      },
    }

    // Get content digest of node.
    const contentDigest = digest(stringify(assetNode))

    assetNode.internal.contentDigest = contentDigest

    createNode(assetNode)
  })
}
