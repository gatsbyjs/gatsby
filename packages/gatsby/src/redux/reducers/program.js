module.exports = (
  state = { directory: `/`, state: `BOOTSTRAPPING` },
  action
) => {
  switch (action.type) {
    case `SET_PROGRAM`:
      return {
        ...action.payload,
      }

    case `SET_PROGRAM_EXTENSIONS`:
      return {
        ...state,
        extensions: action.payload,
      }

    case `SET_PROGRAM_STATUS`:
      return {
        ...state,
        status: `BOOTSTRAP_FINISHED`,
      }

    default:
      return state
  }
}
