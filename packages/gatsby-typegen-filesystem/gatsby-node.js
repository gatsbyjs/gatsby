"use strict";

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require("graphql"),
    GraphQLObjectType = _require.GraphQLObjectType,
    GraphQLNonNull = _require.GraphQLNonNull,
    GraphQLID = _require.GraphQLID,
    GraphQLList = _require.GraphQLList,
    GraphQLString = _require.GraphQLString,
    GraphQLInt = _require.GraphQLInt;

var _require2 = require("graphql-relay"),
    connectionFromArray = _require2.connectionFromArray,
    connectionArgs = _require2.connectionArgs,
    connectionDefinitions = _require2.connectionDefinitions;

var select = require("unist-util-select");
var parsePath = require("parse-filepath");
var path = require("path");
var _ = require("lodash");

var _require3 = require("../gatsby-graphql-utils"),
    nodeInterface = _require3.nodeInterface;

var inferGraphQLType = require("../gatsby/dist/schema/infer-graphql-type");

exports.registerGraphQLNodes = function (_ref) {
  var args = _ref.args;
  var ast = args.ast;

  var nodes = select(ast, "File");

  var fields = {
    urlPathname: {
      type: GraphQLString,
      description: "The relative path to this file converted to a sensible url pathname",
      resolve: function resolve(file) {
        var parsedPath = parsePath(file.relativePath);
        var dirname = parsedPath.dirname;
        var name = parsedPath.name;

        if (name === "template" || name === "index") {
          name = "";
        }
        // TODO url encode pathname?
        return path.posix.join("/", dirname, name, "/");
      }
    }
  };

  return [{
    type: "File",
    name: "File",
    fields: fields,
    nodes: nodes
  }];

  var fileType = new GraphQLObjectType({
    name: "File",
    fields: (0, _extends3.default)({}, inferredFields, nodeFields, customFields),
    interfaces: [nodeInterface],
    isTypeOf: function isTypeOf(value) {
      return value.type === "File";
    }
  });

  var _connectionDefinition = connectionDefinitions({
    nodeType: fileType,
    connectionFields: function connectionFields() {
      return {
        totalCount: {
          type: GraphQLInt
        }
      };
    }
  }),
      typeConnection = _connectionDefinition.connectionType;

  var types = {
    file: {
      type: fileType,
      args: (0, _extends3.default)({}, inferredFields),
      resolve: function resolve(arg, inputArgs) {
        return _.find(nodes, function (file) {
          return (
            // Check if any of input args don't match the file's value.
            // If they don't match, return false so we go onto the next file.
            !_.some(inputArgs, function (v, k) {
              return file[k] !== v;
            })
          );
        });
      }
    },
    allFile: {
      type: typeConnection,
      description: "Connection to all file nodes",
      args: (0, _extends3.default)({}, connectionArgs),
      resolve: function resolve(object, resolveArgs) {
        var result = connectionFromArray(nodes, resolveArgs);
        result.totalCount = nodes.length;
        return result;
      }
    }
  };

  return types;
};