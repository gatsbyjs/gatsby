const React = require(`react`)

const { render } = require(`./render`)
const { resourceComponents } = require(`./resource-components`)
const { RecipeStep, RecipeIntroduction } = require(`./step-component`)
const Input = require(`./input`).default
const { useInput, useInputByKey } = require(`./input-provider`)
const { useResource } = require(`./resource-provider`)
const { useProvider } = require(`./provider-provider`)

const transformRecipeMDX = require(`../transform-recipe-mdx`).default

const scope = {
  React,
  RecipeStep,
  RecipeIntroduction,
  Input,
  useInput,
  useInputByKey,
  useResource,
  useProvider,
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

module.exports = (mdxSrc, cb, context, isApply, isStream = false) => {
  const scopeKeys = Object.keys(scope)
  const scopeValues = Object.values(scope)

  const srcCode = transformRecipeMDX(mdxSrc, true)

  const component = new Function(...scopeKeys, transformCodeForEval(srcCode))

  try {
    const result = render(
      component(...scopeValues),
      cb,
      context,
      isApply,
      isStream
    )
    return result
  } catch (e) {
    throw e
  }
}
