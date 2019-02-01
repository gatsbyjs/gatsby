module.exports = (
  state = {
    composer: null,
  },
  action
) => {
  switch (action.type) {
    case `SET_SCHEMA_COMPOSER`:
      return {
        composer: action.payload,
        ...state,
      }
    default:
      return state
  }
}
