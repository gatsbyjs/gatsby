const providedResources = require(`../resources`)

const extractPlan = node => {
  let text = {}
  if (node.text) {
    try {
      text = JSON.parse(node.text)
    } catch {
      return null
    }
  }

  const { _type, _props, ...plan } = text

  if (!_type || !providedResources[_type]) {
    return null
  }

  return {
    resourceName: _type,
    resourceDefinitions: _props,
    ...plan,
  }
}

const transform = (props = {}) => {
  if (!props.children) {
    const plan = extractPlan(props)
    return plan ? [plan] : []
  }

  const plan = props.children.filter(Boolean).reduce((acc, curr) => {
    const childResourcePlans = transform(curr)

    let currText = {}
    if (curr.text) {
      try {
        currText = JSON.parse(curr.text)
      } catch {}
    }

    if (curr.type === `Input`) {
      currText.resourceName = `Input`
      return [...acc, currText]
    }

    if (!providedResources[curr.type]) {
      return [...acc, ...childResourcePlans]
    }

    const [rawResource, ...resourceChildren] = curr.children || []
    const { _props, ...plan } = JSON.parse(rawResource.text)

    const resourcePlan = {
      resourceName: currText._type,
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
  console.log(JSON.stringify(renderTree, null, 2))
  const [doc] = renderTree.children

  return transform(doc)
}
