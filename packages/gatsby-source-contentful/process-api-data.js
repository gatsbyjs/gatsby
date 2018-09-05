"use strict";

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _set = require("babel-runtime/core-js/set");

var _set2 = _interopRequireDefault(_set);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = require("lodash");
var crypto = require("crypto");
var stringify = require("json-stringify-safe");
var deepMap = require("deep-map");

var digest = function digest(str) {
  return crypto.createHash("md5").update(str).digest("hex");
};
var typePrefix = "Contentful";
var makeTypeName = function makeTypeName(type) {
  return _.upperFirst(_.camelCase(typePrefix + " " + type));
};

var getLocalizedField = function getLocalizedField(_ref) {
  var field = _ref.field,
      defaultLocale = _ref.defaultLocale,
      locale = _ref.locale;

  if (field[locale.code]) {
    return field[locale.code];
  } else if (field[locale.fallbackCode]) {
    return field[locale.fallbackCode];
  } else {
    return field[defaultLocale];
  }
};

var makeGetLocalizedField = function makeGetLocalizedField(_ref2) {
  var locale = _ref2.locale,
      defaultLocale = _ref2.defaultLocale;
  return function (field) {
    return getLocalizedField({ field: field, locale: locale, defaultLocale: defaultLocale });
  };
};

exports.getLocalizedField = getLocalizedField;

// If the id starts with a number, left-pad it with a c (for Contentful of
// course :-))
var fixId = function fixId(id) {
  if (!isNaN(id.slice(0, 1))) {
    return "c" + id;
  }

  return id;
};
exports.fixId = fixId;

exports.fixIds = function (object) {
  return deepMap(object, function (v, k) {
    return k === "id" ? fixId(v) : v;
  });
};

var makeId = function makeId(_ref3) {
  var id = _ref3.id,
      currentLocale = _ref3.currentLocale,
      defaultLocale = _ref3.defaultLocale;
  return currentLocale === defaultLocale ? id : id + "___" + currentLocale;
};

exports.makeId = makeId;

var makeMakeId = function makeMakeId(_ref4) {
  var currentLocale = _ref4.currentLocale,
      defaultLocale = _ref4.defaultLocale;
  return function (id) {
    return makeId({ id: id, currentLocale: currentLocale, defaultLocale: defaultLocale });
  };
};

exports.buildEntryList = function (_ref5) {
  var contentTypeItems = _ref5.contentTypeItems,
      currentSyncData = _ref5.currentSyncData;
  return contentTypeItems.map(function (contentType) {
    return currentSyncData.entries.filter(function (entry) {
      return entry.sys.contentType.sys.id === contentType.sys.id;
    });
  });
};

exports.buildResolvableSet = function (_ref6) {
  var entryList = _ref6.entryList,
      _ref6$existingNodes = _ref6.existingNodes,
      existingNodes = _ref6$existingNodes === undefined ? [] : _ref6$existingNodes,
      _ref6$assets = _ref6.assets,
      assets = _ref6$assets === undefined ? [] : _ref6$assets,
      locales = _ref6.locales,
      defaultLocale = _ref6.defaultLocale;

  var resolvable = new _set2.default();
  existingNodes.forEach(function (n) {
    return resolvable.add(n.id);
  });

  entryList.forEach(function (entries) {
    entries.forEach(function (entry) {
      resolvable.add(entry.sys.id);
    });
  });
  assets.forEach(function (assetItem) {
    return resolvable.add(assetItem.sys.id);
  });

  return resolvable;
};

