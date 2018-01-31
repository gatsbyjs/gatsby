var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

var Remark = require(`remark`);

var find = require(`unist-util-find`);

var _ = require(`lodash`);

var plugin = require(`../`);

var remark = new Remark().data(`settings`, {
  commonmark: true,
  footnotes: true,
  pedantic: true
});

var extractObjectTag = function extractObjectTag(mdast) {
  return _.reduce(mdast.children[0].children, function (result, child) {
    return result + child.value;
  }, ``);
};

var extractIframeTag = function extractIframeTag(mdast) {
  return mdast.children[0].value;
};

describe(`gatsby-remark-responsive-iframe`, function () {
  ;
  [`iframe`, `object`].forEach(function (tag) {
    it(`transforms an ${tag} with unitless width and height`,
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    _regeneratorRuntime.mark(function _callee() {
      var markdownAST, transformed, node, _node$data$hChildren, child;

      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              markdownAST = remark.parse(`
<${tag} url="http://www.example.com/" width="600" height="400"></${tag}>
    `);
              _context.next = 3;
              return plugin({
                markdownAST
              });

            case 3:
              transformed = _context.sent;
              node = find(transformed, function (node) {
                return node.type === `unknown`;
              });
              expect(node).toBeDefined();
              expect(node.data).toBeDefined();
              expect(node.data.hChildren).toBeDefined();
              expect(node.data.hChildren.length).toBeGreaterThan(0);
              _node$data$hChildren = node.data.hChildren, child = _node$data$hChildren[0];
              expect(child.value).toMatchSnapshot();

            case 11:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    })));
  });
  [`iframe`, `object`].forEach(function (tag) {
    it(`transforms an ${tag} with pixel width and height`,
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    _regeneratorRuntime.mark(function _callee2() {
      var markdownAST, transformed, node, _node$data$hChildren2, child;

      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              markdownAST = remark.parse(`
<${tag} url="http://www.example.com/" width="600px" height="400px"></${tag}>
    `);
              _context2.next = 3;
              return plugin({
                markdownAST
              });

            case 3:
              transformed = _context2.sent;
              node = find(transformed, function (node) {
                return node.type === `unknown`;
              });
              expect(node).toBeDefined();
              expect(node.data).toBeDefined();
              expect(node.data.hChildren).toBeDefined();
              expect(node.data.hChildren.length).toBeGreaterThan(0);
              _node$data$hChildren2 = node.data.hChildren, child = _node$data$hChildren2[0];
              expect(child.value).toMatchSnapshot();

            case 11:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    })));
  });
  var shouldntTransform = [[`100%`, `100`], [`100`, `100%`], [`invalid`, `100`], [`100`, `invalid`]];

  _.map(shouldntTransform, function (_ref3) {
    var width = _ref3[0],
        height = _ref3[1];
    ;
    [`iframe`, `object`].forEach(function (tag) {
      it(`doesn't transform an ${tag} with dimensions: '${width}' '${height}'`,
      /*#__PURE__*/
      _asyncToGenerator(
      /*#__PURE__*/
      _regeneratorRuntime.mark(function _callee3() {
        var markdownAST, transformed, iframeHTML, objectHTML;
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                markdownAST = remark.parse(`
  <${tag} url="http://www.example.com/" width="${width}" height="${height}"></${tag}>
      `);
                _context3.next = 3;
                return plugin({
                  markdownAST
                });

              case 3:
                transformed = _context3.sent;

                // Note: Remark treats iframes (block level) and object (inline) tags
                // differently, wrapping an object tag in <p></p> tags. It also parses
                // out the object tag into three separate nodes - one for the opening
                // tag, one for the closing tag and one for a newline inside. So for any
                // tests that recieve untransformed node back from the plugin, we strip
                // the p tags and combine the nodes into a single html string.
                if (tag === `iframe`) {
                  iframeHTML = extractIframeTag(transformed);
                  expect(iframeHTML).toBeDefined();
                  expect(iframeHTML).toMatchSnapshot();
                } else {
                  objectHTML = extractObjectTag(transformed);
                  expect(objectHTML).toBeDefined();
                  expect(objectHTML).toMatchSnapshot();
                }

              case 5:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      })));
    });
  });
});