"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var onCreateNode = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(_ref2) {
    var node = _ref2.node,
        boundActionCreators = _ref2.boundActionCreators,
        loadNodeContent = _ref2.loadNodeContent,
        cacheDir = _ref2.cacheDir;
    var createNode, updateNode, createParentChildLink, content, output, JSONArray;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            createNode = boundActionCreators.createNode, updateNode = boundActionCreators.updateNode, createParentChildLink = boundActionCreators.createParentChildLink;


            console.log(node.internal.mediaType);
            // Check if this is a File node that's a newly created child of a PDF File.
            // If it is, create a parent/child link.
            if (node.internal.type === "File" &&
            // node.internal.mediaType !== `application/pdf` &&
            // Remove once we upgrade node-sharp to v0.18 which supports tiff.
            // node.internal.mediaType !== `image/tiff` &&
            node.internal.mediaType === "image/png" && _.some(pdfNodes, function (p) {
              return p.name === node.name.slice(0, p.name.length);
            })) {
              createParentChildLink({
                parent: _.find(pdfNodes, function (p) {
                  return p.name === node.name.slice(0, p.name.length);
                }),
                child: node
              });
            }

            if (!(node.internal.mediaType !== "application/pdf")) {
              _context.next = 5;
              break;
            }

            return _context.abrupt("return");

          case 5:

            pdfNodes.push(node);

            _context.next = 8;
            return loadNodeContent(node);

          case 8:
            content = _context.sent;
            _context.prev = 9;
            _context.next = 12;
            return execa.shell("rm " + path.join(cacheDir, node.name) + "*");

          case 12:
            _context.next = 16;
            break;

          case 14:
            _context.prev = 14;
            _context.t0 = _context["catch"](9);

          case 16:
            _context.next = 18;
            return execa.shell("pdfimages -all \"" + node.absolutePath + "\" \"" + path.join(cacheDir, node.name) + "\"");

          case 18:
            output = _context.sent;


            console.log("done creating pdf images");
            return _context.abrupt("return");

          case 26:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[9, 14]]);
  }));

  return function onCreateNode(_x) {
    return _ref.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = require("lodash");
var crypto = require("crypto");
var execa = require("execa");
var path = require("path");

var pdfNodes = [];

exports.onCreateNode = onCreateNode;