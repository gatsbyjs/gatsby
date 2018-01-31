var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

var Promise = require(`bluebird`);

var _ = require(`lodash`);

var _require = require(`../gatsby-node`),
    onCreateNode = _require.onCreateNode;

var _require2 = require(`graphql`),
    graphql = _require2.graphql,
    GraphQLObjectType = _require2.GraphQLObjectType,
    GraphQLList = _require2.GraphQLList,
    GraphQLSchema = _require2.GraphQLSchema;

var _require3 = require(`../../../gatsby/src/schema/infer-graphql-type`),
    inferObjectStructureFromNodes = _require3.inferObjectStructureFromNodes;

describe(`Process markdown content correctly`, function () {
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

  describe(`Process generated markdown node correctly`, function () {
    it(`Correctly creates a new MarkdownRemark node`,
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
              createNode = jest.fn();
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
              }).then(function () {
                expect(createNode.mock.calls).toMatchSnapshot();
                expect(_.isString(createNode.mock.calls[0][0].frontmatter.date)).toBeTruthy();
                expect(createParentChildLink.mock.calls).toMatchSnapshot();
                expect(createNode).toHaveBeenCalledTimes(1);
                expect(createParentChildLink).toHaveBeenCalledTimes(1);
              });

            case 7:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    })));
    it(`Correctly parses a graymatter excerpt`,
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    _regeneratorRuntime.mark(function _callee2() {
      var content, createNode, createParentChildLink, actions;
      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              content = `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi auctor sit amet velit id facilisis. Nulla viverra, eros at efficitur pulvinar, lectus orci accumsan nisi, eu blandit elit nulla nec lectus. Integer porttitor imperdiet sapien. Quisque in orci sed nisi consequat aliquam. Aenean id mollis nisi. Sed auctor odio id erat facilisis venenatis. Quisque posuere faucibus libero vel fringilla.

In quis lectus sed eros efficitur luctus. Morbi tempor, nisl eget feugiat tincidunt, sem velit vulputate enim, nec interdum augue enim nec mauris. Nulla iaculis ante sed enim placerat pretium. Nulla metus odio, facilisis vestibulum lobortis vitae, bibendum at nunc. Donec sit amet efficitur metus, in bibendum nisi. Vivamus tempus vel turpis sit amet auctor. Maecenas luctus vestibulum velit, at sagittis leo volutpat quis. Praesent posuere nec augue eget sodales. Pellentesque vitae arcu ut est varius venenatis id maximus sem. Curabitur non consectetur turpis.

<!-- end -->

Maecenas sodales, arcu at dictum porta, sapien leo consectetur metus, nec rhoncus quam mauris vel odio. Vivamus sed sapien in massa pulvinar feugiat vel eu tellus. Nam rutrum sem nisi, vitae viverra erat varius ut. Praesent fringilla, metus in condimentum varius, ligula augue efficitur dolor, at tempus velit velit id arcu. Suspendisse urna est, blandit ac lacus id, efficitur semper purus. Etiam dignissim suscipit lorem accumsan ultricies. Duis lacinia tortor sapien, sed malesuada leo molestie nec. Sed lobortis varius ipsum, eu lobortis metus malesuada consequat. Sed purus nulla, tempor ac tincidunt et, blandit vel ex. Vestibulum id dolor non nulla posuere consectetur quis et turpis. Cras dolor metus, elementum a enim at, semper bibendum sapien. Sed lacus augue, laoreet in metus id, volutpat malesuada mauris.

Sed eu gravida mauris. Suspendisse potenti. Praesent sit amet egestas mi, sed hendrerit eros. Vestibulum congue scelerisque magna, id viverra justo congue nec. Duis id dapibus metus, et dictum erat. Nulla rhoncus a mauris nec tincidunt. Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec elementum molestie ullamcorper. Nulla pulvinar feugiat mauris, placerat malesuada ligula rutrum non. Integer venenatis ex at dignissim fermentum. Nunc bibendum nulla in purus pharetra, non sodales justo fringilla.

Sed bibendum sem iaculis, pellentesque leo sed, imperdiet ante. Sed consequat mattis dui nec pretium. Donec vel consectetur est. Nam sagittis, libero vitae pretium pharetra, velit est dignissim erat, at cursus quam massa vitae ligula. Suspendisse potenti. In hac habitasse platea dictumst. Donec sit amet finibus justo. Mauris ante dolor, pulvinar vitae feugiat eu, rhoncus nec diam. In ut accumsan diam, faucibus fringilla odio. Nunc id ultricies turpis. Quisque justo quam, tristique sit amet interdum quis, facilisis at mi. Fusce porttitor vel sem ut condimentum. Praesent at libero congue, vulputate elit ut, rhoncus erat.
            `;
              node.content = content;
              createNode = jest.fn();
              createParentChildLink = jest.fn();
              actions = {
                createNode,
                createParentChildLink
              };
              _context2.next = 7;
              return onCreateNode({
                node,
                loadNodeContent,
                actions
              }, {
                excerpt_separator: `<!-- end -->`
              }).then(function () {
                expect(createNode.mock.calls).toMatchSnapshot();
                expect(_.isString(createNode.mock.calls[0][0].excerpt)).toBeTruthy();
                expect(createNode.mock.calls[0][0].excerpt).not.toEqual(0);
                expect(createParentChildLink.mock.calls).toMatchSnapshot();
                expect(createNode).toHaveBeenCalledTimes(1);
                expect(createParentChildLink).toHaveBeenCalledTimes(1);
              });

            case 7:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    })));
  });
  describe(`process graphql correctly`, function () {
    // given a set of nodes and a query, return the result of the query
    function queryResult(_x, _x2, _x3) {
      return _queryResult.apply(this, arguments);
    }

    function _queryResult() {
      _queryResult = _asyncToGenerator(
      /*#__PURE__*/
      _regeneratorRuntime.mark(function _callee3(nodes, fragment, _temp) {
        var _ref3, _ref3$types, types, schema, result;

        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _ref3 = _temp === void 0 ? {} : _temp, _ref3$types = _ref3.types, types = _ref3$types === void 0 ? [] : _ref3$types;
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
                _context3.next = 4;
                return graphql(schema, `query {
                    listNode {
                        ${fragment}
                    }
                }
                `);

              case 4:
                result = _context3.sent;
                return _context3.abrupt("return", result);

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));
      return _queryResult.apply(this, arguments);
    }

    it(`Correctly queries an excerpt for a node with an excerpt separator`, function (done) {
      var content = `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi auctor sit amet velit id facilisis. Nulla viverra, eros at efficitur pulvinar, lectus orci accumsan nisi, eu blandit elit nulla nec lectus. Integer porttitor imperdiet sapien. Quisque in orci sed nisi consequat aliquam. Aenean id mollis nisi. Sed auctor odio id erat facilisis venenatis. Quisque posuere faucibus libero vel fringilla.

In quis lectus sed eros efficitur luctus. Morbi tempor, nisl eget feugiat tincidunt, sem velit vulputate enim, nec interdum augue enim nec mauris. Nulla iaculis ante sed enim placerat pretium. Nulla metus odio, facilisis vestibulum lobortis vitae, bibendum at nunc. Donec sit amet efficitur metus, in bibendum nisi. Vivamus tempus vel turpis sit amet auctor. Maecenas luctus vestibulum velit, at sagittis leo volutpat quis. Praesent posuere nec augue eget sodales. Pellentesque vitae arcu ut est varius venenatis id maximus sem. Curabitur non consectetur turpis.

<!-- end -->

Maecenas sodales, arcu at dictum porta, sapien leo consectetur metus, nec rhoncus quam mauris vel odio. Vivamus sed sapien in massa pulvinar feugiat vel eu tellus. Nam rutrum sem nisi, vitae viverra erat varius ut. Praesent fringilla, metus in condimentum varius, ligula augue efficitur dolor, at tempus velit velit id arcu. Suspendisse urna est, blandit ac lacus id, efficitur semper purus. Etiam dignissim suscipit lorem accumsan ultricies. Duis lacinia tortor sapien, sed malesuada leo molestie nec. Sed lobortis varius ipsum, eu lobortis metus malesuada consequat. Sed purus nulla, tempor ac tincidunt et, blandit vel ex. Vestibulum id dolor non nulla posuere consectetur quis et turpis. Cras dolor metus, elementum a enim at, semper bibendum sapien. Sed lacus augue, laoreet in metus id, volutpat malesuada mauris.

Sed eu gravida mauris. Suspendisse potenti. Praesent sit amet egestas mi, sed hendrerit eros. Vestibulum congue scelerisque magna, id viverra justo congue nec. Duis id dapibus metus, et dictum erat. Nulla rhoncus a mauris nec tincidunt. Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec elementum molestie ullamcorper. Nulla pulvinar feugiat mauris, placerat malesuada ligula rutrum non. Integer venenatis ex at dignissim fermentum. Nunc bibendum nulla in purus pharetra, non sodales justo fringilla.

Sed bibendum sem iaculis, pellentesque leo sed, imperdiet ante. Sed consequat mattis dui nec pretium. Donec vel consectetur est. Nam sagittis, libero vitae pretium pharetra, velit est dignissim erat, at cursus quam massa vitae ligula. Suspendisse potenti. In hac habitasse platea dictumst. Donec sit amet finibus justo. Mauris ante dolor, pulvinar vitae feugiat eu, rhoncus nec diam. In ut accumsan diam, faucibus fringilla odio. Nunc id ultricies turpis. Quisque justo quam, tristique sit amet interdum quis, facilisis at mi. Fusce porttitor vel sem ut condimentum. Praesent at libero congue, vulputate elit ut, rhoncus erat.
            `;
      node.content = content;
      var createdNode;

      var createNode = function createNode(markdownNode) {
        return queryResult([markdownNode], `
                    excerpt
                    frontmatter {
                        title
                    }
                `, {
          types: [{
            name: `MarkdownRemark`
          }]
        }).then(function (result) {
          try {
            createdNode = result.data.listNode[0];
            expect(createdNode).toMatchSnapshot();
            expect(createdNode.excerpt).toMatch(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi auctor sit amet velit id facilisis. Nulla viverra, eros at efficitur pulvinar, lectus orci accumsan nisi, eu blandit elit nulla nec lectus. Integer porttitor imperdiet sapien. Quisque in orci sed nisi consequat aliquam. Aenean id mollis nisi. Sed auctor odio id erat facilisis venenatis. Quisque posuere faucibus libero vel fringilla.

In quis lectus sed eros efficitur luctus. Morbi tempor, nisl eget feugiat tincidunt, sem velit vulputate enim, nec interdum augue enim nec mauris. Nulla iaculis ante sed enim placerat pretium. Nulla metus odio, facilisis vestibulum lobortis vitae, bibendum at nunc. Donec sit amet efficitur metus, in bibendum nisi. Vivamus tempus vel turpis sit amet auctor. Maecenas luctus vestibulum velit, at sagittis leo volutpat quis. Praesent posuere nec augue eget sodales. Pellentesque vitae arcu ut est varius venenatis id maximus sem. Curabitur non consectetur turpis.

`);
            done();
          } catch (err) {
            done.fail(err);
          }
        });
      };

      var createParentChildLink = jest.fn();
      var actions = {
        createNode,
        createParentChildLink
      };
      onCreateNode({
        node,
        loadNodeContent,
        actions
      }, {
        excerpt_separator: `<!-- end -->`
      });
    });
    it(`Correctly queries an excerpt for a node without an excerpt separator`, function (done) {
      var content = `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi auctor sit amet velit id facilisis. Nulla viverra, eros at efficitur pulvinar, lectus orci accumsan nisi, eu blandit elit nulla nec lectus. Integer porttitor imperdiet sapien. Quisque in orci sed nisi consequat aliquam. Aenean id mollis nisi. Sed auctor odio id erat facilisis venenatis. Quisque posuere faucibus libero vel fringilla.

In quis lectus sed eros efficitur luctus. Morbi tempor, nisl eget feugiat tincidunt, sem velit vulputate enim, nec interdum augue enim nec mauris. Nulla iaculis ante sed enim placerat pretium. Nulla metus odio, facilisis vestibulum lobortis vitae, bibendum at nunc. Donec sit amet efficitur metus, in bibendum nisi. Vivamus tempus vel turpis sit amet auctor. Maecenas luctus vestibulum velit, at sagittis leo volutpat quis. Praesent posuere nec augue eget sodales. Pellentesque vitae arcu ut est varius venenatis id maximus sem. Curabitur non consectetur turpis.

Maecenas sodales, arcu at dictum porta, sapien leo consectetur metus, nec rhoncus quam mauris vel odio. Vivamus sed sapien in massa pulvinar feugiat vel eu tellus. Nam rutrum sem nisi, vitae viverra erat varius ut. Praesent fringilla, metus in condimentum varius, ligula augue efficitur dolor, at tempus velit velit id arcu. Suspendisse urna est, blandit ac lacus id, efficitur semper purus. Etiam dignissim suscipit lorem accumsan ultricies. Duis lacinia tortor sapien, sed malesuada leo molestie nec. Sed lobortis varius ipsum, eu lobortis metus malesuada consequat. Sed purus nulla, tempor ac tincidunt et, blandit vel ex. Vestibulum id dolor non nulla posuere consectetur quis et turpis. Cras dolor metus, elementum a enim at, semper bibendum sapien. Sed lacus augue, laoreet in metus id, volutpat malesuada mauris.

Sed eu gravida mauris. Suspendisse potenti. Praesent sit amet egestas mi, sed hendrerit eros. Vestibulum congue scelerisque magna, id viverra justo congue nec. Duis id dapibus metus, et dictum erat. Nulla rhoncus a mauris nec tincidunt. Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec elementum molestie ullamcorper. Nulla pulvinar feugiat mauris, placerat malesuada ligula rutrum non. Integer venenatis ex at dignissim fermentum. Nunc bibendum nulla in purus pharetra, non sodales justo fringilla.

Sed bibendum sem iaculis, pellentesque leo sed, imperdiet ante. Sed consequat mattis dui nec pretium. Donec vel consectetur est. Nam sagittis, libero vitae pretium pharetra, velit est dignissim erat, at cursus quam massa vitae ligula. Suspendisse potenti. In hac habitasse platea dictumst. Donec sit amet finibus justo. Mauris ante dolor, pulvinar vitae feugiat eu, rhoncus nec diam. In ut accumsan diam, faucibus fringilla odio. Nunc id ultricies turpis. Quisque justo quam, tristique sit amet interdum quis, facilisis at mi. Fusce porttitor vel sem ut condimentum. Praesent at libero congue, vulputate elit ut, rhoncus erat.
            `;
      node.content = content;
      var createdNode;

      var createNode = function createNode(markdownNode) {
        return queryResult([markdownNode], `
                    excerpt
                    frontmatter {
                        title
                    }
                `, {
          types: [{
            name: `MarkdownRemark`
          }]
        }).then(function (result) {
          try {
            createdNode = result.data.listNode[0];
            expect(createdNode).toMatchSnapshot();
            expect(createdNode.excerpt).toMatch(``);
            done();
          } catch (err) {
            done.fail(err);
          }
        });
      };

      var createParentChildLink = jest.fn();
      var actions = {
        createNode,
        createParentChildLink
      };
      onCreateNode({
        node,
        loadNodeContent,
        actions
      });
    });
  });
});