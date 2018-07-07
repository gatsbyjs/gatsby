const resolve = require(`./resolve`)

export function tsPresetsFromJsPresets(jsPresets) {
  const copy = (jsPresets && jsPresets.slice(0)) || []
  if (copy.length > 0) {
    const lastItem = copy[copy.length - 1]
    const lastPreset = typeof lastItem === `string` ? lastItem : lastItem[0]
    // If preset-flow is the last preset, which is the case without a custom .babelrc,
    // assume we can replace it with preset-typescript.
    if (lastPreset && lastPreset.indexOf(`@babel/preset-flow`) !== -1) {
      copy.pop()
    }
  }
  copy.push(resolve(`@babel/preset-typescript`))
  return copy
}

export const PARSER_OPTIONS = {
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  allowSuperOutsideMethod: true,
  sourceType: `unambigious`,
  sourceFilename: true,
  plugins: [
    `jsx`,
    `typescript`,
    `doExpressions`,
    `objectRestSpread`,
    `decorators`,
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
    `pipelineOperator`,
    `nullishCoalescingOperator`,
  ],
}
