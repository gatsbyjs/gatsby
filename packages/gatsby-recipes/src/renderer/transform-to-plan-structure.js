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

    const { _props, ...plan } = JSON.parse(curr.children[0].text)

    const resourcePlan = {
      resourceName: curr.type,
      resourceDefinitions: _props,
      ...plan,
    }

    return [...acc, resourcePlan]
  }, [])

  return plan
}

module.exports = renderTree => {
  const [doc] = renderTree.children

  return transform(doc)
}
