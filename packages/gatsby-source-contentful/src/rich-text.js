const _ = require(`lodash`)
const { BLOCKS, INLINES } = require(`@contentful/rich-text-types`)

const isEntryReferenceNode = node =>
  [
    BLOCKS.EMBEDDED_ENTRY,
    INLINES.ENTRY_HYPERLINK,
    INLINES.EMBEDDED_ENTRY,
  ].indexOf(node.nodeType) >= 0

const isEntryReferenceField = field =>
  field && field.sys && field.sys.type === `Entry`

const getEntryContentType = (entry, contentTypes) =>
  contentTypes.find(
    contentType =>
      entry.sys.contentType &&
      contentType.sys.id === entry.sys.contentType.sys.id
  )

const getFieldProps = (contentType, fieldName) =>
  contentType.fields.find(({ id }) => id === fieldName)

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

      // If one of the entry's fields is itself a reference to another entry,
      // recursively resolve that entry's field locales too.
      if (isEntryReferenceField(fieldValue)) {
        return getEntryWithFieldLocalesResolved({
          entry: fieldValue,
          contentTypes,
          getField,
          defaultLocale,
        })
      }

      return fieldValue
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
