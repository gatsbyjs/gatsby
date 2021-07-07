export enum StateKey {
  mimeTypeExcluded = `mimeTypeExcluded`,
  maxFileSizeBytesExceeded = `maxFileSizeBytesExceeded`,
}

interface IPostBuildWarningLogState {
  [StateKey.mimeTypeExcluded]: number
  [StateKey.maxFileSizeBytesExceeded]: number
}

const incrementReducerCreator = (stateKey: StateKey) => (
  state: IPostBuildWarningLogState
): IPostBuildWarningLogState => {
  state[stateKey]++

  return state
}

const postBuildWarningCounts = {
  state: {
    mimeTypeExcluded: 0,
    maxFileSizeBytesExceeded: 0,
  } as IPostBuildWarningLogState,
  reducers: {
    incrementMimeTypeExceeded: incrementReducerCreator(
      StateKey.mimeTypeExcluded
    ),
    incrementMaxFileSizeBytesExceeded: incrementReducerCreator(
      StateKey.maxFileSizeBytesExceeded
    ),
  },
}

export default postBuildWarningCounts
