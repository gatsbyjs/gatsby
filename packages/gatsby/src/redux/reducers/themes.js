module.exports = (state = {}, action) => {
  switch (action.type) {
    case `SET_RESOLVED_THEMES`:
      return {
        ...state,
        themes: action.payload,
      }

    default:
      return state
  }
}
