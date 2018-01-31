var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

var _require = require(`../gatsby-node`),
    onCreateNode = _require.onCreateNode;

describe(`Process TOML nodes correctly`, function () {
  var node = {
    id: `whatever`,
    parent: `SOURCE`,
    children: [],
    extension: `toml`,
    internal: {
      contentDigest: `whatever`
    },
    name: `test` // Provide fake functions

  };

  var loadNodeContent = function loadNodeContent(node) {
    return Promise.resolve(node.content);
  };

  it(`Correctly creates nodes from TOML test file`,
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee() {
    var createNode, createParentChildLink, actions;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // Unfortunately due to TOML limitations no JSON -> TOML convertors exist,
            // which means that we are stuck with JS template literals.
            node.content = `
    [the]
    test_string = "You'll hate me after this - #"

    [the.hard]
    test_array = [ "] ", " # "]      # ]
    test_array2 = [ "Test #11 ]proved that", "Experiment #9 was a success" ]
    another_test_string = " Same thing, but with a string #"
    harder_test_string = " And when \\"'s are in the string, along with # \\""
    # Things will get harder

        [the.hard."bit#"]
        "what?" = "You don't think some user won't do that?"
        multi_line_array = [
            "]",
            # ] Oh yes I did
            ]
    `;
            createNode = jest.fn();
            createParentChildLink = jest.fn();
            actions = {
              createNode,
              createParentChildLink
            };
            _context.next = 6;
            return onCreateNode({
              node,
              loadNodeContent,
              actions
            }).then(function () {
              expect(createNode.mock.calls).toMatchSnapshot();
              expect(createParentChildLink.mock.calls).toMatchSnapshot();
              expect(createNode).toHaveBeenCalledTimes(1);
              expect(createParentChildLink).toHaveBeenCalledTimes(1);
            });

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  })));
  it(`If the object has an id, it uses that as the id instead of the auto-generated one`,
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee2() {
    var createNode, createParentChildLink, actions;
    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            node.content = `
          id = 'foo'
          blue = true
          funny = 'yup'
    `;
            createNode = jest.fn();
            createParentChildLink = jest.fn();
            actions = {
              createNode,
              createParentChildLink
            };
            _context2.next = 6;
            return onCreateNode({
              node,
              loadNodeContent,
              actions
            }).then(function () {
              expect(createNode.mock.calls[0][0].id).toEqual(`foo`);
            });

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }))); // Since TOML transformer doesn't generate sub-objects from arrays,
  // but directly uses the object, 'id' uniqueness tests between sub-objects
  // are omitted.
});