'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *  
 * Source code for gatsby-source-wordpress plugin.
 * 
*/

var axios = require(`axios`);
var crypto = require(`crypto`);
var _ = require(`lodash`);
var stringify = require(`json-stringify-safe`);
var colorized = require(`./output-color`);

/* The GraphQL Nodes prefix. */
var wpNS = `wordpress__`;

/* If true, will output many console logs. */
var verbose = void 0;

/* The complete site URL. */
var siteURL = void 0;

// ======== Main Void ==========
exports.sourceNodes = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(_ref2, _ref3) {
    var boundActionCreators = _ref2.boundActionCreators,
        getNode = _ref2.getNode,
        hasNodeChanged = _ref2.hasNodeChanged,
        store = _ref2.store;
    var baseUrl = _ref3.baseUrl,
        protocol = _ref3.protocol,
        hostingWPCOM = _ref3.hostingWPCOM,
        useACF = _ref3.useACF,
        auth = _ref3.auth,
        verboseOutput = _ref3.verboseOutput;

    var createNode, setPluginStatus, touchNode, contractURL, wpAPIRoutes, options, apiEndpoints, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, e;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            createNode = boundActionCreators.createNode, setPluginStatus = boundActionCreators.setPluginStatus, touchNode = boundActionCreators.touchNode;

            verbose = verboseOutput;
            siteURL = `${protocol}://${baseUrl}`;

            console.log();
            console.log(colorized.out(`=START PLUGIN=====================================`, colorized.color.Font.FgBlue));
            console.time(`=END PLUGIN=====================================`);
            console.log(``);
            console.log(colorized.out(`Site URL: ${siteURL}`, colorized.color.Font.FgBlue));
            console.log(colorized.out(`Site hosted on Wordpress.com: ${hostingWPCOM}`, colorized.color.Font.FgBlue));
            console.log(colorized.out(`Using ACF: ${useACF}`, colorized.color.Font.FgBlue));
            console.log(colorized.out(`Using Auth: ${auth.user} ${auth.pass}`, colorized.color.Font.FgBlue));
            console.log(colorized.out(`Verbose output: ${verboseOutput}`, colorized.color.Font.FgBlue));
            console.log(``);

            // Touch existing Wordpress nodes so Gatsby doesn`t garbage collect them.
            _.values(store.getState().nodes).filter(function (n) {
              return n.internal.type.slice(0, 10) === wpNS;
            }).forEach(function (n) {
              return touchNode(n.id);
            });

            contractURL = void 0;
            wpAPIRoutes = void 0;


            if (hostingWPCOM) {
              contractURL = `https://public-api.wordpress.com/wp/v2/sites/${baseUrl}`;
            } else {
              contractURL = `${siteURL}/wp-json`;
            }

            if (verbose) console.log(colorized.out(`The contract URL is`, colorized.color.Font.FgBlue), contractURL);

            // Call the API endpoint to discover the routes.
            _context.prev = 18;
            options = {
              method: `get`,
              url: contractURL
            };

            if (auth != undefined) {
              options.auth = {
                username: auth.user,
                password: auth.pass
              };
            }
            _context.next = 23;
            return axios(options);

          case 23:
            wpAPIRoutes = _context.sent;
            _context.next = 31;
            break;

          case 26:
            _context.prev = 26;
            _context.t0 = _context['catch'](18);

            console.log(colorized.out(`The server response was "${_context.t0.response.status} ${_context.t0.response.statusText}"`, colorized.color.Font.FgRed));
            if (_context.t0.response.data.message != undefined) console.log(colorized.out(`Inner exception message : "${_context.t0.response.data.message}"`, colorized.color.Font.FgRed));
            if (_context.t0.response.status == 400 || _context.t0.response.status == 401 || _context.t0.response.status == 403) console.log(colorized.out(`Please provide gatsby-source-wordpress's auth options parameters in site's gatsby-config.js`, colorized.color.Font.FgRed));

          case 31:
            if (!(wpAPIRoutes != undefined)) {
              _context.next = 69;
              break;
            }

            apiEndpoints = [];


            (0, _keys2.default)(wpAPIRoutes.data.routes).map(function (key) {
              if (verbose) console.log(`Route discovered :`, key);
              var route = wpAPIRoutes.data.routes[key];
              // Excluding every endpoint which is not a GET with no param
              if (route._links) {
                // Extract the last part of the URL which will act a the part type
                var p = route._links.self.substring(route._links.self.lastIndexOf(`/`) + 1, route._links.self.length);

                // Excluding the "technical" API endpoints        
                var t = [`v2`, `v3`, `1.0`, `2.0`, `embed`, `proxy`, ``, baseUrl];
                if (!t.includes(p)) {

                  if (verbose) console.log(colorized.out(`Valid route found. Will try to fetch.`, colorized.color.Font.FgGreen));

                  // Extract the endpoint "manufacturer"
                  var n = route.namespace.substring(0, route.namespace.lastIndexOf(`/`));
                  var type = void 0;
                  if (n == `wp`) {
                    type = `${wpNS}${p.replace(/-/g, `_`)}`;
                  } else {
                    type = `${wpNS}${n.replace(/-/g, `_`)}_${p.replace(/-/g, `_`)}`;
                  }

                  // if (verbose) console.log(colorized.out(`NameSpace : ${wpNS} - Manufacturer : ${n} - Endpoint : ${p} - Type : ${type}`, colorized.color.Font.FgGreen))

                  if (verbose) console.log(`GraphQL node internal.type will be : `, type);

                  var f = void 0;

                  // If needed, define a custom GraphQL Node building function here.
                  switch (type) {
                    // Wordpress Native
                    case `${wpNS}posts`:
                      f = processPostsEntities;
                      break;
                    case `${wpNS}pages`:
                      f = processPagesEntities;
                      break;
                    case `${wpNS}tags`:
                      f = processTagsEntities;
                      break;
                    case `${wpNS}categories`:
                      f = processCategoriesEntities;
                      break;

                    // Any other Wordpress native or plugin manugacturer namespace (ACF, WP-API-MENUS, etc.)
                    default:
                      f = processDefaultEntities;
                      break;
                  }
                  apiEndpoints.push({
                    'url': route._links.self,
                    'type': type,
                    'entityFunc': f
                  });
                } else {
                  if (verbose) console.log(colorized.out(`Invalid route.`, colorized.color.Font.FgRed));
                }
              } else {
                if (verbose) console.log(colorized.out(`Invalid route.`, colorized.color.Font.FgRed));
              }
            });

            if (useACF) {
              // The OPTIONS ACF API Endpoint is not giving a valid _link so let`s add it manually.      
              apiEndpoints.push({
                'url': `${contractURL}/acf/v2/options`, // TODO : Need to test that out with ACF on Wordpress.com hosted site. Need a premium account on wp.com to install extensions.
                'type': `${wpNS}acf_options`,
                'entityFunc': processACFSiteOptionsEntity
              });
              if (verbose) console.log(colorized.out(`Added ACF Options route.`, colorized.color.Font.FgGreen));
            }

            console.log(`Fetching the JSON data from ${apiEndpoints.length} valid API Endpoints...`);
            console.time(`Fetching data`);
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 40;
            _iterator = (0, _getIterator3.default)(apiEndpoints);

          case 42:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 50;
              break;
            }

            e = _step.value;
            _context.next = 46;
            return fetchData(e, auth, createNode);

          case 46:
            console.log(``);

          case 47:
            _iteratorNormalCompletion = true;
            _context.next = 42;
            break;

          case 50:
            _context.next = 56;
            break;

          case 52:
            _context.prev = 52;
            _context.t1 = _context['catch'](40);
            _didIteratorError = true;
            _iteratorError = _context.t1;

          case 56:
            _context.prev = 56;
            _context.prev = 57;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 59:
            _context.prev = 59;

            if (!_didIteratorError) {
              _context.next = 62;
              break;
            }

            throw _iteratorError;

          case 62:
            return _context.finish(59);

          case 63:
            return _context.finish(56);

          case 64:
            console.timeEnd(`Fetching data`);

            setPluginStatus({
              status: {
                lastFetched: new Date().toJSON()
              }
            });

            console.timeEnd(`=END PLUGIN=====================================`);

            _context.next = 70;
            break;

          case 69:
            console.log(colorized.out(`No routes to fetch. Ending.`, colorized.color.Font.FgRed));

          case 70:
            return _context.abrupt('return');

          case 71:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[18, 26], [40, 52, 56, 64], [57,, 59, 63]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Fetch the data fril specifiend endpoint url, using the auth provided.
 * 
 * @param {any} endpoint 
 * @param {any} auth 
 * @param {any} createNode 
 */
