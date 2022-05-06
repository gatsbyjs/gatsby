import { ActionsUnion, IGatsbyState } from "../types"

const initialState = {
  gatsbyImageSourceUrls: new Set<string>(),
}

export const telemetryReducer = (
  state: IGatsbyState["telemetry"] = initialState,
  action: ActionsUnion
): IGatsbyState["telemetry"] => {
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
    case `MERGE_WORKER_QUERY_STATE`: {
      const { queryStateTelemetryChunk } = action.payload
      const { gatsbyImageSourceUrls } = state

      return {
        ...state,
        ...queryStateTelemetryChunk,
        gatsbyImageSourceUrls: new Set([
          ...(queryStateTelemetryChunk?.gatsbyImageSourceUrls ?? []),
          ...gatsbyImageSourceUrls,
        ]),
      }
    }
    default: {
      return state
    }
  }
}
