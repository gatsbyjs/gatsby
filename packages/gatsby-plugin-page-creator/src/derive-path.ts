import _ from "lodash"
import slugify from "slugify"

// Generates the path for the page from the file path
// product/{Product.id}.js => /product/:id, pulls from nodes.id
// product/{Product.sku__en} => product/:sku__en pulls from nodes.sku.en
// blog/{MarkdownRemark.parent__(File)__relativePath}} => blog/:slug pulls from nodes.parent.relativePath
export function derivePath(path: string, node: Record<string, any>): string {
  // 1.  Remove the extension
  let pathWithoutExtension = path.replace(/\.[a-z]+$/, ``)

  // 2.  Pull out the slug parts that are within { } brackets.
  const slugParts = /(\{.*\})/g.exec(pathWithoutExtension)

  // 2.a  This shouldn't happen - but TS requires us to validate
  if (!slugParts) {
    throw new Error(
      `CollectionBuilderError: An error occured building the slug parts. This is likely a bug within Gatsby and not your code. Please report it to us if you run into this.`
    )
  }

  // 3.  For each slug parts get the actual value from the node data
  slugParts.forEach(slugPart => {
    // 3.a. this transforms foo__bar into foo.bar
    const __ = new RegExp(`__`, `g`)
    const key = slugPart
      .replace(/(\{|\})/g, ``)
      // Remove Model
      .replace(/[a-zA-Z]+\./, ``)
      // Ignore union syntax
      .replace(/\(.*\)__/g, ``)
      // replace access by periods
      .replace(__, `.`)

    // 3.b  We do node or node.nodes here because we support the special group
    //      graphql field, which then moves nodes in another depth
    const nodeValue = _.get(node.nodes, `[0]${key}`) || _.get(node, key)

    // 3.c  log error if the key does not exist on node
    if (!nodeValue) {
      console.error(
        `CollectionBuilderError: Could not find value in the following node for key ${slugPart} (transformed to ${key})`
      )
      console.log(JSON.stringify(node, null, 4))
      return
    }

    const value = slugify((nodeValue + ``).replace(/\//g, `(REPLACED)`), {
      lower: true,
    }).replace(/\(REPLACED\)/gi, `/`)

    // 3.d  replace the part of the slug with the actual value
    pathWithoutExtension = pathWithoutExtension.replace(slugPart, value)
  })

  return pathWithoutExtension
}