var fetchData = function () {
  var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(endpoint, auth, createNode) {
    var type, url, processEntityFunc, result, options, length, nodes;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            type = endpoint.type;
            url = endpoint.url;
            processEntityFunc = endpoint.entityFunc;

            /// Fetch --------------------------------------------------------------------------------------------------------------

            console.log(colorized.out(`=== [ Fetching ${type} ] ===`, colorized.color.Font.FgBlue), url);

            if (verbose) console.time(`Fetching the ${type} took`);
            result = void 0;
            _context2.prev = 6;
            options = {
              method: `get`,
              url: url
            };


            if (auth != undefined) {
              options.auth = {
                username: auth.user,
                password: auth.pass
              };
            }

            _context2.next = 11;
            return axios(options);

          case 11:
            result = _context2.sent;
            _context2.next = 19;
            break;

          case 14:
            _context2.prev = 14;
            _context2.t0 = _context2['catch'](6);

            // TODO : Better handling of dead source REST API (Retries, etc.)
            console.log(colorized.out(`The server response was "${_context2.t0.response.status} ${_context2.t0.response.statusText}"`, colorized.color.Font.FgRed));
            if (_context2.t0.response.data.message != undefined) console.log(colorized.out(`Inner exception message : "${_context2.t0.response.data.message}"`, colorized.color.Font.FgRed));
            if (_context2.t0.response.status == 400 || _context2.t0.response.status == 401 || _context2.t0.response.status == 403) console.log(colorized.out(`Auth on endpoint is not implemented on this gatsby-source plugin.`, colorized.color.Font.FgRed));

          case 19:

            // console.log(`result is`, result)

            if (verbose) console.timeEnd(`Fetching the ${type} took`);

            if (result && result.status.toString().startsWith(`2`)) {
              length = void 0;

              if (result != undefined && result.data != undefined && Array.isArray(result.data)) {
                length = result.data.length;
              } else if (result.data != undefined && !Array.isArray(result.data)) {
                length = (0, _keys2.default)(result.data).length;
              }

              console.log(colorized.out(`${type} fetched : ${length}`, colorized.color.Font.FgGreen));

              if (verbose) console.time(`Parsing result ${type} took`);

              nodes = processEntityFunc({ type: type, data: result.data });

              // console.log(`Nodes are :`, nodes)

              if (nodes.length) {
                nodes.forEach(function (node) {
                  createGraphQLNode(node, createNode);
                });
              } else {
                createGraphQLNode(nodes, createNode);
              }
              if (verbose) console.timeEnd(`Parsing result ${type} took`);
            }

          case 21:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[6, 14]]);
  }));

  return function fetchData(_x3, _x4, _x5) {
    return _ref4.apply(this, arguments);
  };
}();

