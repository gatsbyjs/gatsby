import React from "react"
import remove from "unist-util-remove"
import slugify from "slugify"

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

export { removeJsx, makeResourceId, log }
