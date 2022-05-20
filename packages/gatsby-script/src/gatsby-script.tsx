import React, { useEffect, useContext } from "react"
import { PartytownContext } from "./partytown-context"
import type { ReactElement, ScriptHTMLAttributes } from "react"
import { requestIdleCallback } from "./request-idle-callback-shim"

export enum ScriptStrategy {
  postHydrate = `post-hydrate`,
  idle = `idle`,
  offMainThread = `off-main-thread`,
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface ScriptProps
  extends Omit<ScriptHTMLAttributes<HTMLScriptElement>, `onLoad` | `onError`> {
  id?: string
  strategy?: ScriptStrategy | `post-hydrate` | `idle` | `off-main-thread`
  children?: string
  onLoad?: (event: Event) => void
  onError?: (event: ErrorEvent) => void
  forward?: Array<string>
}

const handledProps = new Set([
  `src`,
  `strategy`,
  `dangerouslySetInnerHTML`,
  `children`,
  `onLoad`,
  `onError`,
])

export const scriptCache: Set<string> = new Set()
export const scriptCallbackCache: Map<
  string,
  {
    load?: {
      callbacks?: Array<(event: Event) => void>
      event?: Event | undefined
    }
    error?: {
      callbacks?: Array<(event: ErrorEvent) => void>
      event?: ErrorEvent | undefined
    }
  }
> = new Map()

export function Script(props: ScriptProps): ReactElement | null {
  const {
    id,
    src,
    strategy = ScriptStrategy.postHydrate,
    onLoad,
    onError,
  } = props || {}
  const { collectScript } = useContext(PartytownContext)

  useEffect(() => {
    let script: HTMLScriptElement | null

    switch (strategy) {
      case ScriptStrategy.postHydrate:
        script = injectScript(props)
        break
      case ScriptStrategy.idle:
        requestIdleCallback(() => {
          script = injectScript(props)
        })
        break
      case ScriptStrategy.offMainThread:
        if (typeof window !== `undefined` && collectScript) {
          const attributes = resolveAttributes(props)
          collectScript(attributes)
        }
        break
    }

    return (): void => {
      if (onLoad) {
        script?.removeEventListener(`load`, onLoad)
      }
      if (onError) {
        script?.removeEventListener(`error`, onError)
      }
      script?.remove()
    }
  }, [])

  if (strategy === ScriptStrategy.offMainThread) {
    const inlineScript = resolveInlineScript(props)
    const attributes = resolveAttributes(props)

    if (typeof window === `undefined` && collectScript) {
      const identifier = id || src || `no-id-or-src`
      console.warn(
        `Unable to collect off-main-thread script '${identifier}' for configuration with Partytown.\nGatsby script components must be used either as a child of your page, in wrapPageElement, or wrapRootElement.\nSee https://gatsby.dev/gatsby-script for more information.`
      )
      collectScript(attributes)
    }

    if (inlineScript) {
      return (
        <script
          type="text/partytown"
          async
          data-strategy={strategy}
          crossOrigin="anonymous"
          {...attributes}
          dangerouslySetInnerHTML={{ __html: resolveInlineScript(props) }}
        />
      )
    }
    return (
      <script
        type="text/partytown"
        async
        src={proxyPartytownUrl(src)}
        data-strategy={strategy}
        crossOrigin="anonymous"
        {...attributes}
      />
    )
  }

  return null
}

function injectScript(props: ScriptProps): HTMLScriptElement | null {
  const {
    id,
    src,
    strategy = ScriptStrategy.postHydrate,
    onLoad,
    onError,
  } = props || {}

  const scriptKey = id || src || (scriptCache.size + 1).toString()

  /**
   * If a duplicate script is already loaded/errored, we replay load/error callbacks with the original event.
   * If it's not yet loaded/errored, keep track of callbacks so we can call load/error callbacks for each when the event occurs.
   */
  const cachedCallbacks = scriptCallbackCache.get(scriptKey) || {}

  const callbackNames = [`load`, `error`]

  const currentCallbacks = {
    load: onLoad,
    error: onError,
  }

  for (const name of callbackNames) {
    if (currentCallbacks?.[name]) {
      const { callbacks = [] } = cachedCallbacks?.[name] || {}
      callbacks.push(currentCallbacks?.[name])

      if (cachedCallbacks?.[name]?.event) {
        currentCallbacks?.[name]?.(cachedCallbacks?.[name]?.event)
      } else {
        scriptCallbackCache.set(scriptKey, {
          [name]: {
            callbacks,
          },
        })
      }
    }
  }

  // Avoid injecting duplicate scripts into the DOM
  if (scriptCache.has(scriptKey)) {
    return null
  }

  const inlineScript = resolveInlineScript(props)
  const attributes = resolveAttributes(props)

  const script = document.createElement(`script`)

  if (id) {
    script.id = id
  }

  script.dataset.strategy = strategy

  for (const [key, value] of Object.entries(attributes)) {
    script.setAttribute(key, value)
  }

  if (inlineScript) {
    script.textContent = inlineScript
  }

  if (src) {
    script.src = src
  }

  for (const name of callbackNames) {
    if (currentCallbacks?.[name]) {
      script.addEventListener(name, event => {
        const cachedCallbacks = scriptCallbackCache.get(scriptKey) || {}

        for (const callback of cachedCallbacks?.[name]?.callbacks || []) {
          callback(event)
        }

        scriptCallbackCache.set(scriptKey, { [name]: { event } })
      })
    }
  }

  scriptCache.add(scriptKey)

  document.body.appendChild(script)

  scriptCache.add(scriptKey)

  return script
}

function resolveInlineScript(props: ScriptProps): string {
  const { dangerouslySetInnerHTML, children = `` } = props || {}
  const { __html: dangerousHTML = `` } = dangerouslySetInnerHTML || {}
  return dangerousHTML || children
}

function resolveAttributes(props: ScriptProps): Record<string, string> {
  const attributes: Record<string, string> = {}

  for (const [key, value] of Object.entries(props)) {
    if (handledProps.has(key)) {
      continue
    }
    attributes[key] = value
  }

  return attributes
}

function proxyPartytownUrl(url: string | undefined): string | undefined {
  if (!url) {
    return undefined
  }
  return `/__partytown-proxy?url=${encodeURIComponent(url)}`
}