var digest = function digest(str) {
  return crypto.createHash(`md5`).update(str).digest(`hex`);
};

/**
 * Create the Graph QL Node
 * 
 * @param {any} node 
 * @param {any} createNode 
 */
var createGraphQLNode = function createGraphQLNode(node, createNode) {
  if (node.id != undefined) {
    var gatsbyNode = (0, _extends3.default)({}, node, {
      children: [],
      parent: `__SOURCE__`,
      internal: (0, _extends3.default)({}, node.internal, {
        content: (0, _stringify2.default)(node),
        mediaType: `text/html`
      })
      // TODO
      // author___NODE: result.data.data[i].relationships.uid.data.id,
    });
    gatsbyNode.internal.contentDigest = digest(stringify(gatsbyNode));
    createNode(gatsbyNode);
  }
};

var processCategoriesEntities = function processCategoriesEntities(_ref5) {
  var type = _ref5.type,
      data = _ref5.data;

  var toReturn = [];
  data.map(function (ent, i) {
    var newEnt = {
      id: `CATEGORY_${ent.id.toString().toUpperCase()}`,
      internal: {
        type: `${wpNS}CATEGORY`
      },
      order: i + 1
    };
    if (newEnt.revision_timestamp) {
      newEnt.revision_timestamp = new Date(newEnt.revision_timestamp).toJSON();
    }
    toReturn.push(loopOtherFields(ent, newEnt, false, false));
  });
  return toReturn;
};

var processTagsEntities = function processTagsEntities(_ref6) {
  var type = _ref6.type,
      data = _ref6.data;

  var toReturn = [];
  data.map(function (ent, i) {
    var newEnt = {
      id: `TAG_${ent.id.toString().toUpperCase()}`,
      internal: {
        type: `${wpNS}TAG`
      },
      order: i + 1
    };
    if (newEnt.revision_timestamp) {
      newEnt.revision_timestamp = new Date(newEnt.revision_timestamp).toJSON();
    }
    toReturn.push(loopOtherFields(ent, newEnt, false, false));
  });
  return toReturn;
};

