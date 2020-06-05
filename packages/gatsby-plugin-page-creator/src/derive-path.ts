const _ = require(`lodash`)

// Generates the path for the page from the file path
// src/pages/product/{id}.js => /product/:id, pulls from nodes.id
// src/pages/product/{sku__en} => product/:sku__en pulls from nodes.sku.en
export function derivePath(
  absolutePath: string,
  node: Record<string, any>
): string {
  let [, path] = absolutePath.split(`src/pages`)
  path = path.replace(/\.[a-z]+$/, ``)

  const slugParts = /(\{.*\})/g.exec(path)

  slugParts.forEach(slugPart => {
    const __ = new RegExp(`__`, `g`)
    const key = slugPart.replace(/(\{|\})/g, ``).replace(__, `.`)

    const value = _.get(node.nodes, `[0]${key}`) || _.get(node, key)
    // throw if the key does not exist on node
    path = path.replace(slugPart, value)
  })

  // make sure we didnt accidentally get // by appending
  // this probably shouldnt end up in the final api. it's a bit of a hack
  return path.replace(`//`, `/`)
}
