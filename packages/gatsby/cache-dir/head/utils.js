import { VALID_NODE_NAMES } from "./constants"

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
 * Throw error if Head export is not a valid
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
 * Warn for invalid tags in head.
 * @param {string} tagName
 */
export function warnForInvalidTags(tagName) {
  if (process.env.NODE_ENV !== `production`) {
    const warning = `<${tagName}> is not a valid head element. Please use one of the following: ${VALID_NODE_NAMES.join(
      `, `
    )}`

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
    const isInValidNodes = newNodes.some(e =>
      isEqualNode(e, existingHeadElement)
    )

    if (!isInValidNodes) {
      onStale(existingHeadElement)
    }
  }

  for (const validHeadNode of newNodes) {
    const isInExistingHeadElementsList = oldNodes.some(e =>
      isEqualNode(e, validHeadNode)
    )

    if (!isInExistingHeadElementsList) {
      onNew(validHeadNode)
    }
  }
}