var processPagesEntities = function processPagesEntities(_ref7) {
  var type = _ref7.type,
      data = _ref7.data;

  var toReturn = [];
  data.map(function (ent, i) {
    var newEnt = {
      id: `PAGE_${ent.id.toString().toUpperCase()}`,
      internal: {
        type: `${wpNS}PAGE`
      },
      order: i + 1,
      created: new Date(ent.date).toJSON(),
      changed: new Date(ent.modified).toJSON(),
      title: ent.title.rendered,
      content: ent.content.rendered,
      excerpt: ent.excerpt.rendered
    };
    if (newEnt.revision_timestamp) {
      newEnt.revision_timestamp = new Date(newEnt.revision_timestamp).toJSON();
    }
    toReturn.push(loopOtherFields(ent, newEnt, true, true));
  });
  return toReturn;
};

var processPostsEntities = function processPostsEntities(_ref8) {
  var type = _ref8.type,
      data = _ref8.data;

  var toReturn = [];
  data.map(function (ent, i) {
    var newEnt = {
      id: `POST_${ent.id.toString().toUpperCase()}`,
      internal: {
        type: `${wpNS}POST`
      },
      order: i + 1,
      created: new Date(ent.date).toJSON(),
      changed: new Date(ent.modified).toJSON(),
      title: ent.title.rendered,
      content: ent.content.rendered,
      excerpt: ent.excerpt.rendered
    };
    if (newEnt.revision_timestamp) {
      newEnt.revision_timestamp = new Date(newEnt.revision_timestamp).toJSON();
    }
    toReturn.push(loopOtherFields(ent, newEnt, true, true));
  });
  return toReturn;
};

/**
 * Process a default array of entities
 * 
 * @param {any} { type, data } 
 * @returns 
 */
var processDefaultEntities = function processDefaultEntities(_ref9) {
  var type = _ref9.type,
      data = _ref9.data;

  try {
    var toReturn = [];
    data.map(function (ent, i) {

      var id = ent.id == undefined ? ent.ID == undefined ? 0 : ent.ID : ent.id;

      var newEnt = {
        id: `${type}_${id.toString()}`,
        internal: {
          type: type.toUpperCase()
        },
        order: i + 1
      };
      if (newEnt.revision_timestamp) {
        newEnt.revision_timestamp = new Date(newEnt.revision_timestamp).toJSON();
      }
      toReturn.push(loopOtherFields(ent, newEnt, false, false));
    });

    // console.log(colorized.out(`${type} has been processed using the default entity list processor`, colorized.color.Font.FgYellow))

    return toReturn;
  } catch (e) {
    // If map() fails, then switch to a single entity type
    var _toReturn = [];
    var id = data.id == undefined ? data.ID == undefined ? 0 : data.ID : data.id;
    var newEnt = {
      id: `${type}_${id.toString()}`,
      internal: {
        type: type.toUpperCase()
      },
      order: 1
    };
    if (newEnt.revision_timestamp) {
      newEnt.revision_timestamp = new Date(newEnt.revision_timestamp).toJSON();
    }
    _toReturn.push(loopOtherFields(data, newEnt, false, false));
    // console.log(colorized.out(`${type} has been processed using the default single entity processor`, colorized.color.Font.FgYellow))
    return _toReturn;
  }
};

/**
 * Process a single entity
 * 
 * @param {any} { type, data } 
 * @returns 
 */
var processACFSiteOptionsEntity = function processACFSiteOptionsEntity(_ref10) {
  var type = _ref10.type,
      data = _ref10.data;

  var newEnt = {
    id: type.toString().toUpperCase(), // Todo : Allow one or a collection of nodes. Yet : only one node.
    internal: {
      type: type
    }
  };
  return loopOtherFields(data, newEnt, true, false);
};

/**
 * Will loop to add any other field of the JSON API to the Node object.
 * 
 * If includeACFField == true, will also add the ACF Fields as a JSON string if present, 
 * or add an empty ACF field.
 * 
 * If stringifyACFContents == true, the ACF Fields will be stringifyd. 
 * 
 * You'll then have to call `JSON.parse(acf)` in your site's code in order to get the content.
 * In most cases, this makes using ACF easier because GrahQL queries can then be written 
 * without knowing the data structure of ACF.
 * 
 * @param {any} ent
 * @param {any} newEnt 
 * @param {any} includeACFField 
 * @param {any} stringifyACFContents 
 * @returns 
 */
function loopOtherFields(ent, newEnt, includeACFField, stringifyACFContents) {
  newEnt = validateObjectTree(ent, newEnt, includeACFField, stringifyACFContents);
  // Because some solution will rely on the use of ACF fields and implement a component check on values of this field,
  // we want to ensure that the ACF field is always here even if ACF isn`t installed on Wordpress back-end.
  if (includeACFField && newEnt.acf == undefined) {
    newEnt.acf = [];
  }
  return newEnt;
}

