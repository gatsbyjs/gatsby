const React = require(`react`)
const mdx = require(`@mdx-js/mdx`)
const { transform } = require(`@babel/standalone`)
const babelPluginTransformReactJsx = require(`@babel/plugin-transform-react-jsx`)

const { render, File, NPMPackage } = require(`./render`)

// TODO: Create components for resources dynamically
// based on what's found in resources.
const scope = {
  React,
  File,
  NPMPackage,
}

// TODO: Release MDX v2 canary so we can avoid the hacks
const isMdxJsx = str => str.startsWith(`/* @jsx mdx */`)
const stripMdxLayout = str => {
  const newJsx = str
    .replace(/^.*mdxType="MDXLayout">/ms, ``)
    .replace(/<\/MDXLayout>.*/ms, ``)

  return `<doc>${newJsx}</doc>`
}

const transformJsx = jsx => {
  const { code } = transform(jsx, {
    plugins: [babelPluginTransformReactJsx],
  })

  return code
}

// This is overloaded to handle MDX input, JSX input
// or MDX's JSX output as input.
module.exports = jsx => {
  const scopeKeys = Object.keys(scope)
  const scopeValues = Object.values(scope)

  let srcCode = null

  if (isMdxJsx(jsx)) {
    jsx = stripMdxLayout(jsx)
  }

  try {
    srcCode = transformJsx(jsx)
  } catch (e) {
    const jsxFromMdx = mdx.sync(jsx, { skipExport: true })
    srcCode = transformJsx(stripMdxLayout(jsxFromMdx))
  }

  const component = new Function(
    ...scopeKeys,
    `return (${srcCode.replace(/;$/, ``)})`
  )

  return render(component(...scopeValues))
}
