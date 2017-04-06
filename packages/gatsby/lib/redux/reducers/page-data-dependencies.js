const _ = require("lodash");

module.exports = (state = { nodes: {}, connections: {} }, action) => {
  switch (action.type) {
    case "ADD_PAGE_DEPENDENCY":
      if (action.payload.path === "") {
        return state;
      }

      // If this nodeId not set yet.
      if (action.payload.nodeId) {
        if (!_.has(state, `nodes.${action.payload.nodeId}`)) {
          state.nodes[action.payload.nodeId] = [action.payload.path];
        } else {
          if (
            _.includes(state.nodes[action.payload.nodeId], action.payload.path)
          ) {
            state.nodes[action.payload.nodeId] = state.nodes[
              action.payload.nodeId
            ].concat([action.payload.path]);
          }
        }
      }

      // If this connection not set yet.
      if (action.payload.connection) {
        if (!_.has(state, `connections.${action.payload.connection}`)) {
          state.connections[action.payload.connection] = [action.payload.path];
        } else {
          if (
            !_.includes(
              state.connections[action.payload.connection],
              action.payload.path
            )
          ) {
            state.connections[action.payload.connection] = state.connections[
              action.payload.connection
            ].concat([action.payload.path]);
          }
        }
      }

      return state;
    default:
      return state;
  }
};
