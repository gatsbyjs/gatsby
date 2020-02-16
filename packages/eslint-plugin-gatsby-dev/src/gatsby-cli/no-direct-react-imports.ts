import {
  ESLintUtils,
  AST_NODE_TYPES,
} from "@typescript-eslint/experimental-utils"
import path from "path"

const adjust = (context, quotes): string => {
  const { replacementImportLocation } = context.options[0]

  const filePath = context.getFilename()

  const directoryPath = path.posix.dirname(filePath)

  let relativePath = path.posix.relative(
    directoryPath,
    replacementImportLocation
  )

  if (!relativePath.startsWith(`.`)) {
    // make sure we start with `./` or `../` etc
    relativePath = `./${relativePath}`
  }

  return `${quotes}${relativePath}${quotes}`
}

const createRule = ESLintUtils.RuleCreator(n => n)

export default createRule({
  name: `no-direct-react-imports`,
  meta: {
    type: `problem`,
    docs: {
      category: `Best Practices`,
      description: `Don't use that, use something else`,
      recommended: `error`,
    },
    messages: {
      directReactImport: `Don't use direct "react" imports. Import local "react" to make sure multiple versions of "react" are not used for single root.`,
    },
    schema: [
      {
        type: `object`,
        properties: {
          replacementImportLocation: {
            type: `string`,
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: `code`,
  },
  defaultOptions: [],
  create: context => {
    return {
      ImportDeclaration: function(node): void {
        if (node.source.value === `react`) {
          context.report({
            node,
            messageId: `directReactImport`,
            fix: fixer => fixer.replaceText(node.source, adjust(context, `"`)),
          })
        }
      },
      CallExpression: function(node): void {
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          node.callee.name === `require` &&
          node.arguments.length === 1
        ) {
          if (
            node.arguments[0].type === AST_NODE_TYPES.Literal &&
            node.arguments[0].value === `react`
          ) {
            const quotes = node.arguments[0].raw[0]
            context.report({
              node,
              messageId: `directReactImport`,
              fix: fixer =>
                fixer.replaceText(node.arguments[0], adjust(context, quotes)),
            })
          } else if (
            node.arguments[0].type === AST_NODE_TYPES.TemplateLiteral &&
            node.arguments[0].quasis[0].value.raw === `react`
          ) {
            context.report({
              node,
              messageId: `directReactImport`,
              fix: fixer =>
                fixer.replaceText(node.arguments[0], adjust(context, `\``)),
            })
          }
        }
      },
    }
  },
})
