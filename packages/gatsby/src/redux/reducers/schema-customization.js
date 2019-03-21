const _ = require(`lodash`)
module.exports = (
  state = {
    composer: null,
    thirdPartySchemas: [],
    types: [],
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
    case `CREATE_TYPES`: {
      let types
      if (_.isArray(action.payload)) {
        types = [...state.types, ...action.payload]
      } else {
        types = [...state.types, action.payload]
      }
      return {
        ...state,
        types,
      }
    }
    case `DELETE_CACHE`:
      return {
        composer: null,
        thirdPartySchemas: [],
        types: [],
      }
    default:
      return state
  }
}
