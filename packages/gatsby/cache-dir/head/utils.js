import { VALID_NODE_NAMES } from "./constants"
import React from "react"

const htmlAttributesList = new Set()
const bodyAttributesList = new Set()

/**
 * Filter the props coming from a page down to just the ones that are relevant for head.
 * This e.g. filters out properties that are undefined during SSR.
 */
export function filterHeadProps(input) {
  return {
    location: {
      pathname: input.location.pathname,
    },
    params: input.params,
    data: input.data || {},
    pageContext: input.pageContext,
  }
}

/**
 * Throw error if Head export is not a valid function
 */
export function headExportValidator(head) {
  if (typeof head !== `function`)
    throw new Error(
      `Expected "Head" export to be a function got "${typeof head}".`
    )
}

/**
 * Warn once for same messsage
 */
let warnOnce = _ => {}
if (process.env.NODE_ENV !== `production`) {
  const warnings = new Set()
  warnOnce = msg => {
    if (!warnings.has(msg)) {
      console.warn(msg)
    }
    warnings.add(msg)
  }
}

/**
 * Warn for invalid tags in Head which may have been directly added or introduced by `wrapRootElement`
 * @param {string} tagName
 */
export function warnForInvalidTags(tagName) {
  if (process.env.NODE_ENV !== `production`) {
    const warning = `<${tagName}> is not a valid head element. You can only use one of the following: ${VALID_NODE_NAMES.join(
      `, `
    )}.You should also make sure that wrapRootElement in gatsby-ssr/gatsby-browser doesn't contain UI elements`

    warnOnce(warning)
  }
}

/**
 * When a `nonce` is present on an element, browsers such as Chrome and Firefox strip it out of the
 * actual HTML attributes for security reasons *when the element is added to the document*. Thus,
 * given two equivalent elements that have nonces, `Element,isEqualNode()` will return false if one
 * of those elements gets added to the document. Although the `element.nonce` property will be the
 * same for both elements, the one that was added to the document will return an empty string for
 * its nonce HTML attribute value.
 *
 * This custom `isEqualNode()` function therefore removes the nonce value from the `newTag` before
 * comparing it to `oldTag`, restoring it afterwards.
 *
 * For more information, see:
 * https://bugs.chromium.org/p/chromium/issues/detail?id=1211471#c12
 */
export function isEqualNode(oldTag, newTag) {
  if (oldTag instanceof HTMLElement && newTag instanceof HTMLElement) {
    const nonce = newTag.getAttribute(`nonce`)
    // Only strip the nonce if `oldTag` has had it stripped. An element's nonce attribute will not
    // be stripped if there is no content security policy response header that includes a nonce.
    if (nonce && !oldTag.getAttribute(`nonce`)) {
      const cloneTag = newTag.cloneNode(true)
      cloneTag.setAttribute(`nonce`, ``)
      cloneTag.nonce = nonce
      return nonce === oldTag.nonce && oldTag.isEqualNode(cloneTag)
    }
  }

  return oldTag.isEqualNode(newTag)
}

export function diffNodes({ oldNodes, newNodes, onStale, onNew }) {
  for (const existingHeadElement of oldNodes) {
    const indexInNewNodes = newNodes.findIndex(e =>
      isEqualNode(e, existingHeadElement)
    )

    if (indexInNewNodes === -1) {
      onStale(existingHeadElement)
    } else {
      // this node is re-created as-is, so we keep old node, and remove it from list of new nodes (as we handled it already here)
      newNodes.splice(indexInNewNodes, 1)
    }
  }

  // remaing new nodes didn't have matching old node, so need to be added
  for (const newNode of newNodes) {
    onNew(newNode)
  }
}

