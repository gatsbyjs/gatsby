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
      description: `Don't use direct "react" imports. It can lead to multiple "react" versions being used in single root causing CLI to crash with very confusing error.`,
      recommended: `error`,
    },
    messages: {
      directReactImport: `Don't use direct "react" imports. Use {{ localImport }} to make sure multiple versions of "react" are not used for single root.`,
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
          const localImport = adjust(context, `"`)
          context.report({
            node,
            messageId: `directReactImport`,
            data: {
              localImport,
            },
            fix: fixer => fixer.replaceText(node.source, localImport),
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
            const localImport = adjust(context, quotes)
            context.report({
              node,
              messageId: `directReactImport`,
              data: {
                localImport,
              },
              fix: fixer => fixer.replaceText(node.arguments[0], localImport),
            })
          } else if (
            node.arguments[0].type === AST_NODE_TYPES.TemplateLiteral &&
            node.arguments[0].quasis[0].value.raw === `react`
          ) {
            const localImport = adjust(context, `\``)
            context.report({
              node,
              messageId: `directReactImport`,
              data: {
                localImport,
              },
              fix: fixer => fixer.replaceText(node.arguments[0], localImport),
            })
          }
        }
      },
    }
  },
})
