const imageNodes = {
  state: {
    urls: new Set(),
    nodeMetaByUrl: {},
    nodeIds: [],
  },

  reducers: {
    setState(state, payload) {
      state = {
        ...state,
        ...payload,
      }

      return state
    },

    setNodeIds(_, payload) {
      return {
        nodeIds: payload,
      }
    },

    pushNodeMeta(state, { id, sourceUrl, modifiedGmt }) {
      state.nodeIds.push(id)
      state.nodeMetaByUrl[sourceUrl] = {
        id,
        modifiedGmt,
      }

      return state
    },

    addImgMatches(state, matches) {
      matches.forEach(match =>
        match.subMatches.forEach(subMatch => state.urls.add(subMatch))
      )

      return state
    },
  },
}

export default imageNodes
