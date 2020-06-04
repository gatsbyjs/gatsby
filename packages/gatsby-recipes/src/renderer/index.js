const React = require(`react`)
const mdx = require(`@mdx-js/mdx`)
const { mdx: mdxPragma } = require(`@mdx-js/react`)
const version = require(`@mdx-js/mdx/package.json`).version
const { transform } = require(`@babel/standalone`)
const babelPluginTransformReactJsx = require(`@babel/plugin-transform-react-jsx`)
const babelPluginRemoveExportKeywords = require(`babel-plugin-remove-export-keywords`)

const { render } = require(`./render`)
const { resourceComponents } = require(`./resource-components`)
const { RecipeStep, RecipeIntroduction } = require(`./step-component`)
const Input = require(`./input`).default
const { useInputByUuid } = require(`./input-provider`)
const babelPluginRemoveShortcodes = require(`./babel-plugin-remove-shortcodes`)

const scope = {
  React,
  RecipeStep,
  RecipeIntroduction,
  Input,
  useInputByUuid,
  MDXLayout: ({ children }) => <React.Fragment>{children}</React.Fragment>,
  Config: `div`, // Keep this as a noop for now
  ...resourceComponents,
  mdx: React.createElement,
}

const transformCodeForEval = code =>
  `${code}; return React.createElement(MDXContent)`

const transformJsx = jsx => {
  const { code } = transform(jsx, {
    plugins: [
      babelPluginRemoveExportKeywords,
      babelPluginRemoveShortcodes,
      [babelPluginTransformReactJsx, { useBuiltIns: true }],
    ],
  })

  return code
}

module.exports = (mdxSrc, cb, context, isApply) => {
  const scopeKeys = Object.keys(scope)
  const scopeValues = Object.values(scope)

  const jsxFromMdx = mdx.sync(mdxSrc, { skipExport: true })
  const srcCode = transformJsx(jsxFromMdx)

  console.log(transformCodeForEval(srcCode))

  const component = new Function(...scopeKeys, transformCodeForEval(srcCode))

  try {
    const result = render(component(...scopeValues), cb, context, isApply)
    return result
  } catch (e) {
    throw e
  }
}
