import type { ScriptProps } from "gatsby-script"

export function getForwards(
  collectedScripts: Array<ScriptProps>
): Array<string> {
  return collectedScripts?.flatMap(
    (script: ScriptProps) => script?.forward || []
  )
}
