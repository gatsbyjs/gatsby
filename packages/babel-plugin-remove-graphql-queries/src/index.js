/*  eslint-disable new-cap */
const graphql = require(`gatsby/graphql`)
const { murmurhash } = require(`./murmur`)
const nodePath = require(`path`)

class StringInterpolationNotAllowedError extends Error {
  constructor(interpolationStart, interpolationEnd) {
    super(
      `BabelPluginRemoveGraphQLQueries: String interpolations are not allowed in graphql ` +
        `fragments. Included fragments should be referenced ` +
        `as \`...MyModule_foo\`.`
    )
    this.interpolationStart = JSON.parse(JSON.stringify(interpolationStart))
    this.interpolationEnd = JSON.parse(JSON.stringify(interpolationEnd))
    Error.captureStackTrace(this, StringInterpolationNotAllowedError)
  }
}

class EmptyGraphQLTagError extends Error {
  constructor(locationOfGraphqlString) {
    super(`BabelPluginRemoveGraphQLQueries: Unexpected empty graphql tag.`)
    this.templateLoc = locationOfGraphqlString
    Error.captureStackTrace(this, EmptyGraphQLTagError)
  }
}

class GraphQLSyntaxError extends Error {
  constructor(documentText, originalError, locationOfGraphqlString) {
    super(
      `BabelPluginRemoveGraphQLQueries: GraphQL syntax error in query:\n\n${documentText}\n\nmessage:\n\n${originalError}`
    )
    this.documentText = documentText
    this.originalError = originalError
    this.templateLoc = locationOfGraphqlString
    Error.captureStackTrace(this, GraphQLSyntaxError)
  }
}

const isGlobalIdentifier = tag =>
  tag.isIdentifier({ name: `graphql` }) && tag.scope.hasGlobal(`graphql`)

export function followVariableDeclarations(binding) {
  const node = binding.path?.node
  if (
    node?.type === `VariableDeclarator` &&
    node?.id.type === `Identifier` &&
    node?.init?.type === `Identifier`
  ) {
    return followVariableDeclarations(
      binding.path.scope.getBinding(node.init.name)
    )
  }
  return binding
}

function getTagImport(tag) {
  const name = tag.node.name
  const binding = tag.scope.getBinding(name)

  if (!binding) return null

  const path = binding.path
  const parent = path.parentPath

  if (
    binding.kind === `module` &&
    parent.isImportDeclaration() &&
    parent.node.source.value === `gatsby`
  )
    return path

  if (
    path.isVariableDeclarator() &&
    path.get(`init`).isCallExpression() &&
    path.get(`init.callee`).isIdentifier({ name: `require` }) &&
    path.get(`init`).node.arguments[0].value === `gatsby`
  ) {
    const id = path.get(`id`)
    if (id.isObjectPattern()) {
      return id
        .get(`properties`)
        .find(path => path.get(`value`).node.name === name)
    }
    return id
  }
  return null
}

function isGraphqlTag(tag) {
  const isExpression = tag.isMemberExpression()
  const identifier = isExpression ? tag.get(`object`) : tag

  const importPath = getTagImport(identifier)
  if (!importPath) return isGlobalIdentifier(tag)

  if (
    isExpression &&
    (importPath.isImportNamespaceSpecifier() || importPath.isIdentifier())
  ) {
    return tag.get(`property`).node.name === `graphql`
  }

  if (importPath.isImportSpecifier())
    return importPath.node.imported.name === `graphql`

  if (importPath.isObjectProperty())
    return importPath.get(`key`).node.name === `graphql`

  return false
}

function removeImport(tag) {
  const isExpression = tag.isMemberExpression()
  const identifier = isExpression ? tag.get(`object`) : tag
  const importPath = getTagImport(identifier)

  const removeVariableDeclaration = statement => {
    let declaration = statement.findParent(p => p.isVariableDeclaration())
    if (declaration) {
      declaration.remove()
    }
  }

  if (!importPath) return

  const parent = importPath.parentPath

  if (importPath.isImportSpecifier()) {
    if (parent.node.specifiers.length === 1) parent.remove()
    else importPath.remove()
  }
  if (importPath.isObjectProperty()) {
    if (parent.node.properties.length === 1) {
      removeVariableDeclaration(importPath)
    } else importPath.remove()
  }
  if (importPath.isIdentifier()) {
    removeVariableDeclaration(importPath)
  }
}

