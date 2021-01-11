import { Rule } from "eslint"
import { Node, Identifier } from "estree"
import { store } from "../../redux"
import { isPageTemplate } from "../eslint-rules-helpers"

function isTemplateQuery(node: Node, varName: string | undefined): boolean {
  // Checks for:
  // const query = graphql``
  // export { query }
  if (
    node.type === `ExportNamedDeclaration` &&
    node.declaration === null &&
    varName
  ) {
    // For export { foobar } the declaration will be null and specifiers exists
    const nonQueryExports = node.specifiers.find(
      e => e.exported.name !== varName
    )
    return !nonQueryExports
  } else {
    // For export const query = 'foobar' the declaration exists with type 'VariableDeclaration'

    // Checks for:
    // export const query = graphql``
    return (
      node.type === `ExportNamedDeclaration` &&
      node.declaration?.type === `VariableDeclaration` &&
      node.declaration?.declarations[0]?.init?.type ===
        `TaggedTemplateExpression` &&
      (node.declaration?.declarations[0]?.init?.tag as Identifier)?.name ===
        `graphql`
    )
  }
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
      // eslint-disable-next-line consistent-return
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
      },
      // eslint-disable-next-line consistent-return
      ExportNamedDeclaration: (node): void => {
        if (isTemplateQuery(node, queryVariableName)) {
          return undefined
        }

        context.report({
          node,
          messageId: `limitedExportsPageTemplates`,
        })
      },
    }
  },
}

module.exports = limitedExports
