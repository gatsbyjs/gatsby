"use strict";

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var contentful = require("contentful");
var _ = require("lodash");

var processAPIData = require("./process-api-data");

module.exports = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(_ref2) {
    var spaceId = _ref2.spaceId,
        accessToken = _ref2.accessToken,
        syncToken = _ref2.syncToken;
    var client, space, defaultLocale, currentSyncData, query, contentTypes, contentTypeItems;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // Fetch articles.
            console.time("Fetch Contentful data");
            console.log("Starting to fetch data from Contentful");

            client = contentful.createClient({
              space: spaceId,
              accessToken: accessToken
            });

            // The sync API puts the locale in all fields in this format { fieldName:
            // {'locale': value} } so we need to get the space and its default local.
            //
            // We'll extend this soon to support multiple locales.

            space = void 0;
            defaultLocale = "en-US";
            _context.prev = 5;

            console.log("Fetching default locale");
            _context.next = 9;
            return client.getSpace();

          case 9:
            space = _context.sent;

            defaultLocale = _.find(space.locales, { default: true }).code;
            console.log("default local is : " + defaultLocale);
            _context.next = 18;
            break;

          case 14:
            _context.prev = 14;
            _context.t0 = _context["catch"](5);

            console.log("Accessing your Contentful space failed. Perhaps you're offline or the spaceId/accessToken is incorrect.");
            // TODO perhaps continue if there's cached data? That would let
            // someone develop a contentful site even if not connected to the internet.
            // For prod builds though always fail if we can't get the latest data.
            process.exit(1);

          case 18:
            currentSyncData = void 0;
            _context.prev = 19;
            query = syncToken ? { nextSyncToken: syncToken } : { initial: true };
            _context.next = 23;
            return client.sync(query);

          case 23:
            currentSyncData = _context.sent;
            _context.next = 30;
            break;

          case 26:
            _context.prev = 26;
            _context.t1 = _context["catch"](19);

            console.log("error fetching contentful data", _context.t1);
            process.exit(1);

          case 30:

            // We need to fetch content types with the non-sync API as the sync API
            // doesn't support this.
            contentTypes = void 0;
            _context.prev = 31;
            _context.next = 34;
            return pagedGet(client, "getContentTypes");

          case 34:
            contentTypes = _context.sent;
            _context.next = 40;
            break;

          case 37:
            _context.prev = 37;
            _context.t2 = _context["catch"](31);

            console.log("error fetching content types", _context.t2);

          case 40:
            console.log("contentTypes fetched", contentTypes.items.length);

            contentTypeItems = contentTypes.items;

            // Fix IDs on entries and assets, created/updated and deleted.

            contentTypeItems = contentTypeItems.map(function (c) {
              return processAPIData.fixIds(c);
            });

            currentSyncData.entries = currentSyncData.entries.map(function (e) {
              if (e) {
                return processAPIData.fixIds(e);
              }
            });
            currentSyncData.assets = currentSyncData.assets.map(function (a) {
              if (a) {
                return processAPIData.fixIds(a);
              }
            });
            currentSyncData.deletedEntries = currentSyncData.deletedEntries.map(function (e) {
              if (e) {
                return processAPIData.fixIds(e);
              }
            });
            currentSyncData.deletedAssets = currentSyncData.deletedAssets.map(function (a) {
              if (a) {
                return processAPIData.fixIds(a);
              }
            });

            return _context.abrupt("return", {
              currentSyncData: currentSyncData,
              contentTypeItems: contentTypeItems,
              defaultLocale: defaultLocale,
              locales: space.locales
            });

          case 48:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined, [[5, 14], [19, 26], [31, 37]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Gets all the existing entities based on pagination parameters.
 * The first call will have no aggregated response. Subsequent calls will
 * concatenate the new responses to the original one.
 */
function pagedGet(client, method) {
  var query = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var skip = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var pageLimit = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1000;
  var aggregatedResponse = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;

  return client[method]((0, _extends3.default)({}, query, {
    skip: skip,
    limit: pageLimit,
    order: "sys.createdAt"
  })).then(function (response) {
    if (!aggregatedResponse) {
      aggregatedResponse = response;
    } else {
      aggregatedResponse.items = aggregatedResponse.items.concat(response.items);
    }
    if (skip + pageLimit <= response.total) {
      return pagedGet(client, method, skip + pageLimit, aggregatedResponse);
    }
    return aggregatedResponse;
  });
}