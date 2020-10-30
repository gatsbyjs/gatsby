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

    const opener = part.match(/\{/)?.[0]!
    const model = part.match(/{([a-zA-Z_][\w]+)./)?.[1]!
    const field = part.match(/((?<=\.).*)}/)?.[1]!
    const closer = part.match(/\}/)?.[0]!

    try {
      assert(opener, `{`, errorMessage(part)) // This is a noop because of the opening check, but here for posterity
      assert(model, /^[a-zA-Z_][\w]+$/, errorMessage(part))
      assert(field, /^[a-zA-Z_][\w_()]+$/, errorMessage(part))
      assert(closer, `}`, errorMessage(part))
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
