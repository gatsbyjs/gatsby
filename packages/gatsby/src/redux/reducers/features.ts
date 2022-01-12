import { IToggleFeatureAction, IGatsbyState } from "../types"

export const initialState: IGatsbyState["features"] = {
  imageService: false,
}

export const featuresReducer = (
  state: IGatsbyState["features"] = Object.assign({}, initialState),
  action: IToggleFeatureAction
): IGatsbyState["features"] => {
  switch (action.type) {
    case `TOGGLE_FEATURE`: {
      // when a feature got enabled we don't want plugins to disable it
      if (initialState[action.payload.name] !== action.payload.value) {
        state[action.payload.name] = action.payload.value
      }

      return state
    }
    default:
      return state
  }
}
