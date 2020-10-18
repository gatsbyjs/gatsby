import { Store } from "redux"
import reporter from "gatsby-cli/lib/reporter"

export function assertStore(store?: Store): asserts store {
  if (!store) {
    reporter.panic(`Could not find Redux store`)
  }
}
