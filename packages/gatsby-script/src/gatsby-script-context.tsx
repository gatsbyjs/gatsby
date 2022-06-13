import { createContext } from "react"
import { ScriptStrategy, ScriptProps } from "./gatsby-script"

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface CollectedScriptProps {
  id?: string
  src?: string
  strategy: ScriptStrategy | `post-hydrate` | `idle` | `off-main-thread`
  callbacks: Array<string>
  forward?: Array<string>
  inline: boolean
}

export const GatsbyScriptContext: React.Context<{
  collectScript?: (script: CollectedScriptProps) => void
}> = createContext({})

/**
 * Pare down object size to contain only data we care about.
 */
export function filterCollectedScriptProps(
  props: ScriptProps
): CollectedScriptProps {
  const {
    id,
    src,
    strategy = ScriptStrategy.postHydrate,
    onLoad,
    onError,
    children,
    dangerouslySetInnerHTML,
    forward,
  } = props

  const inline = Boolean(children || dangerouslySetInnerHTML?.__html)
  const callbacks: Array<string> = []

  if (onLoad) {
    callbacks.push(`onLoad`)
  }

  if (onError) {
    callbacks.push(`onError`)
  }

  return { id, src, strategy, callbacks, forward, inline }
}
