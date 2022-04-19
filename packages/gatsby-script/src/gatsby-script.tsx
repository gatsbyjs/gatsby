import React, { useEffect } from "react"
import type { ReactElement, ScriptHTMLAttributes } from "react"

export enum ScriptStrategy {
  preHydrate = `pre-hydrate`,
  postHydrate = `post-hydrate`,
  idle = `idle`,
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface ScriptProps extends ScriptHTMLAttributes<HTMLScriptElement> {
  strategy?: ScriptStrategy
  children?: string
}

const handledProps = new Set([
  `src`,
  `strategy`,
  `dangerouslySetInnerHTML`,
  `children`,
])

export function Script(props: ScriptProps): ReactElement {
  const { src, strategy = ScriptStrategy.postHydrate } = props || {}

  useEffect(() => {
    switch (strategy) {
      case ScriptStrategy.postHydrate:
        injectScript(props)
        break
      case ScriptStrategy.idle:
        requestIdleCallback(() => {
          injectScript(props)
        })
        break
      default:
        return
    }
  }, [])

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

    return <script async src={src} data-strategy={strategy} {...attributes} />
  }

  return <></>
}

function injectScript(props: ScriptProps): void {
  const { src, strategy = ScriptStrategy.postHydrate } = props || {}
  const inlineScript = resolveInlineScript(props)
  const attributes = resolveAttributes(props)

  const script = document.createElement(`script`)

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

  document.body.appendChild(script)
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
