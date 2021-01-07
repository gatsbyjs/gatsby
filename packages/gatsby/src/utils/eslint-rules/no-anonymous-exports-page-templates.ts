import { Rule } from "eslint"
import { store } from "../../redux"
import { isPageTemplate } from "../eslint-rules-helpers"

const defs = {
  ArrowFunctionExpression: {
    message: `Anonymous arrow functions cause Fast Refresh to not preserve local component state.

Please add a name to your function, for example:

Before:
export default () => {};

After:
const Named = () => {};
export default Named;
`,
  },
  FunctionDeclaration: {
    message: `Anonymous function declarations cause Fast Refresh to not preserve local component state.

Please add a name to your function, for example:

Before:
export default function () {};

After:
export default function Named() {}
`,
    forbid: (node): boolean => !node.declaration.id,
  },
}

const noAnonymousExports: Rule.RuleModule = {
  meta: {
    type: `suggestion`,
  },
  create: context => {
    if (!isPageTemplate(store, context)) {
      return undefined
    }

    return {
      ExportDefaultDeclaration: (node): void => {
        const def = defs[node.declaration.type]

        if (def && (!def.forbid || def.forbid(node))) {
          context.report({ node, message: def.message })
        }
      },
    }
  },
}

module.exports = noAnonymousExports
