import ReactReconciler from "react-reconciler"

// const debugInner = require(`debug`)(`recipes-reconciler`)
const debug = (title, data) => {
  if (process.env.DEBUG) {
    console.log(title, data)
  }
  // debugInner(title, JSON.stringify(data, null, 2))
}

const reconciler = ReactReconciler({
  finalizeInitialChildren(element, type, props) {},
  getChildHostContext(parentContext, fiberType, rootInstance) {},
  getRootHostContext(rootInstance) {
    return {
      type: `recipes-root`,
    }
  },
  shouldSetTextContent(type, props) {},
  resetTextContent(element) {},
  createInstance(
    type,
    props,
    rootContainerInstance,
    hostContext,
    internalInstanceHandle
  ) {
    const instance = {
      type,
      props,
    }

    debug(`creating instance`, instance)

    return instance
  },
  createTextInstance(
    text,
    rootContainerInstance,
    hostContext,
    internalInstanceHandle
  ) {
    debug(`creating text instance`, text)
    return { text }
  },
  commitTextUpdate(textInstance, oldText, newText) {
    debug(`updating text instance`, newText)
    textInstance.text = newText
    return textInstance
  },
  appendChildToContainer(container, child) {
    container.children = container.children || []
    const propName = child.key ? `key` : `_uuid`
    const index = container.children.findIndex(
      c => c[propName] === child[propName]
    )

    debug(`appending child to container at index ${index}`)

    if (index === -1) {
      container.children.push(child)
    } else {
      container.children[index] = child
    }

    return container
  },
  appendChild(parent, child) {
    debug(`appending child`, { parent, child })
    parent.children = parent.children || []
    parent.children.push(child)
  },
  appendInitialChild(parent, child) {
    debug(`appending initial child`, { parent, child })
    parent.children = parent.children || []
    parent.children.push(child)
  },
  removeChildFromContainer(container, child) {},
  removeChild(parent, child) {},
  insertInContainerBefore(container, child, before) {},
  insertBefore(parent, child, before) {},
  prepareUpdate(
    instance,
    type,
    oldProps,
    newProps,
    rootContainerInstance,
    currentHostContext
  ) {},
  commitUpdate(
    instance,
    updatePayload,
    type,
    oldProps,
    newProps,
    finishedWork
  ) {},
  hideInstance() {},
  unhideInstance() {},
  prepareForCommit(...args) {},
  resetAfterCommit(...args) {},
  getPublicInstance(...args) {},
  supportsMutation: true,
})

const RecipesRenderer = {
  render(whatToRender, currState) {
    debug(`rendering recipe`)
    const container = reconciler.createContainer(currState, false, false)
    reconciler.updateContainer(whatToRender, container, null, null)

    return currState
  },
}

export default RecipesRenderer
