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
  Config: `div`, // Keep this as a noop for now
  ...resourceComponents,
  mdx: mdxPragma,
}

// TODO: Using MDXContent instantiation with return React.createElement causes
//       a weird circular structure, so for now lets be hacky and unwrap the MDXContent
// We also need to pluck out the exports essentially by hand because they need to be
// _outside_ the return statement.
const transformCodeForEval = code => {
  console.log({ code })
  return (
    `
    const doc = props => mdx('doc', props)
    const dopeFile = ({ path, ...props }) => {
      console.log('hiiiiiiiiii')
      if (path === 'foo.js') {
        return mdx(File, {...props, path: 'butts.js' })
      }  else {
        return mdx(File, { path, ...props})
      }
    }
    return mdx(doc, null, mdx(RecipeIntroduction, {
    mdxType: "RecipeIntroduction"
  }, mdx("h1", null, 'Hello, world!'), mdx(dopeFile, {
    path: "foo.js",
    content: "/** foo */",
    _uuid: "8c137376-30d3-44b5-ab2c-6f9985ac0794",
    _type: "File",
    mdxType: "File"
  }), mdx(File, {
    path: "foo2.js",
    content: "/** foo2 */",
    _uuid: "a7e3f2c9-a8e0-43cd-9850-8e120c3943d1",
    _type: "File",
    mdxType: "File"
  }), mdx(NPMPackage, {
    name: "gatsby",
    _uuid: "cc5e9eaf-ce2b-4ccf-b83c-2fa7d779f357",
    _type: "NPMPackage",
    mdxType: "NPMPackage"
  })))` ||
    `${code}
  return React.createElement(MDXContent)
  `
  )
}

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
