import sysPath from "path"
import { Reporter } from "gatsby"
import { CODES } from "./error-utils"

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
    if (!part.startsWith(`{`)) return

    const opener = part.slice(0)
    const model = part.match(/{([a-zA-Z]+)./)?.[1]!
    const field = part.match(/\.([a-zA-Z_()]+)}/)?.[1]!
    const closer = part.match(/\}/)?.[0]!

    try {
      assert(opener, `{`) // This is a noop because of the opening check, but here for posterity
      assert(model, /^[A-Z][a-zA-Z]+$/)
      assert(field, /^[a-zA-Z_()]+$/)
      assert(closer, `}`)
    } catch (e) {
      reporter.panicOnBuild({
        id: CODES.CollectionPath,
        context: {
          sourceMessage: `Collection page builder encountered an error parsing the filepath. To use collection paths the schema to follow is {Model.field}. The problematic part is: ${part}.`,
        },
        filePath: filePath,
      })
      passing = false
    }
  })
  return passing
}

function assert(part: string, matches: string | RegExp): void {
  const regexp = matches instanceof RegExp ? matches : new RegExp(matches)

  if (!part || regexp.test(part) === false) {
    throw new Error()
  }
}
