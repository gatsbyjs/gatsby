module.exports = (state = {}, action) => {
  switch (action.type) {
    case "CREATE_NODE":
      return {
        ...state,
        [action.payload.id]: action.payload,
      };
    case "UPDATE_NODE":
      return {
        ...state,
        [action.payload.id]: action.payload,
      };
    default:
      return state;
  }
};
