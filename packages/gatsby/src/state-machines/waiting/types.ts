import type { Store, AnyAction } from "redux"
import type { IGatsbyState } from "../../redux/types"

export type IMutationAction = {
  type: string
  payload: Array<unknown>
}
export type IWaitingContext = {
  nodeMutationBatch: Array<IMutationAction>
  store?: Store<IGatsbyState, AnyAction> | undefined
  runningBatch: Array<IMutationAction>
  sourceFilesDirty?: boolean | undefined
}
