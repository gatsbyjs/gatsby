import * as providedResources from "../resources"
const isResource = type => type && (type === `Input` || providedResources[type])

const extractPlan = (node, type) => {
  if (!isResource(type)) {
    return null
  }

  let text = {}
  if (node.text) {
    try {
      text = JSON.parse(node.text)
    } catch {
      return null
    }
  }

  const { _props: props, ...plan } = text

  return {
    resourceName: type,
    resourceDefinitions: props,
    ...plan,
  }
}

const transform = (props = {}, type) => {
  if (!props.children) {
    const plan = extractPlan(props, type)
    return plan ? [plan] : []
  }

  const plan = props.children.filter(Boolean).reduce((acc, curr) => {
    const childType = curr.type || type

    let currText = {}
    if (curr.text) {
      try {
        currText = JSON.parse(curr.text)
      } catch {} // eslint-disable-line
    }

    if (childType === `Input`) {
      currText.resourceName = `Input`
      return [...acc, currText]
    }

    if (!providedResources[childType]) {
      return [...acc, ...transform(curr, childType)]
    }

    const [rawResource, ...resourceChildren] = curr.children || []
    const { _props, ...plan } = JSON.parse(rawResource.text)

    const resourcePlan = {
      resourceName: childType,
      resourceDefinitions: _props,
      ...plan,
    }

    if (resourceChildren.length) {
      resourcePlan.resourceChildren = transform(
        { children: resourceChildren },
        childType
      )
    }

    return [...acc, resourcePlan]
  }, [])

  return plan
}

export default function transformToPlanStructure(renderTree) {
  const [doc] = renderTree.children

  return transform(doc)
}
