import sysPath from "path"
import { Reporter } from "gatsby"
import { CODES, prefixId } from "./error-utils"

// This file is a helper for consumers. It's going to log an error to them if they
// in any way have an incorrect filepath setup for us to predictably use collection
// querying.
//
// Without this, users will can get mystic errors.
export function isValidCollectionPathImplementation(
  filePath: string,
  reporter: Reporter
): boolean {
  const parts = filePath.split(sysPath.sep)
  let passing = true

  parts.forEach(part => {
    if (passing === false) return
    if (!part.includes(`{`) && !part.includes(`}`)) return

    const opener = part.match(/\{/)?.[0]! // Search for {
    const model = part.match(/{([a-zA-Z_][\w]+)./)?.[1]! // Search for word before first dot, e.g. Model
    const field = part.match(/((?<=\.).*)}/)?.[1]! // Search for everything after the first dot, e.g. foo__bar (or in invalid case: foo.bar)
    const closer = part.match(/\}/)?.[0]! // Search for }

    try {
      assert(opener, `{`, errorMessage(part)) // Check that { exists
      assert(model, /^[a-zA-Z_][\w]+$/, errorMessage(part)) // Check that Model is https://spec.graphql.org/draft/#sec-Names
      assert(field, /^[a-zA-Z_][\w_()]+$/, errorMessage(part)) // Check that field is foo__bar__baz (and not foo.bar.baz) + https://spec.graphql.org/draft/#sec-Names
      assert(closer, `}`, errorMessage(part)) // Check that } exists
    } catch (e) {
      reporter.panicOnBuild({
        id: prefixId(CODES.CollectionPath),
        context: {
          sourceMessage: e.message,
        },
        filePath: filePath,
      })
      passing = false
    }
  })
  return passing
}

function errorMessage(part: string): string {
  return `Collection page builder encountered an error parsing the filepath. To use collection paths the schema to follow is {Model.field__subfield}. The problematic part is: ${part}.`
}

function assert(part: string, matches: string | RegExp, message: string): void {
  const regexp = matches instanceof RegExp ? matches : new RegExp(matches)

  if (!part || regexp.test(part) === false) {
    throw new Error(message)
  }
}
