import React from "react"

import { render } from "./render"
import { resourceComponents } from "./resource-components"
import { RecipeStep, RecipeIntroduction } from "./step-component"
import Input from "./input"
import { useInput, useInputByKey } from "./input-provider"
import { useResource } from "./resource-provider"
import { useProvider } from "./provider-provider"

import transformRecipeMDX from "../transform-recipe-mdx"

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

export default function (mdxSrc, cb, context, isApply, isStream = false) {
  const scopeKeys = Object.keys(scope)
  const scopeValues = Object.values(scope)

  const srcCode = transformRecipeMDX(mdxSrc, true)

  const component = new Function(...scopeKeys, transformCodeForEval(srcCode))

  const result = render(
    component(...scopeValues),
    cb,
    context,
    isApply,
    isStream
  )
  return result
}
