module.exports = renderTree => {
  const resources = renderTree.children[0].children
  const plan = resources.reduce((acc, curr) => {
    // TODO: Test against list of resources
    if (!/^[A-Z]/.test(curr.type)) {
      return acc
    }

    acc[curr.type] = acc[curr.type] || []
    acc[curr.type].push(JSON.parse(curr.children[0].text))

    return acc
  }, {})

  return plan
}
