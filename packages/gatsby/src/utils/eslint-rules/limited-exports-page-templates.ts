import { Rule } from "eslint"
import { Node, Identifier } from "estree"
import { store } from "../../redux"
import { isPageTemplate } from "../eslint-rules-helpers"

function hasOneValidNamedDeclaration(
  node: Node,
  varName: string | undefined
): boolean {
  // Checks for:
  // const query = graphql``
  // export { query }
  if (
    node.type === `ExportNamedDeclaration` &&
    node.declaration === null &&
    varName
  ) {
    // For export { foobar, query } the declaration will be null and specifiers exists
    // For { foobar, query } it'll return true, for { query } it'll return false
    const nonQueryExports = node.specifiers.some(
      e => e.exported.name !== varName
    )
    return !nonQueryExports
  }

  return false
}

function isTemplateQuery(node: Node): boolean {
  // For export const query = 'foobar' the declaration exists with type 'VariableDeclaration'

  // Checks for:
  // export const query = graphql``
  // This case only has one item in the declarations array
  // For export const hello = 10, world = 'foo'
  // The array will have two items. So use every() to check if only one item exists
  // With TaggedTemplateExpression and "graphql" name

  return (
    node.type === `ExportNamedDeclaration` &&
    node.declaration?.type === `VariableDeclaration` &&
    node.declaration?.declarations.every(
      el =>
        el?.init?.type === `TaggedTemplateExpression` &&
        (el.init.tag as Identifier)?.name === `graphql`
    )
  )
}

const limitedExports: Rule.RuleModule = {
  meta: {
    type: `problem`,
    messages: {
      limitedExportsPageTemplates: `In page templates only a default export of a valid React component and the named export of a page query is allowed.
        All other named exports will cause Fast Refresh to not preserve local component state and do a full refresh.

        Please move your other named exports to another file.
`,
    },
  },
  create: context => {
    if (!isPageTemplate(store, context)) {
      return {}
    }

    let queryVariableName: string | undefined = ``

    return {
      TaggedTemplateExpression: (node): void => {
        if (
          node.type === `TaggedTemplateExpression` &&
          // @ts-ignore
          node.tag?.name === `graphql`
        ) {
          if (queryVariableName) {
            return undefined
          }
          // @ts-ignore
          queryVariableName = node.parent?.id?.name
        }

        return undefined
      },
      ExportNamedDeclaration: (node): void => {
        if (hasOneValidNamedDeclaration(node, queryVariableName)) {
          return undefined
        }

        if (isTemplateQuery(node)) {
          return undefined
        }

        context.report({
          node,
          messageId: `limitedExportsPageTemplates`,
        })

        return undefined
      },
    }
  },
}

module.exports = limitedExports
