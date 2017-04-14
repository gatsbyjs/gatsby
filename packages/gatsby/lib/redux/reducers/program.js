module.exports = (state = { directory: `/` }, action) => {
  switch (action.type) {
    case "SET_PROGRAM":
      return {
        ...action.payload,
      }

    case "SET_PROGRAM_EXTENSIONS":
      return {
        ...state,
        extensions: action.payload,
      }

    default:
      return state
  }
}
