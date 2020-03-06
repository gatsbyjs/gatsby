module.exports = (
  state = { directory: `/`, state: `BOOTSTRAPPING`, dbType: `` },
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

    case `SET_DB_TYPE`:
      return {
        ...state,
        dbType: action.payload,
      }

    default:
      return state
  }
}
