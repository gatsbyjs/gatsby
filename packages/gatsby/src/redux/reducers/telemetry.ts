import { ActionsUnion, IGatsbyState } from "../types"

const initialState = {
  gatsbyImageResolver: new Set<string>(),
}

export const telemetryReducer = (
  state: IGatsbyState["telemetry"] = initialState,
  action: ActionsUnion
): IGatsbyState["telemetry"] => {
  switch (action.type) {
    case `PROCESS_GATSBY_IMAGE_SOURCE_URL`: {
      const { sourceUrl } = action.payload
      const nextState = new Set(state.gatsbyImageResolver)

      nextState.add(sourceUrl)

      console.log(`next state:`, nextState)
      console.log(...nextState)

      return {
        ...state,
        gatsbyImageResolver: nextState,
      }
    }
    default: {
      return { ...state }
    }
  }
}
