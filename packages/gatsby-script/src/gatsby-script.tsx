import React, { useEffect } from "react"
import { ReactElement } from "react"

export enum ScriptStrategy {
  preHydrate = `pre-hydrate`,
  postHydrate = `post-hydrate`,
  idle = `idle`,
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface ScriptProps {
  src: string
  strategy?: ScriptStrategy
}

export function Script(props: ScriptProps): ReactElement {
  const { src, strategy = ScriptStrategy.postHydrate } = props || {}

  useEffect(() => {
    switch (strategy) {
      case ScriptStrategy.postHydrate:
        injectScript(src, strategy)
        break
      case ScriptStrategy.idle:
        requestIdleCallback(() => {
          injectScript(src, strategy)
        })
        break
      default:
        return
    }
  }, [])

  if (strategy === ScriptStrategy.preHydrate) {
    return <script async src={src} data-strategy={strategy} />
  }

  return <></>
}

function injectScript(src: string, strategy: ScriptStrategy): void {
  const script = document.createElement(`script`)
  script.src = src
  script.dataset.strategy = strategy
  document.body.appendChild(script)
}
