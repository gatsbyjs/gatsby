import { ActionsUnion, IGatsbyState } from "../types"

const initialState = {
  gatsbyImageSourceUrls: new Set<string>(),
}

export const telemetryReducer = (
  state: IGatsbyState["telemetry"] = initialState,
  action: ActionsUnion
): IGatsbyState["telemetry"] => {
  // @ts-ignore
  console.log(`telemetry reducer action`, action, action.payload)
  switch (action.type) {
    case `PROCESS_GATSBY_IMAGE_SOURCE_URL`: {
      const { sourceUrl } = action.payload
      const nextState = new Set(state.gatsbyImageSourceUrls)

      nextState.add(sourceUrl)

      return {
        ...state,
        gatsbyImageSourceUrls: nextState,
      }
    }
    case `CLEAR_GATSBY_IMAGE_SOURCE_URL`: {
      return {
        ...state,
        gatsbyImageSourceUrls: new Set<string>(),
      }
    }
    default: {
      return state
    }
  }
}
