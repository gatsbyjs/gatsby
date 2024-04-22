import type { Rule } from "eslint"
import { slash } from "gatsby-core-utils"
import type { GatsbyReduxStore } from "../redux"

export function isPageTemplate(
  s: GatsbyReduxStore,
  c: Rule.RuleContext,
): boolean {
  const filename = c.getFilename()
  if (!filename) {
    return false
  }

  return s.getState().components.has(slash(filename))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function test(t): any {
  return Object.assign(t, {
    parserOptions: {
      sourceType: `module`,
      ecmaVersion: 9,
    },
  })
}
