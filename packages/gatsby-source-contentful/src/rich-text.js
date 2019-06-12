const _ = require(`lodash`)
const { BLOCKS, INLINES } = require(`@contentful/rich-text-types`)

const isEntryReferenceNode = node =>
  [
    BLOCKS.EMBEDDED_ENTRY,
    INLINES.ENTRY_HYPERLINK,
    INLINES.EMBEDDED_ENTRY,
  ].indexOf(node.nodeType) >= 0

const isAssetReferenceNode = node =>
  [BLOCKS.EMBEDDED_ASSET, INLINES.ASSET_HYPERLINK].indexOf(node.nodeType) >= 0

const isEntryReferenceField = field => _.get(field, `sys.type`) === `Entry`
const isAssetReferenceField = field => _.get(field, `sys.type`) === `Asset`

const getEntryContentType = (entry, contentTypes) =>
  contentTypes.find(
    contentType =>
      entry.sys.contentType &&
      contentType.sys.id === entry.sys.contentType.sys.id
  )

const getFieldProps = (contentType, fieldName) =>
  contentType.fields.find(({ id }) => id === fieldName)

const getAssetWithFieldLocalesResolved = ({ asset, getField }) => {
  return {
    ...asset,
    fields: _.mapValues(asset.fields, getField),
  }
}

const getFieldWithLocaleResolved = ({
  field,
  contentTypes,
  getField,
  defaultLocale,
}) => {
  // If the field is itself a reference to another entry, recursively resolve
  // that entry's field locales too.
  if (isEntryReferenceField(field)) {
    return getEntryWithFieldLocalesResolved({
      entry: field,
      contentTypes,
      getField,
      defaultLocale,
    })
  }

  if (isAssetReferenceField(field)) {
    return getAssetWithFieldLocalesResolved({
      asset: field,
      getField,
    })
  }

  if (Array.isArray(field)) {
    return field.map(fieldItem =>
      getFieldWithLocaleResolved({
        field: fieldItem,
        contentTypes,
        getField,
        defaultLocale,
      })
    )
  }

  return field
}

const getEntryWithFieldLocalesResolved = ({
  entry,
  contentTypes,
  getField,
  defaultLocale,
}) => {
  const contentType = getEntryContentType(entry, contentTypes)

  return {
    ...entry,
    fields: _.mapValues(entry.fields, (field, fieldName) => {
      const fieldProps = getFieldProps(contentType, fieldName)

      const fieldValue = fieldProps.localized
        ? getField(field)
        : field[defaultLocale]

      return getFieldWithLocaleResolved({
        field: fieldValue,
        contentTypes,
        getField,
        defaultLocale,
      })
    }),
  }
}

const getNormalizedRichTextNode = ({
  node,
  contentTypes,
  getField,
  defaultLocale,
}) => {
  if (isEntryReferenceNode(node)) {
    return {
      ...node,
      data: {
        ...node.data,
        target: getEntryWithFieldLocalesResolved({
          entry: node.data.target,
          contentTypes,
          getField,
          defaultLocale,
        }),
      },
    }
  }

  if (isAssetReferenceNode(node)) {
    return {
      ...node,
      data: {
        ...node.data,
        target: getAssetWithFieldLocalesResolved({
          asset: node.data.target,
          getField,
        }),
      },
    }
  }

  if (Array.isArray(node.content)) {
    return {
      ...node,
      content: node.content.map(childNode =>
        getNormalizedRichTextNode({
          node: childNode,
          contentTypes,
          getField,
          defaultLocale,
        })
      ),
    }
  }

  return node
}

/**
 * Walk through the rich-text object, resolving locales on referenced entries
 * (and on entries they've referenced, etc.).
 */
const getNormalizedRichTextField = ({
  field,
  contentTypes,
  getField,
  defaultLocale,
}) => {
  if (field && field.content) {
    return {
      ...field,
      content: field.content.map(node =>
        getNormalizedRichTextNode({
          node,
          contentTypes,
          getField,
          defaultLocale,
        })
      ),
    }
  }

  return field
}

exports.getNormalizedRichTextField = getNormalizedRichTextField
