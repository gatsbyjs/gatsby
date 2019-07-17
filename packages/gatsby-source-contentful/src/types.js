const _ = require(`lodash`)
const util = require(`util`)
const chalk = require(`chalk`)

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

      if (
        !contentTypes &&
        context.configReferenceTypes &&
        context.configReferenceTypes[context.typeName] &&
        context.configReferenceTypes[context.typeName][context.fieldName]
      ) {
        // see if there is information from Contentful API, but there is in plugin options
        let possibleTypes =
          context.configReferenceTypes[context.typeName][context.fieldName]

        // convert possible types to array if it's single string
        if (!Array.isArray(possibleTypes)) {
          possibleTypes = [possibleTypes]
        }

        // map type names to Contentful type objects
        contentTypes = context.contentTypeItems.filter(contentType =>
          possibleTypes.includes(contentType.name)
        )
      }

      let hasLinkedTypesInformation = true
      if (!contentTypes) {
        hasLinkedTypesInformation = false
        contentTypes = context.contentTypeItems
      }

      // add backreferences if we have information about types
      if (hasLinkedTypesInformation) {
        contentTypes.forEach(contentType => {
          context.addBackReference({
            referencingType: context.typeName,
            referencedType: contentType.name,
            referencingFieldName: context.fieldName,
          })
        })
      } else {
        context.addMissingTypesInReferenceWarning({
          typeName: context.typeName,
          fieldName: context.fieldName,
          isArray: !!context.isArray,
        })
      }

      if (contentTypes.length > 0) {
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

const MissingReferenceFieldTypeSingle = {
  [util.inspect.custom]: () =>
    chalk.yellow(`<Missing type information for single reference>`),
}

const MissingReferenceFieldTypeArray = {
  [util.inspect.custom]: () =>
    chalk.yellow(`<Missing type information for array reference>`),
}

/**
 * @param {object} Context
 * @param {Array<import("contentful").ContentType>} Context.contentTypeItems
 * @param {any} Context.actions
 * @param {any} Context.schema
 */
exports.createTypes = ({
  actions,
  schema,
  contentTypeItems,
  reporter,
  configReferenceTypes,
}) => {
  let missingFieldInformationMap = null
  let missingFieldInformationHaveSingleReference = false
  const addMissingTypesInReferenceWarning = ({
    typeName,
    fieldName,
    isArray,
  }) => {
    // first check if user opted out of displaying warning
    // for this type or type.field
    if (
      _.get(configReferenceTypes, [typeName]) === false ||
      _.get(configReferenceTypes, [typeName, fieldName]) === false
    ) {
      return
    }

    if (!missingFieldInformationMap) {
      missingFieldInformationMap = {}
    }

    if (!missingFieldInformationMap[typeName]) {
      missingFieldInformationMap[typeName] = {
        // merge partial user configuration if it already exists
        ..._.omitBy(configReferenceTypes[typeName], value => value === false),
      }
    }

    missingFieldInformationMap[typeName][fieldName] = isArray
      ? MissingReferenceFieldTypeArray
      : MissingReferenceFieldTypeSingle

    if (!isArray) {
      missingFieldInformationHaveSingleReference = true
    }
  }

  const context = {
    contentTypeItems,
    schema,
    configReferenceTypes,
    addMissingTypesInReferenceWarning,
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
            addBackReference: ({
              referencingType,
              referencedType,
              referencingFieldName,
            }) => {
              let backReferencesForType = backReferences[referencedType]
              if (!backReferencesForType) {
                backReferencesForType = backReferences[referencedType] = []
              }

              backReferencesForType.push({
                referencingType,
                referencingFieldName,
              })
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
        typeBackReferences.forEach(
          ({ referencingType, referencingFieldName }) => {
            const gqlTypeName = makeTypeName(referencingType)
            const fieldName = _.camelCase(
              `${referencingFieldName} ${referencingType}`
            )

            if (typeConfig.fields[fieldName]) {
              reporter.warn(
                `Can't create "${fieldName}" back reference in "${makeTypeName(
                  typeName
                )}" type because field already exists`
              )
              return
            }

            typeConfig.fields[fieldName] = {
              // back references are always array
              type: `[${gqlTypeName}]`,
              extensions: {
                link: {
                  from: `${fieldName}___NODE`,
                },
              },
            }
          }
        )
      }

      return schema.buildObjectType(typeConfig)
    }),
  ])

  if (missingFieldInformationMap) {
    let warningBlocks = [
      `gatsby-source-contentful couldn't determine types for some reference fields. Reverse references will not be created for them.`,
      `You can configure possible types that reference field can link to in Your Contentful space by editing field definition and adding validation that restricts possible types. See https://www.contentful.com/r/knowledgebase/validations/ for details (particularly for Type validation).`,
      `Alternatively, you can configure possible types in gatsby-source-contentful plugin options by copying object below and specifying types for reference fields.`,
      `referenceTypes: ${util.inspect(missingFieldInformationMap, {
        colors: process.env.FORCE_COLOR != 0,
      })}`,
      `Possible values are:\n - "${chalk.yellow(
        `false`
      )}" (to disable creating reverse reference for given field and this warning)\n - Name of type [string]\n - Array of types [Array<string>]`,
      `Available types are:\n${contentTypeItems
        .map(contentType => ` - ${chalk.yellow(`"${contentType.name}"`)}`)
        .join(`\n`)}`,
      missingFieldInformationHaveSingleReference &&
        `Note: Because of limitation in Contentful content API, gatsby-source-contentful is unable to pull information about possible type for single reference fields. `,
    ].filter(Boolean)

    reporter.warn(warningBlocks.join(`\n\n`))
  }
}