function getGraphQLTag(path) {
  const tag = path.get(`tag`)
  const isGlobal = isGlobalIdentifier(tag)

  if (!isGlobal && !isGraphqlTag(tag)) return {}

  const quasis = path.node.quasi.quasis

  if (quasis.length !== 1) {
    throw new StringInterpolationNotAllowedError(
      quasis[0].loc.end,
      quasis[1].loc.start
    )
  }

  const text = quasis[0].value.raw
  const normalizedText = graphql.stripIgnoredCharacters(text)

  const hash = murmurhash(normalizedText, `abc`)

  try {
    const ast = graphql.parse(text)

    if (ast.definitions.length === 0) {
      throw new EmptyGraphQLTagError(quasis[0].loc)
    }
    return { ast, text: normalizedText, hash, isGlobal }
  } catch (err) {
    throw new GraphQLSyntaxError(text, err, quasis[0].loc)
  }
}

function isUseStaticQuery(path) {
  return (
    (path.node.callee.type === `MemberExpression` &&
      path.node.callee.property.name === `useStaticQuery` &&
      path.get(`callee`).get(`object`).referencesImport(`gatsby`)) ||
    (path.node.callee.name === `useStaticQuery` &&
      path.get(`callee`).referencesImport(`gatsby`))
  )
}

