import reporter from "gatsby-cli/lib/reporter"
import { getNonGatsbyCodeFrameFormatted } from "./stack-trace-utils"
import type { IGatsbyNode } from "../redux/types"

const reported = new Set<string>()

const genericProxy = createProxyHandler()
const nodeInternalProxy = createProxyHandler({
  onGet(key, value) {
    if (key === `fieldOwners` || key === `content`) {
      // all allowed in here
      return value
    }
    return undefined
  },
  onSet(target, key, value) {
    if (key === `fieldOwners` || key === `content`) {
      target[key] = value
      return true
    }
    return undefined
  },
})

const nodeProxy = createProxyHandler({
  onGet(key, value) {
    if (key === `internal`) {
      return memoizedProxy(value, nodeInternalProxy)
    } else if (key === `fields` || key === `children`) {
      // all allowed in here
      return value
    }
    return undefined
  },
  onSet(target, key, value) {
    if (key === `fields` || key === `children`) {
      target[key] = value
      return true
    }
    return undefined
  },
})

/**
 * Every time we create proxy for object, we store it in WeakMap,
 * so that we reuse it for that object instead of creating new Proxy.
 * This also ensures reference equality: `memoizedProxy(obj) === memoizedProxy(obj)`.
 * If we didn't reuse already created proxy above comparison would return false.
 */
const referenceMap = new WeakMap<any, any>()
function memoizedProxy<T>(target: T, handler: ProxyHandler<any>): T {
  const alreadyWrapped = referenceMap.get(target)
  if (alreadyWrapped) {
    return alreadyWrapped
  } else {
    const wrapped = new Proxy(target, handler)
    referenceMap.set(target, wrapped)
    return wrapped
  }
}

function createProxyHandler({
  onGet,
  onSet,
}: {
  onGet?: (key: string | symbol, value: any) => any
  onSet?: (target: any, key: string | symbol, value: any) => boolean | undefined
} = {}): ProxyHandler<any> {
  function set(target, key, value): boolean {
    if (onSet) {
      const result = onSet(target, key, value)
      if (result !== undefined) {
        return result
      }
    }

    const error = new Error(`Stack trace:`)
    Error.captureStackTrace(error, set)

    if (error.stack && !reported.has(error.stack)) {
      reported.add(error.stack)
      const codeFrame = getNonGatsbyCodeFrameFormatted({
        stack: error.stack,
      })
      reporter.warn(
        `Node mutation detected\n\n${
          codeFrame ? `${codeFrame}\n\n` : ``
        }${error.stack.replace(/^Error:?\s*/, ``)}`
      )
    }
    return true
  }

  function get(target, key): any {
    const value = target[key]

    if (onGet) {
      const result = onGet(key, value)
      if (result !== undefined) {
        return result
      }
    }

    const fieldDescriptor = Object.getOwnPropertyDescriptor(target, key)
    if (fieldDescriptor && !fieldDescriptor.writable) {
      // this is to prevent errors like:
      // ```
      // TypeError: 'get' on proxy: property 'constants' is a read - only and
      // non - configurable data property on the proxy target but the proxy
      // did not return its actual value
      // (expected '[object Object]' but got '[object Object]')
      // ```
      return value
    }

    if (typeof value === `object` && value !== null) {
      return memoizedProxy(value, genericProxy)
    }

    return value
  }

  return {
    get,
    set,
  }
}

let shouldWrapNodesInProxies = !!process.env.GATSBY_DETECT_NODE_MUTATIONS
export function enableNodeMutationsDetection(): void {
  shouldWrapNodesInProxies = true

  reporter.warn(
    `Node mutation detection is enabled. Remember to disable it after you are finished with diagnostic as it will cause build performance degradation.`
  )
}

export function wrapNode<T extends IGatsbyNode | undefined>(node: T): T {
  if (node && shouldWrapNodesInProxies) {
    return memoizedProxy(node, nodeProxy)
  } else {
    return node
  }
}

export function wrapNodes<T extends Array<IGatsbyNode> | undefined>(
  nodes: T
): T {
  if (nodes && shouldWrapNodesInProxies && nodes.length > 0) {
    return nodes.map(node => memoizedProxy(node, nodeProxy)) as T
  } else {
    return nodes
  }
}
