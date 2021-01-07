import { Rule } from "eslint"
import { store } from "../../redux"
import { isPageTemplate } from "../eslint-rules-helpers"

const limitedExports: Rule.RuleModule = {
  meta: {
    type: `suggestion`,
  },
  create: context => {
    if (!isPageTemplate(store, context)) {
      return undefined
    }

    return {
      ExportNamedDeclaration: (node): void => {
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
