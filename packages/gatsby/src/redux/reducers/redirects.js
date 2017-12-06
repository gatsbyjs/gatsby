module.exports = (state = [], action) => {
  switch (action.type) {
    case `CREATE_REDIRECT`:
      return [...state, action.payload]
    default:
      return state
  }
}
