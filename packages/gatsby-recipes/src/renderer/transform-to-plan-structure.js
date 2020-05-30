const providedResources = require(`../resources`)

const transform = (props = {}) => {
  if (!props.children) {
    return []
  }

  const plan = props.children.reduce((acc, curr) => {
    const childResourcePlans = transform(curr)

    let currText = {}
    if (curr.text) {
      try {
        currText = JSON.parse(curr.text)
      } catch {}
    }

    console.log({ curr, currText, childResourcePlans })
    if (currText.mdxType === `Input`) {
      currText.resourceName = `Input`
      return [...acc, currText]
    }
    if (!providedResources[curr.type]) {
      return [...acc, ...childResourcePlans]
    }

    const [rawResource, ...resourceChildren] = curr.children
    const { _props, ...plan } = JSON.parse(rawResource.text)

    console.log({ _props, plan })

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
