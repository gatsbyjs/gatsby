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

export function updateImport(babel) {
  const { types: t, template } = babel
  return {
    visitor: {
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

const RENAME_BLACKLIST = [`Asset`, `Reference`]
const SYS_FIELDS_TRANSFORMS = new Map([
  [`node_locale`, `locale`],
  [`contentful_id`, `id`],
  [`spaceId`, `spaceId`],
  [`createdAt`, `firstPublishedAt`],
  [`updatedAt`, `publishedAt`],
  [`revision`, `publishedVersion`],
  [`type`, `contentType`],
])

function locateSubfield(node, fieldName) {
  return (
    node.selectionSet &&
    node.selectionSet.selections.find(({ name }) => name?.value === fieldName)
  )
}

function processGraphQLQuery(query, state) {
  try {
    let hasChanged = false // this is sort of a hack, but print changes formatting and we only want to use it when we have to
    const ast = graphql.parse(query)

    graphql.visit(ast, {
      SelectionSet(node) {
        // Rename content type node selectors
        const contentfulSelector = node.selections.find(({ name }) => {
          const res = name?.value.match(
            /^(allContentful|contentful)([A-Z0-9].+)/
          )
          return res && !RENAME_BLACKLIST.includes(res[2])
        })

        if (contentfulSelector) {
          contentfulSelector.name.value = contentfulSelector.name.value.replace(
            `ontentful`,
            `ontentfulContentType`
          )
          hasChanged = true
          return
        }

        // Move sys attributes into real sys
        const contentfulSysFields = node.selections.filter(({ name }) =>
          SYS_FIELDS_TRANSFORMS.has(name?.value)
        )

        if (contentfulSysFields.length) {
          const transformedSysFields = cloneDeep(contentfulSysFields).map(
            field => {
              const transformedField = {
                ...field,
                name: {
                  ...field.name,
                  value: SYS_FIELDS_TRANSFORMS.get(field.name.value),
                },
              }

              if (transformedField.name.value === `contentType`) {
                transformedField.selectionSet = {
                  kind: `SelectionSet`,
                  selections: [
                    {
                      kind: `Field`,
                      name: { kind: `Name`, value: `name` },
                    },
                  ],
                }
              }

              return transformedField
            }
          )

          // Replace first old field occurence with new sys field
          let sysInjected = false
          const sysField = {
            kind: `Field`,
            name: {
              kind: `Name`,
              value: `sys`,
            },
            selectionSet: {
              kind: `SelectionSet`,
              selections: transformedSysFields,
            },
          }

          node.selections = node.selections
            .map(field => {
              if (SYS_FIELDS_TRANSFORMS.has(field.name?.value)) {
                if (!sysInjected) {
                  // inject for first occurence
                  sysInjected = true
                  return sysField
                }
                // remove all the others
                return null
              }
              // keep non-sys fields as they are
              return field
            })
            .filter(Boolean)

          hasChanged = true
          return
        }

        // @todo transform filters

        // @todo transform sorting

        // @todo text field: field.field -> field.raw

        // @todo rich text
      },
      Field(node, index) {
        // console.log(`entering field: `, { node, index })

        // Flatten asset file field
        const fileField = locateSubfield(node, `file`)
        if (fileField) {
          // Top level file fields
          const newFields = []
          if (locateSubfield(fileField, `url`)) {
            newFields.push({
              kind: `Field`,
              name: { kind: `Name`, value: `url` },
            })
          }
          if (locateSubfield(fileField, `fileName`)) {
            newFields.push({
              kind: `Field`,
              name: { kind: `Name`, value: `fileName` },
            })
          }
          if (locateSubfield(fileField, `contentType`)) {
            newFields.push({
              kind: `Field`,
              name: { kind: `Name`, value: `contentType` },
            })
          }

          // details subfield with size and dimensions
          const detailsField = locateSubfield(fileField, `details`)
          if (detailsField) {
            if (locateSubfield(detailsField, `size`)) {
              newFields.push({
                kind: `Field`,
                name: { kind: `Name`, value: `size` },
              })
            }
            // width & height from image subfield
            const imageField = locateSubfield(detailsField, `image`)
            if (imageField) {
              if (locateSubfield(imageField, `width`)) {
                newFields.push({
                  kind: `Field`,
                  name: { kind: `Name`, value: `width` },
                })
              }
              if (locateSubfield(imageField, `height`)) {
                newFields.push({
                  kind: `Field`,
                  name: { kind: `Name`, value: `height` },
                })
              }
            }
          }

          // Replace old file field with new fields
          const fileFieldIndex = node.selectionSet.selections.findIndex(
            ({ name }) => name?.value === `file`
          )
          node.selectionSet.selections = [
            ...node.selectionSet.selections.slice(0, fileFieldIndex),
            ...newFields,
            ...node.selectionSet.selections.slice(fileFieldIndex + 1),
          ]

          hasChanged = true
        }
      },
    })
    return { ast, hasChanged }
  } catch (err) {
    throw new Error(
      `GatsbyImageCodemod: GraphQL syntax error in query:\n\n${query}\n\nmessage:\n\n${err}`
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
