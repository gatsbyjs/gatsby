const React = require(`react`)
const mdx = require(`@mdx-js/mdx`)
const version = require(`@mdx-js/mdx/package.json`).version
const { transform } = require(`@babel/standalone`)
const babelPluginTransformReactJsx = require(`@babel/plugin-transform-react-jsx`)

const { render } = require(`./render`)
const { resourceComponents } = require(`./resource-components`)
const { RecipeStep, RecipeIntroduction } = require(`./step-component`)
const Input = require(`./input`).default
const { useInputByUuid } = require(`./input-provider`)

const scope = {
  React,
  RecipeStep,
  RecipeIntroduction,
  Input,
  useInputByUuid,
  Config: `div`, // Keep this as a noop for now
  ...resourceComponents,
}

// We want to call the function constructor with our resulting
// transformed JS so we need to turn it into a "function body"
const transformCodeForEval = code => {
  const newCode = code.replace(/;$/, ``)

  return `return (${newCode})`
}

// TODO: Release MDX v2 canary so we can avoid the hacks
const stripMdxLayout = str => {
  const newJsx = str
    .replace(/^.*mdxType="MDXLayout">/ms, ``)
    .replace(/<\/MDXLayout>.*/ms, ``)

  console.log({ newJsx })
  return `<doc>${newJsx}</doc>`
}

const transformJsx = jsx => {
  const { code } = transform(jsx, {
    plugins: [[babelPluginTransformReactJsx, { useBuiltIns: true }]],
  })

  return code
}

module.exports = (mdxSrc, cb, context, isApply) => {
  console.trace()
  console.log(`mdxSrc`, mdxSrc)
  const scopeKeys = Object.keys(scope)
  const scopeValues = Object.values(scope)

  console.log(1)
  console.log({ version })
  const jsxFromMdx = mdx.sync(mdxSrc, { skipExport: true })
  console.log(2)
  console.log({ jsxFromMdx })
  const srcCode = transformJsx(stripMdxLayout(jsxFromMdx))
  console.log(3)

  const component = new Function(...scopeKeys, transformCodeForEval(srcCode))
  console.log(4)

  try {
    const result = render(component(...scopeValues), cb, context, isApply)
    return result
  } catch (e) {
    throw e
  }
}
