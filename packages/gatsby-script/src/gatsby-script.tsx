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

export const scriptCache = new Set()

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
        if (collectScript) {
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

function injectScript(props: ScriptProps): HTMLScriptElement | null {
  const {
    id,
    src,
    strategy = ScriptStrategy.postHydrate,
    onLoad,
    onError,
  } = props || {}

  if (scriptCache.has(id || src)) {
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

  if (onLoad) {
    script.addEventListener(`load`, onLoad)
  }

  if (onError) {
    script.addEventListener(`error`, onError)
  }

  document.body.appendChild(script)

  scriptCache.add(id || src)

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
  return `/__third-party-proxy?url=${encodeURIComponent(url)}`
}
