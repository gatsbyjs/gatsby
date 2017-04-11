module.exports = (state = { directory: `/` }, action) => {
  switch (action.type) {
    case "SET_PROGRAM":
      return {
        ...action.payload,
      };

    default:
      return state;
  }
};
