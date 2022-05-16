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
      state.gatsbyImageSourceUrls.add(sourceUrl)
      return state
    }
    case `CLEAR_GATSBY_IMAGE_SOURCE_URL`: {
      state.gatsbyImageSourceUrls = new Set<string>()
      return state
    }
    case `MERGE_WORKER_QUERY_STATE`: {
      const { queryStateTelemetryChunk } = action.payload

      const urlsFromWorker =
        queryStateTelemetryChunk.gatsbyImageSourceUrls || new Set<string>()

      urlsFromWorker.forEach(url => {
        state.gatsbyImageSourceUrls.add(url)
      })

      return state
    }
    default: {
      return state
    }
  }
}
