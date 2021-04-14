import { assertStore } from "./assert-store"
import { Store } from "redux"
import { IMutationAction } from "../services"
import { actions } from "../redux/actions"
import reporter from "gatsby-cli/lib/reporter"
/**
 * These are the deferred redux actions sent from api-runner-node
 * They may include a `resolve` prop (if they are createNode actions).
 * If so, we resolve the promise when we're done
 */
export const callRealApi = (event: IMutationAction, store?: Store): void => {
  assertStore(store)
  const { type, payload, resolve } = event
  if (type in actions) {
    // If this is a createNode action then this will be a thunk.
    // No worries, we just dispatch it like any other
    const action = actions[type](...payload)
    const result = store.dispatch(action)
    // Somebody may be waiting for this
    if (resolve) {
      resolve(result)
    }
  } else {
    reporter.log(`Could not dispatch unknown action "${type}`)
  }
}
