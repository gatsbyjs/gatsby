var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

var _ = require(`lodash`);

var _require = require(`graphql`),
    graphql = _require.graphql,
    GraphQLObjectType = _require.GraphQLObjectType,
    GraphQLList = _require.GraphQLList,
    GraphQLSchema = _require.GraphQLSchema;

var _require2 = require(`../gatsby-node`),
    onCreateNode = _require2.onCreateNode;

var _require3 = require(`../../../gatsby/src/schema/infer-graphql-type`),
    inferObjectStructureFromNodes = _require3.inferObjectStructureFromNodes; // given a set of nodes and a query, return the result of the query


function queryResult(_x, _x2, _x3) {
  return _queryResult.apply(this, arguments);
}

function _queryResult() {
  _queryResult = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee2(nodes, fragment, _temp) {
    var _ref2, _ref2$types, types, schema, result;

    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _ref2 = _temp === void 0 ? {} : _temp, _ref2$types = _ref2.types, types = _ref2$types === void 0 ? [] : _ref2$types;
            schema = new GraphQLSchema({
              query: new GraphQLObjectType({
                name: `RootQueryType`,
                fields: function fields() {
                  return {
                    listNode: {
                      name: `LISTNODE`,
                      type: new GraphQLList(new GraphQLObjectType({
                        name: `MarkdownRemark`,
                        fields: inferObjectStructureFromNodes({
                          nodes,
                          types: types.concat()
                        })
                      })),

                      resolve() {
                        return nodes;
                      }

                    }
                  };
                }
              })
            });
            _context2.next = 4;
            return graphql(schema, `query {
            listNode {
                ${fragment}
            }
          }
        `);

          case 4:
            result = _context2.sent;
            return _context2.abrupt("return", result);

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));
  return _queryResult.apply(this, arguments);
}

describe(`Excerpt is generated correctly from schema`, function () {
  var node = {
    id: `whatever`,
    children: [],
    internal: {
      contentDigest: `whatever`,
      mediaType: `text/markdown`
    } // Make some fake functions its expecting.

  };

  var loadNodeContent = function loadNodeContent(node) {
    return Promise.resolve(node.content);
  };

  it(`correctly loads a default excerpt`,
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee() {
    var content, createNode, createParentChildLink, actions;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            content = `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---
Where oh where is my little pony?
`;
            node.content = content;

            createNode = function createNode(markdownNode) {
              queryResult([markdownNode], `
                excerpt
                frontmatter {
                    title
                }
            `, {
                types: [{
                  name: `MarkdownRemark`
                }]
              }).then(function (result) {
                expect(_.isString(result.data.listNode.excerpt));
              });
            };

            createParentChildLink = jest.fn();
            actions = {
              createNode,
              createParentChildLink
            };
            _context.next = 7;
            return onCreateNode({
              node,
              loadNodeContent,
              actions
            });

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  })));
});