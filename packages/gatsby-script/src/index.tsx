import React, { useEffect } from "react"
import { ReactElement } from "react"

export enum IScriptStrategy {
  preHydrate = `pre-hydrate`,
  postHydrate = `post-hydrate`,
  idle = `idle`,
}

export interface IScriptProps {
  src: string
  strategy?: IScriptStrategy
}

export default function Script(props: IScriptProps): ReactElement {
  const { src, strategy = IScriptStrategy.postHydrate } = props || {}

  useEffect(() => {
    switch (strategy) {
      case IScriptStrategy.postHydrate:
        injectScript(src)
        break
      case IScriptStrategy.idle:
        requestIdleCallback(() => {
          injectScript(src)
        })
        break
      default:
        return
    }
  }, [])

  if (strategy === IScriptStrategy.preHydrate) {
    return <script async src={src} />
  }

  return <></>
}

function injectScript(src: string): void {
  const script = document.createElement(`script`)
  script.src = src
  document.body.appendChild(script)
}
