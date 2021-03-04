import { stripImageSizesFromUrl } from "~/steps/source-nodes/fetch-nodes/fetch-referenced-media-items"

const imageNodes = {
  state: {
    nodeMetaByUrl: {},
  },

  reducers: {
    setState(state, payload) {
      state = {
        ...state,
        ...payload,
      }

      return state
    },

    pushNodeMeta(state, { id, sourceUrl, modifiedGmt }) {
      const nodeUrl = stripImageSizesFromUrl(sourceUrl)
      // don't overwrite the lookup table in case we have multiple
      // sized urls for the same image
      if (!state.nodeMetaByUrl[nodeUrl]) {
        state.nodeMetaByUrl[nodeUrl] = {
          id,
          modifiedGmt,
        }
      }

      return state
    },
  },
}

export default imageNodes
