import React from "react"
import remove from "unist-util-remove"
import slugify from "slugify"
import { useInputByKey } from "gatsby-recipes/src/renderer/input-provider"
import {
  InputField,
  InputFieldLabel,
  InputFieldControl,
} from "gatsby-interface"

const components = {
  Config: () => null,
  GatsbyPlugin: () => null,
  NPMPackageJson: () => null,
  NPMPackage: () => null,
  File: () => null,
  Input: ({ label, type = `text`, _key: key, sendInputEvent, ...rest }) => {
    const value = useInputByKey(key)

    return (
      <div sx={{ pt: 3, width: `30%`, maxWidth: `100%` }}>
        <InputField sx={{ pt: 3 }}>
          <div>
            <InputFieldLabel>{label}</InputFieldLabel>
          </div>
          <InputFieldControl
            type={type}
            value={value}
            onInput={e => {
              sendInputEvent({ key, value: e.target.value })
            }}
          />
        </InputField>
      </div>
    )
  },
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
