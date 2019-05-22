const _ = require(`lodash`)

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
      extensions: {
        infer: false,
      },
    })

    context.gqlTypes.push(textGQLTypeConfig)

    // use that type
    return {
      type: textTypeName,
      extensions: {
        link: {
          from: `${context.fieldName}___NODE`,
        },
      },
    }
  },

  Boolean: () => `Boolean`,

  // Reference and Media fields
  Link: (field, context) => {
    if (field.linkType === `Asset`) {
      // Media field
      const type = {
        type: `ContentfulAsset`,
        extensions: {
          link: {
            from: `${context.fieldName}___NODE`,
          },
        },
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
        })
      })

      if (contentTypes.length > 1) {
        // this is union field
        const usedTypesNames = contentTypes.map(contentType =>
          makeTypeName(contentType.name)
        )

        // this is re-implementation of union type naming function from gatsby
        const UnionTypeName = usedTypesNames.sort().join(``) + `Union`

        let unionType = context.gqlTypes.find(
          gqlType =>
            gqlType.kind === `UNION` && gqlType.config.name === UnionTypeName
        )

        // create union type, if it doesn't exist yet
        if (!unionType) {
          unionType = context.schema.buildUnionType({
            name: UnionTypeName,
            types: usedTypesNames,
            resolveType: node => node.internal.type,
          })

          context.gqlTypes.push(unionType)
        }

        // use that type
        return {
          type: UnionTypeName,
          extensions: {
            link: {
              from: `${context.fieldName}___NODE`,
            },
          },
        }
      } else if (contentTypes.length === 1) {
        // this is single type - not sure if this should be special case
        // (using regular object type)
        // or should create union with single type?
        return {
          type: makeTypeName(contentTypes[0].name),
          extensions: {
            link: {
              from: `${context.fieldName}___NODE`,
            },
          },
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

  Date: () => {
    return {
      type: `Date`,
      extensions: {
        dateformat: {},
      },
    }
  },

  RichText: (field, context) => {
    const richTextTypeName = _.camelCase(
      `${context.typeName} ${context.fieldName} RichTextNode`
    )

    // create object type
    const richTextFieldType = context.schema.buildObjectType({
      name: richTextTypeName,
      fields: {
        json: {
          type: `JSON`,
          resolve: source => source,
        },
      },
      extensions: {
        infer: false,
      },
    })

    context.gqlTypes.push(richTextFieldType)

    return richTextTypeName
  },

  // Breaking changes below:

  // Object / Json field type in contentful was fully inferred from data
  // This trully depended on free-form data, so I do think using GraphQLJSON
  // here is better option (tho it loses filtering support for those fields)
  Object: () => `JSON`,
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
      name: makeTypeName(contentType.name),
      fields: contentType.fields.reduce(
        (fields, field) => {
          const gqlType = fieldTypeToGraphQLType(field, {
            gqlTypes: extraTypes,
            typeName: contentType.name,
            fieldName: field.id,
            addBackReference: ({ referencingType, referencedType }) => {
              let backReferencesForType = backReferences[referencedType]
              if (!backReferencesForType) {
                backReferencesForType = backReferences[referencedType] = []
              }

              backReferencesForType.push(referencingType)
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
          createdAt: {
            type: `Date`,
            extensions: {
              dateformat: {},
            },
          },
          updatedAt: {
            type: `Date`,
            extensions: {
              dateformat: {},
            },
          },
        }
      ),
      interfaces: [`Node`],
      extensions: {
        infer: false,
      },
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
        _.uniq(typeBackReferences).forEach(referencedByType => {
          const gqlTypeName = makeTypeName(referencedByType)
          const fieldName = _.camelCase(referencedByType)
          typeConfig.fields[fieldName] = {
            // back references are always array
            type: `[${gqlTypeName}]`,
            extensions: {
              link: {
                from: `${fieldName}___NODE`,
              },
            },
          }
        })
      }

      return schema.buildObjectType(typeConfig)
    }),
  ])
}
