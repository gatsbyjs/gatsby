"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

const _ = require(`lodash`);

const _require = require(`gatsby/graphql`),
      graphql = _require.graphql,
      GraphQLObjectType = _require.GraphQLObjectType,
      GraphQLList = _require.GraphQLList,
      GraphQLSchema = _require.GraphQLSchema;

const _require2 = require(`../gatsby-node`),
      onCreateNode = _require2.onCreateNode;

const _require3 = require(`../../../gatsby/src/schema/infer-graphql-type`),
      inferObjectStructureFromNodes = _require3.inferObjectStructureFromNodes; // given a set of nodes and a query, return the result of the query


function queryResult(_x, _x2) {
  return _queryResult.apply(this, arguments);
}

function _queryResult() {
  _queryResult = (0, _asyncToGenerator2.default)(function* (nodes, fragment, {
    types = []
  } = {}) {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: `RootQueryType`,
        fields: () => {
          return {
            listNode: {
              name: `LISTNODE`,
              type: new GraphQLList(new GraphQLObjectType({
                name: `MarkdownRemark`,
                fields: inferObjectStructureFromNodes({
                  nodes,
                  types: [...types]
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
    const result = yield graphql(schema, `query {
            listNode {
                ${fragment}
            }
          }
        `);
    return result;
  });
  return _queryResult.apply(this, arguments);
}

describe(`Excerpt is generated correctly from schema`, () => {
  const node = {
    id: `whatever`,
    children: [],
    internal: {
      contentDigest: `whatever`,
      mediaType: `text/markdown`
    } // Make some fake functions its expecting.

  };

  const loadNodeContent = node => Promise.resolve(node.content);

  it(`correctly loads a default excerpt`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(function* () {
    const content = `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---
Where oh where is my little pony?
`;
    node.content = content;

    const createNode = markdownNode => {
      queryResult([markdownNode], `
                excerpt
                frontmatter {
                    title
                }
            `, {
        types: [{
          name: `MarkdownRemark`
        }]
      }).then(result => {
        expect(_.isString(result.data.listNode.excerpt));
      });
    };

    const createParentChildLink = jest.fn();
    const actions = {
      createNode,
      createParentChildLink
    };
    const createNodeId = jest.fn();
    createNodeId.mockReturnValue(`uuid-from-gatsby`);
    yield onCreateNode({
      node,
      loadNodeContent,
      actions,
      createNodeId
    });
  }));
});