"use strict";

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require("babel-runtime/helpers/objectWithoutProperties");

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

/**
 * Create the Graph QL Node
 *
 * @param {any} ent
 * @param {any} type
 * @param {any} createNode
 */
var createGraphQLNode = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(ent, type, createNode, store, cache) {
    var id, node;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            id = !ent.id ? !ent.ID ? 0 : ent.ID : ent.id;
            node = {
              id: `${type}_${id.toString()}`,
              children: [],
              parent: null,
              internal: {
                type: type
              }
            };

            node = recursiveAddFields(ent, node, createNode);
            node.internal.content = JSON.stringify(node);
            node.internal.contentDigest = digest(stringify(node));
            createNode(node);

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function createGraphQLNode(_x, _x2, _x3, _x4, _x5) {
    return _ref.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var crypto = require(`crypto`);
var deepMapKeys = require(`deep-map-keys`);
var uuidv5 = require(`uuid/v5`);
var stringify = require(`json-stringify-safe`);

var conflictFieldPrefix = `lever_`;
// restrictedNodeFields from here https://www.gatsbyjs.org/docs/node-interface/
var restrictedNodeFields = [`id`, `children`, `parent`, `fields`, `internal`];

/**
 * Encrypts a String using md5 hash of hexadecimal digest.
 *
 * @param {any} str
 */
var digest = function digest(str) {
  return crypto.createHash(`md5`).update(str).digest(`hex`);
};
exports.createGraphQLNode = createGraphQLNode;

/**
 * Add fields recursively
 *
 * @param {any} ent
 * @param {any} newEnt
 * @returns the new node
 */
function recursiveAddFields(ent, newEnt) {
  for (var _iterator = Object.keys(ent), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref2;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref2 = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref2 = _i.value;
    }

    var k = _ref2;

    if (!newEnt.hasOwnProperty(k)) {
      (function () {
        var key = getValidKey(k);
        newEnt[key] = ent[k];
        // Nested Objects & Arrays of Objects
        if (typeof ent[key] === `object`) {
          if (!Array.isArray(ent[key]) && ent[key] != null) {
            newEnt[key] = recursiveAddFields(ent[key], {});
          } else if (Array.isArray(ent[key])) {
            if (ent[key].length > 0 && typeof ent[key][0] === `object`) {
              ent[k].map(function (el, i) {
                newEnt[key][i] = recursiveAddFields(el, {});
              });
            }
          }
        }
      })();
    }
  }
  return newEnt;
}
exports.recursiveAddFields = recursiveAddFields;

/**
 * Validate the GraphQL naming convetions & protect specific fields.
 *
 * @param {any} key
 * @returns the valid name
 */
function getValidKey(_ref3) {
  var key = _ref3.key,
      _ref3$verbose = _ref3.verbose,
      verbose = _ref3$verbose === undefined ? false : _ref3$verbose;

  var nkey = String(key);
  var NAME_RX = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
  var changed = false;
  // Replace invalid characters
  if (!NAME_RX.test(nkey)) {
    changed = true;
    nkey = nkey.replace(/-|__|:|\.|\s/g, `_`);
  }
  // Prefix if first character isn't a letter.
  if (!NAME_RX.test(nkey.slice(0, 1))) {
    changed = true;
    nkey = `${conflictFieldPrefix}${nkey}`;
  }
  if (restrictedNodeFields.includes(nkey)) {
    changed = true;
    nkey = `${conflictFieldPrefix}${nkey}`.replace(/-|__|:|\.|\s/g, `_`);
  }
  if (changed && verbose) console.log(`Object with key "${key}" breaks GraphQL naming convention. Renamed to "${nkey}"`);

  return nkey;
}

exports.getValidKey = getValidKey;

// Create entities from the few the lever API returns as an object for presumably
// legacy reasons.
exports.normalizeEntities = function (entities) {
  return entities.reduce(function (acc, e) {
    return acc.concat(e);
  }, []);
};

// Standardize ids + make sure keys are valid.
exports.standardizeKeys = function (entities) {
  return entities.map(function (e) {
    return deepMapKeys(e, function (key) {
      return key === `ID` ? getValidKey({ key: `id` }) : getValidKey({ key });
    });
  });
};

// Standardize dates on ISO 8601 version.
exports.standardizeDates = function (entities) {
  return entities.map(function (e) {
    if (e.createdAt) {
      e.createdAt = new Date(e.createdAt).toJSON();
    }
    return e;
  });
};

var seedConstant = `c2012db8-fafc-5a03-915f-e6016ff32086`;
exports.createGatsbyIds = function (entities) {
  return entities.map(function (e) {
    e.id = uuidv5(e.lever_id.toString(), uuidv5(`lever`, seedConstant));
    return e;
  });
};

exports.createNodesFromEntities = function (_ref4) {
  var entities = _ref4.entities,
      createNode = _ref4.createNode;

  entities.forEach(function (e) {
    var entity = (0, _objectWithoutProperties3.default)(e, []);

    var node = (0, _extends3.default)({}, entity, {
      parent: null,
      children: [],
      internal: {
        type: `lever`,
        contentDigest: digest(JSON.stringify(entity))
      }
    });
    createNode(node);
  });
};