exports.buildForeignReferenceMap = function (_ref7) {
  var contentTypeItems = _ref7.contentTypeItems,
      entryList = _ref7.entryList,
      resolvable = _ref7.resolvable,
      defaultLocale = _ref7.defaultLocale,
      locales = _ref7.locales;

  var foreignReferenceMap = {};
  contentTypeItems.forEach(function (contentTypeItem, i) {
    var contentTypeItemId = contentTypeItem.name.toLowerCase();
    entryList[i].forEach(function (entryItem) {
      var entryItemFields = entryItem.fields;
      (0, _keys2.default)(entryItemFields).forEach(function (entryItemFieldKey) {
        if (entryItemFields[entryItemFieldKey]) {
          var entryItemFieldValue = entryItemFields[entryItemFieldKey][defaultLocale];
          // If this is an array of single reference object
          // add to the reference map, otherwise ignore.
          if (Array.isArray(entryItemFieldValue)) {
            if (entryItemFieldValue[0] && entryItemFieldValue[0].sys && entryItemFieldValue[0].sys.type && entryItemFieldValue[0].sys.id) {
              entryItemFieldValue.forEach(function (v) {
                // Don't create link to an unresolvable field.
                if (!resolvable.has(v.sys.id)) {
                  return;
                }

                if (!foreignReferenceMap[v.sys.id]) {
                  foreignReferenceMap[v.sys.id] = [];
                }
                foreignReferenceMap[v.sys.id].push({
                  name: contentTypeItemId + "___NODE",
                  id: entryItem.sys.id
                });
              });
            }
          } else if (entryItemFieldValue && entryItemFieldValue.sys && entryItemFieldValue.sys.type && entryItemFieldValue.sys.id && resolvable.has(entryItemFieldValue.sys.id)) {
            if (!foreignReferenceMap[entryItemFieldValue.sys.id]) {
              foreignReferenceMap[entryItemFieldValue.sys.id] = [];
            }
            foreignReferenceMap[entryItemFieldValue.sys.id].push({
              name: contentTypeItemId + "___NODE",
              id: entryItem.sys.id
            });
          }
        }
      });
    });
  });

  return foreignReferenceMap;
};

function createTextNode(node, key, text, createNode) {
  var _textNode;

  var str = _.isString(text) ? text : " ";
  var textNode = (_textNode = {
    id: "" + node.id + key + "TextNode",
    parent: node.id,
    children: []
  }, (0, _defineProperty3.default)(_textNode, key, str), (0, _defineProperty3.default)(_textNode, "internal", {
    type: _.camelCase(node.internal.type + " " + key + " TextNode"),
    mediaType: "text/x-markdown",
    content: str,
    contentDigest: digest(str)
  }), _textNode);

  node.children = node.children.concat([textNode.id]);
  createNode(textNode);

  return textNode.id;
}
exports.createTextNode = createTextNode;