/**
 * validate Object Tree
 * 
 * @param {any} ent 
 * @param {any} newEnt 
 * @param {any} includeACFField 
 * @param {any} stringifyACFContents 
 * @returns 
 */
function validateObjectTree(ent, newEnt, includeACFField, stringifyACFContents) {
  (0, _keys2.default)(ent).map(function (k) {
    if (!newEnt.hasOwnProperty(k)) {
      var val = ent[k];
      var key = k;
      var NAME_RX = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
      if (!NAME_RX.test(key)) {
        var nkey = `_${key}`.replace(/-/g, `_`).replace(/:/g, `_`);
        if (verbose) console.log(colorized.out(`Object with key "${key}" that does not complies to GraphQL naming convention (will fail).`, colorized.color.Font.FgRed));
        if (verbose) console.log(colorized.out(`Renaming the key to "${nkey}"`, colorized.color.Font.FgRed));
        key = nkey;
      }
      newEnt[key] = val;

      if (includeACFField && stringifyACFContents && key == `acf` && val != `false`) {
        //Stringifying acf keys
        newEnt.acf = (0, _stringify2.default)(newEnt.acf);
        // TODO : Creating a node of mediaType application/json + link the parent node to this
      }

      // Nested objects
      if (typeof newEnt[key] == `object` && !Array.isArray(newEnt[key]) && newEnt[key] !== null && key !== `acf`) {
        // if (verbose) console.log(colorized.out(`Calling a recursive process on key [${typeof newEnt[key]}] ${key}`, colorized.color.Font.FgYellow))
        newEnt[key] = validateObjectTree(newEnt[key], {}, includeACFField, stringifyACFContents);
      } else if (typeof newEnt[key] == `object` && Array.isArray(newEnt[key]) && newEnt[key] !== null && key !== `acf`) {

        if (Array.isArray(newEnt[key]) && newEnt[key].length > 0 && typeof newEnt[key][0] == `object`) {
          // Array of objects
          // if (verbose) console.log(colorized.out(`Calling a recursive process on key [Array] ${key}`, colorized.color.Font.FgYellow))
          val.map(function (el, i) {
            newEnt[key][i] = validateObjectTree(el, {}, includeACFField, stringifyACFContents);
          });
        }
      }
    }
  });
  return newEnt;
}

// const mkdirp = require(`mkdirp`)
// const cacheSitePath = `${store.getState().program.directory}/.cache/source-wordpress`
// mkdirp(cacheSitePath, function (err) {
//   if (err) console.error(err)
// })
// "get-urls": "^7.x",
// const getUrls = require(`get-urls`)
// const downloader = require(`./image-downloader.js`)
// const getImagesAndGraphQLNode = (node, auth, createNode, cacheSitePath) => {

//   const nodeStr = JSON.stringify(node)
//   // -------- Fetch the assets (images for now)
//   const urls = getUrls(nodeStr)

//   urls.forEach((url) => {
//     if (url.endsWith(`jpg`) || url.endsWith(`jpeg`) || url.endsWith(`png`) || url.endsWith(`gif`)) {
//       downloader.image({
//         url: url,
//         dest: cacheSitePath,
//         auth: auth,
//       })
//         .then(({ filename, image }) => {
//           // console.log(`Image saved to`, filename)
//         }).catch((err) => {
//           console.log(`Some error occurred. The image couldn\`t be downloaded.`, err)
//         })
//     }

//   })


// }


// if (type !== `SiteSetting`) {
//   // Re-fetching strategy init
//   let lastFetched
//   if (store.getState().status.plugins && store.getState().status.plugins[`gatsby-source-wordpress-acf`]) {
//     lastFetched = store.getState().status.plugins[`gatsby-source-wordpress-acf`].lastFetched

//     // TODO : Check why last fetched date is always undefined.
//     // Date format of pages and posts is "2017-06-16T22:30:22"

//   }

//   if (lastFetched) {
//     console.log(`The ${type}s source has been fetched previously.`, lastFetched)
//     console.log(`Optimized the URL so the previously-fetched data isn`t loaded twice`)
//     fetchURL = url

//     // TODO : build the query that will only get the content added or updated from previous fetch. 

//     // url = `${baseUrl}/jsonapi/node/article?filter[new-content][path]=changed&filter[new-content][value]=${parseInt(
//     //   new Date(lastFetched).getTime() / 1000
//     // ).toFixed(
//     //   0
//     // )}&filter[new-content][operator]=%3E&page[offset]=0&page[limit]=10`

//   } else {
//     fetchURL = url
//   }

// } else {

//   fetchURL = url

// }