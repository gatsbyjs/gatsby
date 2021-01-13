import React from "react"
import remove from "unist-util-remove"
import slugify from "slugify"

const components = {
  Config: () => null,
  GatsbyPlugin: () => null,
  NPMPackageJson: () => null,
  NPMPackage: () => null,
  File: () => null,
  Input: () => null,
  Directory: () => null,
  GatsbyShadowFile: () => null,
  NPMScript: () => null,
  RecipeIntroduction: props => <div>{props.children}</div>,
  RecipeStep: props => <div>{props.children}</div>,
  ContentfulSpace: () => null,
  ContentfulEnvironment: () => null,
  ContentfulType: () => null,
}

const removeJsx = () => tree => {
  remove(tree, `export`, () => true)
  return tree
}

const makeResourceId = res => {
  if (!res.describe) {
    res.describe = ``
  }
  const id = encodeURIComponent(`${res.resourceName}-${slugify(res.describe)}`)
  return id
}

const log = (label, textOrObj) => {
  console.log(label, textOrObj)
}

export { components, removeJsx, makeResourceId, log }
