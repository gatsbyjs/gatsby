import { Rule } from "eslint"
import { Node, ExportDefaultDeclaration } from "estree"
import { store } from "../../redux"
import { isPageTemplate } from "../eslint-rules-helpers"

const defs = {
  ArrowFunctionExpression: {
    messageId: `anonymousArrowFunction`,
  },
  FunctionDeclaration: {
    messageId: `anonymousFunctionDeclaration`,
    forbid: (node): boolean => !node.declaration.id,
  },
  ClassDeclaration: {
    messageId: `anonymousClass`,
    forbid: (node): boolean => !node.declaration.id,
  },
}

const noAnonymousExports: Rule.RuleModule = {
  meta: {
    type: `problem`,
    messages: {
      anonymousArrowFunction: `Anonymous arrow functions cause Fast Refresh to not preserve local component state.

       Please add a name to your function, for example:

       Before:
       export default () => {}

       After:
       const Named = () => {}
       export default Named;
`,
      anonymousFunctionDeclaration: `Anonymous function declarations cause Fast Refresh to not preserve local component state.

       Please add a name to your function, for example:

       Before:
       export default function () {}

       After:
       export default function Named() {}
`,
      anonymousClass: `Anonymous classes cause Fast Refresh to not preserve local component state.

       Please add a name to your class, for example:

       Before:
       export default class extends Component {}

       After:
       export default class Named extends Component {}
`,
    },
  },
  create: context => {
    if (!isPageTemplate(store, context)) {
      return {}
    }

    return {
      ExportDefaultDeclaration: (node: Node): void => {
        // @ts-ignore
        const type = node.declaration.type as ExportDefaultDeclaration["type"]
        const def = defs[type]

        if (def && (!def.forbid || def.forbid(node))) {
          context.report({
            node,
            messageId: def.messageId,
          })
        }
      },
    }
  },
}

module.exports = noAnonymousExports
