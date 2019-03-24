const _ = require(`lodash`)

// Ideally we would have nice access to it - I also potentially missed something
// obvious and I don't need to import from gatsby internals (yikes #1)
const { link } = require(`gatsby/dist/schema/resolvers`)
// This probably will be handled by automatically adding fieldArgs/resolver
// to Date fields - for now importing directly from gatsby internals (yikes #2)
const { dateResolver } = require(`gatsby/dist/schema/types/date`)

const typePrefix = `Contentful`
const makeTypeName = type => _.upperFirst(_.camelCase(`${typePrefix} ${type}`))

exports.makeTypeName = makeTypeName

const makeTextNodeType = (contentTypeName, key) =>
  _.camelCase(`${contentTypeName} ${key} TextNode`)

exports.makeTextNodeType = makeTextNodeType

const fieldTypeToGraphQLTypeLookup = {
  // Short string
  Symbol: () => `String`,

  // Multiple values - handle inner type as usual and just
  // wrap type in `[]`
  Array: (field, context) => {
    const innerField = fieldTypeToGraphQLType(field.items, {
      isArray: true,
      ...context,
    })
    if (innerField) {
      return {
        ...innerField,
        type: `[${innerField.type}]`,
      }
    }
    return null
  },

  // Long string (markdown)
  Text: (field, context) => {
    const textTypeName = makeTextNodeType(
      makeTypeName(context.typeName),
      context.fieldName
    )

    const textGQLTypeConfig = context.schema.buildObjectType({
      name: textTypeName,
      fields: {
        [context.fieldName]: `String`,
        // missing - how to properly add childMarkdownRemark field (and other children that
        // transform markdown content (i.e. mdx)?

        // We shouldn't directly specify exact type name for parent/children
        // in this instance: as markdown content can be transformed by
        // different plugin (i.e "gatsby-transformer-remark" and "gatsby-mdx").
        // It also would create tight bind between different source/transformer
        // plugins.

        // Instead I think types should have some metadata
        // that transformer plugins could subscribe to.
        // Common thing that transformer look for is "mediaType", so perhaps
        // types could optionally declare those - this would potentially need
        // custom config field in `buildObjectType` on top of ones that
        // graphql-compose uses (?). This is generally problematic
        // because some transformers use mediaType, but some don't
        // (i.e. `gatsby-transformer-sharp` or `gatsby-transformer-asciidoc`
        // check extension field of potential parent File node).

        // I will hack it for now:
        childMarkdownRemark: `MarkdownRemark`,
        // but I can't create actual "children" field which
        // is union combining all children node types
      },
      interfaces: [`Node`],
    })

    context.gqlTypes.push(textGQLTypeConfig)

    // use that type
    return {
      type: textTypeName,
    }
  },

  Boolean: () => `Boolean`,

  // Reference and Media fields
  Link: (field, context) => {
    if (field.linkType === `Asset`) {
      // Media field
      const type = {
        type: `ContentfulAsset`,
        resolve: link({ by: `id`, from: `${context.fieldName}___NODE` }),
      }

      return type
    } else if (field.linkType === `Entry`) {
      // Reference field
      let contentTypes = null

      // If there is validations field:
      if (field.validations) {
        // lok for validations that limit available content types
        field.validations.some(validation => {
          if (validation.linkContentType) {
            contentTypes = context.contentTypeItems.filter(contentType =>
              validation.linkContentType.includes(contentType.sys.contentful_id)
            )
            return true
          }
          return false
        })
      }

      if (!contentTypes) {
        contentTypes = context.contentTypeItems
      }

      // add backreferences
      contentTypes.forEach(contentType => {
        context.addBackReference({
          referencingType: context.typeName,
          referencedType: contentType.name,
          fieldName: context.fieldName,
          array: context.isArray,
        })
      })

      if (contentTypes.length > 1) {
        // this is union field

        // would be good to have access to gatsby convenience function
        // to generate this union name, so it's consistent with names
        // that gatsby is generating during inference (to not break queries
        // if someone defines fragment on union type)
        const UnionTypeName = _.camelCase(
          `${context.typeName} ${context.fieldName}`
        )

        // create union type
        const unionType = context.schema.buildUnionType({
          name: UnionTypeName,
          types: contentTypes.map(contentType =>
            makeTypeName(contentType.name)
          ),
          resolveType: node => node.internal.type,
        })

        context.gqlTypes.push(unionType)

        // use that type
        return {
          type: UnionTypeName,
          resolve: link({ by: `id`, from: `${context.fieldName}___NODE` }),
        }
      } else if (contentTypes.length === 1) {
        // this is single type - not sure if this should be special case
        // (using regular object type)
        // or should create union with single type?
        return {
          type: makeTypeName(contentTypes[0].name),
          resolve: link({ by: `id`, from: `${context.fieldName}___NODE` }),
        }
      } else {
        return null
      }
    }
    return null
  },
  // Number - integer
  Integer: () => `Int`,
  // Number - decimal
  Number: () => `Float`,
  Location: () => makeTypeName(`Location`),

  // TO-DO figure out how to attach fields args / resolver properly.
  // I'm importing private internals from gatsby which is no-no
  Date: () => dateResolver,

  // Breaking changes below:

  // Object / Json field type in contentful was fully inferred from data
  // This trully depended on free-form data, so I do think using GraphQLJSON
  // here is better option (tho it loses filtering support for those fields)
  Object: () => `JSON`,

  // Previously RichText child node would be created that would look something like this:
  // {
  //   type: `Contentful<ContentTypeName><FieldKey>RichTextNode`
  //   fields: {
  //     [<FieldKey>]: `String`,
  //     json: `JSON`,
  //   }
  //   interfaces: [`Node]
  // }
  // Which seriously just adds extra nesting, but we kept it because original
  // RichText field type implementation relied on creating RichText Nodes
  // for RichText transformer that would consume input and render
  // html string. Because this set of changes introduce number of breaking changes
  // this is good opportunity to clean up RichText as well.
  RichText: () => `JSON`,
}

