"use strict";

var faker = require("faker");
var crypto = require("crypto");

exports.sourceNodes = function (_ref, pluginOptions) {
  var boundActionCreators = _ref.boundActionCreators;
  var createNode = boundActionCreators.createNode;
  var schema = pluginOptions.schema,
      count = pluginOptions.count,
      type = pluginOptions.type;

  var _loop = function _loop(i) {
    var item = {};
    Object.keys(schema).map(function (schemaKey) {
      var schemaItemList = schema[schemaKey];
      item[schemaKey] = {};
      // ['firstName', 'lastName']
      schemaItemList.forEach(function (schemaItem) {
        item[schemaKey][schemaItem] = faker[schemaKey][schemaItem]();
      });
    });
    var contentDigest = crypto.createHash(`md5`).update(JSON.stringify(item)).digest(`hex`);

    var nodeBase = {
      id: JSON.stringify(faker.random.number()),
      parent: null,
      children: [],
      internal: {
        type,
        contentDigest
      }
    };
    createNode(Object.assign({}, nodeBase, item));
  };

  for (var i = 0; i < count; i++) {
    _loop(i);
  }
};