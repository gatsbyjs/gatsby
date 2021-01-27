import { Rule } from "eslint"
import { GatsbyReduxStore } from "../redux"

export function isPageTemplate(
  s: GatsbyReduxStore,
  c: Rule.RuleContext
): boolean {
  const filename = c.getFilename()
  if (!filename) {
    return false
  }
  return s.getState().components.has(filename)
}

export function test(t): any {
  return Object.assign(t, {
    parserOptions: {
      sourceType: `module`,
      ecmaVersion: 9,
    },
  })
}
