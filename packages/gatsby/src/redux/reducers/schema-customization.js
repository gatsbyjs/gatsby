module.exports = (
  state = {
    composer: null,
    thirdPartySchemas: [],
    typeDefs: [],
  },
  action
) => {
  switch (action.type) {
    case `ADD_THIRD_PARTY_SCHEMA`:
      return {
        ...state,
        thirdPartySchemas: [...state.thirdPartySchemas, action.payload],
      }
    case `SET_SCHEMA_COMPOSER`:
      return {
        ...state,
        composer: action.payload,
      }
    case `ADD_TYPE_DEFS`:
      return {
        ...state,
        typeDefs: [...state.typeDefs, action.payload],
      }
    default:
      return state
  }
}
