const providedResources = require(`../resources`)

const transform = (props = {}) => {
  if (!props.children) {
    return []
  }

  const plan = props.children.reduce((acc, curr) => {
    const childResourcePlans = transform(curr)

    if (!providedResources[curr.type]) {
      return [...acc, ...childResourcePlans]
    }

    const [rawResource, ...resourceChildren] = curr.children
    const { _props, ...plan } = JSON.parse(rawResource.text)

    const resourcePlan = {
      resourceName: curr.type,
      resourceDefinitions: _props,
      ...plan,
    }

    if (resourceChildren.length) {
      resourcePlan.resourceChildren = transform({ children: resourceChildren })
    }

    return [...acc, resourcePlan]
  }, [])

  return plan
}

module.exports = renderTree => {
  const [doc] = renderTree.children

  return transform(doc)
}
