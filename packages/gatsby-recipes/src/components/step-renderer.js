import React from "react"
import { mdx as createElement, MDXProvider } from "@mdx-js/react"
import { useInput, useInputByKey } from "../renderer/input-provider"
import { useResource } from "../renderer/resource-provider"
import { useProvider } from "../renderer/provider-provider"

const transformCodeForEval = jsx => `${jsx}

  return React.createElement(MDXProvider, { components },
    React.createElement(MDXContent, props)
  );`

export default ({ children: srcCode, scope, components, ...props }) => {
  const fullScope = {
    mdx: createElement,
    MDXProvider,
    React,
    // need to pass both so that we can guarantee the components we need are passed to MDXProvider for shortcodes and we also need some components to be in direct scope
    ...components,
    components,
    props,
    useInput,
    useInputByKey,
    useResource,
    useProvider,
    ...scope,
  }
  const scopeKeys = Object.keys(fullScope)
  const scopeValues = Object.values(fullScope)

  const fn = new Function(...scopeKeys, transformCodeForEval(srcCode))

  return fn(...scopeValues)
}
