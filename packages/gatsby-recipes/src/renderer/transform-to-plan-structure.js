const providedResources = require(`../resources`)
const flatted = require(`flatted`)

const extractPlan = node => {
  let text = {}
  if (node.text) {
    try {
      text = JSON.parse(node.text)
    } catch {
      return null
    }
  }

  const { _type: type, _props: props, ...plan } = text

  if (type === `Input`) {
    return {
      resourceName: type,
      resourceDefinitions: props,
      ...plan,
    }
  }

  if (!type || !providedResources[type]) {
    return null
  }

  return {
    resourceName: type,
    resourceDefinitions: props,
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

    if (curr._type === `Input`) {
      currText.resourceName = `Input`
      return [...acc, currText]
    }

    if (!providedResources[curr.type]) {
      return [...acc, ...childResourcePlans]
    }

    const [rawResource, ...resourceChildren] = curr.children || []
    const { _props, _type, ...plan } = JSON.parse(rawResource.text)

    const resourcePlan = {
      resourceName: _type,
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
  // console.log(flatted.stringify(renderTree, null, 2))
  const [doc] = renderTree.children

  return transform(doc)
}
