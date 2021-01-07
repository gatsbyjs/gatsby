import { Rule } from "eslint"
import { Node, Identifier } from "estree"
import { store } from "../../redux"
import { isPageTemplate } from "../eslint-rules-helpers"

function isTemplateQuery(node: Node): boolean {
  return (
    node?.type === `ExportNamedDeclaration` &&
    node?.declaration?.type === `VariableDeclaration` &&
    node?.declaration?.declarations[0]?.init?.type ===
      `TaggedTemplateExpression` &&
    (node?.declaration?.declarations[0]?.init?.tag as Identifier)?.name ===
      `graphql`
  )
}

const limitedExports: Rule.RuleModule = {
  meta: {
    type: `problem`,
  },
  create: context => {
    if (!isPageTemplate(store, context)) {
      return {}
    }

    return {
      // eslint-disable-next-line consistent-return
      ExportNamedDeclaration: (node): void => {
        if (isTemplateQuery(node)) {
          return undefined
        }

        context.report({
          node,
          message: `In page templates only a default export of a valid React component and the named export of a page query is allowed.
All other named exports will cause Fast Refresh to not preserve local component state and do a full refresh.

Please move your other named exports to another file.`,
        })
      },
    }
  },
}

module.exports = limitedExports
