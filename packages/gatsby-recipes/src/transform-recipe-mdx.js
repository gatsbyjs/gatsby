import babelPluginTransformReactJsx from "@babel/plugin-transform-react-jsx"
import babelChainingPlugin from "@babel/plugin-proposal-optional-chaining"
import mdx from "@mdx-js/mdx"
import babelPluginRemoveShortcodes from "./renderer/babel-plugin-remove-shortcodes"
import babelPluginCopyKeyProp from "./renderer/babel-plugin-copy-key-prop"
import babelPluginMoveExportKeywords from "./renderer/babel-plugin-move-export-keywords"

const mdxCache = new Map()
const jsxCache = new Map()

const transformJsx = jsx => {
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
      babelPluginRemoveShortcodes,
      // TODO figure out how to use preset-env
      babelChainingPlugin,
      [babelPluginTransformReactJsx, { useBuiltIns: true }],
    ],
  }

  const { code } = transform(jsx, options)

  return code
}

export default mdxSrc => {
  let jsxFromMdx
  if (mdxCache.has(mdxSrc)) {
    jsxFromMdx = mdxCache.get(mdxSrc)
  } else {
    jsxFromMdx = mdx.sync(mdxSrc, {
      skipExport: true,
      commonmark: true,
    })
    mdxCache.set(mdxSrc, jsxFromMdx)
  }

  let srcCode
  if (jsxCache.has(jsxFromMdx)) {
    srcCode = jsxCache.get(jsxFromMdx)
  } else {
    srcCode = transformJsx(jsxFromMdx)
    jsxCache.set(jsxFromMdx, srcCode)
  }

  return srcCode
}
