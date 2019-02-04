module.exports = (
  state = {
    composer: null,
  },
  action
) => {
  switch (action.type) {
    case `SET_SCHEMA_COMPOSER`:
      return {
        ...state,
        composer: action.payload,
      }
    default:
      return state
  }
}
