import * as graphql from "graphql"
import { parse, print } from "recast"
import { transformFromAstSync, parseSync } from "@babel/core"
import { cloneDeep } from "lodash"

export default function jsCodeShift(file) {
  if (
    file.path.includes(`node_modules`) ||
    file.path.includes(`.cache`) ||
    file.path.includes(`public`)
  ) {
    return file.source
  }
  const transformedSource = babelRecast(file.source, file.path)
  return transformedSource
}

export function babelRecast(code, filePath) {
  const transformedAst = parse(code, {
    parser: {
      parse: source => runParseSync(source, filePath),
    },
  })

  const changedTracker = { hasChanged: false, filename: filePath } // recast adds extra semicolons that mess with diffs and we want to avoid them

  const options = {
    cloneInputAst: false,
    code: false,
    ast: true,
    plugins: [[updateImport, changedTracker]],
  }

  const { ast } = transformFromAstSync(transformedAst, code, options)

  if (changedTracker.hasChanged) {
    return print(ast, { lineTerminator: `\n` }).code
  }
  return code
}

const CONTENT_TYPE_SELECTOR_REGEX = /^(allContentful|[cC]ontentful)([A-Z0-9].+)/
const CONTENT_TYPE_SELECTOR_BLACKLIST = [`Asset`, `Reference`, `Id`, `Tag`]
const SYS_FIELDS_TRANSFORMS = new Map([
  [`node_locale`, `locale`],
  [`contentful_id`, `id`],
  [`spaceId`, `spaceId`],
  [`createdAt`, `firstPublishedAt`],
  [`updatedAt`, `publishedAt`],
  [`revision`, `publishedVersion`],
])

const isContentTypeSelector = selector => {
  if (!selector) {
    return false
  }
  const res = selector.match(CONTENT_TYPE_SELECTOR_REGEX)
  return res && !CONTENT_TYPE_SELECTOR_BLACKLIST.includes(res[2])
}
const updateContentfulSelector = selector =>
  selector.replace(`ontentful`, `ontentfulContentType`)

const renderFilename = (path, state) =>
  `${state.opts.filename} (Line ${path.node.loc.start.line})`

const injectNewFields = (selections, newFields, fieldToReplace) => {
  if (!fieldToReplace) {
    return [...selections, ...newFields]
  }

  const fieldIndex = selections.findIndex(
    ({ name }) => name?.value === fieldToReplace
  )

  return [
    ...selections.slice(0, fieldIndex),
    ...newFields,
    ...selections.slice(fieldIndex + 1),
  ]
}

function getNestedMemberExpressionProperties(node, t) {
  const properties = []
  let current = node
  while (t.isMemberExpression(current)) {
    if (t.isIdentifier(current.property)) {
      properties.push(current.property.name)
    }
    current = current.object
  }
  return properties.reverse()
}

