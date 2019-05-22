const parser = require(`@babel/parser`)
const traverse = require(`@babel/traverse`).default
const fs = require(`fs-extra`)
const util = require(`util`)
const globCB = require(`glob`)
const glob = util.promisify(globCB)

const buckets = [
  {
    test: /api-runner-node/,
    group: `NodeAPI`,
    hits: new Map(),
  },
  {
    test: /api-runner-browser/,
    group: `BrowserAPI`,
    hits: new Map(),
  },
  {
    test: /api-runner-ssr/,
    group: `SSRAPI`,
    hits: new Map(),
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

module.exports = async function findApiCalls(globRegex) {
  const files = await glob(globRegex, {
    ignore: [
      `**/commonjs/**`,
      `**/node_modules/**`,
      `**/__tests__/**`,
      `**/dist/**`,
      `**/__mocks__/**`,
      `babel.config.js`,
      `graphql.js`,
      `**/flow-typed/**`,
    ],
  })

  files.forEach(file => {
    const code = fs.readFileSync(file, { encoding: `utf-8` })

    try {
      const ast = parser.parse(code, PARSER_OPTIONS)
      traverse(ast, {
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

                references.forEach(ref => {
                  const call = ref.findParent(
                    path => path.type === `CallExpression`
                  )
                  if (
                    call &&
                    call.node.arguments &&
                    call.node.arguments[0].quasis
                  ) {
                    const apiHookName =
                      call.node.arguments[0].quasis[0].value.raw
                    if (!bucket.hits.has(apiHookName)) {
                      bucket.hits.set(apiHookName, [])
                    }

                    const instance = {
                      file,
                      location: call.node.loc,
                    }
                    bucket.hits.get(apiHookName).push(instance)
                  }
                })
              }
            }
          }
        },
      })
    } catch (e) {
      console.log(`parsing error`, {
        file,
        e,
      })
    }
  })

  return buckets
}
