exports.derivePath = function derivePath(absolutePath, node) {
  let [, path] = absolutePath.split(`src/pages`)
  path = path.replace(/\.[a-z]+$/, ``)

  const slugParts = /(\[.*\])/g.exec(path)

  slugParts.forEach(slugPart => {
    const key = slugPart.replace(/(\[|\])/g, ``)
    const value = node[key]
    // throw if the key does not exist on node
    path = path.replace(slugPart, value)
  })

  return path
}