export function updateImport(babel) {
  const { types: t } = babel
  // Stack to keep track of nesting
  const stack = []
  // Flag to indicate whether we are inside createResolvers function
  let insideCreateResolvers = false
  return {
    visitor: {
      Identifier(path, state) {
        if (
          path.node.name === `createSchemaCustomization` &&
          state.opts.filename.match(/gatsby-node/)
        ) {
          console.log(
            `${renderFilename(
              path,
              state
            )}: Check your custom schema customizations if you patch or adjust schema related to Contentful. You probably can remove it now.`
          )
        }

        // Rename content type identifiers within createResolvers
        if (insideCreateResolvers) {
          const variableName = path.node.name

          // Check if the variable name matches the regex
          if (isContentTypeSelector(variableName)) {
            path.node.name = updateContentfulSelector(variableName)
            state.opts.hasChanged = true
          }
        }
      },
      ObjectPattern: {
        enter(path) {
          // Push this ObjectPattern onto the stack as we enter it
          stack.push(path.node.properties.map(prop => prop.key?.name))
        },
        exit(path, state) {
          // Check if the variable name matches the regex
          path.node.properties.forEach(prop => {
            if (isContentTypeSelector(prop.key?.name)) {
              prop.key.name = updateContentfulSelector(prop.key.name)
              state.opts.hasChanged = true
            }
          })

          // Rename contentType.__typename to contentType.name
          if (
            JSON.stringify([[`sys`], [`contentType`], [`__typename`]]) ===
            JSON.stringify(stack)
          ) {
            const typenameProp = path.node.properties.find(
              prop => prop.key.name === `__typename`
            )
            if (typenameProp) {
              typenameProp.key = t.identifier(`name`)
              typenameProp.value = t.identifier(`name`)
            }
            // Merge old sys fields into new structure
          } else {
            const transformedSysProperties = []
            path.node.properties.forEach(property => {
              if (SYS_FIELDS_TRANSFORMS.has(property.key?.name)) {
                const transformedProp = {
                  ...property,
                  key: {
                    ...property.key,
                    name: SYS_FIELDS_TRANSFORMS.get(property.key.name),
                  },
                }
                transformedSysProperties.push(transformedProp)
              }
            })
            if (transformedSysProperties.length) {
              const sysField = {
                type: `Property`,
                key: {
                  type: `Identifier`,
                  name: `sys`,
                },
                value: {
                  type: `ObjectPattern`,
                  properties: transformedSysProperties,
                },
              }
              path.node.properties = injectSysField(
                sysField,
                path.node.properties
              )

              state.opts.hasChanged = true
            }
          }

          // Pop this ObjectPattern off the stack as we exit it
          stack.pop()
        },
      },
      MemberExpression(path, state) {
        const nestedProperties = getNestedMemberExpressionProperties(
          path.node,
          t
        )

        const assetFlatStructure = new Map([
          [`url`, [`url`, `file`]],
          [`fileName`, [`fileName`, `file`]],
          [`contentType`, [`contentType`, `file`]],
          [`size`, [`size`, `details`, `file`]],
          [`width`, [`width`, `image`, `details`, `file`]],
          [`height`, [`height`, `image`, `details`, `file`]],
        ])

        for (const [newProp, oldProps] of assetFlatStructure) {
          if (
            nestedProperties.slice(-oldProps.length).join(`.`) ===
            oldProps.reverse().join(`.`)
          ) {
            // We found a matching nested property.
            // Rebuild the MemberExpression with the new structure.
            let baseExpression = path.node
            for (let i = 0; i < oldProps.length; i++) {
              baseExpression = baseExpression.object
            }
            const newExpression = t.memberExpression(
              baseExpression,
              t.identifier(newProp)
            )
            path.replaceWith(newExpression)
            state.opts.hasChanged = true
            return
          }
        }

        // Identify MemberExpression for `allContentfulPage.nodes.contentfulId`
        const propName = path.node.property.name
        const replacement = SYS_FIELDS_TRANSFORMS.get(propName)

        if (replacement) {
          // Rewrite the MemberExpression with the new property
          path.node.property = t.identifier(replacement)

          // Also rewrite the parent node to `.sys.` if it's not already
          if (path.node.object.property?.name !== `sys`) {
            path.node.object = t.memberExpression(
              path.node.object,
              t.identifier(`sys`)
            )
          }
          state.opts.hasChanged = true
        }

        // Rename sys.contentType.__typename to sys.contentType.name
        if (
          propName === `__typename` &&
          t.isMemberExpression(path.node.object) &&
          t.isIdentifier(path.node.object.property, { name: `contentType` }) &&
          t.isMemberExpression(path.node.object.object) &&
          t.isIdentifier(path.node.object.object.property, { name: `sys` })
        ) {
          path.node.property = t.identifier(`name`)
          return
        }

        if (isContentTypeSelector(path.node.property?.name)) {
          if (
            path.node.object?.name === `data` ||
            path.node.object.property?.name === `data`
          ) {
            path.node.property.name = updateContentfulSelector(
              path.node.property.name
            )
            state.opts.hasChanged = true
          } else {
            console.log(
              `${renderFilename(path, state)}: You might need to change "${
                path.node.property?.name
              }" to "${updateContentfulSelector(path.node.property.name)}"`
            )
          }
        }
      },
      ExportNamedDeclaration: {
        enter(path) {
          const declaration = path.node.declaration

          // For "export function createResolvers() {}"
          if (
            t.isFunctionDeclaration(declaration) &&
            t.isIdentifier(declaration.id, { name: `createResolvers` })
          ) {
            insideCreateResolvers = true
          }

          // For "export const createResolvers = function() {}" or "export const createResolvers = () => {}"
          else if (t.isVariableDeclaration(declaration)) {
            const declarators = declaration.declarations
            for (const declarator of declarators) {
              if (
                t.isIdentifier(declarator.id, { name: `createResolvers` }) &&
                (t.isFunctionExpression(declarator.init) ||
                  t.isArrowFunctionExpression(declarator.init))
              ) {
                insideCreateResolvers = true
              }
            }
          }
        },
        exit() {
          insideCreateResolvers = false
        },
      },
      TSInterfaceDeclaration(path, state) {
        path.node.body.body.forEach(property => {
          if (
            t.isTSPropertySignature(property) &&
            isContentTypeSelector(property.key.name)
          ) {
            property.key.name = updateContentfulSelector(property.key.name)
            state.opts.hasChanged = true
          }
        })
      },
      TaggedTemplateExpression({ node }, state) {
        if (node.tag.name !== `graphql`) {
          return
        }
        const query = node.quasi?.quasis?.[0]?.value?.raw
        if (query) {
          const { ast: transformedGraphQLQuery, hasChanged } =
            processGraphQLQuery(query, state)

          if (hasChanged) {
            node.quasi.quasis[0].value.raw = graphql.print(
              transformedGraphQLQuery
            )
            state.opts.hasChanged = true
          }
        }
      },
      CallExpression({ node }, state) {
        if (node.callee.name !== `graphql`) {
          return
        }
        const query = node.arguments?.[0].quasis?.[0]?.value?.raw

        if (query) {
          const { ast: transformedGraphQLQuery, hasChanged } =
            processGraphQLQuery(query, state)

          if (hasChanged) {
            node.arguments[0].quasis[0].value.raw = graphql.print(
              transformedGraphQLQuery
            )
            state.opts.hasChanged = true
          }
        }
      },
    },
  }
}

