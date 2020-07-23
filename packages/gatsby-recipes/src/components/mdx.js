import React from "react"
import { mdx as createElement, MDXProvider } from "@mdx-js/react"
const { useInputByKey } = require(`../renderer/input-provider`)
const { useResource } = require(`../renderer/resource-provider`)
const { useProvider } = require(`../renderer/provider-provider`)
const transformRecipeMDX = require(`../transform-recipe-mdx`)

const transformCodeForEval = jsx => `${jsx}

  return React.createElement(MDXProvider, { components },
    React.createElement(MDXContent, props)
  );`

export default ({ children: mdxSrc, scope, components, ...props }) => {
  const fullScope = {
    mdx: createElement,
    MDXProvider,
    React,
    components,
    props,
    useInputByKey,
    useResource,
    useProvider,
    ...scope,
  }
  const scopeKeys = Object.keys(fullScope)
  const scopeValues = Object.values(fullScope)

  const srcCode = transformRecipeMDX(mdxSrc)

  const fn = new Function(...scopeKeys, transformCodeForEval(srcCode))
  // console.log(srcCode)

  return fn(...scopeValues)
}
