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
  const { id, src, strategy = ScriptStrategy.postHydrate } = props || {}
  const { collectScript } = useContext(PartytownContext)

  useEffect(() => {
    let details: IInjectedScriptDetails | null

    switch (strategy) {
      case ScriptStrategy.postHydrate:
        details = injectScript(props)
        break
      case ScriptStrategy.idle:
        requestIdleCallback(() => {
          details = injectScript(props)
        })
        break
      case ScriptStrategy.offMainThread:
        if (collectScript) {
          const attributes = resolveAttributes(props)
          collectScript(attributes)
        }
        break
    }

    return (): void => {
      const { script, loadCallback, errorCallback } = details || {}

      if (loadCallback) {
        script?.removeEventListener(`load`, loadCallback)
      }

      if (errorCallback) {
        script?.removeEventListener(`error`, errorCallback)
      }

      script?.remove()
    }
  }, [])

  if (strategy === ScriptStrategy.offMainThread) {
    const inlineScript = resolveInlineScript(props)
    const attributes = resolveAttributes(props)

    if (typeof window === `undefined`) {
      if (collectScript) {
        collectScript(attributes)
      } else {
        console.warn(
          `Unable to collect off-main-thread script '${
            id || src || `no-id-or-src`
          }' for configuration with Partytown.\nGatsby script components must be used either as a child of your page, in wrapPageElement, or wrapRootElement.\nSee https://gatsby.dev/gatsby-script for more information.`
        )
      }
    }

    if (inlineScript) {
      return (
        <script
          type="text/partytown"
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
        src={proxyPartytownUrl(src)}
        data-strategy={strategy}
        crossOrigin="anonymous"
        {...attributes}
      />
    )
  }

  return null
}

interface IInjectedScriptDetails {
  script: HTMLScriptElement | null
  loadCallback: (event: Event) => void
  errorCallback: (event: ErrorEvent) => void
}

function injectScript(props: ScriptProps): IInjectedScriptDetails | null {
  const {
    id,
    src,
    strategy = ScriptStrategy.postHydrate,
    onLoad,
    onError,
  } = props || {}

  const scriptKey = id || src

  const callbackNames = [`load`, `error`]

  const currentCallbacks = {
    load: onLoad,
    error: onError,
  }

  if (scriptKey) {
    /**
     * If a duplicate script is already loaded/errored, we replay load/error callbacks with the original event.
     * If it's not yet loaded/errored, keep track of callbacks so we can call load/error callbacks for each when the event occurs.
     */
    for (const name of callbackNames) {
      if (currentCallbacks?.[name]) {
        const cachedCallbacks = scriptCallbackCache.get(scriptKey) || {}
        const { callbacks = [] } = cachedCallbacks?.[name] || {}
        callbacks.push(currentCallbacks?.[name])

        if (cachedCallbacks?.[name]?.event) {
          currentCallbacks?.[name]?.(cachedCallbacks?.[name]?.event)
        } else {
          scriptCallbackCache.set(scriptKey, {
            ...cachedCallbacks,
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

  const wrappedCallbacks: Record<string, (event: Event | ErrorEvent) => void> =
    {}

  if (scriptKey) {
    // Add listeners on injected scripts so events are cached for use in de-duplicated script callbacks
    for (const name of callbackNames) {
      const wrappedEventCallback = (event: Event | ErrorEvent): void =>
        onEventCallback(event, scriptKey, name)
      script.addEventListener(name, wrappedEventCallback)
      wrappedCallbacks[`${name}Callback`] = wrappedEventCallback
    }

    scriptCache.add(scriptKey)
  }

  document.body.appendChild(script)

  return {
    script,
    loadCallback: wrappedCallbacks.loadCallback,
    errorCallback: wrappedCallbacks.errorCallback,
  }
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
  return `/__third-party-proxy?url=${encodeURIComponent(url)}`
}

function onEventCallback(
  event: Event | ErrorEvent,
  scriptKey: string,
  eventName: string
): void {
  const cachedCallbacks = scriptCallbackCache.get(scriptKey) || {}

  for (const callback of cachedCallbacks?.[eventName]?.callbacks || []) {
    callback(event)
  }

  scriptCallbackCache.set(scriptKey, { [eventName]: { event } })
}
