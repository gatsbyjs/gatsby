'use strict';

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _graphqlRelay = require('graphql-relay');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('graphql'),
    GraphQLInterfaceType = _require.GraphQLInterfaceType,
    GraphQLNonNull = _require.GraphQLNonNull,
    GraphQLID = _require.GraphQLID,
    GraphQLList = _require.GraphQLList,
    GraphQLInt = _require.GraphQLInt;

exports.createConnection = function (nodeType, nodesArray) {
  // Create connection for nodeType
  var _connectionDefinition = (0, _graphqlRelay.connectionDefinitions)({
    nodeType: nodeType,
    connectionFields: function connectionFields() {
      return {
        totalCount: {
          type: GraphQLInt
        }
      };
    }
  }),
      typeConnection = _connectionDefinition.connectionType;

  return {
    type: typeConnection,
    args: (0, _extends3.default)({}, _graphqlRelay.connectionArgs),
    resolve: function resolve(object, args) {
      var result = (0, _graphqlRelay.connectionFromArray)(nodesArray, args);
      result.totalCount = nodesArray.length;
      return result;
    }
  };
};
var nodeInterface = new GraphQLInterfaceType({
  name: 'Node',
  description: 'An object with an id, parent, and children',
  fields: function fields() {
    return {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The id of the node.'
      },
      parent: {
        type: nodeInterface,
        description: 'The parent of this node.'
      },
      children: {
        type: new GraphQLList(nodeInterface),
        description: 'The children of this node.'
      }
    };
  }
});

exports.nodeInterface = nodeInterface;