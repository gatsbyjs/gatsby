import React, { useRef, useEffect } from "react"
import type { ReactElement, ScriptHTMLAttributes } from "react"

export enum ScriptStrategy {
  preHydrate = `pre-hydrate`,
  postHydrate = `post-hydrate`,
  idle = `idle`,
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface ScriptProps
  extends Omit<ScriptHTMLAttributes<HTMLScriptElement>, `onLoad`> {
  id?: string
  strategy?: ScriptStrategy
  children?: string
  onLoad?: (event: Event) => void
}

const handledProps = new Set([
  `src`,
  `strategy`,
  `dangerouslySetInnerHTML`,
  `children`,
  `onLoad`,
])

const scriptCache = new Set()

export function Script(props: ScriptProps): ReactElement {
  const { src, strategy = ScriptStrategy.postHydrate, onLoad } = props || {}

  const ref = useRef<HTMLScriptElement>(null)

  useEffect(() => {
    let script: HTMLScriptElement | null

    switch (strategy) {
      case ScriptStrategy.preHydrate:
        // Handle gatsby-link navigation case
        if (!performance.getEntriesByName(location.href).length) {
          script = injectScript(props)
        }
        break
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
      script?.remove()
    }
  }, [])

  // Handle events for non-inline pre-hydrate scripts
  useEffect(() => {
    if (onLoad) {
      ref?.current?.addEventListener(`load`, onLoad)
    }

    return (): void => {
      if (onLoad) {
        ref?.current?.removeEventListener(`load`, onLoad)
      }
      ref?.current?.remove()
    }
  }, [ref])

  if (strategy === ScriptStrategy.preHydrate) {
    const inlineScript = resolveInlineScript(props)
    const attributes = resolveAttributes(props)

    if (inlineScript) {
      return (
        <script async data-strategy={strategy} {...attributes}>
          {resolveInlineScript(props)}
        </script>
      )
    }

    return (
      <script
        ref={ref}
        async
        src={src}
        data-strategy={strategy}
        {...attributes}
      />
    )
  }

  return <></>
}

function injectScript(props: ScriptProps): HTMLScriptElement | null {
  const { id, src, strategy = ScriptStrategy.postHydrate, onLoad } = props || {}

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