// Locate a subfield within a selection set or fields
function locateSubfield(node, fieldName) {
  const subFields = Array.isArray(node)
    ? node
    : node.selectionSet?.selections || node.value?.fields
  if (!subFields) {
    return null
  }
  return subFields.find(({ name }) => name?.value === fieldName)
}

// Replace first old field occurence with new sys field
const injectSysField = (sysField, selections) => {
  let sysInjected = false

  selections = selections
    .map(field => {
      const fieldName = field.name?.value || field.key?.name
      if (fieldName === `sys`) {
        const existingSysFields = (
          field.selectionSet?.selections || field.value.properties
        ).map(subField => {
          const kind = subField.kind || subField.type
          // handle contentType rename
          if (
            (kind === `ObjectProperty`
              ? subField.key.name
              : subField.name.value) === `contentType`
          ) {
            const subfields =
              kind === `ObjectProperty`
                ? subField.value.properties
                : subField.selectionSet.selections

            subfields.map(contentTypeField => {
              const fieldName =
                kind === `ObjectProperty`
                  ? contentTypeField.key.name
                  : contentTypeField.name.value

              if (fieldName === `__typename`) {
                if (kind === `ObjectProperty`) {
                  contentTypeField.key.name = `name`
                } else {
                  contentTypeField.name.value = `name`
                }
              }
            })
          }
          return subField
        })
        if (sysField?.type === `Property`) {
          sysField.value.properties.push(...existingSysFields)
        } else {
          sysField.selectionSet.selections.push(...existingSysFields)
        }
        return null
      }
      return field
    })
    .filter(Boolean)

  // Replace first old field occurence with new sys field
  return selections
    .map(field => {
      const fieldName = field.name?.value || field.key?.name
      if (SYS_FIELDS_TRANSFORMS.has(fieldName)) {
        if (!sysInjected) {
          // Inject for first occurence of a sys field
          sysInjected = true
          return sysField
        }
        // Remove all later fields
        return null
      }
      // Keep non-sys fields as they are
      return field
    })
    .filter(Boolean)
}

