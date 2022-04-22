import React, { useEffect } from "react"
import type { ReactElement, ScriptHTMLAttributes } from "react"

export enum ScriptStrategy {
  postHydrate = `post-hydrate`,
  idle = `idle`,
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface ScriptProps
  extends Omit<ScriptHTMLAttributes<HTMLScriptElement>, `onLoad` | `onError`> {
  id?: string
  strategy?: ScriptStrategy
  children?: string
  onLoad?: (event: Event) => void
  onError?: (event: ErrorEvent) => void
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
  const { strategy = ScriptStrategy.postHydrate, onLoad, onError } = props || {}

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
