import { Store, AnyAction } from "redux"
import { IGatsbyState } from "../../redux/types"

export interface IMutationAction {
  type: string
  payload: unknown[]
}
export interface IWaitingContext {
  nodeMutationBatch: IMutationAction[]
  store?: Store<IGatsbyState, AnyAction>
  runningBatch: IMutationAction[]
  filesDirty?: boolean
  webhookBody?: Record<string, unknown>
}
