import { createModel } from "@rematch/core"
import type { IRootModel } from "."

export enum StateKey {
  mimeTypeExcluded = `mimeTypeExcluded`,
  maxFileSizeBytesExceeded = `maxFileSizeBytesExceeded`,
}

type IPostBuildWarningLogState = {
  [StateKey.mimeTypeExcluded]: number
  [StateKey.maxFileSizeBytesExceeded]: number
}

function incrementReducerCreator(
  stateKey: StateKey,
): (state: IPostBuildWarningLogState) => IPostBuildWarningLogState {
  return (state: IPostBuildWarningLogState): IPostBuildWarningLogState => {
    state[stateKey]++

    return state
  }
}

const postBuildWarningCounts = createModel<IRootModel>()({
  state: {
    mimeTypeExcluded: 0,
    maxFileSizeBytesExceeded: 0,
  } as IPostBuildWarningLogState,
  reducers: {
    incrementMimeTypeExceeded: incrementReducerCreator(
      StateKey.mimeTypeExcluded,
    ),
    incrementMaxFileSizeBytesExceeded: incrementReducerCreator(
      StateKey.maxFileSizeBytesExceeded,
    ),
  },
  effects: () => {
    return {}
  },
})

export default postBuildWarningCounts
