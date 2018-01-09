module.exports = (state = [], action) => {
  switch (action.type) {
    case `SET_SITE_API_TO_PLUGINS`:
      return { ...action.payload }
    default:
      return state
  }
}