exports.createContentTypeNodes = function (_ref8) {
  var contentTypeItem = _ref8.contentTypeItem,
      restrictedNodeFields = _ref8.restrictedNodeFields,
      conflictFieldPrefix = _ref8.conflictFieldPrefix,
      entries = _ref8.entries,
      createNode = _ref8.createNode,
      resolvable = _ref8.resolvable,
      foreignReferenceMap = _ref8.foreignReferenceMap,
      defaultLocale = _ref8.defaultLocale,
      locales = _ref8.locales;

  var contentTypeItemId = contentTypeItem.name;
  locales.forEach(function (locale) {
    var mId = makeMakeId({ currentLocale: locale.code, defaultLocale: defaultLocale });
    var getField = makeGetLocalizedField({ locale: locale, defaultLocale: defaultLocale });

    // Warn about any field conflicts
    var conflictFields = [];
    contentTypeItem.fields.forEach(function (contentTypeItemField) {
      var fieldName = contentTypeItemField.id;
      if (restrictedNodeFields.includes(fieldName)) {
        console.log("Restricted field found for ContentType " + contentTypeItemId + " and field " + fieldName + ". Prefixing with " + conflictFieldPrefix + ".");
        conflictFields.push(fieldName);
      }
    });

    // First create nodes for each of the entries of that content type
    var entryNodes = entries.map(function (entryItem) {
      // Get localized fields.
      var entryItemFields = _.mapValues(entryItem.fields, function (v) {
        return getField(v);
      });

      // Prefix any conflicting fields
      // https://github.com/gatsbyjs/gatsby/pull/1084#pullrequestreview-41662888
      conflictFields.forEach(function (conflictField) {
        entryItemFields["" + conflictFieldPrefix + conflictField] = entryItemFields[conflictField];
        delete entryItemFields[conflictField];
      });

      // Add linkages to other nodes based on foreign references
      (0, _keys2.default)(entryItemFields).forEach(function (entryItemFieldKey) {
        if (entryItemFields[entryItemFieldKey]) {
          var entryItemFieldValue = entryItemFields[entryItemFieldKey];
          if (Array.isArray(entryItemFieldValue)) {
            if (entryItemFieldValue[0].sys && entryItemFieldValue[0].sys.type && entryItemFieldValue[0].sys.id) {
              entryItemFields[entryItemFieldKey + "___NODE"] = entryItemFieldValue.filter(function (v) {
                return resolvable.has(v.sys.id);
              }).map(function (v) {
                return mId(v.sys.id);
              });

              delete entryItemFields[entryItemFieldKey];
            }
          } else if (entryItemFieldValue && entryItemFieldValue.sys && entryItemFieldValue.sys.type && entryItemFieldValue.sys.id && resolvable.has(entryItemFieldValue.sys.id)) {
            entryItemFields[entryItemFieldKey + "___NODE"] = mId(entryItemFieldValue.sys.id);
            delete entryItemFields[entryItemFieldKey];
          }
        }
      });

      // Add reverse linkages if there are any for this node
      var foreignReferences = foreignReferenceMap[entryItem.sys.id];
      if (foreignReferences) {
        foreignReferences.forEach(function (foreignReference) {
          var existingReference = entryItemFields[foreignReference.name];
          if (existingReference) {
            entryItemFields[foreignReference.name].push(mId(foreignReference.id));
          } else {
            // If there is one foreign reference, there can be many.
            // Best to be safe and put it in an array to start with.
            entryItemFields[foreignReference.name] = [mId(foreignReference.id)];
          }
        });
      }

      var entryNode = {
        id: mId(entryItem.sys.id),
        parent: contentTypeItemId,
        children: [],
        internal: {
          type: "" + makeTypeName(contentTypeItemId)
        }

        // Use default locale field.
      };(0, _keys2.default)(entryItemFields).forEach(function (entryItemFieldKey) {
        // Ignore fields with "___node" as they're already handled
        // and won't be a text field.
        if (entryItemFieldKey.split("___").length > 1) {
          return;
        }

        entryItemFields[entryItemFieldKey] = entryItemFields[entryItemFieldKey];
      });

      // Replace text fields with text nodes so we can process their markdown
      // into HTML.
      (0, _keys2.default)(entryItemFields).forEach(function (entryItemFieldKey) {
        // Ignore fields with "___node" as they're already handled
        // and won't be a text field.
        if (entryItemFieldKey.split("___").length > 1) {
          return;
        }

        var fieldType = contentTypeItem.fields.find(function (f) {
          return (restrictedNodeFields.includes(f.id) ? "" + conflictFieldPrefix + f.id : f.id) === entryItemFieldKey;
        }).type;
        if (fieldType === "Text") {
          entryItemFields[entryItemFieldKey + "___NODE"] = createTextNode(entryNode, entryItemFieldKey, entryItemFields[entryItemFieldKey], createNode);

          delete entryItemFields[entryItemFieldKey];
        }
      });

      entryNode = (0, _extends3.default)({}, entryItemFields, entryNode, { node_locale: locale.code

        // Get content digest of node.
      });var contentDigest = digest(stringify(entryNode));

      entryNode.internal.contentDigest = contentDigest;

      return entryNode;
    });

    // Create a node for each content type
    var contentTypeNode = {
      id: contentTypeItemId,
      parent: "__SOURCE__",
      children: [],
      name: contentTypeItem.name,
      displayField: contentTypeItem.displayField,
      description: contentTypeItem.description,
      internal: {
        type: "" + makeTypeName("ContentType")
      }

      // Get content digest of node.
    };var contentDigest = digest(stringify(contentTypeNode));

    contentTypeNode.internal.contentDigest = contentDigest;

    createNode(contentTypeNode);
    entryNodes.forEach(function (entryNode) {
      createNode(entryNode);
    });
  });
};

exports.createAssetNodes = function (_ref9) {
  var assetItem = _ref9.assetItem,
      createNode = _ref9.createNode,
      defaultLocale = _ref9.defaultLocale,
      locales = _ref9.locales;

  locales.forEach(function (locale) {
    var mId = makeMakeId({ currentLocale: locale.code, defaultLocale: defaultLocale });
    var getField = makeGetLocalizedField({ locale: locale, defaultLocale: defaultLocale });

    var localizedAsset = (0, _extends3.default)({}, assetItem);
    // Create a node for each asset. They may be referenced by Entries
    //
    // Get localized fields.
    localizedAsset.fields = {
      file: getField(localizedAsset.fields.file),
      title: localizedAsset.fields.title ? getField(localizedAsset.fields.title) : "",
      description: localizedAsset.fields.description ? getField(localizedAsset.fields.description) : ""
    };
    var assetNode = (0, _extends3.default)({
      id: mId(localizedAsset.sys.id),
      parent: "__SOURCE__",
      children: []
    }, localizedAsset.fields, {
      node_locale: locale.code,
      internal: {
        type: "" + makeTypeName("Asset")
      }

      // Get content digest of node.
    });var contentDigest = digest(stringify(assetNode));

    assetNode.internal.contentDigest = contentDigest;

    createNode(assetNode);
  });
};