import type { IWaitingContext } from "../state-machines/waiting/types"
import { callRealApi } from "../utils/call-deferred-api"

// Consume the entire batch and run actions
export async function runMutationBatch({
  runningBatch = [],
  store,
}: Partial<IWaitingContext>): Promise<Array<void>> {
  return Promise.all(runningBatch.map(payload => callRealApi(payload, store)))
}
