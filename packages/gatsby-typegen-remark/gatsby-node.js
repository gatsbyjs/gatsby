"use strict";

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require("graphql"),
    GraphQLObjectType = _require.GraphQLObjectType,
    GraphQLList = _require.GraphQLList,
    GraphQLString = _require.GraphQLString,
    GraphQLInt = _require.GraphQLInt;

var _require2 = require("graphql-relay"),
    connectionFromArray = _require2.connectionFromArray,
    connectionArgs = _require2.connectionArgs,
    connectionDefinitions = _require2.connectionDefinitions;

var Remark = require("remark");
var remarkHtml = require("remark-html");
var excerptHTML = require("excerpt-html");
var select = require("unist-util-select");
var sanitizeHTML = require("sanitize-html");
var _ = require("lodash");

var _require3 = require("../gatsby-graphql-utils"),
    nodeInterface = _require3.nodeInterface;

exports.registerGraphQLNodes = function (_ref) {
  var args = _ref.args;

  // Setup Remark.
  var remark = Remark({ commonmark: true });
  var htmlCompiler = {};
  remarkHtml(htmlCompiler);

  var ast = args.ast;

  var nodes = select(ast, "Markdown");

  var getAST = function getAST(markdownNode) {
    if (markdownNode.ast) {
      return markdownNode;
    } else {
      markdownNode.ast = remark.parse(markdownNode.src);
      return markdownNode;
    }
  };

  var getHeadings = function getHeadings(markdownNode) {
    if (markdownNode.headings) {
      return markdownNode;
    } else {
      var _getAST = getAST(markdownNode),
          _ast = _getAST.ast;

      markdownNode.headings = select(_ast, "heading").map(function (heading) {
        return {
          value: _.first(select(heading, "text").map(function (text) {
            return text.value;
          })),
          depth: heading.depth
        };
      });

      return markdownNode;
    }
  };

  var getHTML = function getHTML(markdownNode) {
    if (markdownNode.html) {
      return markdownNode;
    } else {
      markdownNode.html = htmlCompiler.Compiler.prototype.compile(getAST(markdownNode).ast);
      return markdownNode;
    }
  };

  var HeadingType = new GraphQLObjectType({
    name: "MarkdownHeading",
    fields: {
      value: {
        type: GraphQLString,
        resolve: function resolve(heading) {
          return heading.value;
        }
      },
      depth: {
        type: GraphQLInt,
        resolve: function resolve(heading) {
          return heading.depth;
        }
      }
    }
  });

  var fields = {
    html: {
      type: GraphQLString,
      resolve: function resolve(markdownNode) {
        return getHTML(markdownNode).html;
      }
    },
    src: {
      type: GraphQLString
    },
    excerpt: {
      type: GraphQLString,
      args: {
        pruneLength: {
          type: GraphQLInt,
          defaultValue: 140
        }
      },
      resolve: function resolve(markdownNode, _ref2) {
        var pruneLength = _ref2.pruneLength;

        return excerptHTML(getHTML(markdownNode).html, { pruneLength: pruneLength });
      }
    },
    headings: {
      type: new GraphQLList(HeadingType),
      resolve: function resolve(markdownNode) {
        return getHeadings(markdownNode).headings;
      }
    },
    timeToRead: {
      type: GraphQLInt,
      resolve: function resolve(markdownNode) {
        var timeToRead = 0;
        var pureText = sanitizeHTML(getHTML(markdownNode).html, { allowTags: [] });
        var avgWPM = 265;
        var wordCount = _.words(pureText).length;
        timeToRead = Math.round(wordCount / avgWPM);
        if (timeToRead === 0) {
          timeToRead = 1;
        }
        return timeToRead;
      }
    }
  };

  return [{
    type: "Markdown",
    name: "MarkdownRemark",
    fields: fields,
    nodes: nodes
  }];

  var markdownType = new GraphQLObjectType({
    name: "MarkdownRemark",
    fields: fields,
    interfaces: [nodeInterface],
    isTypeOf: function isTypeOf(value) {
      return value.type === "Markdown";
    }
  });

  var _connectionDefinition = connectionDefinitions({
    nodeType: markdownType,
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
    allMarkdown: {
      type: typeConnection,
      description: "Connection to all markdown nodes",
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