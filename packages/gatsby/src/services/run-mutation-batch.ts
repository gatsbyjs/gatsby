import { IMutationAction } from "../state-machines/data-layer/types"
import { Store, AnyAction } from "redux"
import { IGatsbyState } from "../redux/types"
import { IWaitingContext } from "../state-machines/waiting/types"
import { assertStore } from "../utils/assert-store"
import { actions } from "../redux/actions"

const callRealApi = (
  event: IMutationAction,
  store?: Store<IGatsbyState, AnyAction>
): void => {
  assertStore(store)
  const { type, payload } = event
  if (type in actions) {
    store.dispatch(actions[type](...payload))
  }
}

// Consume the entire batch and run actions
export const runMutationBatch = async ({
  runningBatch = [],
  store,
}: Partial<IWaitingContext>): Promise<void[]> =>
  Promise.all(runningBatch.map(payload => callRealApi(payload, store)))
