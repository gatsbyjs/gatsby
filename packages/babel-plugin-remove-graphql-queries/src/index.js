/*  eslint-disable new-cap */
const graphql = require(`graphql`)
const murmurhash = require("./murmur")
const nodePath = require(`path`)

function getGraphQLTag(path) {
  const tag = path.get(`tag`)
  if (!tag.isIdentifier({ name: `graphql` })) return {}

  const quasis = path.node.quasi.quasis

  if (quasis.length !== 1) {
    throw new Error(
      `BabelPluginRemoveGraphQL: String interpolations are not allowed in graphql ` +
        `fragments. Included fragments should be referenced ` +
        `as \`...MyModule_foo\`.`
    )
  }

  const text = quasis[0].value.raw
  const hash = murmurhash(text, `abc`)

  try {
    const ast = graphql.parse(text)

    if (ast.definitions.length === 0) {
      throw new Error(`BabelPluginRemoveGraphQL: Unexpected empty graphql tag.`)
    }
    return { ast, text, hash }
  } catch (err) {
    throw new Error(
      `BabelPluginRemoveGraphQLQueries: GraphQL syntax error in query:\n\n${text}\n\nmessage:\n\n${
        err.message
      }`
    )
  }
}

export default function({ types: t }) {
  return {
    visitor: {
      Program(path, state) {
        const nestedJSXVistor = {
          JSXIdentifier(path2) {
            if (
              [`production`, `test`].includes(process.env.NODE_ENV) &&
              path2.isJSXIdentifier({ name: `StaticQuery` })
            ) {
              const identifier = t.identifier("staticQueryData")
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
              path.unshiftContainer("body", importDeclaration)
            }
          },
        }

        path.traverse({
          TaggedTemplateExpression(path2, state) {
            const { ast, text, hash } = getGraphQLTag(path2)

            if (!ast) return null

            const queryHash = hash.toString()
            const query = text

            // Replace the query with the hash of the query.
            path2.replaceWith(t.StringLiteral(queryHash))

            path.traverse(nestedJSXVistor, { queryHash, query })

            return null
          },
        })
      },
    },
  }
}

export { getGraphQLTag }
