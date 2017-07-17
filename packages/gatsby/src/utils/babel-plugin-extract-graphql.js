/*  eslint-disable new-cap */
const graphql = require(`graphql`)

function getGraphQLTag(path) {
  const tag = path.get(`tag`)
  if (!tag.isIdentifier({ name: `graphql` })) return null

  const quasis = path.node.quasi.quasis

  if (quasis.length !== 1) {
    throw new Error(
      `BabelPluginGraphQL: Substitutions are not allowed in graphql. ` +
        `fragments. Included fragments should be referenced ` +
        `as \`...MyModule_foo\`.`
    )
  }

  const text = quasis[0].value.raw

  try {
    const ast = graphql.parse(text)

    if (ast.definitions.length === 0) {
      throw new Error(`BabelPluginGraphQL: Unexpected empty graphql tag.`)
    }
    return ast
  } catch (err) {
    throw new Error(
      `BabelPluginGraphQL: GraphQL syntax error in query:\n\n${text}\n\nmessage:\n\n${err.message}`
    )
  }
}

function BabelPluginGraphQL({ types: t }) {
  return {
    visitor: {
      TaggedTemplateExpression(path, state) {
        const ast = getGraphQLTag(path)

        if (!ast) return null

        return path.replaceWith(
          t.StringLiteral(`** extracted graphql fragment **`)
        )
      },
    },
  }
}

BabelPluginGraphQL.getGraphQLTag = getGraphQLTag
module.exports = BabelPluginGraphQL
