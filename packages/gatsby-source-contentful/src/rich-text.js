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

const getContentTypeItemFromEntry = (entry, contentTypeItems) =>
  contentTypeItems.find(
    contentTypeItem =>
      entry.sys.contentType &&
      contentTypeItem.sys.id === entry.sys.contentType.sys.id
  )

const getFieldPropsFromContentTypeItem = (contentTypeItem, fieldName) =>
  contentTypeItem.fields.find(({ id }) => id === fieldName)

const resolveLocaleForAllEntryFields = ({
  entry,
  contentTypeItems,
  getField,
  defaultLocale,
}) => {
  const contentTypeItem = getContentTypeItemFromEntry(entry, contentTypeItems)

  return {
    ...entry,
    fields: _.mapValues(entry.fields, (field, fieldName) => {
      const fieldProps = getFieldPropsFromContentTypeItem(
        contentTypeItem,
        fieldName
      )

      const fieldValue = fieldProps.localized
        ? getField(field)
        : field[defaultLocale]

      // If one of the entry's fields is itself a reference to another entry,
      // recursively resolve that entry's field locales too.
      if (isEntryReferenceField(fieldValue)) {
        return resolveLocaleForAllEntryFields({
          entry: fieldValue,
          contentTypeItems,
          getField,
          defaultLocale,
        })
      }

      return fieldValue
    }),
  }
}

const resolveLocaleForEntryReferenceNode = ({
  node,
  contentTypeItems,
  getField,
  defaultLocale,
}) => {
  return {
    ...node,
    data: {
      target: resolveLocaleForAllEntryFields({
        entry: node.data.target,
        contentTypeItems,
        getField,
        defaultLocale,
      }),
    },
  }
}

const normalizeRichTextNode = ({
  node,
  contentTypeItems,
  getField,
  defaultLocale,
}) => {
  if (isEntryReferenceNode(node)) {
    return resolveLocaleForEntryReferenceNode({
      node,
      contentTypeItems,
      getField,
      defaultLocale,
    })
  }

  if (Array.isArray(node.content)) {
    return {
      ...node,
      content: node.content.map(childNode =>
        normalizeRichTextNode({
          node: childNode,
          contentTypeItems,
          getField,
          defaultLocale,
        })
      ),
    }
  }

  return node
}

const normalizeRichTextField = ({
  field,
  contentTypeItems,
  getField,
  defaultLocale,
}) => {
  if (field && field.content) {
    return {
      ...field,
      content: field.content.map(node =>
        normalizeRichTextNode({
          node,
          contentTypeItems,
          getField,
          defaultLocale,
        })
      ),
    }
  }

  return field
}

exports.normalizeRichTextField = normalizeRichTextField