export default function ({ types: t }) {
  return {
    visitor: {
      Program(path, state) {
        const nestedJSXVistor = {
          JSXIdentifier(path2) {
            if (
              (process.env.NODE_ENV === `test` ||
                state.opts.stage === `build-html`) &&
              path2.isJSXIdentifier({ name: `StaticQuery` }) &&
              path2.referencesImport(`gatsby`) &&
              path2.parent.type !== `JSXClosingElement`
            ) {
              const identifier = t.identifier(`staticQueryData`)
              const filename = state.file.opts.filename
              const shortResultPath = `public/static/d/${this.queryHash}.json`
              const resultPath = nodePath.join(process.cwd(), shortResultPath)
              // Add query
              path2.parent.attributes.push(
                t.jSXAttribute(
                  t.jSXIdentifier(`data`),
                  t.jSXExpressionContainer(identifier)
                )
              )
              // Add import
              const importDefaultSpecifier = t.importDefaultSpecifier(
                identifier
              )
              const importDeclaration = t.importDeclaration(
                [importDefaultSpecifier],
                t.stringLiteral(
                  filename
                    ? nodePath.relative(
                        nodePath.parse(filename).dir,
                        resultPath
                      )
                    : shortResultPath
                )
              )
              path.unshiftContainer(`body`, importDeclaration)
            }
          },
        }

        const nestedHookVisitor = {
          CallExpression(path2) {
            if (
              (process.env.NODE_ENV === `test` ||
                state.opts.stage === `build-html`) &&
              isUseStaticQuery(path2)
            ) {
              const identifier = t.identifier(`staticQueryData`)
              const filename = state.file.opts.filename
              const shortResultPath = `public/static/d/${this.queryHash}.json`
              const resultPath = nodePath.join(process.cwd(), shortResultPath)

              // only remove the import if its like:
              // import { useStaticQuery } from 'gatsby'
              // but not if its like:
              // import * as Gatsby from 'gatsby'
              // because we know we can remove the useStaticQuery import,
              // but we don't know if other 'gatsby' exports are used, so we
              // cannot remove all 'gatsby' imports.
              if (path2.node.callee.type !== `MemberExpression`) {
                // Remove imports to useStaticQuery
                const importPath = path2.scope.getBinding(`useStaticQuery`).path
                const parent = importPath.parentPath
                if (importPath.isImportSpecifier())
                  if (parent.node.specifiers.length === 1) parent.remove()
                  else importPath.remove()
              }

              // Add query
              path2.replaceWith(
                t.memberExpression(identifier, t.identifier(`data`))
              )

              // Add import
              const importDefaultSpecifier = t.importDefaultSpecifier(
                identifier
              )
              const importDeclaration = t.importDeclaration(
                [importDefaultSpecifier],
                t.stringLiteral(
                  filename
                    ? nodePath.relative(
                        nodePath.parse(filename).dir,
                        resultPath
                      )
                    : shortResultPath
                )
              )
              path.unshiftContainer(`body`, importDeclaration)
            }
          },
        }

        const tagsToRemoveImportsFrom = new Set()

        const setImportForStaticQuery = templatePath => {
          const { ast, text, hash, isGlobal } = getGraphQLTag(templatePath)

          if (!ast) return null

          const queryHash = hash.toString()
          const query = text

          const tag = templatePath.get(`tag`)
          if (!isGlobal) {
            // Enqueue import removal. If we would remove it here, subsequent named exports
            // wouldn't be handled properly
            tagsToRemoveImportsFrom.add(tag)
          }

          // Replace the query with the hash of the query.
          templatePath.replaceWith(t.StringLiteral(queryHash))

          // traverse upwards until we find top-level JSXOpeningElement or Program
          // this handles exported queries and variable queries
          let parent = templatePath
          while (
            parent &&
            ![`Program`, `JSXOpeningElement`].includes(parent.node.type)
          ) {
            parent = parent.parentPath
          }

          // modify StaticQuery elements and import data only if query is inside StaticQuery
          parent.traverse(nestedJSXVistor, {
            queryHash,
            query,
          })

          // modify useStaticQuery elements and import data only if query is inside useStaticQuery
          parent.traverse(nestedHookVisitor, {
            queryHash,
            query,
            templatePath,
          })

          return null
        }

        // Traverse for <StaticQuery/> instances
        path.traverse({
          JSXElement(jsxElementPath) {
            if (
              jsxElementPath.node.openingElement.name.name !== `StaticQuery`
            ) {
              return
            }

            jsxElementPath.traverse({
              JSXAttribute(jsxPath) {
                if (jsxPath.node.name.name !== `query`) {
                  return
                }
                jsxPath.traverse({
                  TaggedTemplateExpression(templatePath, state) {
                    setImportForStaticQuery(templatePath)
                  },
                  Identifier(identifierPath) {
                    if (identifierPath.node.name !== `graphql`) {
                      const varName = identifierPath.node.name
                      path.traverse({
                        VariableDeclarator(varPath) {
                          if (
                            varPath.node.id.name === varName &&
                            varPath.node.init.type ===
                              `TaggedTemplateExpression`
                          ) {
                            varPath.traverse({
                              TaggedTemplateExpression(templatePath) {
                                setImportForStaticQuery(templatePath)
                              },
                            })
                          }
                        },
                      })
                    }
                  },
                })
              },
            })
          },
        })

        // Traverse once again for useStaticQuery instances
        path.traverse({
          CallExpression(hookPath) {
            if (!isUseStaticQuery(hookPath)) return

            function TaggedTemplateExpression(templatePath) {
              setImportForStaticQuery(templatePath)
            }

            // See if the query is a variable that's being passed in
            // and if it is, go find it.
            if (
              hookPath.node.arguments.length === 1 &&
              hookPath.node.arguments[0].type === `Identifier`
            ) {
              const [{ name: varName }] = hookPath.node.arguments

              let binding = hookPath.scope.getBinding(varName)

              if (binding) {
                followVariableDeclarations(binding).path.traverse({
                  TaggedTemplateExpression,
                })
              }
            }

            hookPath.traverse({
              // Assume the query is inline in the component and extract that.
              TaggedTemplateExpression,
            })
          },
        })

        // Run it again to remove non-staticquery versions
        path.traverse({
          TaggedTemplateExpression(path2, state) {
            const { ast, hash, isGlobal } = getGraphQLTag(path2)

            if (!ast) return null

            const queryHash = hash.toString()

            const tag = path2.get(`tag`)
            if (!isGlobal) {
              // Enqueue import removal. If we would remove it here, subsequent named exports
              // wouldn't be handled properly
              tagsToRemoveImportsFrom.add(tag)
            }

            // Replace the query with the hash of the query.
            path2.replaceWith(t.StringLiteral(queryHash))
            return null
          },
        })

        tagsToRemoveImportsFrom.forEach(removeImport)
      },
    },
  }
}

export {
  getGraphQLTag,
  StringInterpolationNotAllowedError,
  EmptyGraphQLTagError,
  GraphQLSyntaxError,
  murmurhash,
}
