const React = require(`react`)
const mdx = require(`@mdx-js/mdx`)
const { transform } = require(`@babel/standalone`)
const babelPluginTransformReactJsx = require(`@babel/plugin-transform-react-jsx`)

const { render } = require(`./render`)
const resourceComponents = require(`./resource-components`)

const scope = {
  React,
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

  return `<doc>${newJsx}</doc>`
}

const transformJsx = jsx => {
  const { code } = transform(jsx, {
    plugins: [[babelPluginTransformReactJsx, { useBuiltIns: true }]],
  })

  return code
}

// This is overloaded to handle MDX input, JSX input
// or MDX's JSX output as input.
module.exports = jsx => {
  const scopeKeys = Object.keys(scope)
  const scopeValues = Object.values(scope)

  const jsxFromMdx = mdx.sync(jsx, { skipExport: true })
  const srcCode = transformJsx(stripMdxLayout(jsxFromMdx))

  const component = new Function(...scopeKeys, transformCodeForEval(srcCode))

  try {
    const result = render(component(...scopeValues))
    return result
  } catch (e) {
    throw e
  }
}
