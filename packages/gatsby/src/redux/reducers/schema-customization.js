module.exports = (
  state = {
    composer: null,
    fieldExtensions: {},
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
      if (Array.isArray(action.payload)) {
        types = [
          ...state.types,
          ...action.payload.map(typeOrTypeDef => {
            return {
              typeOrTypeDef,
              plugin: action.plugin,
            }
          }),
        ]
      } else {
        types = [
          ...state.types,
          { typeOrTypeDef: action.payload, plugin: action.plugin },
        ]
      }
      return {
        ...state,
        types,
      }
    }
    case `CREATE_FIELD_EXTENSION`: {
      const { extension, name } = action.payload
      return {
        ...state,
        fieldExtensions: { ...state.fieldExtensions, [name]: extension },
      }
    }
    case `DELETE_CACHE`:
      return {
        composer: null,
        fieldExtensions: {},
        thirdPartySchemas: [],
        types: [],
      }
    default:
      return state
  }
}
