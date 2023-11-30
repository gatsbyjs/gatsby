import { IGatsbyState, ActionsUnion } from "../types"

export const imageCdnAllowedUrlsReducer = (
  state: IGatsbyState["imageCdnAllowedUrls"] = new Set(),
  action: ActionsUnion
): IGatsbyState["imageCdnAllowedUrls"] => {
  switch (action.type) {
    case `ADD_IMAGE_CDN_ALLOWED_URL`: {
      for (const url of action.payload.urls) {
        state.add(url)
      }

      return state
    }
    default:
      return state
  }
}