// Flatten the old deeply nested Contentful asset structure
const flattenAssetFields = node => {
  const flatAssetFields = []

  // Flatten asset file field
  const fileField = locateSubfield(node, `file`)

  if (fileField) {
    // Top level file fields
    const urlField = locateSubfield(fileField, `url`)
    if (urlField) {
      flatAssetFields.push(urlField)
    }
    const fileNameField = locateSubfield(fileField, `fileName`)
    if (fileNameField) {
      flatAssetFields.push(fileNameField)
    }
    const contentTypeField = locateSubfield(fileField, `contentType`)
    if (contentTypeField) {
      flatAssetFields.push(contentTypeField)
    }

    // details subfield with size and dimensions
    const detailsField = locateSubfield(fileField, `details`)
    if (detailsField) {
      const sizeField = locateSubfield(detailsField, `size`)
      if (sizeField) {
        flatAssetFields.push(sizeField)
      }
      // width & height from image subfield
      const imageField = locateSubfield(detailsField, `image`)
      if (imageField) {
        const widthField = locateSubfield(imageField, `width`)
        if (widthField) {
          flatAssetFields.push(widthField)
        }
        const heightField = locateSubfield(imageField, `height`)
        if (heightField) {
          flatAssetFields.push(heightField)
        }
      }
    }
  }
  return flatAssetFields
}

function createNewSysField(fields, fieldType = `Field`) {
  const kind = fieldType === `Argument` ? `Argument` : `Field`
  const subKindValue = fieldType === `Argument` ? `ObjectValue` : `SelectionSet`
  const subKindIndex = fieldType === `Argument` ? `value` : `selectionSet`
  const subKindIndex2 = fieldType === `Argument` ? `fields` : `selections`

  const contentfulSysFields = fields.filter(({ name }) =>
    SYS_FIELDS_TRANSFORMS.has(name?.value)
  )

  if (contentfulSysFields.length) {
    const transformedSysFields = cloneDeep(contentfulSysFields).map(field => {
      return {
        ...field,
        name: {
          ...field.name,
          value: SYS_FIELDS_TRANSFORMS.get(field.name.value),
        },
      }
    })

    const sysField = {
      kind: kind,
      name: {
        kind: `Name`,
        value: `sys`,
      },
      [subKindIndex]: {
        kind: subKindValue,
        [subKindIndex2]: transformedSysFields,
      },
    }
    return sysField
  }
  return null
}

