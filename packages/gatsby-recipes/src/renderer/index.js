const React = require(`react`)
const mdx = require(`@mdx-js/mdx`)
const { transform } = require(`@babel/standalone`)
const template = require("@babel/template").default
const babelPluginTransformReactJsx = require(`@babel/plugin-transform-react-jsx`)
const babelPluginRemoveExportKeywords = require(`babel-plugin-remove-export-keywords`)

const { render } = require(`./render`)
const { resourceComponents } = require(`./resource-components`)
const { RecipeStep, RecipeIntroduction } = require(`./step-component`)
const Input = require(`./input`).default
const { useInputByUuid } = require(`./input-provider`)
const babelPluginRemoveShortcodes = require(`./babel-plugin-remove-shortcodes`)
const babelPluginCopyKeyProp = require(`./babel-plugin-copy-key-prop`)
const babelPluginMoveExportKeywords = require(`./babel-plugin-move-export-keywords`)

const scope = {
  React,
  RecipeStep,
  RecipeIntroduction,
  Input,
  useInputByUuid,
  Config: `div`, // Keep this as a noop for now
  ...resourceComponents,
  mdx: React.createElement,
  MDXContent: React.createElement,
}

const transformCodeForEval = code => {
  // Remove the trailing semicolons so we can turn the component
  // into a return statement.
  let newCode = code.replace(/;\n;$/, ``)

  newCode = newCode + `\nreturn React.createElement(MDXContent)`

  return newCode
}

const transformJsx = jsx => {
  const { code } = transform(jsx, {
    parserOpts: {
      // We want to return outside of a function because the output from
      // Babel will be evaluated inline as part of the render process.
      allowReturnOutsideFunction: true,
    },
    plugins: [
      babelPluginCopyKeyProp,
      babelPluginMoveExportKeywords,
      // babelPluginRemoveExportKeywords,
      babelPluginRemoveShortcodes,
      [babelPluginTransformReactJsx, { useBuiltIns: true }],
    ],
  })

  return code
}

module.exports = (mdxSrc, cb, context, isApply) => {
  const scopeKeys = Object.keys(scope)
  const scopeValues = Object.values(scope)

  let jsxFromMdx = mdx.sync(mdxSrc, { skipExport: true })
  const srcCode = transformJsx(jsxFromMdx)

  const component = new Function(...scopeKeys, transformCodeForEval(srcCode))

  try {
    const result = render(component(...scopeValues), cb, context, isApply)
    return result
  } catch (e) {
    throw e
  }
}
