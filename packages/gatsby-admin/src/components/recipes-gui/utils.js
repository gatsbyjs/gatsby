import React from "react"
import remove from "unist-util-remove"

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

export { components, removeJsx }
