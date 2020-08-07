import { IWaitingContext } from "../state-machines/waiting/types"
import { callRealApi } from "../utils/call-deferred-api"

// Consume the entire batch and run actions
export const runMutationBatch = async ({
  runningBatch = [],
  store,
}: Partial<IWaitingContext>): Promise<void[]> =>
  Promise.all(runningBatch.map(payload => callRealApi(payload, store)))
