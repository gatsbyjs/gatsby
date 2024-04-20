import type { IGatsbyState, ActionsUnion } from "../types"

export function remoteFileAllowedUrlsReducer(
  state: IGatsbyState["remoteFileAllowedUrls"] | undefined = new Set(),
  action: ActionsUnion,
): IGatsbyState["remoteFileAllowedUrls"] {
  switch (action.type) {
    case `ADD_REMOTE_FILE_ALLOWED_URL`: {
      for (const url of action.payload.urls) {
        state.add(url)
      }

      return state
    }
    default:
      return state
  }
}
