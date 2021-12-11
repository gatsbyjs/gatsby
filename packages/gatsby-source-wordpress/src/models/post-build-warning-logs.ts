import { createModel } from "@rematch/core"
import { RootModel } from "./index"

export enum StateKey {
  mimeTypeExcluded = `mimeTypeExcluded`,
  maxFileSizeBytesExceeded = `maxFileSizeBytesExceeded`,
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const incrementReducerCreator = stateKey => state => {
  state[stateKey]++

  return state
}

const postBuildWarningCounts = createModel<RootModel>()({
  state: {
    mimeTypeExcluded: 0,
    maxFileSizeBytesExceeded: 0,
  },
  reducers: {
    incrementMimeTypeExceeded: incrementReducerCreator(
      StateKey.mimeTypeExcluded
    ),
    incrementMaxFileSizeBytesExceeded: incrementReducerCreator(
      StateKey.maxFileSizeBytesExceeded
    ),
  },
})

export default postBuildWarningCounts
