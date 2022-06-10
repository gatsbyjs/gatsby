import { createContext } from "react"
import { ScriptStrategy, ScriptProps } from "./gatsby-script"

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface CollectedScriptProps {
  id?: string
  src?: string
  strategy: ScriptStrategy | `post-hydrate` | `idle` | `off-main-thread`
  onLoad: boolean
  onError: boolean
  inline: boolean
  forward?: Array<string>
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
    onLoad: onLoadCallback,
    onError: onErrorCallback,
    children,
    dangerouslySetInnerHTML,
    forward,
  } = props

  const onLoad = typeof onLoadCallback === `function`
  const onError = typeof onErrorCallback === `function`
  const inline = Boolean(children || dangerouslySetInnerHTML?.__html)

  return { id, src, strategy, onLoad, onError, inline, forward }
}