function processGraphQLQuery(query) {
  try {
    let hasChanged = false // this is sort of a hack, but print changes formatting and we only want to use it when we have to
    const ast = graphql.parse(query)

    function processArguments(node) {
      // flatten Contentful Asset filters
      // Queries directly on allContentfulAssets
      const flatAssetFields = flattenAssetFields(node)
      if (flatAssetFields.length) {
        node.value.fields = injectNewFields(
          node.value.fields,
          flatAssetFields,
          `file`
        )
        hasChanged = true
      }
      // Subfields that might be asset fields
      node.value.fields.forEach((field, fieldIndex) => {
        const flatAssetFields = flattenAssetFields(field)
        if (flatAssetFields.length) {
          node.value.fields[fieldIndex].value.fields = injectNewFields(
            node.value.fields[fieldIndex].value.fields,
            flatAssetFields,
            `file`
          )
          hasChanged = true
        }
      })

      // Rename metadata -> contentfulMetadata
      node.value.fields.forEach(field => {
        if (field.name.value === `metadata`) {
          field.name.value = `contentfulMetadata`
          hasChanged = true
        }
      })

      const sysField = createNewSysField(node.value.fields, `Argument`)
      if (sysField) {
        node.value.fields = injectSysField(sysField, node.value.fields)
        hasChanged = true
      }
    }

    graphql.visit(ast, {
      Argument(node) {
        // Update filters and sort of collection endpoints
        if ([`filter`, `sort`].includes(node.name.value)) {
          if (node.value.kind === `ListValue`) {
            node.value.values.forEach(node => processArguments({ value: node }))
            return
          }
          processArguments(node)
        }
      },
      SelectionSet(node) {
        // Rename content type node selectors
        node.selections.forEach(field => {
          if (isContentTypeSelector(field.name?.value)) {
            field.name.value = updateContentfulSelector(field.name.value)
            hasChanged = true
          }
        })
      },
      InlineFragment(node) {
        if (isContentTypeSelector(node.typeCondition.name?.value)) {
          node.typeCondition.name.value = updateContentfulSelector(
            node.typeCondition.name.value
          )
          hasChanged = true

          const sysField = createNewSysField(node.selectionSet.selections)
          if (sysField) {
            node.selectionSet.selections = injectSysField(
              sysField,
              node.selectionSet.selections
            )
            hasChanged = true
          }
        }
      },
      FragmentDefinition(node) {
        if (isContentTypeSelector(node.typeCondition.name?.value)) {
          node.typeCondition.name.value = updateContentfulSelector(
            node.typeCondition.name.value
          )
          hasChanged = true

          const sysField = createNewSysField(node.selectionSet.selections)
          if (sysField) {
            node.selectionSet.selections = injectSysField(
              sysField,
              node.selectionSet.selections
            )
            hasChanged = true
          }
        }
      },
      Field(node) {
        // Flatten asset fields
        if (node.name.value === `contentfulAsset`) {
          const flatAssetFields = flattenAssetFields({
            value: { fields: node.arguments },
          })

          node.arguments = injectNewFields(
            node.arguments,
            flatAssetFields,
            `file`
          )

          hasChanged = true
        }

        // Rename metadata -> contentfulMetadata
        if (node.name.value === `metadata`) {
          const tagsField = locateSubfield(node, `tags`)
          if (tagsField) {
            node.name.value = `contentfulMetadata`
            hasChanged = true
          }
        }

        if (isContentTypeSelector(node.name.value)) {
          // Move sys properties into new sys property
          const nodesField =
            node.name.value.indexOf(`all`) === 0 &&
            locateSubfield(node, `nodes`)
          const rootNode = nodesField || node

          const sysField = createNewSysField(rootNode.selectionSet.selections)
          if (sysField) {
            rootNode.selectionSet.selections = injectSysField(
              sysField,
              rootNode.selectionSet.selections
            )
            hasChanged = true
          }

          const filterNode =
            node.name.value.indexOf(`all`) === 0 &&
            locateSubfield(node.arguments, `filter`)

          const filterFields = filterNode?.value?.fields || node.arguments

          if (filterFields && filterFields.length) {
            const sysField = createNewSysField(filterFields, `Argument`)
            // Inject the new sys at the first occurence of any old sys field
            if (sysField) {
              if (node.name.value.indexOf(`all`) === 0) {
                const filterFieldIndex = node.arguments.findIndex(
                  field => field.name?.value === `filter`
                )
                node.arguments[filterFieldIndex].value.fields = injectSysField(
                  sysField,
                  node.arguments[filterFieldIndex].value.fields
                )
              } else {
                node.arguments = injectSysField(sysField, filterFields)
              }
              hasChanged = true
            }
          }
        }

        // Flatten asset file field
        const flatAssetFields = flattenAssetFields(node)
        if (flatAssetFields.length) {
          node.selectionSet.selections = injectNewFields(
            node.selectionSet.selections,
            flatAssetFields,
            `file`
          )
          hasChanged = true
        }
      },
    })
    return { ast, hasChanged }
  } catch (err) {
    throw new Error(
      `GatsbySourceContentfulCodemod: GraphQL syntax error in query:\n\n${query}\n\nmessage:\n\n${err}`
    )
  }
}

function runParseSync(source, filePath) {
  let ast
  try {
    ast = parseSync(source, {
      plugins: [
        `@babel/plugin-syntax-jsx`,
        `@babel/plugin-proposal-class-properties`,
      ],
      overrides: [
        {
          test: [`**/*.ts`, `**/*.tsx`],
          plugins: [[`@babel/plugin-syntax-typescript`, { isTSX: true }]],
        },
      ],
      filename: filePath,
      parserOpts: {
        tokens: true, // recast uses this
      },
    })
  } catch (e) {
    console.error(e)
  }
  if (!ast) {
    console.log(
      `The codemod was unable to parse ${filePath}. If you're running against the '/src' directory and your project has a custom babel config, try running from the root of the project so the codemod can pick it up.`
    )
  }
  return ast
}