const fieldTypeToGraphQLType = (field, context) => {
  if (field.type in fieldTypeToGraphQLTypeLookup) {
    let gqlType = fieldTypeToGraphQLTypeLookup[field.type](field, context)

    if (typeof gqlType === `string`) {
      gqlType = {
        type: gqlType,
      }
    }

    if (field.required && gqlType) {
      gqlType.type = `${gqlType.type}!`
    }

    return gqlType
  }

  // for development - check what field types are not handled
  console.log(`Field type not handled`, field)

  return null
}

/**
 * @param {object} Context
 * @param {Array<import("contentful").ContentType>} Context.contentTypeItems
 * @param {any} Context.actions
 * @param {any} Context.schema
 */
exports.createTypes = ({ actions, schema, contentTypeItems }) => {
  const context = {
    contentTypeItems,
    schema,
  }

  const defaultFields = {
    node_locale: `String`,
    contentful_id: `String`,
  }

  // those could be probably use just SDL in separate file
  // they don't need special resolvers
  const defaultTypes = {}
  defaultTypes[`Location`] = {
    name: makeTypeName(`Location`),
    fields: {
      lat: `Float!`,
      lon: `Float!`,
    },
  }

  defaultTypes[`AssetFileDetailsImage`] = {
    name: makeTypeName(`AssetFileDetailsImage`),
    fields: {
      width: `Int`,
      height: `Int`,
    },
  }

  defaultTypes[`AssetFileDetails`] = {
    name: makeTypeName(`AssetFileDetails`),
    fields: {
      size: `Int`,
      image: `ContentfulAssetFileDetailsImage`,
    },
  }

  defaultTypes[`AssetFile`] = {
    name: makeTypeName(`AssetFile`),
    fields: {
      url: `String`,
      details: `ContentfulAssetFileDetails`,
      fileName: `String`,
      contentType: `String`,
    },
  }

  defaultTypes[`Asset`] = {
    name: makeTypeName(`Asset`),
    fields: {
      ...defaultFields,
      title: `String`,
      description: `String`,
      file: `ContentfulAssetFile`,
    },
    interfaces: [`Node`],
  }

  const extraTypes = []
  const backReferences = {}

  const typeConfigs = contentTypeItems.reduce((acc, contentType) => {
    const fieldType = {
      // I would like to use @dontInfer on this field and
      // not quite sure how?
      name: makeTypeName(contentType.name),
      fields: contentType.fields.reduce(
        (fields, field) => {
          const gqlType = fieldTypeToGraphQLType(field, {
            gqlTypes: extraTypes,
            typeName: contentType.name,
            fieldName: field.id,
            addBackReference: ({
              referencingType,
              referencedType,
              ...rest
            }) => {
              let backReferencesForType = backReferences[referencedType]
              if (!backReferencesForType) {
                backReferencesForType = backReferences[referencedType] = {}
              }

              let fields = backReferencesForType[referencingType]
              if (!fields) {
                fields = backReferencesForType[referencingType] = []
              }

              fields.push(rest)
            },
            ...context,
          })

          if (gqlType) {
            fields[field.id] = gqlType
          }

          return fields
        },
        // default content node fields
        {
          ...defaultFields,
          createdAt: dateResolver,
          updatedAt: dateResolver,
        }
      ),

      interfaces: [`Node`],
    }

    acc[contentType.name] = fieldType

    return acc
  }, defaultTypes)

  actions.createTypes([
    ...extraTypes,
    ...Object.keys(typeConfigs).map(typeName => {
      const typeConfig = typeConfigs[typeName]

      // handle back-references
      const typeBackReferences = backReferences[typeName]

      if (typeBackReferences) {
        Object.keys(typeBackReferences).forEach(referencedByType => {
          const fieldsReferencingType = typeBackReferences[referencedByType]
          const gqlTypeName = makeTypeName(referencedByType)
          typeConfig.fields[_.camelCase(referencedByType)] = {
            // back references are always array
            type: `[${gqlTypeName}]`,
            resolve: async (source, _fieldArgs, context, _info) => {
              const allNodesIdsThatReferenceThisOne = await Promise.all(
                fieldsReferencingType.map(async ({ fieldName, array }) => {
                  // Ideally I could use query below (or something like that)
                  // but we currently don't support filtering using union
                  // type fields.
                  // const query = {
                  //   filter: { [fieldName]: { id: { eq: source.id } } },
                  // }
                  // const nodes = await context.nodeModel.runQuery({
                  //   query,
                  //   type: gqlTypeName,
                  //   firstOnly: false,
                  // }, {
                  // connectionType: gqlTypeName,
                  // })

                  // I shouln't call nodeStore here.
                  // I only need to do it right now because I can't use
                  // runQuery, because we can't filter by fields that are
                  // unions
                  const nodes = context.nodeModel.nodeStore.getNodesByType(
                    gqlTypeName
                  )
                  const filteredNodes = nodes.filter(node => {
                    if (array) {
                      const fieldValue = node[`${fieldName}___NODE`]
                      return fieldValue && fieldValue.includes(source.id)
                    } else {
                      return node[`${fieldName}___NODE`] === source.id
                    }
                  })

                  return filteredNodes.map(node => node.id)
                })
              )

              const nodes = context.nodeModel.getNodesByIds(
                {
                  ids: _.uniq(_.flatten(allNodesIdsThatReferenceThisOne)),
                  type: gqlTypeName,
                },
                {
                  // I don't want individual nodes page dependency
                  // as it won't catch if new node of that type
                  // will link to this one.
                  connectionType: gqlTypeName,
                }
              )

              return nodes
            },
          }
        })
      }

      return schema.buildObjectType(typeConfig)
    }),
  ])
}
