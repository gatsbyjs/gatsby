import React, { useRef, useEffect } from "react"
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
  `onLoad`,
])

export function Script(props: ScriptProps): ReactElement {
  const { src, strategy = ScriptStrategy.postHydrate, onLoad } = props || {}

  const scriptRef = useRef<HTMLScriptElement>(null)

  useEffect(() => {
    let script: HTMLScriptElement

    switch (strategy) {
      case ScriptStrategy.postHydrate:
        script = injectScript(props)
        break
      case ScriptStrategy.idle:
        requestIdleCallback(() => {
          script = injectScript(props)
        })
        break
      default:
        return
    }

    // eslint-disable-next-line consistent-return
    return (): void => {
      // @ts-ignore TODO - Fix type mismatch
      script.removeEventListener(`load`, onLoad)
    }
  }, [])

  useEffect(() => {
    if (scriptRef) {
      // @ts-ignore TODO - Fix type mismatch
      scriptRef?.current?.addEventListener(`load`, onLoad)
    }
    // eslint-disable-next-line consistent-return
    return (): void => {
      // @ts-ignore TODO - Fix type mismatch
      scriptRef?.current?.removeEventListener(`load`, onLoad)
    }
  }, [scriptRef])

  if (strategy === ScriptStrategy.preHydrate) {
    const inlineScript = resolveInlineScript(props)
    const attributes = resolveAttributes(props)

    if (inlineScript) {
      return (
        <script ref={scriptRef} async data-strategy={strategy} {...attributes}>
          {resolveInlineScript(props)}
        </script>
      )
    }

    return (
      <script
        ref={scriptRef}
        async
        src={src}
        data-strategy={strategy}
        {...attributes}
      />
    )
  }

  return <></>
}

function injectScript(props: ScriptProps): HTMLScriptElement {
  const { src, strategy = ScriptStrategy.postHydrate, onLoad } = props || {}
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

  if (onLoad) {
    // @ts-ignore TODO - Fix type mismatch
    script.addEventListener(`load`, onLoad)
  }

  document.body.appendChild(script)

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
