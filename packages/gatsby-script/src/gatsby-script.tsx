import React, { useEffect } from "react"
import type { ReactElement } from "react"

export enum ScriptStrategy {
  preHydrate = `pre-hydrate`,
  postHydrate = `post-hydrate`,
  idle = `idle`,
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface ScriptProps {
  src?: string
  strategy?: ScriptStrategy
  dangerouslySetInnerHTML?: {
    __html: string
  }
  children?: string
}

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

    if (inlineScript) {
      return (
        <script async data-strategy={strategy}>
          {resolveInlineScript(props)}
        </script>
      )
    }

    return <script async src={src} data-strategy={strategy} />
  }

  return <></>
}

function injectScript(props: ScriptProps): void {
  const { src, strategy = ScriptStrategy.postHydrate } = props || {}
  const inlineScript = resolveInlineScript(props)

  const script = document.createElement(`script`)

  script.dataset.strategy = strategy
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
