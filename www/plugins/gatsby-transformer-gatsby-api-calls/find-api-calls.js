const parser = require(`@babel/parser`)
const traverse = require(`@babel/traverse`).default

const buckets = [
  {
    test: /api-runner-node/,
    group: `NodeAPI`,
  },
  {
    test: /api-runner-browser/,
    group: `BrowserAPI`,
  },
  {
    test: /api-runner-ssr/,
    group: `SSRAPI`,
  },
]

const PARSER_OPTIONS = {
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  allowSuperOutsideMethod: true,
  sourceType: `unambigious`,
  sourceFilename: true,
  plugins: [
    `jsx`,
    `flow`,
    `doExpressions`,
    `objectRestSpread`,
    [
      `decorators`,
      {
        decoratorsBeforeExport: true,
      },
    ],
    `classProperties`,
    `classPrivateProperties`,
    `classPrivateMethods`,
    `exportDefaultFrom`,
    `exportNamespaceFrom`,
    `asyncGenerators`,
    `functionBind`,
    `functionSent`,
    `dynamicImport`,
    `numericSeparator`,
    `optionalChaining`,
    `importMeta`,
    `bigInt`,
    `optionalCatchBinding`,
    `throwExpressions`,
    [
      `pipelineOperator`,
      {
        proposal: `minimal`,
      },
    ],
    `nullishCoalescingOperator`,
  ],
}

module.exports = async function findApiCalls({ node, loadNodeContent }) {
  const calls = []

  const code = await loadNodeContent(node)

  try {
    const ast = parser.parse(code, PARSER_OPTIONS)

    // Shared code for both commonjs and ESM imports
    const handleReferences = (bucket, references) => {
      references.forEach(ref => {
        const call = ref.findParent(path => path.type === `CallExpression`)
        if (call && call.node.arguments && call.node.arguments[0].quasis) {
          const apiHookName = call.node.arguments[0].quasis[0].value.raw

          calls.push({
            file: node.relativePath,
            // `loc` is not plain object so using dirty trick
            // to turn it into one
            codeLocation: JSON.parse(JSON.stringify(call.node.loc)),
            name: apiHookName,
            group: bucket.group,
          })
        }
      })
    }

    traverse(ast, {
      ImportDeclaration(path) {
        const importPath = path.node.source.value
        let bucket
        if ((bucket = buckets.find(a => a.test.test(importPath)))) {
          path.node.specifiers.forEach(specifier => {
            // we are special casing named imports for browser APIs

            if (
              specifier.type === `ImportDefaultSpecifier` ||
              [`apiRunnerAsync`, `apiRunner`].includes(specifier.imported.name)
            ) {
              const apiRunnerFunctionName = specifier.local.name
              const references =
                path.scope.bindings[apiRunnerFunctionName].referencePaths

              handleReferences(bucket, references)
            }
          })
        }
      },
      CallExpression(path) {
        if (path.node.callee && path.node.callee.name === `require`) {
          const arg = path.node.arguments[0]
          let bucket
          if (
            arg.quasis &&
            (bucket = buckets.find(a => a.test.test(arg.quasis[0].value.raw)))
          ) {
            const test = path.findParent(
              path => path.type === `VariableDeclarator`
            )
            if (test) {
              const apiRunnerName = test.node.id.name
              const references =
                test.scope.bindings[apiRunnerName].referencePaths

              handleReferences(bucket, references)
            }
          }
        }
      },
    })
  } catch (e) {
    console.log(`parsing error`, {
      file: node.relativePath,
      e,
    })
  }

  return calls
}
