const babelPluginTransformReactJsx = require(`@babel/plugin-transform-react-jsx`)
const babelChainingPlugin = require(`@babel/plugin-proposal-optional-chaining`)
const mdx = require(`@mdx-js/mdx`)
const babelPluginRemoveShortcodes = require(`./renderer/babel-plugin-remove-shortcodes`)
const babelPluginCopyKeyProp = require(`./renderer/babel-plugin-copy-key-prop`)
const babelPluginMoveExportKeywords = require(`./renderer/babel-plugin-move-export-keywords`)

const mdxCache = new Map()
const jsxCache = new Map()

const transformJsx = (jsx, isRenderer) => {
  delete require.cache[require.resolve(`@babel/standalone`)]
  const { transform } = require(`@babel/standalone`)
  const options = {
    parserOpts: {
      // We want to return outside of a function because the output from
      // Babel will be evaluated inline as part of the render process.
      allowReturnOutsideFunction: true,
    },
    plugins: [
      babelPluginCopyKeyProp,
      babelPluginMoveExportKeywords,
      // TODO figure out how to use preset-env
      babelChainingPlugin,
      [babelPluginTransformReactJsx, { useBuiltIns: true }],
    ],
  }

  if (isRenderer) {
    options.plugins.push(babelPluginRemoveShortcodes)
  }

  const { code } = transform(jsx, options)

  return code
}

module.exports = (mdxSrc, isRenderer = false) => {
  let jsxFromMdx
  if (mdxCache.has(mdxSrc)) {
    jsxFromMdx = mdxCache.get(mdxSrc)
  } else {
    jsxFromMdx = mdx.sync(mdxSrc, { skipExport: true })
    mdxCache.set(mdxSrc, jsxFromMdx)
  }

  let srcCode
  if (jsxCache.has(jsxFromMdx)) {
    srcCode = jsxCache.get(jsxFromMdx)
  } else {
    srcCode = transformJsx(jsxFromMdx, isRenderer)
    jsxCache.set(jsxFromMdx, srcCode)
  }

  return srcCode
}
