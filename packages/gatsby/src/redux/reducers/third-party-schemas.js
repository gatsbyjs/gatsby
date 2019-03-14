module.exports = (state = [], action) => {
  switch (action.type) {
    case `ADD_THIRD_PARTY_SCHEMA`:
      return [...state, action.payload]
    default:
      return state
  }
}