export function getValidHeadNodes(rootNode) {
  const validHeadNodes = []
  const seenIds = new Map()

  // Filter out non-element nodes before looping since we don't care about them
  for (const node of getNodesOfElementType(rootNode.childNodes)) {
    const nodeName = node.nodeName.toLowerCase()
    const id = node.attributes?.id?.value

    if (isValidNodeName(nodeName)) {
      // <html> and <body> tags are treated differently, in that we don't  render them, we only  extract the attributes and apply them
      if (nodeName === `html` || nodeName === `body`) {
        for (const attribute of node.attributes) {
          const attributesList =
            nodeName === `html` ? htmlAttributesList : bodyAttributesList
          updateAttribute(
            nodeName,
            attribute.name,
            attribute.value,
            attributesList
          )
        }
      } else {
        let clonedNode = node.cloneNode(true)
        clonedNode.setAttribute(`data-gatsby-head`, true)

        // // This is hack to make script tags work
        if (clonedNode.nodeName.toLowerCase() === `script`) {
          clonedNode = massageScript(clonedNode)
        }
        // Duplicate ids are not allowed in the head, so we need to dedupe them
        if (id) {
          if (!seenIds.has(id)) {
            validHeadNodes.push(clonedNode)
            seenIds.set(id, validHeadNodes.length - 1)
          } else {
            const indexOfPreviouslyInsertedNode = seenIds.get(id)
            validHeadNodes[
              indexOfPreviouslyInsertedNode
            ].parentNode?.removeChild(
              validHeadNodes[indexOfPreviouslyInsertedNode]
            )
            validHeadNodes[indexOfPreviouslyInsertedNode] = clonedNode
          }
        } else {
          validHeadNodes.push(clonedNode)
        }
      }
    } else {
      warnForInvalidTags(nodeName)
    }

    if (node.childNodes.length) {
      validHeadNodes.push(...getValidHeadNodes(node))
    }
  }

  return validHeadNodes
}

export function getValidHeadNodeForSSR(
  rootNode,
  { setHtmlAttributes, setBodyAttributes }
) {
  const validHeadNodes = []
  const seenIds = new Map()

  // Filter out non-element nodes before looping since we don't care about them
  for (const node of getNodesOfElementType(rootNode.childNodes)) {
    const { rawTagName } = node
    const id = node.attributes?.id

    if (isValidNodeName(rawTagName)) {
      if (rawTagName === `html` || rawTagName === `body`) {
        if (rawTagName === `html`) setHtmlAttributes(node.attributes)
        if (rawTagName === `body`) setBodyAttributes(node.attributes)
      } else {
        let element
        const attributes = { ...node.attributes, "data-gatsby-head": true }

        if (rawTagName === `script` || rawTagName === `style`) {
          element = (
            <node.rawTagName
              {...attributes}
              dangerouslySetInnerHTML={{
                __html: node.text,
              }}
            />
          )
        } else {
          element =
            node.textContent.length > 0 ? (
              <node.rawTagName {...attributes}>
                {node.textContent}
              </node.rawTagName>
            ) : (
              <node.rawTagName {...attributes} />
            )
        }

        if (id) {
          if (!seenIds.has(id)) {
            validHeadNodes.push(element)
            seenIds.set(id, validHeadNodes.length - 1)
          } else {
            const indexOfPreviouslyInsertedNode = seenIds.get(id)
            validHeadNodes[indexOfPreviouslyInsertedNode] = element
          }
        } else {
          validHeadNodes.push(element)
        }
      }
    } else {
      warnForInvalidTags(rawTagName)
    }

    if (node.childNodes.length) {
      validHeadNodes.push(
        ...getValidHeadNodeForSSR(node, {
          setHtmlAttributes,
          setBodyAttributes,
        })
      )
    }
  }

  return validHeadNodes
}

function massageScript(node) {
  const script = document.createElement(`script`)
  for (const attr of node.attributes) {
    script.setAttribute(attr.name, attr.value)
  }
  script.innerHTML = node.innerHTML

  return script
}

function isValidNodeName(nodeName) {
  return VALID_NODE_NAMES.includes(nodeName)
}
/*
 * For Head, we only care about element nodes(type = 1), so we filter out the rest
 * For Node type, see https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
 */
function getNodesOfElementType(nodes) {
  return Array.from(nodes).filter(childNode => childNode.nodeType === 1)
}

function updateAttribute(
  tagName,
  attributeName,
  attributeValue,
  attributesList
) {
  const elementTag = document.getElementsByTagName(tagName)[0]

  if (!elementTag) {
    return
  }

  elementTag.setAttribute(attributeName, attributeValue)
  attributesList.add(attributeName)
}

export function removePrevHtmlAttributes() {
  htmlAttributesList.forEach(attributeName => {
    const elementTag = document.getElementsByTagName(`html`)[0]
    elementTag.removeAttribute(attributeName)
  })
}

export function removePrevBodyAttributes() {
  bodyAttributesList.forEach(attributeName => {
    const elementTag = document.getElementsByTagName(`body`)[0]
    elementTag.removeAttribute(attributeName)
  })
}

export function removePrevHeadElements() {
  const prevHeadNodes = document.querySelectorAll(`[data-gatsby-head]`)
  for (const node of prevHeadNodes) {
    node.parentNode.removeChild(node)
  }
}
