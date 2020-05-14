const providedResources = require(`../resources`)

module.exports = renderTree => {
  const resources = renderTree.children[0].children
  const plan = resources.reduce((acc, curr) => {
    if (!providedResources[curr.type]) {
      return acc
    }

    const { _props, ...plan } = JSON.parse(curr.children[0].text)

    const resourcePlan = {
      resourceName: curr.type,
      resourceDefinitions: _props,
      ...plan,
    }

    acc.push(resourcePlan)

    return acc
  }, [])

  return plan
}
