/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 1506:
/***/ ((module) => {

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
  
    return self;
  }
  
  module.exports = _assertThisInitialized, module.exports.__esModule = true, module.exports["default"] = module.exports;
  
  /***/ }),
  
  /***/ 7154:
  /***/ ((module) => {
  
  function _extends() {
    module.exports = _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
  
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
  
      return target;
    }, module.exports.__esModule = true, module.exports["default"] = module.exports;
    return _extends.apply(this, arguments);
  }
  
  module.exports = _extends, module.exports.__esModule = true, module.exports["default"] = module.exports;
  
  /***/ }),
  
  /***/ 5354:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {
  
  var setPrototypeOf = __webpack_require__(9489);
  
  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    setPrototypeOf(subClass, superClass);
  }
  
  module.exports = _inheritsLoose, module.exports.__esModule = true, module.exports["default"] = module.exports;
  
  /***/ }),
  
  /***/ 5318:
  /***/ ((module) => {
  
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      "default": obj
    };
  }
  
  module.exports = _interopRequireDefault, module.exports.__esModule = true, module.exports["default"] = module.exports;
  
  /***/ }),
  
  /***/ 7316:
  /***/ ((module) => {
  
  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
  
    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }
  
    return target;
  }
  
  module.exports = _objectWithoutPropertiesLoose, module.exports.__esModule = true, module.exports["default"] = module.exports;
  
  /***/ }),
  
  /***/ 9489:
  /***/ ((module) => {
  
  function _setPrototypeOf(o, p) {
    module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    }, module.exports.__esModule = true, module.exports["default"] = module.exports;
    return _setPrototypeOf(o, p);
  }
  
  module.exports = _setPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;
  
  /***/ }),
  
  /***/ 1122:
  /***/ ((__unused_webpack_module, exports, __webpack_require__) => {
  
  "use strict";
  
  
  exports.__esModule = true;
  exports.shallowCompare = exports.validateRedirect = exports.insertParams = exports.resolve = exports.match = exports.pick = exports.startsWith = undefined;
  
  var _invariant = __webpack_require__(6128);
  
  var _invariant2 = _interopRequireDefault(_invariant);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  ////////////////////////////////////////////////////////////////////////////////
  // startsWith(string, search) - Check if `string` starts with `search`
  var startsWith = function startsWith(string, search) {
    return string.substr(0, search.length) === search;
  };
  
  ////////////////////////////////////////////////////////////////////////////////
  // pick(routes, uri)
  //
  // Ranks and picks the best route to match. Each segment gets the highest
  // amount of points, then the type of segment gets an additional amount of
  // points where
  //
  //     static > dynamic > splat > root
  //
  // This way we don't have to worry about the order of our routes, let the
  // computers do it.
  //
  // A route looks like this
  //
  //     { path, default, value }
  //
  // And a returned match looks like:
  //
  //     { route, params, uri }
  //
  // I know, I should use TypeScript not comments for these types.
  var pick = function pick(routes, uri) {
    var match = void 0;
    var default_ = void 0;
  
    var _uri$split = uri.split("?"),
        uriPathname = _uri$split[0];
  
    var uriSegments = segmentize(uriPathname);
    var isRootUri = uriSegments[0] === "";
    var ranked = rankRoutes(routes);
  
    for (var i = 0, l = ranked.length; i < l; i++) {
      var missed = false;
      var route = ranked[i].route;
  
      if (route.default) {
        default_ = {
          route: route,
          params: {},
          uri: uri
        };
        continue;
      }
  
      var routeSegments = segmentize(route.path);
      var params = {};
      var max = Math.max(uriSegments.length, routeSegments.length);
      var index = 0;
  
      for (; index < max; index++) {
        var routeSegment = routeSegments[index];
        var uriSegment = uriSegments[index];
  
        if (isSplat(routeSegment)) {
          // Hit a splat, just grab the rest, and return a match
          // uri:   /files/documents/work
          // route: /files/*
          var param = routeSegment.slice(1) || "*";
          params[param] = uriSegments.slice(index).map(decodeURIComponent).join("/");
          break;
        }
  
        if (uriSegment === undefined) {
          // URI is shorter than the route, no match
          // uri:   /users
          // route: /users/:userId
          missed = true;
          break;
        }
  
        var dynamicMatch = paramRe.exec(routeSegment);
  
        if (dynamicMatch && !isRootUri) {
          var matchIsNotReserved = reservedNames.indexOf(dynamicMatch[1]) === -1;
          !matchIsNotReserved ?  false ? 0 : (0, _invariant2.default)(false) : void 0;
          var value = decodeURIComponent(uriSegment);
          params[dynamicMatch[1]] = value;
        } else if (routeSegment !== uriSegment) {
          // Current segments don't match, not dynamic, not splat, so no match
          // uri:   /users/123/settings
          // route: /users/:id/profile
          missed = true;
          break;
        }
      }
  
      if (!missed) {
        match = {
          route: route,
          params: params,
          uri: "/" + uriSegments.slice(0, index).join("/")
        };
        break;
      }
    }
  
    return match || default_ || null;
  };
  
  ////////////////////////////////////////////////////////////////////////////////
  // match(path, uri) - Matches just one path to a uri, also lol
  var match = function match(path, uri) {
    return pick([{ path: path }], uri);
  };
  
  ////////////////////////////////////////////////////////////////////////////////
  // resolve(to, basepath)
  //
  // Resolves URIs as though every path is a directory, no files.  Relative URIs
  // in the browser can feel awkward because not only can you be "in a directory"
  // you can be "at a file", too. For example
  //
  //     browserSpecResolve('foo', '/bar/') => /bar/foo
  //     browserSpecResolve('foo', '/bar') => /foo
  //
  // But on the command line of a file system, it's not as complicated, you can't
  // `cd` from a file, only directories.  This way, links have to know less about
  // their current path. To go deeper you can do this:
  //
  //     <Link to="deeper"/>
  //     // instead of
  //     <Link to=`{${props.uri}/deeper}`/>
  //
  // Just like `cd`, if you want to go deeper from the command line, you do this:
  //
  //     cd deeper
  //     # not
  //     cd $(pwd)/deeper
  //
  // By treating every path as a directory, linking to relative paths should
  // require less contextual information and (fingers crossed) be more intuitive.
  var resolve = function resolve(to, base) {
    // /foo/bar, /baz/qux => /foo/bar
    if (startsWith(to, "/")) {
      return to;
    }
  
    var _to$split = to.split("?"),
        toPathname = _to$split[0],
        toQuery = _to$split[1];
  
    var _base$split = base.split("?"),
        basePathname = _base$split[0];
  
    var toSegments = segmentize(toPathname);
    var baseSegments = segmentize(basePathname);
  
    // ?a=b, /users?b=c => /users?a=b
    if (toSegments[0] === "") {
      return addQuery(basePathname, toQuery);
    }
  
    // profile, /users/789 => /users/789/profile
    if (!startsWith(toSegments[0], ".")) {
      var pathname = baseSegments.concat(toSegments).join("/");
      return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
    }
  
    // ./         /users/123  =>  /users/123
    // ../        /users/123  =>  /users
    // ../..      /users/123  =>  /
    // ../../one  /a/b/c/d    =>  /a/b/one
    // .././one   /a/b/c/d    =>  /a/b/c/one
    var allSegments = baseSegments.concat(toSegments);
    var segments = [];
    for (var i = 0, l = allSegments.length; i < l; i++) {
      var segment = allSegments[i];
      if (segment === "..") segments.pop();else if (segment !== ".") segments.push(segment);
    }
  
    return addQuery("/" + segments.join("/"), toQuery);
  };
  
  ////////////////////////////////////////////////////////////////////////////////
  // insertParams(path, params)
  
  var insertParams = function insertParams(path, params) {
    var _path$split = path.split("?"),
        pathBase = _path$split[0],
        _path$split$ = _path$split[1],
        query = _path$split$ === undefined ? "" : _path$split$;
  
    var segments = segmentize(pathBase);
    var constructedPath = "/" + segments.map(function (segment) {
      var match = paramRe.exec(segment);
      return match ? params[match[1]] : segment;
    }).join("/");
    var _params$location = params.location;
    _params$location = _params$location === undefined ? {} : _params$location;
    var _params$location$sear = _params$location.search,
        search = _params$location$sear === undefined ? "" : _params$location$sear;
  
    var searchSplit = search.split("?")[1] || "";
    constructedPath = addQuery(constructedPath, query, searchSplit);
    return constructedPath;
  };
  
  var validateRedirect = function validateRedirect(from, to) {
    var filter = function filter(segment) {
      return isDynamic(segment);
    };
    var fromString = segmentize(from).filter(filter).sort().join("/");
    var toString = segmentize(to).filter(filter).sort().join("/");
    return fromString === toString;
  };
  
  ////////////////////////////////////////////////////////////////////////////////
  // Junk
  var paramRe = /^:(.+)/;
  
  var SEGMENT_POINTS = 4;
  var STATIC_POINTS = 3;
  var DYNAMIC_POINTS = 2;
  var SPLAT_PENALTY = 1;
  var ROOT_POINTS = 1;
  
  var isRootSegment = function isRootSegment(segment) {
    return segment === "";
  };
  var isDynamic = function isDynamic(segment) {
    return paramRe.test(segment);
  };
  var isSplat = function isSplat(segment) {
    return segment && segment[0] === "*";
  };
  
  var rankRoute = function rankRoute(route, index) {
    var score = route.default ? 0 : segmentize(route.path).reduce(function (score, segment) {
      score += SEGMENT_POINTS;
      if (isRootSegment(segment)) score += ROOT_POINTS;else if (isDynamic(segment)) score += DYNAMIC_POINTS;else if (isSplat(segment)) score -= SEGMENT_POINTS + SPLAT_PENALTY;else score += STATIC_POINTS;
      return score;
    }, 0);
    return { route: route, score: score, index: index };
  };
  
  var rankRoutes = function rankRoutes(routes) {
    return routes.map(rankRoute).sort(function (a, b) {
      return a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index;
    });
  };
  
  var segmentize = function segmentize(uri) {
    return uri
    // strip starting/ending slashes
    .replace(/(^\/+|\/+$)/g, "").split("/");
  };
  
  var addQuery = function addQuery(pathname) {
    for (var _len = arguments.length, query = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      query[_key - 1] = arguments[_key];
    }
  
    query = query.filter(function (q) {
      return q && q.length > 0;
    });
    return pathname + (query && query.length > 0 ? "?" + query.join("&") : "");
  };
  
  var reservedNames = ["uri", "path"];
  
  /**
   * Shallow compares two objects.
   * @param {Object} obj1 The first object to compare.
   * @param {Object} obj2 The second object to compare.
   */
  var shallowCompare = function shallowCompare(obj1, obj2) {
    var obj1Keys = Object.keys(obj1);
    return obj1Keys.length === Object.keys(obj2).length && obj1Keys.every(function (key) {
      return obj2.hasOwnProperty(key) && obj1[key] === obj2[key];
    });
  };
  
  ////////////////////////////////////////////////////////////////////////////////
  exports.startsWith = startsWith;
  exports.pick = pick;
  exports.match = match;
  exports.resolve = resolve;
  exports.insertParams = insertParams;
  exports.validateRedirect = validateRedirect;
  exports.shallowCompare = shallowCompare;
  
  /***/ }),
  
  /***/ 5863:
  /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
  
  "use strict";
  // ESM COMPAT FLAG
  __webpack_require__.r(__webpack_exports__);
  
  // EXPORTS
  __webpack_require__.d(__webpack_exports__, {
    "TemplateTag": () => (/* reexport */ TemplateTag_TemplateTag),
    "codeBlock": () => (/* reexport */ html_html),
    "commaLists": () => (/* reexport */ commaLists_commaLists),
    "commaListsAnd": () => (/* reexport */ commaListsAnd_commaListsAnd),
    "commaListsOr": () => (/* reexport */ commaListsOr_commaListsOr),
    "html": () => (/* reexport */ html_html),
    "inlineArrayTransformer": () => (/* reexport */ inlineArrayTransformer_inlineArrayTransformer),
    "inlineLists": () => (/* reexport */ inlineLists_inlineLists),
    "oneLine": () => (/* reexport */ oneLine_oneLine),
    "oneLineCommaLists": () => (/* reexport */ oneLineCommaLists_oneLineCommaLists),
    "oneLineCommaListsAnd": () => (/* reexport */ oneLineCommaListsAnd_oneLineCommaListsAnd),
    "oneLineCommaListsOr": () => (/* reexport */ oneLineCommaListsOr_oneLineCommaListsOr),
    "oneLineInlineLists": () => (/* reexport */ oneLineInlineLists_oneLineInlineLists),
    "oneLineTrim": () => (/* reexport */ oneLineTrim_oneLineTrim),
    "removeNonPrintingValuesTransformer": () => (/* reexport */ removeNonPrintingValuesTransformer_removeNonPrintingValuesTransformer),
    "replaceResultTransformer": () => (/* reexport */ replaceResultTransformer_replaceResultTransformer),
    "replaceStringTransformer": () => (/* reexport */ replaceStringTransformer_replaceStringTransformer),
    "replaceSubstitutionTransformer": () => (/* reexport */ replaceSubstitutionTransformer_replaceSubstitutionTransformer),
    "safeHtml": () => (/* reexport */ safeHtml_safeHtml),
    "source": () => (/* reexport */ html_html),
    "splitStringTransformer": () => (/* reexport */ splitStringTransformer_splitStringTransformer),
    "stripIndent": () => (/* reexport */ stripIndent_stripIndent),
    "stripIndentTransformer": () => (/* reexport */ stripIndentTransformer_stripIndentTransformer),
    "stripIndents": () => (/* reexport */ stripIndents_stripIndents),
    "trimResultTransformer": () => (/* reexport */ trimResultTransformer_trimResultTransformer)
  });
  
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/TemplateTag/TemplateTag.js
  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
  
  var _templateObject = _taggedTemplateLiteral(['', ''], ['', '']);
  
  function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
  
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  
  /**
   * @class TemplateTag
   * @classdesc Consumes a pipeline of composable transformer plugins and produces a template tag.
   */
  var TemplateTag = function () {
    /**
     * constructs a template tag
     * @constructs TemplateTag
     * @param  {...Object} [...transformers] - an array or arguments list of transformers
     * @return {Function}                    - a template tag
     */
    function TemplateTag() {
      var _this = this;
  
      for (var _len = arguments.length, transformers = Array(_len), _key = 0; _key < _len; _key++) {
        transformers[_key] = arguments[_key];
      }
  
      _classCallCheck(this, TemplateTag);
  
      this.tag = function (strings) {
        for (var _len2 = arguments.length, expressions = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          expressions[_key2 - 1] = arguments[_key2];
        }
  
        if (typeof strings === 'function') {
          // if the first argument passed is a function, assume it is a template tag and return
          // an intermediary tag that processes the template using the aforementioned tag, passing the
          // result to our tag
          return _this.interimTag.bind(_this, strings);
        }
  
        if (typeof strings === 'string') {
          // if the first argument passed is a string, just transform it
          return _this.transformEndResult(strings);
        }
  
        // else, return a transformed end result of processing the template with our tag
        strings = strings.map(_this.transformString.bind(_this));
        return _this.transformEndResult(strings.reduce(_this.processSubstitutions.bind(_this, expressions)));
      };
  
      // if first argument is an array, extrude it as a list of transformers
      if (transformers.length > 0 && Array.isArray(transformers[0])) {
        transformers = transformers[0];
      }
  
      // if any transformers are functions, this means they are not initiated - automatically initiate them
      this.transformers = transformers.map(function (transformer) {
        return typeof transformer === 'function' ? transformer() : transformer;
      });
  
      // return an ES2015 template tag
      return this.tag;
    }
  
    /**
     * Applies all transformers to a template literal tagged with this method.
     * If a function is passed as the first argument, assumes the function is a template tag
     * and applies it to the template, returning a template tag.
     * @param  {(Function|String|Array<String>)} strings        - Either a template tag or an array containing template strings separated by identifier
     * @param  {...*}                            ...expressions - Optional list of substitution values.
     * @return {(String|Function)}                              - Either an intermediary tag function or the results of processing the template.
     */
  
  
    _createClass(TemplateTag, [{
      key: 'interimTag',
  
  
      /**
       * An intermediary template tag that receives a template tag and passes the result of calling the template with the received
       * template tag to our own template tag.
       * @param  {Function}        nextTag          - the received template tag
       * @param  {Array<String>}   template         - the template to process
       * @param  {...*}            ...substitutions - `substitutions` is an array of all substitutions in the template
       * @return {*}                                - the final processed value
       */
      value: function interimTag(previousTag, template) {
        for (var _len3 = arguments.length, substitutions = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
          substitutions[_key3 - 2] = arguments[_key3];
        }
  
        return this.tag(_templateObject, previousTag.apply(undefined, [template].concat(substitutions)));
      }
  
      /**
       * Performs bulk processing on the tagged template, transforming each substitution and then
       * concatenating the resulting values into a string.
       * @param  {Array<*>} substitutions - an array of all remaining substitutions present in this template
       * @param  {String}   resultSoFar   - this iteration's result string so far
       * @param  {String}   remainingPart - the template chunk after the current substitution
       * @return {String}                 - the result of joining this iteration's processed substitution with the result
       */
  
    }, {
      key: 'processSubstitutions',
      value: function processSubstitutions(substitutions, resultSoFar, remainingPart) {
        var substitution = this.transformSubstitution(substitutions.shift(), resultSoFar);
        return ''.concat(resultSoFar, substitution, remainingPart);
      }
  
      /**
       * Iterate through each transformer, applying the transformer's `onString` method to the template
       * strings before all substitutions are processed.
       * @param {String}  str - The input string
       * @return {String}     - The final results of processing each transformer
       */
  
    }, {
      key: 'transformString',
      value: function transformString(str) {
        var cb = function cb(res, transform) {
          return transform.onString ? transform.onString(res) : res;
        };
        return this.transformers.reduce(cb, str);
      }
  
      /**
       * When a substitution is encountered, iterates through each transformer and applies the transformer's
       * `onSubstitution` method to the substitution.
       * @param  {*}      substitution - The current substitution
       * @param  {String} resultSoFar  - The result up to and excluding this substitution.
       * @return {*}                   - The final result of applying all substitution transformations.
       */
  
    }, {
      key: 'transformSubstitution',
      value: function transformSubstitution(substitution, resultSoFar) {
        var cb = function cb(res, transform) {
          return transform.onSubstitution ? transform.onSubstitution(res, resultSoFar) : res;
        };
        return this.transformers.reduce(cb, substitution);
      }
  
      /**
       * Iterates through each transformer, applying the transformer's `onEndResult` method to the
       * template literal after all substitutions have finished processing.
       * @param  {String} endResult - The processed template, just before it is returned from the tag
       * @return {String}           - The final results of processing each transformer
       */
  
    }, {
      key: 'transformEndResult',
      value: function transformEndResult(endResult) {
        var cb = function cb(res, transform) {
          return transform.onEndResult ? transform.onEndResult(res) : res;
        };
        return this.transformers.reduce(cb, endResult);
      }
    }]);
  
    return TemplateTag;
  }();
  
  /* harmony default export */ const TemplateTag_TemplateTag = (TemplateTag);
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9UZW1wbGF0ZVRhZy9UZW1wbGF0ZVRhZy5qcyJdLCJuYW1lcyI6WyJUZW1wbGF0ZVRhZyIsInRyYW5zZm9ybWVycyIsInRhZyIsInN0cmluZ3MiLCJleHByZXNzaW9ucyIsImludGVyaW1UYWciLCJiaW5kIiwidHJhbnNmb3JtRW5kUmVzdWx0IiwibWFwIiwidHJhbnNmb3JtU3RyaW5nIiwicmVkdWNlIiwicHJvY2Vzc1N1YnN0aXR1dGlvbnMiLCJsZW5ndGgiLCJBcnJheSIsImlzQXJyYXkiLCJ0cmFuc2Zvcm1lciIsInByZXZpb3VzVGFnIiwidGVtcGxhdGUiLCJzdWJzdGl0dXRpb25zIiwicmVzdWx0U29GYXIiLCJyZW1haW5pbmdQYXJ0Iiwic3Vic3RpdHV0aW9uIiwidHJhbnNmb3JtU3Vic3RpdHV0aW9uIiwic2hpZnQiLCJjb25jYXQiLCJzdHIiLCJjYiIsInJlcyIsInRyYW5zZm9ybSIsIm9uU3RyaW5nIiwib25TdWJzdGl0dXRpb24iLCJlbmRSZXN1bHQiLCJvbkVuZFJlc3VsdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7OztJQUlxQkEsVztBQUNuQjs7Ozs7O0FBTUEseUJBQTZCO0FBQUE7O0FBQUEsc0NBQWRDLFlBQWM7QUFBZEEsa0JBQWM7QUFBQTs7QUFBQTs7QUFBQSxTQXVCN0JDLEdBdkI2QixHQXVCdkIsVUFBQ0MsT0FBRCxFQUE2QjtBQUFBLHlDQUFoQkMsV0FBZ0I7QUFBaEJBLG1CQUFnQjtBQUFBOztBQUNqQyxVQUFJLE9BQU9ELE9BQVAsS0FBbUIsVUFBdkIsRUFBbUM7QUFDakM7QUFDQTtBQUNBO0FBQ0EsZUFBTyxNQUFLRSxVQUFMLENBQWdCQyxJQUFoQixDQUFxQixLQUFyQixFQUEyQkgsT0FBM0IsQ0FBUDtBQUNEOztBQUVELFVBQUksT0FBT0EsT0FBUCxLQUFtQixRQUF2QixFQUFpQztBQUMvQjtBQUNBLGVBQU8sTUFBS0ksa0JBQUwsQ0FBd0JKLE9BQXhCLENBQVA7QUFDRDs7QUFFRDtBQUNBQSxnQkFBVUEsUUFBUUssR0FBUixDQUFZLE1BQUtDLGVBQUwsQ0FBcUJILElBQXJCLENBQTBCLEtBQTFCLENBQVosQ0FBVjtBQUNBLGFBQU8sTUFBS0Msa0JBQUwsQ0FDTEosUUFBUU8sTUFBUixDQUFlLE1BQUtDLG9CQUFMLENBQTBCTCxJQUExQixDQUErQixLQUEvQixFQUFxQ0YsV0FBckMsQ0FBZixDQURLLENBQVA7QUFHRCxLQXpDNEI7O0FBQzNCO0FBQ0EsUUFBSUgsYUFBYVcsTUFBYixHQUFzQixDQUF0QixJQUEyQkMsTUFBTUMsT0FBTixDQUFjYixhQUFhLENBQWIsQ0FBZCxDQUEvQixFQUErRDtBQUM3REEscUJBQWVBLGFBQWEsQ0FBYixDQUFmO0FBQ0Q7O0FBRUQ7QUFDQSxTQUFLQSxZQUFMLEdBQW9CQSxhQUFhTyxHQUFiLENBQWlCLHVCQUFlO0FBQ2xELGFBQU8sT0FBT08sV0FBUCxLQUF1QixVQUF2QixHQUFvQ0EsYUFBcEMsR0FBb0RBLFdBQTNEO0FBQ0QsS0FGbUIsQ0FBcEI7O0FBSUE7QUFDQSxXQUFPLEtBQUtiLEdBQVo7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozs7Ozs7QUE0QkE7Ozs7Ozs7OytCQVFXYyxXLEVBQWFDLFEsRUFBNEI7QUFBQSx5Q0FBZkMsYUFBZTtBQUFmQSxxQkFBZTtBQUFBOztBQUNsRCxhQUFPLEtBQUtoQixHQUFaLGtCQUFrQmMsOEJBQVlDLFFBQVosU0FBeUJDLGFBQXpCLEVBQWxCO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7O3lDQVFxQkEsYSxFQUFlQyxXLEVBQWFDLGEsRUFBZTtBQUM5RCxVQUFNQyxlQUFlLEtBQUtDLHFCQUFMLENBQ25CSixjQUFjSyxLQUFkLEVBRG1CLEVBRW5CSixXQUZtQixDQUFyQjtBQUlBLGFBQU8sR0FBR0ssTUFBSCxDQUFVTCxXQUFWLEVBQXVCRSxZQUF2QixFQUFxQ0QsYUFBckMsQ0FBUDtBQUNEOztBQUVEOzs7Ozs7Ozs7b0NBTWdCSyxHLEVBQUs7QUFDbkIsVUFBTUMsS0FBSyxTQUFMQSxFQUFLLENBQUNDLEdBQUQsRUFBTUMsU0FBTjtBQUFBLGVBQ1RBLFVBQVVDLFFBQVYsR0FBcUJELFVBQVVDLFFBQVYsQ0FBbUJGLEdBQW5CLENBQXJCLEdBQStDQSxHQUR0QztBQUFBLE9BQVg7QUFFQSxhQUFPLEtBQUsxQixZQUFMLENBQWtCUyxNQUFsQixDQUF5QmdCLEVBQXpCLEVBQTZCRCxHQUE3QixDQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7MENBT3NCSixZLEVBQWNGLFcsRUFBYTtBQUMvQyxVQUFNTyxLQUFLLFNBQUxBLEVBQUssQ0FBQ0MsR0FBRCxFQUFNQyxTQUFOO0FBQUEsZUFDVEEsVUFBVUUsY0FBVixHQUNJRixVQUFVRSxjQUFWLENBQXlCSCxHQUF6QixFQUE4QlIsV0FBOUIsQ0FESixHQUVJUSxHQUhLO0FBQUEsT0FBWDtBQUlBLGFBQU8sS0FBSzFCLFlBQUwsQ0FBa0JTLE1BQWxCLENBQXlCZ0IsRUFBekIsRUFBNkJMLFlBQTdCLENBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7O3VDQU1tQlUsUyxFQUFXO0FBQzVCLFVBQU1MLEtBQUssU0FBTEEsRUFBSyxDQUFDQyxHQUFELEVBQU1DLFNBQU47QUFBQSxlQUNUQSxVQUFVSSxXQUFWLEdBQXdCSixVQUFVSSxXQUFWLENBQXNCTCxHQUF0QixDQUF4QixHQUFxREEsR0FENUM7QUFBQSxPQUFYO0FBRUEsYUFBTyxLQUFLMUIsWUFBTCxDQUFrQlMsTUFBbEIsQ0FBeUJnQixFQUF6QixFQUE2QkssU0FBN0IsQ0FBUDtBQUNEOzs7Ozs7ZUFuSGtCL0IsVyIsImZpbGUiOiJUZW1wbGF0ZVRhZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGNsYXNzIFRlbXBsYXRlVGFnXG4gKiBAY2xhc3NkZXNjIENvbnN1bWVzIGEgcGlwZWxpbmUgb2YgY29tcG9zYWJsZSB0cmFuc2Zvcm1lciBwbHVnaW5zIGFuZCBwcm9kdWNlcyBhIHRlbXBsYXRlIHRhZy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVtcGxhdGVUYWcge1xuICAvKipcbiAgICogY29uc3RydWN0cyBhIHRlbXBsYXRlIHRhZ1xuICAgKiBAY29uc3RydWN0cyBUZW1wbGF0ZVRhZ1xuICAgKiBAcGFyYW0gIHsuLi5PYmplY3R9IFsuLi50cmFuc2Zvcm1lcnNdIC0gYW4gYXJyYXkgb3IgYXJndW1lbnRzIGxpc3Qgb2YgdHJhbnNmb3JtZXJzXG4gICAqIEByZXR1cm4ge0Z1bmN0aW9ufSAgICAgICAgICAgICAgICAgICAgLSBhIHRlbXBsYXRlIHRhZ1xuICAgKi9cbiAgY29uc3RydWN0b3IoLi4udHJhbnNmb3JtZXJzKSB7XG4gICAgLy8gaWYgZmlyc3QgYXJndW1lbnQgaXMgYW4gYXJyYXksIGV4dHJ1ZGUgaXQgYXMgYSBsaXN0IG9mIHRyYW5zZm9ybWVyc1xuICAgIGlmICh0cmFuc2Zvcm1lcnMubGVuZ3RoID4gMCAmJiBBcnJheS5pc0FycmF5KHRyYW5zZm9ybWVyc1swXSkpIHtcbiAgICAgIHRyYW5zZm9ybWVycyA9IHRyYW5zZm9ybWVyc1swXTtcbiAgICB9XG5cbiAgICAvLyBpZiBhbnkgdHJhbnNmb3JtZXJzIGFyZSBmdW5jdGlvbnMsIHRoaXMgbWVhbnMgdGhleSBhcmUgbm90IGluaXRpYXRlZCAtIGF1dG9tYXRpY2FsbHkgaW5pdGlhdGUgdGhlbVxuICAgIHRoaXMudHJhbnNmb3JtZXJzID0gdHJhbnNmb3JtZXJzLm1hcCh0cmFuc2Zvcm1lciA9PiB7XG4gICAgICByZXR1cm4gdHlwZW9mIHRyYW5zZm9ybWVyID09PSAnZnVuY3Rpb24nID8gdHJhbnNmb3JtZXIoKSA6IHRyYW5zZm9ybWVyO1xuICAgIH0pO1xuXG4gICAgLy8gcmV0dXJuIGFuIEVTMjAxNSB0ZW1wbGF0ZSB0YWdcbiAgICByZXR1cm4gdGhpcy50YWc7XG4gIH1cblxuICAvKipcbiAgICogQXBwbGllcyBhbGwgdHJhbnNmb3JtZXJzIHRvIGEgdGVtcGxhdGUgbGl0ZXJhbCB0YWdnZWQgd2l0aCB0aGlzIG1ldGhvZC5cbiAgICogSWYgYSBmdW5jdGlvbiBpcyBwYXNzZWQgYXMgdGhlIGZpcnN0IGFyZ3VtZW50LCBhc3N1bWVzIHRoZSBmdW5jdGlvbiBpcyBhIHRlbXBsYXRlIHRhZ1xuICAgKiBhbmQgYXBwbGllcyBpdCB0byB0aGUgdGVtcGxhdGUsIHJldHVybmluZyBhIHRlbXBsYXRlIHRhZy5cbiAgICogQHBhcmFtICB7KEZ1bmN0aW9ufFN0cmluZ3xBcnJheTxTdHJpbmc+KX0gc3RyaW5ncyAgICAgICAgLSBFaXRoZXIgYSB0ZW1wbGF0ZSB0YWcgb3IgYW4gYXJyYXkgY29udGFpbmluZyB0ZW1wbGF0ZSBzdHJpbmdzIHNlcGFyYXRlZCBieSBpZGVudGlmaWVyXG4gICAqIEBwYXJhbSAgey4uLip9ICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLmV4cHJlc3Npb25zIC0gT3B0aW9uYWwgbGlzdCBvZiBzdWJzdGl0dXRpb24gdmFsdWVzLlxuICAgKiBAcmV0dXJuIHsoU3RyaW5nfEZ1bmN0aW9uKX0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIEVpdGhlciBhbiBpbnRlcm1lZGlhcnkgdGFnIGZ1bmN0aW9uIG9yIHRoZSByZXN1bHRzIG9mIHByb2Nlc3NpbmcgdGhlIHRlbXBsYXRlLlxuICAgKi9cbiAgdGFnID0gKHN0cmluZ3MsIC4uLmV4cHJlc3Npb25zKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBzdHJpbmdzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBpZiB0aGUgZmlyc3QgYXJndW1lbnQgcGFzc2VkIGlzIGEgZnVuY3Rpb24sIGFzc3VtZSBpdCBpcyBhIHRlbXBsYXRlIHRhZyBhbmQgcmV0dXJuXG4gICAgICAvLyBhbiBpbnRlcm1lZGlhcnkgdGFnIHRoYXQgcHJvY2Vzc2VzIHRoZSB0ZW1wbGF0ZSB1c2luZyB0aGUgYWZvcmVtZW50aW9uZWQgdGFnLCBwYXNzaW5nIHRoZVxuICAgICAgLy8gcmVzdWx0IHRvIG91ciB0YWdcbiAgICAgIHJldHVybiB0aGlzLmludGVyaW1UYWcuYmluZCh0aGlzLCBzdHJpbmdzKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHN0cmluZ3MgPT09ICdzdHJpbmcnKSB7XG4gICAgICAvLyBpZiB0aGUgZmlyc3QgYXJndW1lbnQgcGFzc2VkIGlzIGEgc3RyaW5nLCBqdXN0IHRyYW5zZm9ybSBpdFxuICAgICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtRW5kUmVzdWx0KHN0cmluZ3MpO1xuICAgIH1cblxuICAgIC8vIGVsc2UsIHJldHVybiBhIHRyYW5zZm9ybWVkIGVuZCByZXN1bHQgb2YgcHJvY2Vzc2luZyB0aGUgdGVtcGxhdGUgd2l0aCBvdXIgdGFnXG4gICAgc3RyaW5ncyA9IHN0cmluZ3MubWFwKHRoaXMudHJhbnNmb3JtU3RyaW5nLmJpbmQodGhpcykpO1xuICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybUVuZFJlc3VsdChcbiAgICAgIHN0cmluZ3MucmVkdWNlKHRoaXMucHJvY2Vzc1N1YnN0aXR1dGlvbnMuYmluZCh0aGlzLCBleHByZXNzaW9ucykpLFxuICAgICk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFuIGludGVybWVkaWFyeSB0ZW1wbGF0ZSB0YWcgdGhhdCByZWNlaXZlcyBhIHRlbXBsYXRlIHRhZyBhbmQgcGFzc2VzIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgdGVtcGxhdGUgd2l0aCB0aGUgcmVjZWl2ZWRcbiAgICogdGVtcGxhdGUgdGFnIHRvIG91ciBvd24gdGVtcGxhdGUgdGFnLlxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gICAgICAgIG5leHRUYWcgICAgICAgICAgLSB0aGUgcmVjZWl2ZWQgdGVtcGxhdGUgdGFnXG4gICAqIEBwYXJhbSAge0FycmF5PFN0cmluZz59ICAgdGVtcGxhdGUgICAgICAgICAtIHRoZSB0ZW1wbGF0ZSB0byBwcm9jZXNzXG4gICAqIEBwYXJhbSAgey4uLip9ICAgICAgICAgICAgLi4uc3Vic3RpdHV0aW9ucyAtIGBzdWJzdGl0dXRpb25zYCBpcyBhbiBhcnJheSBvZiBhbGwgc3Vic3RpdHV0aW9ucyBpbiB0aGUgdGVtcGxhdGVcbiAgICogQHJldHVybiB7Kn0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gdGhlIGZpbmFsIHByb2Nlc3NlZCB2YWx1ZVxuICAgKi9cbiAgaW50ZXJpbVRhZyhwcmV2aW91c1RhZywgdGVtcGxhdGUsIC4uLnN1YnN0aXR1dGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy50YWdgJHtwcmV2aW91c1RhZyh0ZW1wbGF0ZSwgLi4uc3Vic3RpdHV0aW9ucyl9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyBidWxrIHByb2Nlc3Npbmcgb24gdGhlIHRhZ2dlZCB0ZW1wbGF0ZSwgdHJhbnNmb3JtaW5nIGVhY2ggc3Vic3RpdHV0aW9uIGFuZCB0aGVuXG4gICAqIGNvbmNhdGVuYXRpbmcgdGhlIHJlc3VsdGluZyB2YWx1ZXMgaW50byBhIHN0cmluZy5cbiAgICogQHBhcmFtICB7QXJyYXk8Kj59IHN1YnN0aXR1dGlvbnMgLSBhbiBhcnJheSBvZiBhbGwgcmVtYWluaW5nIHN1YnN0aXR1dGlvbnMgcHJlc2VudCBpbiB0aGlzIHRlbXBsYXRlXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICByZXN1bHRTb0ZhciAgIC0gdGhpcyBpdGVyYXRpb24ncyByZXN1bHQgc3RyaW5nIHNvIGZhclxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgcmVtYWluaW5nUGFydCAtIHRoZSB0ZW1wbGF0ZSBjaHVuayBhZnRlciB0aGUgY3VycmVudCBzdWJzdGl0dXRpb25cbiAgICogQHJldHVybiB7U3RyaW5nfSAgICAgICAgICAgICAgICAgLSB0aGUgcmVzdWx0IG9mIGpvaW5pbmcgdGhpcyBpdGVyYXRpb24ncyBwcm9jZXNzZWQgc3Vic3RpdHV0aW9uIHdpdGggdGhlIHJlc3VsdFxuICAgKi9cbiAgcHJvY2Vzc1N1YnN0aXR1dGlvbnMoc3Vic3RpdHV0aW9ucywgcmVzdWx0U29GYXIsIHJlbWFpbmluZ1BhcnQpIHtcbiAgICBjb25zdCBzdWJzdGl0dXRpb24gPSB0aGlzLnRyYW5zZm9ybVN1YnN0aXR1dGlvbihcbiAgICAgIHN1YnN0aXR1dGlvbnMuc2hpZnQoKSxcbiAgICAgIHJlc3VsdFNvRmFyLFxuICAgICk7XG4gICAgcmV0dXJuICcnLmNvbmNhdChyZXN1bHRTb0Zhciwgc3Vic3RpdHV0aW9uLCByZW1haW5pbmdQYXJ0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVyYXRlIHRocm91Z2ggZWFjaCB0cmFuc2Zvcm1lciwgYXBwbHlpbmcgdGhlIHRyYW5zZm9ybWVyJ3MgYG9uU3RyaW5nYCBtZXRob2QgdG8gdGhlIHRlbXBsYXRlXG4gICAqIHN0cmluZ3MgYmVmb3JlIGFsbCBzdWJzdGl0dXRpb25zIGFyZSBwcm9jZXNzZWQuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSAgc3RyIC0gVGhlIGlucHV0IHN0cmluZ1xuICAgKiBAcmV0dXJuIHtTdHJpbmd9ICAgICAtIFRoZSBmaW5hbCByZXN1bHRzIG9mIHByb2Nlc3NpbmcgZWFjaCB0cmFuc2Zvcm1lclxuICAgKi9cbiAgdHJhbnNmb3JtU3RyaW5nKHN0cikge1xuICAgIGNvbnN0IGNiID0gKHJlcywgdHJhbnNmb3JtKSA9PlxuICAgICAgdHJhbnNmb3JtLm9uU3RyaW5nID8gdHJhbnNmb3JtLm9uU3RyaW5nKHJlcykgOiByZXM7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtZXJzLnJlZHVjZShjYiwgc3RyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIGEgc3Vic3RpdHV0aW9uIGlzIGVuY291bnRlcmVkLCBpdGVyYXRlcyB0aHJvdWdoIGVhY2ggdHJhbnNmb3JtZXIgYW5kIGFwcGxpZXMgdGhlIHRyYW5zZm9ybWVyJ3NcbiAgICogYG9uU3Vic3RpdHV0aW9uYCBtZXRob2QgdG8gdGhlIHN1YnN0aXR1dGlvbi5cbiAgICogQHBhcmFtICB7Kn0gICAgICBzdWJzdGl0dXRpb24gLSBUaGUgY3VycmVudCBzdWJzdGl0dXRpb25cbiAgICogQHBhcmFtICB7U3RyaW5nfSByZXN1bHRTb0ZhciAgLSBUaGUgcmVzdWx0IHVwIHRvIGFuZCBleGNsdWRpbmcgdGhpcyBzdWJzdGl0dXRpb24uXG4gICAqIEByZXR1cm4geyp9ICAgICAgICAgICAgICAgICAgIC0gVGhlIGZpbmFsIHJlc3VsdCBvZiBhcHBseWluZyBhbGwgc3Vic3RpdHV0aW9uIHRyYW5zZm9ybWF0aW9ucy5cbiAgICovXG4gIHRyYW5zZm9ybVN1YnN0aXR1dGlvbihzdWJzdGl0dXRpb24sIHJlc3VsdFNvRmFyKSB7XG4gICAgY29uc3QgY2IgPSAocmVzLCB0cmFuc2Zvcm0pID0+XG4gICAgICB0cmFuc2Zvcm0ub25TdWJzdGl0dXRpb25cbiAgICAgICAgPyB0cmFuc2Zvcm0ub25TdWJzdGl0dXRpb24ocmVzLCByZXN1bHRTb0ZhcilcbiAgICAgICAgOiByZXM7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtZXJzLnJlZHVjZShjYiwgc3Vic3RpdHV0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVyYXRlcyB0aHJvdWdoIGVhY2ggdHJhbnNmb3JtZXIsIGFwcGx5aW5nIHRoZSB0cmFuc2Zvcm1lcidzIGBvbkVuZFJlc3VsdGAgbWV0aG9kIHRvIHRoZVxuICAgKiB0ZW1wbGF0ZSBsaXRlcmFsIGFmdGVyIGFsbCBzdWJzdGl0dXRpb25zIGhhdmUgZmluaXNoZWQgcHJvY2Vzc2luZy5cbiAgICogQHBhcmFtICB7U3RyaW5nfSBlbmRSZXN1bHQgLSBUaGUgcHJvY2Vzc2VkIHRlbXBsYXRlLCBqdXN0IGJlZm9yZSBpdCBpcyByZXR1cm5lZCBmcm9tIHRoZSB0YWdcbiAgICogQHJldHVybiB7U3RyaW5nfSAgICAgICAgICAgLSBUaGUgZmluYWwgcmVzdWx0cyBvZiBwcm9jZXNzaW5nIGVhY2ggdHJhbnNmb3JtZXJcbiAgICovXG4gIHRyYW5zZm9ybUVuZFJlc3VsdChlbmRSZXN1bHQpIHtcbiAgICBjb25zdCBjYiA9IChyZXMsIHRyYW5zZm9ybSkgPT5cbiAgICAgIHRyYW5zZm9ybS5vbkVuZFJlc3VsdCA/IHRyYW5zZm9ybS5vbkVuZFJlc3VsdChyZXMpIDogcmVzO1xuICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybWVycy5yZWR1Y2UoY2IsIGVuZFJlc3VsdCk7XG4gIH1cbn1cbiJdfQ==
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/TemplateTag/index.js
  
  
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9UZW1wbGF0ZVRhZy9pbmRleC5qcyJdLCJuYW1lcyI6WyJkZWZhdWx0Il0sIm1hcHBpbmdzIjoicUJBQW9CLGU7cUJBQWJBLE8iLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBmcm9tICcuL1RlbXBsYXRlVGFnJztcbiJdfQ==
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/trimResultTransformer/trimResultTransformer.js
  /**
   * TemplateTag transformer that trims whitespace on the end result of a tagged template
   * @param  {String} side = '' - The side of the string to trim. Can be 'start' or 'end' (alternatively 'left' or 'right')
   * @return {Object}           - a TemplateTag transformer
   */
  var trimResultTransformer = function trimResultTransformer() {
    var side = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return {
      onEndResult: function onEndResult(endResult) {
        if (side === '') {
          return endResult.trim();
        }
  
        side = side.toLowerCase();
  
        if (side === 'start' || side === 'left') {
          return endResult.replace(/^\s*/, '');
        }
  
        if (side === 'end' || side === 'right') {
          return endResult.replace(/\s*$/, '');
        }
  
        throw new Error('Side not supported: ' + side);
      }
    };
  };
  
  /* harmony default export */ const trimResultTransformer_trimResultTransformer = (trimResultTransformer);
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90cmltUmVzdWx0VHJhbnNmb3JtZXIvdHJpbVJlc3VsdFRyYW5zZm9ybWVyLmpzIl0sIm5hbWVzIjpbInRyaW1SZXN1bHRUcmFuc2Zvcm1lciIsInNpZGUiLCJvbkVuZFJlc3VsdCIsImVuZFJlc3VsdCIsInRyaW0iLCJ0b0xvd2VyQ2FzZSIsInJlcGxhY2UiLCJFcnJvciJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FBS0EsSUFBTUEsd0JBQXdCLFNBQXhCQSxxQkFBd0I7QUFBQSxNQUFDQyxJQUFELHVFQUFRLEVBQVI7QUFBQSxTQUFnQjtBQUM1Q0MsZUFENEMsdUJBQ2hDQyxTQURnQyxFQUNyQjtBQUNyQixVQUFJRixTQUFTLEVBQWIsRUFBaUI7QUFDZixlQUFPRSxVQUFVQyxJQUFWLEVBQVA7QUFDRDs7QUFFREgsYUFBT0EsS0FBS0ksV0FBTCxFQUFQOztBQUVBLFVBQUlKLFNBQVMsT0FBVCxJQUFvQkEsU0FBUyxNQUFqQyxFQUF5QztBQUN2QyxlQUFPRSxVQUFVRyxPQUFWLENBQWtCLE1BQWxCLEVBQTBCLEVBQTFCLENBQVA7QUFDRDs7QUFFRCxVQUFJTCxTQUFTLEtBQVQsSUFBa0JBLFNBQVMsT0FBL0IsRUFBd0M7QUFDdEMsZUFBT0UsVUFBVUcsT0FBVixDQUFrQixNQUFsQixFQUEwQixFQUExQixDQUFQO0FBQ0Q7O0FBRUQsWUFBTSxJQUFJQyxLQUFKLDBCQUFpQ04sSUFBakMsQ0FBTjtBQUNEO0FBakIyQyxHQUFoQjtBQUFBLENBQTlCOztBQW9CQSxlQUFlRCxxQkFBZiIsImZpbGUiOiJ0cmltUmVzdWx0VHJhbnNmb3JtZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRlbXBsYXRlVGFnIHRyYW5zZm9ybWVyIHRoYXQgdHJpbXMgd2hpdGVzcGFjZSBvbiB0aGUgZW5kIHJlc3VsdCBvZiBhIHRhZ2dlZCB0ZW1wbGF0ZVxuICogQHBhcmFtICB7U3RyaW5nfSBzaWRlID0gJycgLSBUaGUgc2lkZSBvZiB0aGUgc3RyaW5nIHRvIHRyaW0uIENhbiBiZSAnc3RhcnQnIG9yICdlbmQnIChhbHRlcm5hdGl2ZWx5ICdsZWZ0JyBvciAncmlnaHQnKVxuICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgLSBhIFRlbXBsYXRlVGFnIHRyYW5zZm9ybWVyXG4gKi9cbmNvbnN0IHRyaW1SZXN1bHRUcmFuc2Zvcm1lciA9IChzaWRlID0gJycpID0+ICh7XG4gIG9uRW5kUmVzdWx0KGVuZFJlc3VsdCkge1xuICAgIGlmIChzaWRlID09PSAnJykge1xuICAgICAgcmV0dXJuIGVuZFJlc3VsdC50cmltKCk7XG4gICAgfVxuXG4gICAgc2lkZSA9IHNpZGUudG9Mb3dlckNhc2UoKTtcblxuICAgIGlmIChzaWRlID09PSAnc3RhcnQnIHx8IHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgcmV0dXJuIGVuZFJlc3VsdC5yZXBsYWNlKC9eXFxzKi8sICcnKTtcbiAgICB9XG5cbiAgICBpZiAoc2lkZSA9PT0gJ2VuZCcgfHwgc2lkZSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgcmV0dXJuIGVuZFJlc3VsdC5yZXBsYWNlKC9cXHMqJC8sICcnKTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFNpZGUgbm90IHN1cHBvcnRlZDogJHtzaWRlfWApO1xuICB9LFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHRyaW1SZXN1bHRUcmFuc2Zvcm1lcjtcbiJdfQ==
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/stripIndentTransformer/stripIndentTransformer.js
  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
  
  /**
   * strips indentation from a template literal
   * @param  {String} type = 'initial' - whether to remove all indentation or just leading indentation. can be 'all' or 'initial'
   * @return {Object}                  - a TemplateTag transformer
   */
  var stripIndentTransformer = function stripIndentTransformer() {
    var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'initial';
    return {
      onEndResult: function onEndResult(endResult) {
        if (type === 'initial') {
          // remove the shortest leading indentation from each line
          var match = endResult.match(/^[^\S\n]*(?=\S)/gm);
          var indent = match && Math.min.apply(Math, _toConsumableArray(match.map(function (el) {
            return el.length;
          })));
          if (indent) {
            var regexp = new RegExp('^.{' + indent + '}', 'gm');
            return endResult.replace(regexp, '');
          }
          return endResult;
        }
        if (type === 'all') {
          // remove all indentation from each line
          return endResult.replace(/^[^\S\n]+/gm, '');
        }
        throw new Error('Unknown type: ' + type);
      }
    };
  };
  
  /* harmony default export */ const stripIndentTransformer_stripIndentTransformer = (stripIndentTransformer);
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJpcEluZGVudFRyYW5zZm9ybWVyL3N0cmlwSW5kZW50VHJhbnNmb3JtZXIuanMiXSwibmFtZXMiOlsic3RyaXBJbmRlbnRUcmFuc2Zvcm1lciIsInR5cGUiLCJvbkVuZFJlc3VsdCIsImVuZFJlc3VsdCIsIm1hdGNoIiwiaW5kZW50IiwiTWF0aCIsIm1pbiIsIm1hcCIsImVsIiwibGVuZ3RoIiwicmVnZXhwIiwiUmVnRXhwIiwicmVwbGFjZSIsIkVycm9yIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7OztBQUtBLElBQU1BLHlCQUF5QixTQUF6QkEsc0JBQXlCO0FBQUEsTUFBQ0MsSUFBRCx1RUFBUSxTQUFSO0FBQUEsU0FBdUI7QUFDcERDLGVBRG9ELHVCQUN4Q0MsU0FEd0MsRUFDN0I7QUFDckIsVUFBSUYsU0FBUyxTQUFiLEVBQXdCO0FBQ3RCO0FBQ0EsWUFBTUcsUUFBUUQsVUFBVUMsS0FBVixDQUFnQixtQkFBaEIsQ0FBZDtBQUNBLFlBQU1DLFNBQVNELFNBQVNFLEtBQUtDLEdBQUwsZ0NBQVlILE1BQU1JLEdBQU4sQ0FBVTtBQUFBLGlCQUFNQyxHQUFHQyxNQUFUO0FBQUEsU0FBVixDQUFaLEVBQXhCO0FBQ0EsWUFBSUwsTUFBSixFQUFZO0FBQ1YsY0FBTU0sU0FBUyxJQUFJQyxNQUFKLFNBQWlCUCxNQUFqQixRQUE0QixJQUE1QixDQUFmO0FBQ0EsaUJBQU9GLFVBQVVVLE9BQVYsQ0FBa0JGLE1BQWxCLEVBQTBCLEVBQTFCLENBQVA7QUFDRDtBQUNELGVBQU9SLFNBQVA7QUFDRDtBQUNELFVBQUlGLFNBQVMsS0FBYixFQUFvQjtBQUNsQjtBQUNBLGVBQU9FLFVBQVVVLE9BQVYsQ0FBa0IsYUFBbEIsRUFBaUMsRUFBakMsQ0FBUDtBQUNEO0FBQ0QsWUFBTSxJQUFJQyxLQUFKLG9CQUEyQmIsSUFBM0IsQ0FBTjtBQUNEO0FBakJtRCxHQUF2QjtBQUFBLENBQS9COztBQW9CQSxlQUFlRCxzQkFBZiIsImZpbGUiOiJzdHJpcEluZGVudFRyYW5zZm9ybWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBzdHJpcHMgaW5kZW50YXRpb24gZnJvbSBhIHRlbXBsYXRlIGxpdGVyYWxcbiAqIEBwYXJhbSAge1N0cmluZ30gdHlwZSA9ICdpbml0aWFsJyAtIHdoZXRoZXIgdG8gcmVtb3ZlIGFsbCBpbmRlbnRhdGlvbiBvciBqdXN0IGxlYWRpbmcgaW5kZW50YXRpb24uIGNhbiBiZSAnYWxsJyBvciAnaW5pdGlhbCdcbiAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICAgICAgICAgICAtIGEgVGVtcGxhdGVUYWcgdHJhbnNmb3JtZXJcbiAqL1xuY29uc3Qgc3RyaXBJbmRlbnRUcmFuc2Zvcm1lciA9ICh0eXBlID0gJ2luaXRpYWwnKSA9PiAoe1xuICBvbkVuZFJlc3VsdChlbmRSZXN1bHQpIHtcbiAgICBpZiAodHlwZSA9PT0gJ2luaXRpYWwnKSB7XG4gICAgICAvLyByZW1vdmUgdGhlIHNob3J0ZXN0IGxlYWRpbmcgaW5kZW50YXRpb24gZnJvbSBlYWNoIGxpbmVcbiAgICAgIGNvbnN0IG1hdGNoID0gZW5kUmVzdWx0Lm1hdGNoKC9eW15cXFNcXG5dKig/PVxcUykvZ20pO1xuICAgICAgY29uc3QgaW5kZW50ID0gbWF0Y2ggJiYgTWF0aC5taW4oLi4ubWF0Y2gubWFwKGVsID0+IGVsLmxlbmd0aCkpO1xuICAgICAgaWYgKGluZGVudCkge1xuICAgICAgICBjb25zdCByZWdleHAgPSBuZXcgUmVnRXhwKGBeLnske2luZGVudH19YCwgJ2dtJyk7XG4gICAgICAgIHJldHVybiBlbmRSZXN1bHQucmVwbGFjZShyZWdleHAsICcnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlbmRSZXN1bHQ7XG4gICAgfVxuICAgIGlmICh0eXBlID09PSAnYWxsJykge1xuICAgICAgLy8gcmVtb3ZlIGFsbCBpbmRlbnRhdGlvbiBmcm9tIGVhY2ggbGluZVxuICAgICAgcmV0dXJuIGVuZFJlc3VsdC5yZXBsYWNlKC9eW15cXFNcXG5dKy9nbSwgJycpO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gdHlwZTogJHt0eXBlfWApO1xuICB9LFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHN0cmlwSW5kZW50VHJhbnNmb3JtZXI7XG4iXX0=
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/replaceResultTransformer/replaceResultTransformer.js
  /**
   * Replaces tabs, newlines and spaces with the chosen value when they occur in sequences
   * @param  {(String|RegExp)} replaceWhat - the value or pattern that should be replaced
   * @param  {*}               replaceWith - the replacement value
   * @return {Object}                      - a TemplateTag transformer
   */
  var replaceResultTransformer = function replaceResultTransformer(replaceWhat, replaceWith) {
    return {
      onEndResult: function onEndResult(endResult) {
        if (replaceWhat == null || replaceWith == null) {
          throw new Error('replaceResultTransformer requires at least 2 arguments.');
        }
        return endResult.replace(replaceWhat, replaceWith);
      }
    };
  };
  
  /* harmony default export */ const replaceResultTransformer_replaceResultTransformer = (replaceResultTransformer);
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZXBsYWNlUmVzdWx0VHJhbnNmb3JtZXIvcmVwbGFjZVJlc3VsdFRyYW5zZm9ybWVyLmpzIl0sIm5hbWVzIjpbInJlcGxhY2VSZXN1bHRUcmFuc2Zvcm1lciIsInJlcGxhY2VXaGF0IiwicmVwbGFjZVdpdGgiLCJvbkVuZFJlc3VsdCIsImVuZFJlc3VsdCIsIkVycm9yIiwicmVwbGFjZSJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztBQU1BLElBQU1BLDJCQUEyQixTQUEzQkEsd0JBQTJCLENBQUNDLFdBQUQsRUFBY0MsV0FBZDtBQUFBLFNBQStCO0FBQzlEQyxlQUQ4RCx1QkFDbERDLFNBRGtELEVBQ3ZDO0FBQ3JCLFVBQUlILGVBQWUsSUFBZixJQUF1QkMsZUFBZSxJQUExQyxFQUFnRDtBQUM5QyxjQUFNLElBQUlHLEtBQUosQ0FDSix5REFESSxDQUFOO0FBR0Q7QUFDRCxhQUFPRCxVQUFVRSxPQUFWLENBQWtCTCxXQUFsQixFQUErQkMsV0FBL0IsQ0FBUDtBQUNEO0FBUjZELEdBQS9CO0FBQUEsQ0FBakM7O0FBV0EsZUFBZUYsd0JBQWYiLCJmaWxlIjoicmVwbGFjZVJlc3VsdFRyYW5zZm9ybWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBSZXBsYWNlcyB0YWJzLCBuZXdsaW5lcyBhbmQgc3BhY2VzIHdpdGggdGhlIGNob3NlbiB2YWx1ZSB3aGVuIHRoZXkgb2NjdXIgaW4gc2VxdWVuY2VzXG4gKiBAcGFyYW0gIHsoU3RyaW5nfFJlZ0V4cCl9IHJlcGxhY2VXaGF0IC0gdGhlIHZhbHVlIG9yIHBhdHRlcm4gdGhhdCBzaG91bGQgYmUgcmVwbGFjZWRcbiAqIEBwYXJhbSAgeyp9ICAgICAgICAgICAgICAgcmVwbGFjZVdpdGggLSB0aGUgcmVwbGFjZW1lbnQgdmFsdWVcbiAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICAgICAgICAgICAgICAgLSBhIFRlbXBsYXRlVGFnIHRyYW5zZm9ybWVyXG4gKi9cbmNvbnN0IHJlcGxhY2VSZXN1bHRUcmFuc2Zvcm1lciA9IChyZXBsYWNlV2hhdCwgcmVwbGFjZVdpdGgpID0+ICh7XG4gIG9uRW5kUmVzdWx0KGVuZFJlc3VsdCkge1xuICAgIGlmIChyZXBsYWNlV2hhdCA9PSBudWxsIHx8IHJlcGxhY2VXaXRoID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ3JlcGxhY2VSZXN1bHRUcmFuc2Zvcm1lciByZXF1aXJlcyBhdCBsZWFzdCAyIGFyZ3VtZW50cy4nLFxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIGVuZFJlc3VsdC5yZXBsYWNlKHJlcGxhY2VXaGF0LCByZXBsYWNlV2l0aCk7XG4gIH0sXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgcmVwbGFjZVJlc3VsdFRyYW5zZm9ybWVyO1xuIl19
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/replaceSubstitutionTransformer/replaceSubstitutionTransformer.js
  var replaceSubstitutionTransformer = function replaceSubstitutionTransformer(replaceWhat, replaceWith) {
    return {
      onSubstitution: function onSubstitution(substitution, resultSoFar) {
        if (replaceWhat == null || replaceWith == null) {
          throw new Error('replaceSubstitutionTransformer requires at least 2 arguments.');
        }
  
        // Do not touch if null or undefined
        if (substitution == null) {
          return substitution;
        } else {
          return substitution.toString().replace(replaceWhat, replaceWith);
        }
      }
    };
  };
  
  /* harmony default export */ const replaceSubstitutionTransformer_replaceSubstitutionTransformer = (replaceSubstitutionTransformer);
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZXBsYWNlU3Vic3RpdHV0aW9uVHJhbnNmb3JtZXIvcmVwbGFjZVN1YnN0aXR1dGlvblRyYW5zZm9ybWVyLmpzIl0sIm5hbWVzIjpbInJlcGxhY2VTdWJzdGl0dXRpb25UcmFuc2Zvcm1lciIsInJlcGxhY2VXaGF0IiwicmVwbGFjZVdpdGgiLCJvblN1YnN0aXR1dGlvbiIsInN1YnN0aXR1dGlvbiIsInJlc3VsdFNvRmFyIiwiRXJyb3IiLCJ0b1N0cmluZyIsInJlcGxhY2UiXSwibWFwcGluZ3MiOiJBQUFBLElBQU1BLGlDQUFpQyxTQUFqQ0EsOEJBQWlDLENBQUNDLFdBQUQsRUFBY0MsV0FBZDtBQUFBLFNBQStCO0FBQ3BFQyxrQkFEb0UsMEJBQ3JEQyxZQURxRCxFQUN2Q0MsV0FEdUMsRUFDMUI7QUFDeEMsVUFBSUosZUFBZSxJQUFmLElBQXVCQyxlQUFlLElBQTFDLEVBQWdEO0FBQzlDLGNBQU0sSUFBSUksS0FBSixDQUNKLCtEQURJLENBQU47QUFHRDs7QUFFRDtBQUNBLFVBQUlGLGdCQUFnQixJQUFwQixFQUEwQjtBQUN4QixlQUFPQSxZQUFQO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsZUFBT0EsYUFBYUcsUUFBYixHQUF3QkMsT0FBeEIsQ0FBZ0NQLFdBQWhDLEVBQTZDQyxXQUE3QyxDQUFQO0FBQ0Q7QUFDRjtBQWRtRSxHQUEvQjtBQUFBLENBQXZDOztBQWlCQSxlQUFlRiw4QkFBZiIsImZpbGUiOiJyZXBsYWNlU3Vic3RpdHV0aW9uVHJhbnNmb3JtZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCByZXBsYWNlU3Vic3RpdHV0aW9uVHJhbnNmb3JtZXIgPSAocmVwbGFjZVdoYXQsIHJlcGxhY2VXaXRoKSA9PiAoe1xuICBvblN1YnN0aXR1dGlvbihzdWJzdGl0dXRpb24sIHJlc3VsdFNvRmFyKSB7XG4gICAgaWYgKHJlcGxhY2VXaGF0ID09IG51bGwgfHwgcmVwbGFjZVdpdGggPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAncmVwbGFjZVN1YnN0aXR1dGlvblRyYW5zZm9ybWVyIHJlcXVpcmVzIGF0IGxlYXN0IDIgYXJndW1lbnRzLicsXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIERvIG5vdCB0b3VjaCBpZiBudWxsIG9yIHVuZGVmaW5lZFxuICAgIGlmIChzdWJzdGl0dXRpb24gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHN1YnN0aXR1dGlvbjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHN1YnN0aXR1dGlvbi50b1N0cmluZygpLnJlcGxhY2UocmVwbGFjZVdoYXQsIHJlcGxhY2VXaXRoKTtcbiAgICB9XG4gIH0sXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgcmVwbGFjZVN1YnN0aXR1dGlvblRyYW5zZm9ybWVyO1xuIl19
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/replaceStringTransformer/replaceStringTransformer.js
  var replaceStringTransformer = function replaceStringTransformer(replaceWhat, replaceWith) {
    return {
      onString: function onString(str) {
        if (replaceWhat == null || replaceWith == null) {
          throw new Error('replaceStringTransformer requires at least 2 arguments.');
        }
  
        return str.replace(replaceWhat, replaceWith);
      }
    };
  };
  
  /* harmony default export */ const replaceStringTransformer_replaceStringTransformer = (replaceStringTransformer);
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZXBsYWNlU3RyaW5nVHJhbnNmb3JtZXIvcmVwbGFjZVN0cmluZ1RyYW5zZm9ybWVyLmpzIl0sIm5hbWVzIjpbInJlcGxhY2VTdHJpbmdUcmFuc2Zvcm1lciIsInJlcGxhY2VXaGF0IiwicmVwbGFjZVdpdGgiLCJvblN0cmluZyIsInN0ciIsIkVycm9yIiwicmVwbGFjZSJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBTUEsMkJBQTJCLFNBQTNCQSx3QkFBMkIsQ0FBQ0MsV0FBRCxFQUFjQyxXQUFkO0FBQUEsU0FBK0I7QUFDOURDLFlBRDhELG9CQUNyREMsR0FEcUQsRUFDaEQ7QUFDWixVQUFJSCxlQUFlLElBQWYsSUFBdUJDLGVBQWUsSUFBMUMsRUFBZ0Q7QUFDOUMsY0FBTSxJQUFJRyxLQUFKLENBQ0oseURBREksQ0FBTjtBQUdEOztBQUVELGFBQU9ELElBQUlFLE9BQUosQ0FBWUwsV0FBWixFQUF5QkMsV0FBekIsQ0FBUDtBQUNEO0FBVDZELEdBQS9CO0FBQUEsQ0FBakM7O0FBWUEsZUFBZUYsd0JBQWYiLCJmaWxlIjoicmVwbGFjZVN0cmluZ1RyYW5zZm9ybWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgcmVwbGFjZVN0cmluZ1RyYW5zZm9ybWVyID0gKHJlcGxhY2VXaGF0LCByZXBsYWNlV2l0aCkgPT4gKHtcbiAgb25TdHJpbmcoc3RyKSB7XG4gICAgaWYgKHJlcGxhY2VXaGF0ID09IG51bGwgfHwgcmVwbGFjZVdpdGggPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAncmVwbGFjZVN0cmluZ1RyYW5zZm9ybWVyIHJlcXVpcmVzIGF0IGxlYXN0IDIgYXJndW1lbnRzLicsXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBzdHIucmVwbGFjZShyZXBsYWNlV2hhdCwgcmVwbGFjZVdpdGgpO1xuICB9LFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHJlcGxhY2VTdHJpbmdUcmFuc2Zvcm1lcjtcbiJdfQ==
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/inlineArrayTransformer/inlineArrayTransformer.js
  var defaults = {
    separator: '',
    conjunction: '',
    serial: false
  };
  
  /**
   * Converts an array substitution to a string containing a list
   * @param  {String} [opts.separator = ''] - the character that separates each item
   * @param  {String} [opts.conjunction = '']  - replace the last separator with this
   * @param  {Boolean} [opts.serial = false] - include the separator before the conjunction? (Oxford comma use-case)
   *
   * @return {Object}                     - a TemplateTag transformer
   */
  var inlineArrayTransformer = function inlineArrayTransformer() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaults;
    return {
      onSubstitution: function onSubstitution(substitution, resultSoFar) {
        // only operate on arrays
        if (Array.isArray(substitution)) {
          var arrayLength = substitution.length;
          var separator = opts.separator;
          var conjunction = opts.conjunction;
          var serial = opts.serial;
          // join each item in the array into a string where each item is separated by separator
          // be sure to maintain indentation
          var indent = resultSoFar.match(/(\n?[^\S\n]+)$/);
          if (indent) {
            substitution = substitution.join(separator + indent[1]);
          } else {
            substitution = substitution.join(separator + ' ');
          }
          // if conjunction is set, replace the last separator with conjunction, but only if there is more than one substitution
          if (conjunction && arrayLength > 1) {
            var separatorIndex = substitution.lastIndexOf(separator);
            substitution = substitution.slice(0, separatorIndex) + (serial ? separator : '') + ' ' + conjunction + substitution.slice(separatorIndex + 1);
          }
        }
        return substitution;
      }
    };
  };
  
  /* harmony default export */ const inlineArrayTransformer_inlineArrayTransformer = (inlineArrayTransformer);
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmxpbmVBcnJheVRyYW5zZm9ybWVyL2lubGluZUFycmF5VHJhbnNmb3JtZXIuanMiXSwibmFtZXMiOlsiZGVmYXVsdHMiLCJzZXBhcmF0b3IiLCJjb25qdW5jdGlvbiIsInNlcmlhbCIsImlubGluZUFycmF5VHJhbnNmb3JtZXIiLCJvcHRzIiwib25TdWJzdGl0dXRpb24iLCJzdWJzdGl0dXRpb24iLCJyZXN1bHRTb0ZhciIsIkFycmF5IiwiaXNBcnJheSIsImFycmF5TGVuZ3RoIiwibGVuZ3RoIiwiaW5kZW50IiwibWF0Y2giLCJqb2luIiwic2VwYXJhdG9ySW5kZXgiLCJsYXN0SW5kZXhPZiIsInNsaWNlIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFNQSxXQUFXO0FBQ2ZDLGFBQVcsRUFESTtBQUVmQyxlQUFhLEVBRkU7QUFHZkMsVUFBUTtBQUhPLENBQWpCOztBQU1BOzs7Ozs7OztBQVFBLElBQU1DLHlCQUF5QixTQUF6QkEsc0JBQXlCO0FBQUEsTUFBQ0MsSUFBRCx1RUFBUUwsUUFBUjtBQUFBLFNBQXNCO0FBQ25ETSxrQkFEbUQsMEJBQ3BDQyxZQURvQyxFQUN0QkMsV0FEc0IsRUFDVDtBQUN4QztBQUNBLFVBQUlDLE1BQU1DLE9BQU4sQ0FBY0gsWUFBZCxDQUFKLEVBQWlDO0FBQy9CLFlBQU1JLGNBQWNKLGFBQWFLLE1BQWpDO0FBQ0EsWUFBTVgsWUFBWUksS0FBS0osU0FBdkI7QUFDQSxZQUFNQyxjQUFjRyxLQUFLSCxXQUF6QjtBQUNBLFlBQU1DLFNBQVNFLEtBQUtGLE1BQXBCO0FBQ0E7QUFDQTtBQUNBLFlBQU1VLFNBQVNMLFlBQVlNLEtBQVosQ0FBa0IsZ0JBQWxCLENBQWY7QUFDQSxZQUFJRCxNQUFKLEVBQVk7QUFDVk4seUJBQWVBLGFBQWFRLElBQWIsQ0FBa0JkLFlBQVlZLE9BQU8sQ0FBUCxDQUE5QixDQUFmO0FBQ0QsU0FGRCxNQUVPO0FBQ0xOLHlCQUFlQSxhQUFhUSxJQUFiLENBQWtCZCxZQUFZLEdBQTlCLENBQWY7QUFDRDtBQUNEO0FBQ0EsWUFBSUMsZUFBZVMsY0FBYyxDQUFqQyxFQUFvQztBQUNsQyxjQUFNSyxpQkFBaUJULGFBQWFVLFdBQWIsQ0FBeUJoQixTQUF6QixDQUF2QjtBQUNBTSx5QkFDRUEsYUFBYVcsS0FBYixDQUFtQixDQUFuQixFQUFzQkYsY0FBdEIsS0FDQ2IsU0FBU0YsU0FBVCxHQUFxQixFQUR0QixJQUVBLEdBRkEsR0FHQUMsV0FIQSxHQUlBSyxhQUFhVyxLQUFiLENBQW1CRixpQkFBaUIsQ0FBcEMsQ0FMRjtBQU1EO0FBQ0Y7QUFDRCxhQUFPVCxZQUFQO0FBQ0Q7QUE1QmtELEdBQXRCO0FBQUEsQ0FBL0I7O0FBK0JBLGVBQWVILHNCQUFmIiwiZmlsZSI6ImlubGluZUFycmF5VHJhbnNmb3JtZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBkZWZhdWx0cyA9IHtcbiAgc2VwYXJhdG9yOiAnJyxcbiAgY29uanVuY3Rpb246ICcnLFxuICBzZXJpYWw6IGZhbHNlLFxufTtcblxuLyoqXG4gKiBDb252ZXJ0cyBhbiBhcnJheSBzdWJzdGl0dXRpb24gdG8gYSBzdHJpbmcgY29udGFpbmluZyBhIGxpc3RcbiAqIEBwYXJhbSAge1N0cmluZ30gW29wdHMuc2VwYXJhdG9yID0gJyddIC0gdGhlIGNoYXJhY3RlciB0aGF0IHNlcGFyYXRlcyBlYWNoIGl0ZW1cbiAqIEBwYXJhbSAge1N0cmluZ30gW29wdHMuY29uanVuY3Rpb24gPSAnJ10gIC0gcmVwbGFjZSB0aGUgbGFzdCBzZXBhcmF0b3Igd2l0aCB0aGlzXG4gKiBAcGFyYW0gIHtCb29sZWFufSBbb3B0cy5zZXJpYWwgPSBmYWxzZV0gLSBpbmNsdWRlIHRoZSBzZXBhcmF0b3IgYmVmb3JlIHRoZSBjb25qdW5jdGlvbj8gKE94Zm9yZCBjb21tYSB1c2UtY2FzZSlcbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgICAgICAgICAgICAgICAgLSBhIFRlbXBsYXRlVGFnIHRyYW5zZm9ybWVyXG4gKi9cbmNvbnN0IGlubGluZUFycmF5VHJhbnNmb3JtZXIgPSAob3B0cyA9IGRlZmF1bHRzKSA9PiAoe1xuICBvblN1YnN0aXR1dGlvbihzdWJzdGl0dXRpb24sIHJlc3VsdFNvRmFyKSB7XG4gICAgLy8gb25seSBvcGVyYXRlIG9uIGFycmF5c1xuICAgIGlmIChBcnJheS5pc0FycmF5KHN1YnN0aXR1dGlvbikpIHtcbiAgICAgIGNvbnN0IGFycmF5TGVuZ3RoID0gc3Vic3RpdHV0aW9uLmxlbmd0aDtcbiAgICAgIGNvbnN0IHNlcGFyYXRvciA9IG9wdHMuc2VwYXJhdG9yO1xuICAgICAgY29uc3QgY29uanVuY3Rpb24gPSBvcHRzLmNvbmp1bmN0aW9uO1xuICAgICAgY29uc3Qgc2VyaWFsID0gb3B0cy5zZXJpYWw7XG4gICAgICAvLyBqb2luIGVhY2ggaXRlbSBpbiB0aGUgYXJyYXkgaW50byBhIHN0cmluZyB3aGVyZSBlYWNoIGl0ZW0gaXMgc2VwYXJhdGVkIGJ5IHNlcGFyYXRvclxuICAgICAgLy8gYmUgc3VyZSB0byBtYWludGFpbiBpbmRlbnRhdGlvblxuICAgICAgY29uc3QgaW5kZW50ID0gcmVzdWx0U29GYXIubWF0Y2goLyhcXG4/W15cXFNcXG5dKykkLyk7XG4gICAgICBpZiAoaW5kZW50KSB7XG4gICAgICAgIHN1YnN0aXR1dGlvbiA9IHN1YnN0aXR1dGlvbi5qb2luKHNlcGFyYXRvciArIGluZGVudFsxXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdWJzdGl0dXRpb24gPSBzdWJzdGl0dXRpb24uam9pbihzZXBhcmF0b3IgKyAnICcpO1xuICAgICAgfVxuICAgICAgLy8gaWYgY29uanVuY3Rpb24gaXMgc2V0LCByZXBsYWNlIHRoZSBsYXN0IHNlcGFyYXRvciB3aXRoIGNvbmp1bmN0aW9uLCBidXQgb25seSBpZiB0aGVyZSBpcyBtb3JlIHRoYW4gb25lIHN1YnN0aXR1dGlvblxuICAgICAgaWYgKGNvbmp1bmN0aW9uICYmIGFycmF5TGVuZ3RoID4gMSkge1xuICAgICAgICBjb25zdCBzZXBhcmF0b3JJbmRleCA9IHN1YnN0aXR1dGlvbi5sYXN0SW5kZXhPZihzZXBhcmF0b3IpO1xuICAgICAgICBzdWJzdGl0dXRpb24gPVxuICAgICAgICAgIHN1YnN0aXR1dGlvbi5zbGljZSgwLCBzZXBhcmF0b3JJbmRleCkgK1xuICAgICAgICAgIChzZXJpYWwgPyBzZXBhcmF0b3IgOiAnJykgK1xuICAgICAgICAgICcgJyArXG4gICAgICAgICAgY29uanVuY3Rpb24gK1xuICAgICAgICAgIHN1YnN0aXR1dGlvbi5zbGljZShzZXBhcmF0b3JJbmRleCArIDEpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3Vic3RpdHV0aW9uO1xuICB9LFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGlubGluZUFycmF5VHJhbnNmb3JtZXI7XG4iXX0=
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/inlineArrayTransformer/index.js
  
  
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmxpbmVBcnJheVRyYW5zZm9ybWVyL2luZGV4LmpzIl0sIm5hbWVzIjpbImRlZmF1bHQiXSwibWFwcGluZ3MiOiJxQkFBb0IsMEI7cUJBQWJBLE8iLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBmcm9tICcuL2lubGluZUFycmF5VHJhbnNmb3JtZXInO1xuIl19
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/splitStringTransformer/splitStringTransformer.js
  var splitStringTransformer = function splitStringTransformer(splitBy) {
    return {
      onSubstitution: function onSubstitution(substitution, resultSoFar) {
        if (splitBy != null && typeof splitBy === 'string') {
          if (typeof substitution === 'string' && substitution.includes(splitBy)) {
            substitution = substitution.split(splitBy);
          }
        } else {
          throw new Error('You need to specify a string character to split by.');
        }
        return substitution;
      }
    };
  };
  
  /* harmony default export */ const splitStringTransformer_splitStringTransformer = (splitStringTransformer);
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zcGxpdFN0cmluZ1RyYW5zZm9ybWVyL3NwbGl0U3RyaW5nVHJhbnNmb3JtZXIuanMiXSwibmFtZXMiOlsic3BsaXRTdHJpbmdUcmFuc2Zvcm1lciIsIm9uU3Vic3RpdHV0aW9uIiwic3Vic3RpdHV0aW9uIiwicmVzdWx0U29GYXIiLCJzcGxpdEJ5IiwiaW5jbHVkZXMiLCJzcGxpdCIsIkVycm9yIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFNQSx5QkFBeUIsU0FBekJBLHNCQUF5QjtBQUFBLFNBQVk7QUFDekNDLGtCQUR5QywwQkFDMUJDLFlBRDBCLEVBQ1pDLFdBRFksRUFDQztBQUN4QyxVQUFJQyxXQUFXLElBQVgsSUFBbUIsT0FBT0EsT0FBUCxLQUFtQixRQUExQyxFQUFvRDtBQUNsRCxZQUFJLE9BQU9GLFlBQVAsS0FBd0IsUUFBeEIsSUFBb0NBLGFBQWFHLFFBQWIsQ0FBc0JELE9BQXRCLENBQXhDLEVBQXdFO0FBQ3RFRix5QkFBZUEsYUFBYUksS0FBYixDQUFtQkYsT0FBbkIsQ0FBZjtBQUNEO0FBQ0YsT0FKRCxNQUlPO0FBQ0wsY0FBTSxJQUFJRyxLQUFKLENBQVUscURBQVYsQ0FBTjtBQUNEO0FBQ0QsYUFBT0wsWUFBUDtBQUNEO0FBVndDLEdBQVo7QUFBQSxDQUEvQjs7QUFhQSxlQUFlRixzQkFBZiIsImZpbGUiOiJzcGxpdFN0cmluZ1RyYW5zZm9ybWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc3BsaXRTdHJpbmdUcmFuc2Zvcm1lciA9IHNwbGl0QnkgPT4gKHtcbiAgb25TdWJzdGl0dXRpb24oc3Vic3RpdHV0aW9uLCByZXN1bHRTb0Zhcikge1xuICAgIGlmIChzcGxpdEJ5ICE9IG51bGwgJiYgdHlwZW9mIHNwbGl0QnkgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAodHlwZW9mIHN1YnN0aXR1dGlvbiA9PT0gJ3N0cmluZycgJiYgc3Vic3RpdHV0aW9uLmluY2x1ZGVzKHNwbGl0QnkpKSB7XG4gICAgICAgIHN1YnN0aXR1dGlvbiA9IHN1YnN0aXR1dGlvbi5zcGxpdChzcGxpdEJ5KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgbmVlZCB0byBzcGVjaWZ5IGEgc3RyaW5nIGNoYXJhY3RlciB0byBzcGxpdCBieS4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHN1YnN0aXR1dGlvbjtcbiAgfSxcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBzcGxpdFN0cmluZ1RyYW5zZm9ybWVyO1xuIl19
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/removeNonPrintingValuesTransformer/removeNonPrintingValuesTransformer.js
  var isValidValue = function isValidValue(x) {
    return x != null && !Number.isNaN(x) && typeof x !== 'boolean';
  };
  
  var removeNonPrintingValuesTransformer = function removeNonPrintingValuesTransformer() {
    return {
      onSubstitution: function onSubstitution(substitution) {
        if (Array.isArray(substitution)) {
          return substitution.filter(isValidValue);
        }
        if (isValidValue(substitution)) {
          return substitution;
        }
        return '';
      }
    };
  };
  
  /* harmony default export */ const removeNonPrintingValuesTransformer_removeNonPrintingValuesTransformer = (removeNonPrintingValuesTransformer);
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZW1vdmVOb25QcmludGluZ1ZhbHVlc1RyYW5zZm9ybWVyL3JlbW92ZU5vblByaW50aW5nVmFsdWVzVHJhbnNmb3JtZXIuanMiXSwibmFtZXMiOlsiaXNWYWxpZFZhbHVlIiwieCIsIk51bWJlciIsImlzTmFOIiwicmVtb3ZlTm9uUHJpbnRpbmdWYWx1ZXNUcmFuc2Zvcm1lciIsIm9uU3Vic3RpdHV0aW9uIiwic3Vic3RpdHV0aW9uIiwiQXJyYXkiLCJpc0FycmF5IiwiZmlsdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFNQSxlQUFlLFNBQWZBLFlBQWU7QUFBQSxTQUNuQkMsS0FBSyxJQUFMLElBQWEsQ0FBQ0MsT0FBT0MsS0FBUCxDQUFhRixDQUFiLENBQWQsSUFBaUMsT0FBT0EsQ0FBUCxLQUFhLFNBRDNCO0FBQUEsQ0FBckI7O0FBR0EsSUFBTUcscUNBQXFDLFNBQXJDQSxrQ0FBcUM7QUFBQSxTQUFPO0FBQ2hEQyxrQkFEZ0QsMEJBQ2pDQyxZQURpQyxFQUNuQjtBQUMzQixVQUFJQyxNQUFNQyxPQUFOLENBQWNGLFlBQWQsQ0FBSixFQUFpQztBQUMvQixlQUFPQSxhQUFhRyxNQUFiLENBQW9CVCxZQUFwQixDQUFQO0FBQ0Q7QUFDRCxVQUFJQSxhQUFhTSxZQUFiLENBQUosRUFBZ0M7QUFDOUIsZUFBT0EsWUFBUDtBQUNEO0FBQ0QsYUFBTyxFQUFQO0FBQ0Q7QUFUK0MsR0FBUDtBQUFBLENBQTNDOztBQVlBLGVBQWVGLGtDQUFmIiwiZmlsZSI6InJlbW92ZU5vblByaW50aW5nVmFsdWVzVHJhbnNmb3JtZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBpc1ZhbGlkVmFsdWUgPSB4ID0+XG4gIHggIT0gbnVsbCAmJiAhTnVtYmVyLmlzTmFOKHgpICYmIHR5cGVvZiB4ICE9PSAnYm9vbGVhbic7XG5cbmNvbnN0IHJlbW92ZU5vblByaW50aW5nVmFsdWVzVHJhbnNmb3JtZXIgPSAoKSA9PiAoe1xuICBvblN1YnN0aXR1dGlvbihzdWJzdGl0dXRpb24pIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShzdWJzdGl0dXRpb24pKSB7XG4gICAgICByZXR1cm4gc3Vic3RpdHV0aW9uLmZpbHRlcihpc1ZhbGlkVmFsdWUpO1xuICAgIH1cbiAgICBpZiAoaXNWYWxpZFZhbHVlKHN1YnN0aXR1dGlvbikpIHtcbiAgICAgIHJldHVybiBzdWJzdGl0dXRpb247XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfSxcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCByZW1vdmVOb25QcmludGluZ1ZhbHVlc1RyYW5zZm9ybWVyO1xuIl19
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/commaLists/commaLists.js
  
  
  
  
  
  var commaLists = new TemplateTag_TemplateTag(inlineArrayTransformer_inlineArrayTransformer({ separator: ',' }), stripIndentTransformer_stripIndentTransformer, trimResultTransformer_trimResultTransformer);
  
  /* harmony default export */ const commaLists_commaLists = (commaLists);
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYUxpc3RzL2NvbW1hTGlzdHMuanMiXSwibmFtZXMiOlsiVGVtcGxhdGVUYWciLCJzdHJpcEluZGVudFRyYW5zZm9ybWVyIiwiaW5saW5lQXJyYXlUcmFuc2Zvcm1lciIsInRyaW1SZXN1bHRUcmFuc2Zvcm1lciIsImNvbW1hTGlzdHMiLCJzZXBhcmF0b3IiXSwibWFwcGluZ3MiOiJBQUFBLE9BQU9BLFdBQVAsTUFBd0IsZ0JBQXhCO0FBQ0EsT0FBT0Msc0JBQVAsTUFBbUMsMkJBQW5DO0FBQ0EsT0FBT0Msc0JBQVAsTUFBbUMsMkJBQW5DO0FBQ0EsT0FBT0MscUJBQVAsTUFBa0MsMEJBQWxDOztBQUVBLElBQU1DLGFBQWEsSUFBSUosV0FBSixDQUNqQkUsdUJBQXVCLEVBQUVHLFdBQVcsR0FBYixFQUF2QixDQURpQixFQUVqQkosc0JBRmlCLEVBR2pCRSxxQkFIaUIsQ0FBbkI7O0FBTUEsZUFBZUMsVUFBZiIsImZpbGUiOiJjb21tYUxpc3RzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRlbXBsYXRlVGFnIGZyb20gJy4uL1RlbXBsYXRlVGFnJztcbmltcG9ydCBzdHJpcEluZGVudFRyYW5zZm9ybWVyIGZyb20gJy4uL3N0cmlwSW5kZW50VHJhbnNmb3JtZXInO1xuaW1wb3J0IGlubGluZUFycmF5VHJhbnNmb3JtZXIgZnJvbSAnLi4vaW5saW5lQXJyYXlUcmFuc2Zvcm1lcic7XG5pbXBvcnQgdHJpbVJlc3VsdFRyYW5zZm9ybWVyIGZyb20gJy4uL3RyaW1SZXN1bHRUcmFuc2Zvcm1lcic7XG5cbmNvbnN0IGNvbW1hTGlzdHMgPSBuZXcgVGVtcGxhdGVUYWcoXG4gIGlubGluZUFycmF5VHJhbnNmb3JtZXIoeyBzZXBhcmF0b3I6ICcsJyB9KSxcbiAgc3RyaXBJbmRlbnRUcmFuc2Zvcm1lcixcbiAgdHJpbVJlc3VsdFRyYW5zZm9ybWVyLFxuKTtcblxuZXhwb3J0IGRlZmF1bHQgY29tbWFMaXN0cztcbiJdfQ==
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/commaLists/index.js
  
  
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYUxpc3RzL2luZGV4LmpzIl0sIm5hbWVzIjpbImRlZmF1bHQiXSwibWFwcGluZ3MiOiJxQkFBb0IsYztxQkFBYkEsTyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGZyb20gJy4vY29tbWFMaXN0cyc7XG4iXX0=
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/commaListsAnd/commaListsAnd.js
  
  
  
  
  
  var commaListsAnd = new TemplateTag_TemplateTag(inlineArrayTransformer_inlineArrayTransformer({ separator: ',', conjunction: 'and' }), stripIndentTransformer_stripIndentTransformer, trimResultTransformer_trimResultTransformer);
  
  /* harmony default export */ const commaListsAnd_commaListsAnd = (commaListsAnd);
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYUxpc3RzQW5kL2NvbW1hTGlzdHNBbmQuanMiXSwibmFtZXMiOlsiVGVtcGxhdGVUYWciLCJzdHJpcEluZGVudFRyYW5zZm9ybWVyIiwiaW5saW5lQXJyYXlUcmFuc2Zvcm1lciIsInRyaW1SZXN1bHRUcmFuc2Zvcm1lciIsImNvbW1hTGlzdHNBbmQiLCJzZXBhcmF0b3IiLCJjb25qdW5jdGlvbiJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBT0EsV0FBUCxNQUF3QixnQkFBeEI7QUFDQSxPQUFPQyxzQkFBUCxNQUFtQywyQkFBbkM7QUFDQSxPQUFPQyxzQkFBUCxNQUFtQywyQkFBbkM7QUFDQSxPQUFPQyxxQkFBUCxNQUFrQywwQkFBbEM7O0FBRUEsSUFBTUMsZ0JBQWdCLElBQUlKLFdBQUosQ0FDcEJFLHVCQUF1QixFQUFFRyxXQUFXLEdBQWIsRUFBa0JDLGFBQWEsS0FBL0IsRUFBdkIsQ0FEb0IsRUFFcEJMLHNCQUZvQixFQUdwQkUscUJBSG9CLENBQXRCOztBQU1BLGVBQWVDLGFBQWYiLCJmaWxlIjoiY29tbWFMaXN0c0FuZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUZW1wbGF0ZVRhZyBmcm9tICcuLi9UZW1wbGF0ZVRhZyc7XG5pbXBvcnQgc3RyaXBJbmRlbnRUcmFuc2Zvcm1lciBmcm9tICcuLi9zdHJpcEluZGVudFRyYW5zZm9ybWVyJztcbmltcG9ydCBpbmxpbmVBcnJheVRyYW5zZm9ybWVyIGZyb20gJy4uL2lubGluZUFycmF5VHJhbnNmb3JtZXInO1xuaW1wb3J0IHRyaW1SZXN1bHRUcmFuc2Zvcm1lciBmcm9tICcuLi90cmltUmVzdWx0VHJhbnNmb3JtZXInO1xuXG5jb25zdCBjb21tYUxpc3RzQW5kID0gbmV3IFRlbXBsYXRlVGFnKFxuICBpbmxpbmVBcnJheVRyYW5zZm9ybWVyKHsgc2VwYXJhdG9yOiAnLCcsIGNvbmp1bmN0aW9uOiAnYW5kJyB9KSxcbiAgc3RyaXBJbmRlbnRUcmFuc2Zvcm1lcixcbiAgdHJpbVJlc3VsdFRyYW5zZm9ybWVyLFxuKTtcblxuZXhwb3J0IGRlZmF1bHQgY29tbWFMaXN0c0FuZDtcbiJdfQ==
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/commaListsAnd/index.js
  
  
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYUxpc3RzQW5kL2luZGV4LmpzIl0sIm5hbWVzIjpbImRlZmF1bHQiXSwibWFwcGluZ3MiOiJxQkFBb0IsaUI7cUJBQWJBLE8iLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBmcm9tICcuL2NvbW1hTGlzdHNBbmQnO1xuIl19
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/commaListsOr/commaListsOr.js
  
  
  
  
  
  var commaListsOr = new TemplateTag_TemplateTag(inlineArrayTransformer_inlineArrayTransformer({ separator: ',', conjunction: 'or' }), stripIndentTransformer_stripIndentTransformer, trimResultTransformer_trimResultTransformer);
  
  /* harmony default export */ const commaListsOr_commaListsOr = (commaListsOr);
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYUxpc3RzT3IvY29tbWFMaXN0c09yLmpzIl0sIm5hbWVzIjpbIlRlbXBsYXRlVGFnIiwic3RyaXBJbmRlbnRUcmFuc2Zvcm1lciIsImlubGluZUFycmF5VHJhbnNmb3JtZXIiLCJ0cmltUmVzdWx0VHJhbnNmb3JtZXIiLCJjb21tYUxpc3RzT3IiLCJzZXBhcmF0b3IiLCJjb25qdW5jdGlvbiJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBT0EsV0FBUCxNQUF3QixnQkFBeEI7QUFDQSxPQUFPQyxzQkFBUCxNQUFtQywyQkFBbkM7QUFDQSxPQUFPQyxzQkFBUCxNQUFtQywyQkFBbkM7QUFDQSxPQUFPQyxxQkFBUCxNQUFrQywwQkFBbEM7O0FBRUEsSUFBTUMsZUFBZSxJQUFJSixXQUFKLENBQ25CRSx1QkFBdUIsRUFBRUcsV0FBVyxHQUFiLEVBQWtCQyxhQUFhLElBQS9CLEVBQXZCLENBRG1CLEVBRW5CTCxzQkFGbUIsRUFHbkJFLHFCQUhtQixDQUFyQjs7QUFNQSxlQUFlQyxZQUFmIiwiZmlsZSI6ImNvbW1hTGlzdHNPci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUZW1wbGF0ZVRhZyBmcm9tICcuLi9UZW1wbGF0ZVRhZyc7XG5pbXBvcnQgc3RyaXBJbmRlbnRUcmFuc2Zvcm1lciBmcm9tICcuLi9zdHJpcEluZGVudFRyYW5zZm9ybWVyJztcbmltcG9ydCBpbmxpbmVBcnJheVRyYW5zZm9ybWVyIGZyb20gJy4uL2lubGluZUFycmF5VHJhbnNmb3JtZXInO1xuaW1wb3J0IHRyaW1SZXN1bHRUcmFuc2Zvcm1lciBmcm9tICcuLi90cmltUmVzdWx0VHJhbnNmb3JtZXInO1xuXG5jb25zdCBjb21tYUxpc3RzT3IgPSBuZXcgVGVtcGxhdGVUYWcoXG4gIGlubGluZUFycmF5VHJhbnNmb3JtZXIoeyBzZXBhcmF0b3I6ICcsJywgY29uanVuY3Rpb246ICdvcicgfSksXG4gIHN0cmlwSW5kZW50VHJhbnNmb3JtZXIsXG4gIHRyaW1SZXN1bHRUcmFuc2Zvcm1lcixcbik7XG5cbmV4cG9ydCBkZWZhdWx0IGNvbW1hTGlzdHNPcjtcbiJdfQ==
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/commaListsOr/index.js
  
  
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYUxpc3RzT3IvaW5kZXguanMiXSwibmFtZXMiOlsiZGVmYXVsdCJdLCJtYXBwaW5ncyI6InFCQUFvQixnQjtxQkFBYkEsTyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGZyb20gJy4vY29tbWFMaXN0c09yJztcbiJdfQ==
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/html/html.js
  
  
  
  
  
  
  
  var html = new TemplateTag_TemplateTag(splitStringTransformer_splitStringTransformer('\n'), removeNonPrintingValuesTransformer_removeNonPrintingValuesTransformer, inlineArrayTransformer_inlineArrayTransformer, stripIndentTransformer_stripIndentTransformer, trimResultTransformer_trimResultTransformer);
  
  /* harmony default export */ const html_html = (html);
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9odG1sL2h0bWwuanMiXSwibmFtZXMiOlsiVGVtcGxhdGVUYWciLCJzdHJpcEluZGVudFRyYW5zZm9ybWVyIiwiaW5saW5lQXJyYXlUcmFuc2Zvcm1lciIsInRyaW1SZXN1bHRUcmFuc2Zvcm1lciIsInNwbGl0U3RyaW5nVHJhbnNmb3JtZXIiLCJyZW1vdmVOb25QcmludGluZ1ZhbHVlc1RyYW5zZm9ybWVyIiwiaHRtbCJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBT0EsV0FBUCxNQUF3QixnQkFBeEI7QUFDQSxPQUFPQyxzQkFBUCxNQUFtQywyQkFBbkM7QUFDQSxPQUFPQyxzQkFBUCxNQUFtQywyQkFBbkM7QUFDQSxPQUFPQyxxQkFBUCxNQUFrQywwQkFBbEM7QUFDQSxPQUFPQyxzQkFBUCxNQUFtQywyQkFBbkM7QUFDQSxPQUFPQyxrQ0FBUCxNQUErQyx1Q0FBL0M7O0FBRUEsSUFBTUMsT0FBTyxJQUFJTixXQUFKLENBQ1hJLHVCQUF1QixJQUF2QixDQURXLEVBRVhDLGtDQUZXLEVBR1hILHNCQUhXLEVBSVhELHNCQUpXLEVBS1hFLHFCQUxXLENBQWI7O0FBUUEsZUFBZUcsSUFBZiIsImZpbGUiOiJodG1sLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRlbXBsYXRlVGFnIGZyb20gJy4uL1RlbXBsYXRlVGFnJztcbmltcG9ydCBzdHJpcEluZGVudFRyYW5zZm9ybWVyIGZyb20gJy4uL3N0cmlwSW5kZW50VHJhbnNmb3JtZXInO1xuaW1wb3J0IGlubGluZUFycmF5VHJhbnNmb3JtZXIgZnJvbSAnLi4vaW5saW5lQXJyYXlUcmFuc2Zvcm1lcic7XG5pbXBvcnQgdHJpbVJlc3VsdFRyYW5zZm9ybWVyIGZyb20gJy4uL3RyaW1SZXN1bHRUcmFuc2Zvcm1lcic7XG5pbXBvcnQgc3BsaXRTdHJpbmdUcmFuc2Zvcm1lciBmcm9tICcuLi9zcGxpdFN0cmluZ1RyYW5zZm9ybWVyJztcbmltcG9ydCByZW1vdmVOb25QcmludGluZ1ZhbHVlc1RyYW5zZm9ybWVyIGZyb20gJy4uL3JlbW92ZU5vblByaW50aW5nVmFsdWVzVHJhbnNmb3JtZXInO1xuXG5jb25zdCBodG1sID0gbmV3IFRlbXBsYXRlVGFnKFxuICBzcGxpdFN0cmluZ1RyYW5zZm9ybWVyKCdcXG4nKSxcbiAgcmVtb3ZlTm9uUHJpbnRpbmdWYWx1ZXNUcmFuc2Zvcm1lcixcbiAgaW5saW5lQXJyYXlUcmFuc2Zvcm1lcixcbiAgc3RyaXBJbmRlbnRUcmFuc2Zvcm1lcixcbiAgdHJpbVJlc3VsdFRyYW5zZm9ybWVyLFxuKTtcblxuZXhwb3J0IGRlZmF1bHQgaHRtbDtcbiJdfQ==
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/html/index.js
  
  
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9odG1sL2luZGV4LmpzIl0sIm5hbWVzIjpbImRlZmF1bHQiXSwibWFwcGluZ3MiOiJxQkFBb0IsUTtxQkFBYkEsTyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGZyb20gJy4vaHRtbCc7XG4iXX0=
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/codeBlock/index.js
  
  
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb2RlQmxvY2svaW5kZXguanMiXSwibmFtZXMiOlsiZGVmYXVsdCJdLCJtYXBwaW5ncyI6InFCQUFvQixTO3FCQUFiQSxPIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgZnJvbSAnLi4vaHRtbCc7XG4iXX0=
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/source/index.js
  
  
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zb3VyY2UvaW5kZXguanMiXSwibmFtZXMiOlsiZGVmYXVsdCJdLCJtYXBwaW5ncyI6InFCQUFvQixTO3FCQUFiQSxPIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgZnJvbSAnLi4vaHRtbCc7XG4iXX0=
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/safeHtml/safeHtml.js
  
  
  
  
  
  
  
  var safeHtml = new TemplateTag_TemplateTag(splitStringTransformer_splitStringTransformer('\n'), inlineArrayTransformer_inlineArrayTransformer, stripIndentTransformer_stripIndentTransformer, trimResultTransformer_trimResultTransformer, replaceSubstitutionTransformer_replaceSubstitutionTransformer(/&/g, '&amp;'), replaceSubstitutionTransformer_replaceSubstitutionTransformer(/</g, '&lt;'), replaceSubstitutionTransformer_replaceSubstitutionTransformer(/>/g, '&gt;'), replaceSubstitutionTransformer_replaceSubstitutionTransformer(/"/g, '&quot;'), replaceSubstitutionTransformer_replaceSubstitutionTransformer(/'/g, '&#x27;'), replaceSubstitutionTransformer_replaceSubstitutionTransformer(/`/g, '&#x60;'));
  
  /* harmony default export */ const safeHtml_safeHtml = (safeHtml);
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zYWZlSHRtbC9zYWZlSHRtbC5qcyJdLCJuYW1lcyI6WyJUZW1wbGF0ZVRhZyIsInN0cmlwSW5kZW50VHJhbnNmb3JtZXIiLCJpbmxpbmVBcnJheVRyYW5zZm9ybWVyIiwidHJpbVJlc3VsdFRyYW5zZm9ybWVyIiwic3BsaXRTdHJpbmdUcmFuc2Zvcm1lciIsInJlcGxhY2VTdWJzdGl0dXRpb25UcmFuc2Zvcm1lciIsInNhZmVIdG1sIl0sIm1hcHBpbmdzIjoiQUFBQSxPQUFPQSxXQUFQLE1BQXdCLGdCQUF4QjtBQUNBLE9BQU9DLHNCQUFQLE1BQW1DLDJCQUFuQztBQUNBLE9BQU9DLHNCQUFQLE1BQW1DLDJCQUFuQztBQUNBLE9BQU9DLHFCQUFQLE1BQWtDLDBCQUFsQztBQUNBLE9BQU9DLHNCQUFQLE1BQW1DLDJCQUFuQztBQUNBLE9BQU9DLDhCQUFQLE1BQTJDLG1DQUEzQzs7QUFFQSxJQUFNQyxXQUFXLElBQUlOLFdBQUosQ0FDZkksdUJBQXVCLElBQXZCLENBRGUsRUFFZkYsc0JBRmUsRUFHZkQsc0JBSGUsRUFJZkUscUJBSmUsRUFLZkUsK0JBQStCLElBQS9CLEVBQXFDLE9BQXJDLENBTGUsRUFNZkEsK0JBQStCLElBQS9CLEVBQXFDLE1BQXJDLENBTmUsRUFPZkEsK0JBQStCLElBQS9CLEVBQXFDLE1BQXJDLENBUGUsRUFRZkEsK0JBQStCLElBQS9CLEVBQXFDLFFBQXJDLENBUmUsRUFTZkEsK0JBQStCLElBQS9CLEVBQXFDLFFBQXJDLENBVGUsRUFVZkEsK0JBQStCLElBQS9CLEVBQXFDLFFBQXJDLENBVmUsQ0FBakI7O0FBYUEsZUFBZUMsUUFBZiIsImZpbGUiOiJzYWZlSHRtbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUZW1wbGF0ZVRhZyBmcm9tICcuLi9UZW1wbGF0ZVRhZyc7XG5pbXBvcnQgc3RyaXBJbmRlbnRUcmFuc2Zvcm1lciBmcm9tICcuLi9zdHJpcEluZGVudFRyYW5zZm9ybWVyJztcbmltcG9ydCBpbmxpbmVBcnJheVRyYW5zZm9ybWVyIGZyb20gJy4uL2lubGluZUFycmF5VHJhbnNmb3JtZXInO1xuaW1wb3J0IHRyaW1SZXN1bHRUcmFuc2Zvcm1lciBmcm9tICcuLi90cmltUmVzdWx0VHJhbnNmb3JtZXInO1xuaW1wb3J0IHNwbGl0U3RyaW5nVHJhbnNmb3JtZXIgZnJvbSAnLi4vc3BsaXRTdHJpbmdUcmFuc2Zvcm1lcic7XG5pbXBvcnQgcmVwbGFjZVN1YnN0aXR1dGlvblRyYW5zZm9ybWVyIGZyb20gJy4uL3JlcGxhY2VTdWJzdGl0dXRpb25UcmFuc2Zvcm1lcic7XG5cbmNvbnN0IHNhZmVIdG1sID0gbmV3IFRlbXBsYXRlVGFnKFxuICBzcGxpdFN0cmluZ1RyYW5zZm9ybWVyKCdcXG4nKSxcbiAgaW5saW5lQXJyYXlUcmFuc2Zvcm1lcixcbiAgc3RyaXBJbmRlbnRUcmFuc2Zvcm1lcixcbiAgdHJpbVJlc3VsdFRyYW5zZm9ybWVyLFxuICByZXBsYWNlU3Vic3RpdHV0aW9uVHJhbnNmb3JtZXIoLyYvZywgJyZhbXA7JyksXG4gIHJlcGxhY2VTdWJzdGl0dXRpb25UcmFuc2Zvcm1lcigvPC9nLCAnJmx0OycpLFxuICByZXBsYWNlU3Vic3RpdHV0aW9uVHJhbnNmb3JtZXIoLz4vZywgJyZndDsnKSxcbiAgcmVwbGFjZVN1YnN0aXR1dGlvblRyYW5zZm9ybWVyKC9cIi9nLCAnJnF1b3Q7JyksXG4gIHJlcGxhY2VTdWJzdGl0dXRpb25UcmFuc2Zvcm1lcigvJy9nLCAnJiN4Mjc7JyksXG4gIHJlcGxhY2VTdWJzdGl0dXRpb25UcmFuc2Zvcm1lcigvYC9nLCAnJiN4NjA7JyksXG4pO1xuXG5leHBvcnQgZGVmYXVsdCBzYWZlSHRtbDtcbiJdfQ==
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/safeHtml/index.js
  
  
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zYWZlSHRtbC9pbmRleC5qcyJdLCJuYW1lcyI6WyJkZWZhdWx0Il0sIm1hcHBpbmdzIjoicUJBQW9CLFk7cUJBQWJBLE8iLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBmcm9tICcuL3NhZmVIdG1sJztcbiJdfQ==
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/oneLine/oneLine.js
  
  
  
  
  var oneLine = new TemplateTag_TemplateTag(replaceResultTransformer_replaceResultTransformer(/(?:\n(?:\s*))+/g, ' '), trimResultTransformer_trimResultTransformer);
  
  /* harmony default export */ const oneLine_oneLine = (oneLine);
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vbmVMaW5lL29uZUxpbmUuanMiXSwibmFtZXMiOlsiVGVtcGxhdGVUYWciLCJ0cmltUmVzdWx0VHJhbnNmb3JtZXIiLCJyZXBsYWNlUmVzdWx0VHJhbnNmb3JtZXIiLCJvbmVMaW5lIl0sIm1hcHBpbmdzIjoiQUFBQSxPQUFPQSxXQUFQLE1BQXdCLGdCQUF4QjtBQUNBLE9BQU9DLHFCQUFQLE1BQWtDLDBCQUFsQztBQUNBLE9BQU9DLHdCQUFQLE1BQXFDLDZCQUFyQzs7QUFFQSxJQUFNQyxVQUFVLElBQUlILFdBQUosQ0FDZEUseUJBQXlCLGlCQUF6QixFQUE0QyxHQUE1QyxDQURjLEVBRWRELHFCQUZjLENBQWhCOztBQUtBLGVBQWVFLE9BQWYiLCJmaWxlIjoib25lTGluZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUZW1wbGF0ZVRhZyBmcm9tICcuLi9UZW1wbGF0ZVRhZyc7XG5pbXBvcnQgdHJpbVJlc3VsdFRyYW5zZm9ybWVyIGZyb20gJy4uL3RyaW1SZXN1bHRUcmFuc2Zvcm1lcic7XG5pbXBvcnQgcmVwbGFjZVJlc3VsdFRyYW5zZm9ybWVyIGZyb20gJy4uL3JlcGxhY2VSZXN1bHRUcmFuc2Zvcm1lcic7XG5cbmNvbnN0IG9uZUxpbmUgPSBuZXcgVGVtcGxhdGVUYWcoXG4gIHJlcGxhY2VSZXN1bHRUcmFuc2Zvcm1lcigvKD86XFxuKD86XFxzKikpKy9nLCAnICcpLFxuICB0cmltUmVzdWx0VHJhbnNmb3JtZXIsXG4pO1xuXG5leHBvcnQgZGVmYXVsdCBvbmVMaW5lO1xuIl19
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/oneLine/index.js
  
  
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vbmVMaW5lL2luZGV4LmpzIl0sIm5hbWVzIjpbImRlZmF1bHQiXSwibWFwcGluZ3MiOiJxQkFBb0IsVztxQkFBYkEsTyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGZyb20gJy4vb25lTGluZSc7XG4iXX0=
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/oneLineTrim/oneLineTrim.js
  
  
  
  
  var oneLineTrim = new TemplateTag_TemplateTag(replaceResultTransformer_replaceResultTransformer(/(?:\n\s*)/g, ''), trimResultTransformer_trimResultTransformer);
  
  /* harmony default export */ const oneLineTrim_oneLineTrim = (oneLineTrim);
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vbmVMaW5lVHJpbS9vbmVMaW5lVHJpbS5qcyJdLCJuYW1lcyI6WyJUZW1wbGF0ZVRhZyIsInRyaW1SZXN1bHRUcmFuc2Zvcm1lciIsInJlcGxhY2VSZXN1bHRUcmFuc2Zvcm1lciIsIm9uZUxpbmVUcmltIl0sIm1hcHBpbmdzIjoiQUFBQSxPQUFPQSxXQUFQLE1BQXdCLGdCQUF4QjtBQUNBLE9BQU9DLHFCQUFQLE1BQWtDLDBCQUFsQztBQUNBLE9BQU9DLHdCQUFQLE1BQXFDLDZCQUFyQzs7QUFFQSxJQUFNQyxjQUFjLElBQUlILFdBQUosQ0FDbEJFLHlCQUF5QixZQUF6QixFQUF1QyxFQUF2QyxDQURrQixFQUVsQkQscUJBRmtCLENBQXBCOztBQUtBLGVBQWVFLFdBQWYiLCJmaWxlIjoib25lTGluZVRyaW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVGVtcGxhdGVUYWcgZnJvbSAnLi4vVGVtcGxhdGVUYWcnO1xuaW1wb3J0IHRyaW1SZXN1bHRUcmFuc2Zvcm1lciBmcm9tICcuLi90cmltUmVzdWx0VHJhbnNmb3JtZXInO1xuaW1wb3J0IHJlcGxhY2VSZXN1bHRUcmFuc2Zvcm1lciBmcm9tICcuLi9yZXBsYWNlUmVzdWx0VHJhbnNmb3JtZXInO1xuXG5jb25zdCBvbmVMaW5lVHJpbSA9IG5ldyBUZW1wbGF0ZVRhZyhcbiAgcmVwbGFjZVJlc3VsdFRyYW5zZm9ybWVyKC8oPzpcXG5cXHMqKS9nLCAnJyksXG4gIHRyaW1SZXN1bHRUcmFuc2Zvcm1lcixcbik7XG5cbmV4cG9ydCBkZWZhdWx0IG9uZUxpbmVUcmltO1xuIl19
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/oneLineTrim/index.js
  
  
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vbmVMaW5lVHJpbS9pbmRleC5qcyJdLCJuYW1lcyI6WyJkZWZhdWx0Il0sIm1hcHBpbmdzIjoicUJBQW9CLGU7cUJBQWJBLE8iLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBmcm9tICcuL29uZUxpbmVUcmltJztcbiJdfQ==
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/oneLineCommaLists/oneLineCommaLists.js
  
  
  
  
  
  var oneLineCommaLists = new TemplateTag_TemplateTag(inlineArrayTransformer_inlineArrayTransformer({ separator: ',' }), replaceResultTransformer_replaceResultTransformer(/(?:\s+)/g, ' '), trimResultTransformer_trimResultTransformer);
  
  /* harmony default export */ const oneLineCommaLists_oneLineCommaLists = (oneLineCommaLists);
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vbmVMaW5lQ29tbWFMaXN0cy9vbmVMaW5lQ29tbWFMaXN0cy5qcyJdLCJuYW1lcyI6WyJUZW1wbGF0ZVRhZyIsImlubGluZUFycmF5VHJhbnNmb3JtZXIiLCJ0cmltUmVzdWx0VHJhbnNmb3JtZXIiLCJyZXBsYWNlUmVzdWx0VHJhbnNmb3JtZXIiLCJvbmVMaW5lQ29tbWFMaXN0cyIsInNlcGFyYXRvciJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBT0EsV0FBUCxNQUF3QixnQkFBeEI7QUFDQSxPQUFPQyxzQkFBUCxNQUFtQywyQkFBbkM7QUFDQSxPQUFPQyxxQkFBUCxNQUFrQywwQkFBbEM7QUFDQSxPQUFPQyx3QkFBUCxNQUFxQyw2QkFBckM7O0FBRUEsSUFBTUMsb0JBQW9CLElBQUlKLFdBQUosQ0FDeEJDLHVCQUF1QixFQUFFSSxXQUFXLEdBQWIsRUFBdkIsQ0FEd0IsRUFFeEJGLHlCQUF5QixVQUF6QixFQUFxQyxHQUFyQyxDQUZ3QixFQUd4QkQscUJBSHdCLENBQTFCOztBQU1BLGVBQWVFLGlCQUFmIiwiZmlsZSI6Im9uZUxpbmVDb21tYUxpc3RzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRlbXBsYXRlVGFnIGZyb20gJy4uL1RlbXBsYXRlVGFnJztcbmltcG9ydCBpbmxpbmVBcnJheVRyYW5zZm9ybWVyIGZyb20gJy4uL2lubGluZUFycmF5VHJhbnNmb3JtZXInO1xuaW1wb3J0IHRyaW1SZXN1bHRUcmFuc2Zvcm1lciBmcm9tICcuLi90cmltUmVzdWx0VHJhbnNmb3JtZXInO1xuaW1wb3J0IHJlcGxhY2VSZXN1bHRUcmFuc2Zvcm1lciBmcm9tICcuLi9yZXBsYWNlUmVzdWx0VHJhbnNmb3JtZXInO1xuXG5jb25zdCBvbmVMaW5lQ29tbWFMaXN0cyA9IG5ldyBUZW1wbGF0ZVRhZyhcbiAgaW5saW5lQXJyYXlUcmFuc2Zvcm1lcih7IHNlcGFyYXRvcjogJywnIH0pLFxuICByZXBsYWNlUmVzdWx0VHJhbnNmb3JtZXIoLyg/OlxccyspL2csICcgJyksXG4gIHRyaW1SZXN1bHRUcmFuc2Zvcm1lcixcbik7XG5cbmV4cG9ydCBkZWZhdWx0IG9uZUxpbmVDb21tYUxpc3RzO1xuIl19
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/oneLineCommaLists/index.js
  
  
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vbmVMaW5lQ29tbWFMaXN0cy9pbmRleC5qcyJdLCJuYW1lcyI6WyJkZWZhdWx0Il0sIm1hcHBpbmdzIjoicUJBQW9CLHFCO3FCQUFiQSxPIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgZnJvbSAnLi9vbmVMaW5lQ29tbWFMaXN0cyc7XG4iXX0=
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/oneLineCommaListsOr/oneLineCommaListsOr.js
  
  
  
  
  
  var oneLineCommaListsOr = new TemplateTag_TemplateTag(inlineArrayTransformer_inlineArrayTransformer({ separator: ',', conjunction: 'or' }), replaceResultTransformer_replaceResultTransformer(/(?:\s+)/g, ' '), trimResultTransformer_trimResultTransformer);
  
  /* harmony default export */ const oneLineCommaListsOr_oneLineCommaListsOr = (oneLineCommaListsOr);
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vbmVMaW5lQ29tbWFMaXN0c09yL29uZUxpbmVDb21tYUxpc3RzT3IuanMiXSwibmFtZXMiOlsiVGVtcGxhdGVUYWciLCJpbmxpbmVBcnJheVRyYW5zZm9ybWVyIiwidHJpbVJlc3VsdFRyYW5zZm9ybWVyIiwicmVwbGFjZVJlc3VsdFRyYW5zZm9ybWVyIiwib25lTGluZUNvbW1hTGlzdHNPciIsInNlcGFyYXRvciIsImNvbmp1bmN0aW9uIl0sIm1hcHBpbmdzIjoiQUFBQSxPQUFPQSxXQUFQLE1BQXdCLGdCQUF4QjtBQUNBLE9BQU9DLHNCQUFQLE1BQW1DLDJCQUFuQztBQUNBLE9BQU9DLHFCQUFQLE1BQWtDLDBCQUFsQztBQUNBLE9BQU9DLHdCQUFQLE1BQXFDLDZCQUFyQzs7QUFFQSxJQUFNQyxzQkFBc0IsSUFBSUosV0FBSixDQUMxQkMsdUJBQXVCLEVBQUVJLFdBQVcsR0FBYixFQUFrQkMsYUFBYSxJQUEvQixFQUF2QixDQUQwQixFQUUxQkgseUJBQXlCLFVBQXpCLEVBQXFDLEdBQXJDLENBRjBCLEVBRzFCRCxxQkFIMEIsQ0FBNUI7O0FBTUEsZUFBZUUsbUJBQWYiLCJmaWxlIjoib25lTGluZUNvbW1hTGlzdHNPci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUZW1wbGF0ZVRhZyBmcm9tICcuLi9UZW1wbGF0ZVRhZyc7XG5pbXBvcnQgaW5saW5lQXJyYXlUcmFuc2Zvcm1lciBmcm9tICcuLi9pbmxpbmVBcnJheVRyYW5zZm9ybWVyJztcbmltcG9ydCB0cmltUmVzdWx0VHJhbnNmb3JtZXIgZnJvbSAnLi4vdHJpbVJlc3VsdFRyYW5zZm9ybWVyJztcbmltcG9ydCByZXBsYWNlUmVzdWx0VHJhbnNmb3JtZXIgZnJvbSAnLi4vcmVwbGFjZVJlc3VsdFRyYW5zZm9ybWVyJztcblxuY29uc3Qgb25lTGluZUNvbW1hTGlzdHNPciA9IG5ldyBUZW1wbGF0ZVRhZyhcbiAgaW5saW5lQXJyYXlUcmFuc2Zvcm1lcih7IHNlcGFyYXRvcjogJywnLCBjb25qdW5jdGlvbjogJ29yJyB9KSxcbiAgcmVwbGFjZVJlc3VsdFRyYW5zZm9ybWVyKC8oPzpcXHMrKS9nLCAnICcpLFxuICB0cmltUmVzdWx0VHJhbnNmb3JtZXIsXG4pO1xuXG5leHBvcnQgZGVmYXVsdCBvbmVMaW5lQ29tbWFMaXN0c09yO1xuIl19
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/oneLineCommaListsOr/index.js
  
  
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vbmVMaW5lQ29tbWFMaXN0c09yL2luZGV4LmpzIl0sIm5hbWVzIjpbImRlZmF1bHQiXSwibWFwcGluZ3MiOiJxQkFBb0IsdUI7cUJBQWJBLE8iLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBmcm9tICcuL29uZUxpbmVDb21tYUxpc3RzT3InO1xuIl19
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/oneLineCommaListsAnd/oneLineCommaListsAnd.js
  
  
  
  
  
  var oneLineCommaListsAnd = new TemplateTag_TemplateTag(inlineArrayTransformer_inlineArrayTransformer({ separator: ',', conjunction: 'and' }), replaceResultTransformer_replaceResultTransformer(/(?:\s+)/g, ' '), trimResultTransformer_trimResultTransformer);
  
  /* harmony default export */ const oneLineCommaListsAnd_oneLineCommaListsAnd = (oneLineCommaListsAnd);
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vbmVMaW5lQ29tbWFMaXN0c0FuZC9vbmVMaW5lQ29tbWFMaXN0c0FuZC5qcyJdLCJuYW1lcyI6WyJUZW1wbGF0ZVRhZyIsImlubGluZUFycmF5VHJhbnNmb3JtZXIiLCJ0cmltUmVzdWx0VHJhbnNmb3JtZXIiLCJyZXBsYWNlUmVzdWx0VHJhbnNmb3JtZXIiLCJvbmVMaW5lQ29tbWFMaXN0c0FuZCIsInNlcGFyYXRvciIsImNvbmp1bmN0aW9uIl0sIm1hcHBpbmdzIjoiQUFBQSxPQUFPQSxXQUFQLE1BQXdCLGdCQUF4QjtBQUNBLE9BQU9DLHNCQUFQLE1BQW1DLDJCQUFuQztBQUNBLE9BQU9DLHFCQUFQLE1BQWtDLDBCQUFsQztBQUNBLE9BQU9DLHdCQUFQLE1BQXFDLDZCQUFyQzs7QUFFQSxJQUFNQyx1QkFBdUIsSUFBSUosV0FBSixDQUMzQkMsdUJBQXVCLEVBQUVJLFdBQVcsR0FBYixFQUFrQkMsYUFBYSxLQUEvQixFQUF2QixDQUQyQixFQUUzQkgseUJBQXlCLFVBQXpCLEVBQXFDLEdBQXJDLENBRjJCLEVBRzNCRCxxQkFIMkIsQ0FBN0I7O0FBTUEsZUFBZUUsb0JBQWYiLCJmaWxlIjoib25lTGluZUNvbW1hTGlzdHNBbmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVGVtcGxhdGVUYWcgZnJvbSAnLi4vVGVtcGxhdGVUYWcnO1xuaW1wb3J0IGlubGluZUFycmF5VHJhbnNmb3JtZXIgZnJvbSAnLi4vaW5saW5lQXJyYXlUcmFuc2Zvcm1lcic7XG5pbXBvcnQgdHJpbVJlc3VsdFRyYW5zZm9ybWVyIGZyb20gJy4uL3RyaW1SZXN1bHRUcmFuc2Zvcm1lcic7XG5pbXBvcnQgcmVwbGFjZVJlc3VsdFRyYW5zZm9ybWVyIGZyb20gJy4uL3JlcGxhY2VSZXN1bHRUcmFuc2Zvcm1lcic7XG5cbmNvbnN0IG9uZUxpbmVDb21tYUxpc3RzQW5kID0gbmV3IFRlbXBsYXRlVGFnKFxuICBpbmxpbmVBcnJheVRyYW5zZm9ybWVyKHsgc2VwYXJhdG9yOiAnLCcsIGNvbmp1bmN0aW9uOiAnYW5kJyB9KSxcbiAgcmVwbGFjZVJlc3VsdFRyYW5zZm9ybWVyKC8oPzpcXHMrKS9nLCAnICcpLFxuICB0cmltUmVzdWx0VHJhbnNmb3JtZXIsXG4pO1xuXG5leHBvcnQgZGVmYXVsdCBvbmVMaW5lQ29tbWFMaXN0c0FuZDtcbiJdfQ==
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/oneLineCommaListsAnd/index.js
  
  
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vbmVMaW5lQ29tbWFMaXN0c0FuZC9pbmRleC5qcyJdLCJuYW1lcyI6WyJkZWZhdWx0Il0sIm1hcHBpbmdzIjoicUJBQW9CLHdCO3FCQUFiQSxPIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgZnJvbSAnLi9vbmVMaW5lQ29tbWFMaXN0c0FuZCc7XG4iXX0=
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/inlineLists/inlineLists.js
  
  
  
  
  
  var inlineLists = new TemplateTag_TemplateTag(inlineArrayTransformer_inlineArrayTransformer, stripIndentTransformer_stripIndentTransformer, trimResultTransformer_trimResultTransformer);
  
  /* harmony default export */ const inlineLists_inlineLists = (inlineLists);
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmxpbmVMaXN0cy9pbmxpbmVMaXN0cy5qcyJdLCJuYW1lcyI6WyJUZW1wbGF0ZVRhZyIsInN0cmlwSW5kZW50VHJhbnNmb3JtZXIiLCJpbmxpbmVBcnJheVRyYW5zZm9ybWVyIiwidHJpbVJlc3VsdFRyYW5zZm9ybWVyIiwiaW5saW5lTGlzdHMiXSwibWFwcGluZ3MiOiJBQUFBLE9BQU9BLFdBQVAsTUFBd0IsZ0JBQXhCO0FBQ0EsT0FBT0Msc0JBQVAsTUFBbUMsMkJBQW5DO0FBQ0EsT0FBT0Msc0JBQVAsTUFBbUMsMkJBQW5DO0FBQ0EsT0FBT0MscUJBQVAsTUFBa0MsMEJBQWxDOztBQUVBLElBQU1DLGNBQWMsSUFBSUosV0FBSixDQUNsQkUsc0JBRGtCLEVBRWxCRCxzQkFGa0IsRUFHbEJFLHFCQUhrQixDQUFwQjs7QUFNQSxlQUFlQyxXQUFmIiwiZmlsZSI6ImlubGluZUxpc3RzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRlbXBsYXRlVGFnIGZyb20gJy4uL1RlbXBsYXRlVGFnJztcbmltcG9ydCBzdHJpcEluZGVudFRyYW5zZm9ybWVyIGZyb20gJy4uL3N0cmlwSW5kZW50VHJhbnNmb3JtZXInO1xuaW1wb3J0IGlubGluZUFycmF5VHJhbnNmb3JtZXIgZnJvbSAnLi4vaW5saW5lQXJyYXlUcmFuc2Zvcm1lcic7XG5pbXBvcnQgdHJpbVJlc3VsdFRyYW5zZm9ybWVyIGZyb20gJy4uL3RyaW1SZXN1bHRUcmFuc2Zvcm1lcic7XG5cbmNvbnN0IGlubGluZUxpc3RzID0gbmV3IFRlbXBsYXRlVGFnKFxuICBpbmxpbmVBcnJheVRyYW5zZm9ybWVyLFxuICBzdHJpcEluZGVudFRyYW5zZm9ybWVyLFxuICB0cmltUmVzdWx0VHJhbnNmb3JtZXIsXG4pO1xuXG5leHBvcnQgZGVmYXVsdCBpbmxpbmVMaXN0cztcbiJdfQ==
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/inlineLists/index.js
  
  
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmxpbmVMaXN0cy9pbmRleC5qcyJdLCJuYW1lcyI6WyJkZWZhdWx0Il0sIm1hcHBpbmdzIjoicUJBQW9CLGU7cUJBQWJBLE8iLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBmcm9tICcuL2lubGluZUxpc3RzJztcbiJdfQ==
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/oneLineInlineLists/oneLineInlineLists.js
  
  
  
  
  
  var oneLineInlineLists = new TemplateTag_TemplateTag(inlineArrayTransformer_inlineArrayTransformer, replaceResultTransformer_replaceResultTransformer(/(?:\s+)/g, ' '), trimResultTransformer_trimResultTransformer);
  
  /* harmony default export */ const oneLineInlineLists_oneLineInlineLists = (oneLineInlineLists);
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vbmVMaW5lSW5saW5lTGlzdHMvb25lTGluZUlubGluZUxpc3RzLmpzIl0sIm5hbWVzIjpbIlRlbXBsYXRlVGFnIiwiaW5saW5lQXJyYXlUcmFuc2Zvcm1lciIsInRyaW1SZXN1bHRUcmFuc2Zvcm1lciIsInJlcGxhY2VSZXN1bHRUcmFuc2Zvcm1lciIsIm9uZUxpbmVJbmxpbmVMaXN0cyJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBT0EsV0FBUCxNQUF3QixnQkFBeEI7QUFDQSxPQUFPQyxzQkFBUCxNQUFtQywyQkFBbkM7QUFDQSxPQUFPQyxxQkFBUCxNQUFrQywwQkFBbEM7QUFDQSxPQUFPQyx3QkFBUCxNQUFxQyw2QkFBckM7O0FBRUEsSUFBTUMscUJBQXFCLElBQUlKLFdBQUosQ0FDekJDLHNCQUR5QixFQUV6QkUseUJBQXlCLFVBQXpCLEVBQXFDLEdBQXJDLENBRnlCLEVBR3pCRCxxQkFIeUIsQ0FBM0I7O0FBTUEsZUFBZUUsa0JBQWYiLCJmaWxlIjoib25lTGluZUlubGluZUxpc3RzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRlbXBsYXRlVGFnIGZyb20gJy4uL1RlbXBsYXRlVGFnJztcbmltcG9ydCBpbmxpbmVBcnJheVRyYW5zZm9ybWVyIGZyb20gJy4uL2lubGluZUFycmF5VHJhbnNmb3JtZXInO1xuaW1wb3J0IHRyaW1SZXN1bHRUcmFuc2Zvcm1lciBmcm9tICcuLi90cmltUmVzdWx0VHJhbnNmb3JtZXInO1xuaW1wb3J0IHJlcGxhY2VSZXN1bHRUcmFuc2Zvcm1lciBmcm9tICcuLi9yZXBsYWNlUmVzdWx0VHJhbnNmb3JtZXInO1xuXG5jb25zdCBvbmVMaW5lSW5saW5lTGlzdHMgPSBuZXcgVGVtcGxhdGVUYWcoXG4gIGlubGluZUFycmF5VHJhbnNmb3JtZXIsXG4gIHJlcGxhY2VSZXN1bHRUcmFuc2Zvcm1lcigvKD86XFxzKykvZywgJyAnKSxcbiAgdHJpbVJlc3VsdFRyYW5zZm9ybWVyLFxuKTtcblxuZXhwb3J0IGRlZmF1bHQgb25lTGluZUlubGluZUxpc3RzO1xuIl19
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/oneLineInlineLists/index.js
  
  
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vbmVMaW5lSW5saW5lTGlzdHMvaW5kZXguanMiXSwibmFtZXMiOlsiZGVmYXVsdCJdLCJtYXBwaW5ncyI6InFCQUFvQixzQjtxQkFBYkEsTyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGZyb20gJy4vb25lTGluZUlubGluZUxpc3RzJztcbiJdfQ==
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/stripIndent/stripIndent.js
  
  
  
  
  var stripIndent = new TemplateTag_TemplateTag(stripIndentTransformer_stripIndentTransformer, trimResultTransformer_trimResultTransformer);
  
  /* harmony default export */ const stripIndent_stripIndent = (stripIndent);
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJpcEluZGVudC9zdHJpcEluZGVudC5qcyJdLCJuYW1lcyI6WyJUZW1wbGF0ZVRhZyIsInN0cmlwSW5kZW50VHJhbnNmb3JtZXIiLCJ0cmltUmVzdWx0VHJhbnNmb3JtZXIiLCJzdHJpcEluZGVudCJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBT0EsV0FBUCxNQUF3QixnQkFBeEI7QUFDQSxPQUFPQyxzQkFBUCxNQUFtQywyQkFBbkM7QUFDQSxPQUFPQyxxQkFBUCxNQUFrQywwQkFBbEM7O0FBRUEsSUFBTUMsY0FBYyxJQUFJSCxXQUFKLENBQ2xCQyxzQkFEa0IsRUFFbEJDLHFCQUZrQixDQUFwQjs7QUFLQSxlQUFlQyxXQUFmIiwiZmlsZSI6InN0cmlwSW5kZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRlbXBsYXRlVGFnIGZyb20gJy4uL1RlbXBsYXRlVGFnJztcbmltcG9ydCBzdHJpcEluZGVudFRyYW5zZm9ybWVyIGZyb20gJy4uL3N0cmlwSW5kZW50VHJhbnNmb3JtZXInO1xuaW1wb3J0IHRyaW1SZXN1bHRUcmFuc2Zvcm1lciBmcm9tICcuLi90cmltUmVzdWx0VHJhbnNmb3JtZXInO1xuXG5jb25zdCBzdHJpcEluZGVudCA9IG5ldyBUZW1wbGF0ZVRhZyhcbiAgc3RyaXBJbmRlbnRUcmFuc2Zvcm1lcixcbiAgdHJpbVJlc3VsdFRyYW5zZm9ybWVyLFxuKTtcblxuZXhwb3J0IGRlZmF1bHQgc3RyaXBJbmRlbnQ7XG4iXX0=
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/stripIndent/index.js
  
  
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJpcEluZGVudC9pbmRleC5qcyJdLCJuYW1lcyI6WyJkZWZhdWx0Il0sIm1hcHBpbmdzIjoicUJBQW9CLGU7cUJBQWJBLE8iLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBmcm9tICcuL3N0cmlwSW5kZW50JztcbiJdfQ==
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/stripIndents/stripIndents.js
  
  
  
  
  var stripIndents = new TemplateTag_TemplateTag(stripIndentTransformer_stripIndentTransformer('all'), trimResultTransformer_trimResultTransformer);
  
  /* harmony default export */ const stripIndents_stripIndents = (stripIndents);
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJpcEluZGVudHMvc3RyaXBJbmRlbnRzLmpzIl0sIm5hbWVzIjpbIlRlbXBsYXRlVGFnIiwic3RyaXBJbmRlbnRUcmFuc2Zvcm1lciIsInRyaW1SZXN1bHRUcmFuc2Zvcm1lciIsInN0cmlwSW5kZW50cyJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBT0EsV0FBUCxNQUF3QixnQkFBeEI7QUFDQSxPQUFPQyxzQkFBUCxNQUFtQywyQkFBbkM7QUFDQSxPQUFPQyxxQkFBUCxNQUFrQywwQkFBbEM7O0FBRUEsSUFBTUMsZUFBZSxJQUFJSCxXQUFKLENBQ25CQyx1QkFBdUIsS0FBdkIsQ0FEbUIsRUFFbkJDLHFCQUZtQixDQUFyQjs7QUFLQSxlQUFlQyxZQUFmIiwiZmlsZSI6InN0cmlwSW5kZW50cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUZW1wbGF0ZVRhZyBmcm9tICcuLi9UZW1wbGF0ZVRhZyc7XG5pbXBvcnQgc3RyaXBJbmRlbnRUcmFuc2Zvcm1lciBmcm9tICcuLi9zdHJpcEluZGVudFRyYW5zZm9ybWVyJztcbmltcG9ydCB0cmltUmVzdWx0VHJhbnNmb3JtZXIgZnJvbSAnLi4vdHJpbVJlc3VsdFRyYW5zZm9ybWVyJztcblxuY29uc3Qgc3RyaXBJbmRlbnRzID0gbmV3IFRlbXBsYXRlVGFnKFxuICBzdHJpcEluZGVudFRyYW5zZm9ybWVyKCdhbGwnKSxcbiAgdHJpbVJlc3VsdFRyYW5zZm9ybWVyLFxuKTtcblxuZXhwb3J0IGRlZmF1bHQgc3RyaXBJbmRlbnRzO1xuIl19
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/stripIndents/index.js
  
  
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJpcEluZGVudHMvaW5kZXguanMiXSwibmFtZXMiOlsiZGVmYXVsdCJdLCJtYXBwaW5ncyI6InFCQUFvQixnQjtxQkFBYkEsTyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGZyb20gJy4vc3RyaXBJbmRlbnRzJztcbiJdfQ==
  ;// CONCATENATED MODULE: ./node_modules/common-tags/es/index.js
  // core
  
  
  
  // transformers
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  // tags
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJUZW1wbGF0ZVRhZyIsInRyaW1SZXN1bHRUcmFuc2Zvcm1lciIsInN0cmlwSW5kZW50VHJhbnNmb3JtZXIiLCJyZXBsYWNlUmVzdWx0VHJhbnNmb3JtZXIiLCJyZXBsYWNlU3Vic3RpdHV0aW9uVHJhbnNmb3JtZXIiLCJyZXBsYWNlU3RyaW5nVHJhbnNmb3JtZXIiLCJpbmxpbmVBcnJheVRyYW5zZm9ybWVyIiwic3BsaXRTdHJpbmdUcmFuc2Zvcm1lciIsInJlbW92ZU5vblByaW50aW5nVmFsdWVzVHJhbnNmb3JtZXIiLCJjb21tYUxpc3RzIiwiY29tbWFMaXN0c0FuZCIsImNvbW1hTGlzdHNPciIsImh0bWwiLCJjb2RlQmxvY2siLCJzb3VyY2UiLCJzYWZlSHRtbCIsIm9uZUxpbmUiLCJvbmVMaW5lVHJpbSIsIm9uZUxpbmVDb21tYUxpc3RzIiwib25lTGluZUNvbW1hTGlzdHNPciIsIm9uZUxpbmVDb21tYUxpc3RzQW5kIiwiaW5saW5lTGlzdHMiLCJvbmVMaW5lSW5saW5lTGlzdHMiLCJzdHJpcEluZGVudCIsInN0cmlwSW5kZW50cyJdLCJtYXBwaW5ncyI6IkFBQUE7eUJBQ3dCLGU7eUJBQWpCQSxXOztBQUVQOzttQ0FDa0MseUI7bUNBQTNCQyxxQjtvQ0FDNEIsMEI7b0NBQTVCQyxzQjtzQ0FDOEIsNEI7c0NBQTlCQyx3Qjs0Q0FDb0Msa0M7NENBQXBDQyw4QjtzQ0FDOEIsNEI7c0NBQTlCQyx3QjtvQ0FDNEIsMEI7b0NBQTVCQyxzQjtvQ0FDNEIsMEI7b0NBQTVCQyxzQjtnREFDd0Msc0M7Z0RBQXhDQyxrQzs7QUFFUDs7d0JBQ3VCLGM7d0JBQWhCQyxVOzJCQUNtQixpQjsyQkFBbkJDLGE7MEJBQ2tCLGdCOzBCQUFsQkMsWTtrQkFDVSxRO2tCQUFWQyxJO3VCQUNlLGE7dUJBQWZDLFM7b0JBQ1ksVTtvQkFBWkMsTTtzQkFDYyxZO3NCQUFkQyxRO3FCQUNhLFc7cUJBQWJDLE87eUJBQ2lCLGU7eUJBQWpCQyxXOytCQUN1QixxQjsrQkFBdkJDLGlCO2lDQUN5Qix1QjtpQ0FBekJDLG1CO2tDQUMwQix3QjtrQ0FBMUJDLG9CO3lCQUNpQixlO3lCQUFqQkMsVztnQ0FDd0Isc0I7Z0NBQXhCQyxrQjt5QkFDaUIsZTt5QkFBakJDLFc7MEJBQ2tCLGdCOzBCQUFsQkMsWSIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGNvcmVcbmV4cG9ydCBUZW1wbGF0ZVRhZyBmcm9tICcuL1RlbXBsYXRlVGFnJztcblxuLy8gdHJhbnNmb3JtZXJzXG5leHBvcnQgdHJpbVJlc3VsdFRyYW5zZm9ybWVyIGZyb20gJy4vdHJpbVJlc3VsdFRyYW5zZm9ybWVyJztcbmV4cG9ydCBzdHJpcEluZGVudFRyYW5zZm9ybWVyIGZyb20gJy4vc3RyaXBJbmRlbnRUcmFuc2Zvcm1lcic7XG5leHBvcnQgcmVwbGFjZVJlc3VsdFRyYW5zZm9ybWVyIGZyb20gJy4vcmVwbGFjZVJlc3VsdFRyYW5zZm9ybWVyJztcbmV4cG9ydCByZXBsYWNlU3Vic3RpdHV0aW9uVHJhbnNmb3JtZXIgZnJvbSAnLi9yZXBsYWNlU3Vic3RpdHV0aW9uVHJhbnNmb3JtZXInO1xuZXhwb3J0IHJlcGxhY2VTdHJpbmdUcmFuc2Zvcm1lciBmcm9tICcuL3JlcGxhY2VTdHJpbmdUcmFuc2Zvcm1lcic7XG5leHBvcnQgaW5saW5lQXJyYXlUcmFuc2Zvcm1lciBmcm9tICcuL2lubGluZUFycmF5VHJhbnNmb3JtZXInO1xuZXhwb3J0IHNwbGl0U3RyaW5nVHJhbnNmb3JtZXIgZnJvbSAnLi9zcGxpdFN0cmluZ1RyYW5zZm9ybWVyJztcbmV4cG9ydCByZW1vdmVOb25QcmludGluZ1ZhbHVlc1RyYW5zZm9ybWVyIGZyb20gJy4vcmVtb3ZlTm9uUHJpbnRpbmdWYWx1ZXNUcmFuc2Zvcm1lcic7XG5cbi8vIHRhZ3NcbmV4cG9ydCBjb21tYUxpc3RzIGZyb20gJy4vY29tbWFMaXN0cyc7XG5leHBvcnQgY29tbWFMaXN0c0FuZCBmcm9tICcuL2NvbW1hTGlzdHNBbmQnO1xuZXhwb3J0IGNvbW1hTGlzdHNPciBmcm9tICcuL2NvbW1hTGlzdHNPcic7XG5leHBvcnQgaHRtbCBmcm9tICcuL2h0bWwnO1xuZXhwb3J0IGNvZGVCbG9jayBmcm9tICcuL2NvZGVCbG9jayc7XG5leHBvcnQgc291cmNlIGZyb20gJy4vc291cmNlJztcbmV4cG9ydCBzYWZlSHRtbCBmcm9tICcuL3NhZmVIdG1sJztcbmV4cG9ydCBvbmVMaW5lIGZyb20gJy4vb25lTGluZSc7XG5leHBvcnQgb25lTGluZVRyaW0gZnJvbSAnLi9vbmVMaW5lVHJpbSc7XG5leHBvcnQgb25lTGluZUNvbW1hTGlzdHMgZnJvbSAnLi9vbmVMaW5lQ29tbWFMaXN0cyc7XG5leHBvcnQgb25lTGluZUNvbW1hTGlzdHNPciBmcm9tICcuL29uZUxpbmVDb21tYUxpc3RzT3InO1xuZXhwb3J0IG9uZUxpbmVDb21tYUxpc3RzQW5kIGZyb20gJy4vb25lTGluZUNvbW1hTGlzdHNBbmQnO1xuZXhwb3J0IGlubGluZUxpc3RzIGZyb20gJy4vaW5saW5lTGlzdHMnO1xuZXhwb3J0IG9uZUxpbmVJbmxpbmVMaXN0cyBmcm9tICcuL29uZUxpbmVJbmxpbmVMaXN0cyc7XG5leHBvcnQgc3RyaXBJbmRlbnQgZnJvbSAnLi9zdHJpcEluZGVudCc7XG5leHBvcnQgc3RyaXBJbmRlbnRzIGZyb20gJy4vc3RyaXBJbmRlbnRzJztcbiJdfQ==
  
  /***/ }),
  
  /***/ 9996:
  /***/ ((module) => {
  
  "use strict";
  
  
  var isMergeableObject = function isMergeableObject(value) {
    return isNonNullObject(value)
      && !isSpecial(value)
  };
  
  function isNonNullObject(value) {
    return !!value && typeof value === 'object'
  }
  
  function isSpecial(value) {
    var stringValue = Object.prototype.toString.call(value);
  
    return stringValue === '[object RegExp]'
      || stringValue === '[object Date]'
      || isReactElement(value)
  }
  
  // see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
  var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
  var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;
  
  function isReactElement(value) {
    return value.$$typeof === REACT_ELEMENT_TYPE
  }
  
  function emptyTarget(val) {
    return Array.isArray(val) ? [] : {}
  }
  
  function cloneUnlessOtherwiseSpecified(value, options) {
    return (options.clone !== false && options.isMergeableObject(value))
      ? deepmerge(emptyTarget(value), value, options)
      : value
  }
  
  function defaultArrayMerge(target, source, options) {
    return target.concat(source).map(function(element) {
      return cloneUnlessOtherwiseSpecified(element, options)
    })
  }
  
  function getMergeFunction(key, options) {
    if (!options.customMerge) {
      return deepmerge
    }
    var customMerge = options.customMerge(key);
    return typeof customMerge === 'function' ? customMerge : deepmerge
  }
  
  function getEnumerableOwnPropertySymbols(target) {
    return Object.getOwnPropertySymbols
      ? Object.getOwnPropertySymbols(target).filter(function(symbol) {
        return target.propertyIsEnumerable(symbol)
      })
      : []
  }
  
  function getKeys(target) {
    return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
  }
  
  function propertyIsOnObject(object, property) {
    try {
      return property in object
    } catch(_) {
      return false
    }
  }
  
  // Protects from prototype poisoning and unexpected merging up the prototype chain.
  function propertyIsUnsafe(target, key) {
    return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
      && !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
        && Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
  }
  
  function mergeObject(target, source, options) {
    var destination = {};
    if (options.isMergeableObject(target)) {
      getKeys(target).forEach(function(key) {
        destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
      });
    }
    getKeys(source).forEach(function(key) {
      if (propertyIsUnsafe(target, key)) {
        return
      }
  
      if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
        destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
      } else {
        destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
      }
    });
    return destination
  }
  
  function deepmerge(target, source, options) {
    options = options || {};
    options.arrayMerge = options.arrayMerge || defaultArrayMerge;
    options.isMergeableObject = options.isMergeableObject || isMergeableObject;
    // cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
    // implementations can use it. The caller may not replace it.
    options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;
  
    var sourceIsArray = Array.isArray(source);
    var targetIsArray = Array.isArray(target);
    var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;
  
    if (!sourceAndTargetTypesMatch) {
      return cloneUnlessOtherwiseSpecified(source, options)
    } else if (sourceIsArray) {
      return options.arrayMerge(target, source, options)
    } else {
      return mergeObject(target, source, options)
    }
  }
  
  deepmerge.all = function deepmergeAll(array, options) {
    if (!Array.isArray(array)) {
      throw new Error('first argument should be an array')
    }
  
    return array.reduce(function(prev, next) {
      return deepmerge(prev, next, options)
    }, {})
  };
  
  var deepmerge_1 = deepmerge;
  
  module.exports = deepmerge_1;
  
  
  /***/ }),
  
  /***/ 8037:
  /***/ ((__unused_webpack_module, exports, __webpack_require__) => {
  
  "use strict";
  
  
  var _interopRequireDefault = __webpack_require__(5318);
  
  exports.__esModule = true;
  exports.withPrefix = withPrefix;
  exports.withAssetPrefix = withAssetPrefix;
  exports.navigate = exports["default"] = void 0;
  
  var _objectWithoutPropertiesLoose2 = _interopRequireDefault(__webpack_require__(7316));
  
  var _assertThisInitialized2 = _interopRequireDefault(__webpack_require__(1506));
  
  var _inheritsLoose2 = _interopRequireDefault(__webpack_require__(5354));
  
  var _extends2 = _interopRequireDefault(__webpack_require__(7154));
  
  var _propTypes = _interopRequireDefault(__webpack_require__(5697));
  
  var _react = _interopRequireDefault(__webpack_require__(7294));
  
  var _reachRouter = __webpack_require__(3631);
  
  var _parsePath = __webpack_require__(1752);
  
  exports.parsePath = _parsePath.parsePath;
  
  var _isLocalLink = __webpack_require__(4587);
  
  var _rewriteLinkPath = __webpack_require__(349);
  
  var _excluded = ["to", "getProps", "onClick", "onMouseEnter", "activeClassName", "activeStyle", "innerRef", "partiallyActive", "state", "replace", "_location"];
  
  function withPrefix(path, prefix) {
    var _ref, _prefix;
  
    if (prefix === void 0) {
      prefix = getGlobalBasePrefix();
    }
  
    if (!(0, _isLocalLink.isLocalLink)(path)) {
      return path;
    }
  
    if (path.startsWith("./") || path.startsWith("../")) {
      return path;
    }
  
    var base = (_ref = (_prefix = prefix) !== null && _prefix !== void 0 ? _prefix : getGlobalPathPrefix()) !== null && _ref !== void 0 ? _ref : "/";
    return "" + (base !== null && base !== void 0 && base.endsWith("/") ? base.slice(0, -1) : base) + (path.startsWith("/") ? path : "/" + path);
  } // These global values are wrapped in typeof clauses to ensure the values exist.
  // This is especially problematic in unit testing of this component.
  
  
  var getGlobalPathPrefix = function getGlobalPathPrefix() {
    return  false ? 0 : "";
  };
  
  var getGlobalBasePrefix = function getGlobalBasePrefix() {
    return  false ? 0 : "";
  };
  
  function withAssetPrefix(path) {
    return withPrefix(path, getGlobalPathPrefix());
  }
  
  var NavLinkPropTypes = {
    activeClassName: _propTypes.default.string,
    activeStyle: _propTypes.default.object,
    partiallyActive: _propTypes.default.bool
  }; // Set up IntersectionObserver
  
  var createIntersectionObserver = function createIntersectionObserver(el, cb) {
    var io = new window.IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (el === entry.target) {
          // Check if element is within viewport, remove listener, destroy observer, and run link callback.
          // MSEdge doesn't currently support isIntersecting, so also test for  an intersectionRatio > 0
          cb(entry.isIntersecting || entry.intersectionRatio > 0);
        }
      });
    }); // Add element to the observer
  
    io.observe(el);
    return {
      instance: io,
      el: el
    };
  };
  
  function GatsbyLinkLocationWrapper(props) {
    return /*#__PURE__*/_react.default.createElement(_reachRouter.Location, null, function (_ref2) {
      var location = _ref2.location;
      return /*#__PURE__*/_react.default.createElement(GatsbyLink, (0, _extends2.default)({}, props, {
        _location: location
      }));
    });
  }
  
  var GatsbyLink = /*#__PURE__*/function (_React$Component) {
    (0, _inheritsLoose2.default)(GatsbyLink, _React$Component);
  
    function GatsbyLink(props) {
      var _this;
  
      _this = _React$Component.call(this, props) || this; // Default to no support for IntersectionObserver
  
      _this.defaultGetProps = function (_ref3) {
        var isPartiallyCurrent = _ref3.isPartiallyCurrent,
            isCurrent = _ref3.isCurrent;
  
        if (_this.props.partiallyActive ? isPartiallyCurrent : isCurrent) {
          return {
            className: [_this.props.className, _this.props.activeClassName].filter(Boolean).join(" "),
            style: (0, _extends2.default)({}, _this.props.style, _this.props.activeStyle)
          };
        }
  
        return null;
      };
  
      var IOSupported = false;
  
      if (typeof window !== "undefined" && window.IntersectionObserver) {
        IOSupported = true;
      }
  
      _this.state = {
        IOSupported: IOSupported
      };
      _this.abortPrefetch = null;
      _this.handleRef = _this.handleRef.bind((0, _assertThisInitialized2.default)(_this));
      return _this;
    }
  
    var _proto = GatsbyLink.prototype;
  
    _proto._prefetch = function _prefetch() {
      var currentPath = window.location.pathname + window.location.search; // reach router should have the correct state
  
      if (this.props._location && this.props._location.pathname) {
        currentPath = this.props._location.pathname + this.props._location.search;
      }
  
      var rewrittenPath = (0, _rewriteLinkPath.rewriteLinkPath)(this.props.to, currentPath);
      var parsed = (0, _parsePath.parsePath)(rewrittenPath);
      var newPathName = parsed.pathname + parsed.search; // Prefetch is used to speed up next navigations. When you use it on the current navigation,
      // there could be a race-condition where Chrome uses the stale data instead of waiting for the network to complete
  
      if (currentPath !== newPathName) {
        return ___loader.enqueue(newPathName);
      }
  
      return undefined;
    };
  
    _proto.componentWillUnmount = function componentWillUnmount() {
      if (!this.io) {
        return;
      }
  
      var _this$io = this.io,
          instance = _this$io.instance,
          el = _this$io.el;
  
      if (this.abortPrefetch) {
        this.abortPrefetch.abort();
      }
  
      instance.unobserve(el);
      instance.disconnect();
    };
  
    _proto.handleRef = function handleRef(ref) {
      var _this2 = this;
  
      if (this.props.innerRef && Object.prototype.hasOwnProperty.call(this.props.innerRef, "current")) {
        this.props.innerRef.current = ref;
      } else if (this.props.innerRef) {
        this.props.innerRef(ref);
      }
  
      if (this.state.IOSupported && ref) {
        // If IO supported and element reference found, setup Observer functionality
        this.io = createIntersectionObserver(ref, function (inViewPort) {
          if (inViewPort) {
            _this2.abortPrefetch = _this2._prefetch();
          } else {
            if (_this2.abortPrefetch) {
              _this2.abortPrefetch.abort();
            }
          }
        });
      }
    };
  
    _proto.render = function render() {
      var _this3 = this;
  
      var _this$props = this.props,
          to = _this$props.to,
          _this$props$getProps = _this$props.getProps,
          getProps = _this$props$getProps === void 0 ? this.defaultGetProps : _this$props$getProps,
          _onClick = _this$props.onClick,
          _onMouseEnter = _this$props.onMouseEnter,
          $activeClassName = _this$props.activeClassName,
          $activeStyle = _this$props.activeStyle,
          $innerRef = _this$props.innerRef,
          partiallyActive = _this$props.partiallyActive,
          state = _this$props.state,
          replace = _this$props.replace,
          _location = _this$props._location,
          rest = (0, _objectWithoutPropertiesLoose2.default)(_this$props, _excluded);
  
      if (false) {}
  
      var prefixedTo = (0, _rewriteLinkPath.rewriteLinkPath)(to, _location.pathname);
  
      if (!(0, _isLocalLink.isLocalLink)(prefixedTo)) {
        return /*#__PURE__*/_react.default.createElement("a", (0, _extends2.default)({
          href: prefixedTo
        }, rest));
      }
  
      return /*#__PURE__*/_react.default.createElement(_reachRouter.Link, (0, _extends2.default)({
        to: prefixedTo,
        state: state,
        getProps: getProps,
        innerRef: this.handleRef,
        onMouseEnter: function onMouseEnter(e) {
          if (_onMouseEnter) {
            _onMouseEnter(e);
          }
  
          var parsed = (0, _parsePath.parsePath)(prefixedTo);
  
          ___loader.hovering(parsed.pathname + parsed.search);
        },
        onClick: function onClick(e) {
          if (_onClick) {
            _onClick(e);
          }
  
          if (e.button === 0 && // ignore right clicks
          !_this3.props.target && // let browser handle "target=_blank"
          !e.defaultPrevented && // onClick prevented default
          !e.metaKey && // ignore clicks with modifier keys...
          !e.altKey && !e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            var shouldReplace = replace;
  
            var isCurrent = encodeURI(prefixedTo) === _location.pathname;
  
            if (typeof replace !== "boolean" && isCurrent) {
              shouldReplace = true;
            } // Make sure the necessary scripts and data are
            // loaded before continuing.
  
  
            window.___navigate(prefixedTo, {
              state: state,
              replace: shouldReplace
            });
          }
  
          return true;
        }
      }, rest));
    };
  
    return GatsbyLink;
  }(_react.default.Component);
  
  GatsbyLink.propTypes = (0, _extends2.default)({}, NavLinkPropTypes, {
    onClick: _propTypes.default.func,
    to: _propTypes.default.string.isRequired,
    replace: _propTypes.default.bool,
    state: _propTypes.default.object
  });
  
  var _default = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
    return /*#__PURE__*/_react.default.createElement(GatsbyLinkLocationWrapper, (0, _extends2.default)({
      innerRef: ref
    }, props));
  });
  
  exports["default"] = _default;
  
  var navigate = function navigate(to, options) {
    window.___navigate((0, _rewriteLinkPath.rewriteLinkPath)(to, window.location.pathname), options);
  };
  
  exports.navigate = navigate;
  
  /***/ }),
  
  /***/ 4587:
  /***/ ((__unused_webpack_module, exports) => {
  
  "use strict";
  
  
  exports.__esModule = true;
  exports.isLocalLink = void 0;
  // Copied from https://github.com/sindresorhus/is-absolute-url/blob/3ab19cc2e599a03ea691bcb8a4c09fa3ebb5da4f/index.js
  var ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;
  
  var isAbsolute = function isAbsolute(path) {
    return ABSOLUTE_URL_REGEX.test(path);
  };
  
  var isLocalLink = function isLocalLink(path) {
    if (typeof path !== "string") {
      return undefined; // TODO(v5): Re-Add TypeError
      // throw new TypeError(`Expected a \`string\`, got \`${typeof path}\``)
    }
  
    return !isAbsolute(path);
  };
  
  exports.isLocalLink = isLocalLink;
  
  /***/ }),
  
  /***/ 1752:
  /***/ ((__unused_webpack_module, exports) => {
  
  "use strict";
  
  
  exports.__esModule = true;
  exports.parsePath = parsePath;
  
  function parsePath(path) {
    var pathname = path || "/";
    var search = "";
    var hash = "";
    var hashIndex = pathname.indexOf("#");
  
    if (hashIndex !== -1) {
      hash = pathname.slice(hashIndex);
      pathname = pathname.slice(0, hashIndex);
    }
  
    var searchIndex = pathname.indexOf("?");
  
    if (searchIndex !== -1) {
      search = pathname.slice(searchIndex);
      pathname = pathname.slice(0, searchIndex);
    }
  
    return {
      pathname: pathname,
      search: search === "?" ? "" : search,
      hash: hash === "#" ? "" : hash
    };
  }
  
  /***/ }),
  
  /***/ 349:
  /***/ ((__unused_webpack_module, exports, __webpack_require__) => {
  
  "use strict";
  
  
  exports.__esModule = true;
  exports.rewriteLinkPath = void 0;
  
  var _utils = __webpack_require__(1122);
  
  var _applyTrailingSlashOption = __webpack_require__(4506);
  
  var _parsePath2 = __webpack_require__(1752);
  
  var _isLocalLink = __webpack_require__(4587);
  
  var _ = __webpack_require__(8037);
  
  // Specific import to treeshake Node.js stuff
  var isAbsolutePath = function isAbsolutePath(path) {
    return path === null || path === void 0 ? void 0 : path.startsWith("/");
  };
  
  var getGlobalTrailingSlash = function getGlobalTrailingSlash() {
    return  true ? "legacy" : 0;
  };
  
  function absolutify(path, current) {
    // If it's already absolute, return as-is
    if (isAbsolutePath(path)) {
      return path;
    }
  
    return (0, _utils.resolve)(path, current);
  }
  
  var rewriteLinkPath = function rewriteLinkPath(path, relativeTo) {
    if (typeof path === "number") {
      return path;
    }
  
    if (!(0, _isLocalLink.isLocalLink)(path)) {
      return path;
    }
  
    var _parsePath = (0, _parsePath2.parsePath)(path),
        pathname = _parsePath.pathname,
        search = _parsePath.search,
        hash = _parsePath.hash;
  
    var option = getGlobalTrailingSlash();
    var adjustedPath = path;
  
    if (option === "always" || option === "never") {
      var output = (0, _applyTrailingSlashOption.applyTrailingSlashOption)(pathname, option);
      adjustedPath = "" + output + search + hash;
    }
  
    return isAbsolutePath(adjustedPath) ? (0, _.withPrefix)(adjustedPath) : absolutify(adjustedPath, relativeTo);
  };
  
  exports.rewriteLinkPath = rewriteLinkPath;
  
  /***/ }),
  
  /***/ 4506:
  /***/ ((__unused_webpack_module, exports) => {
  
  "use strict";
  
  
  exports.__esModule = true;
  exports.applyTrailingSlashOption = void 0;
  
  // TODO(v5): Remove legacy setting and default to "always"
  var applyTrailingSlashOption = function applyTrailingSlashOption(input, option) {
    if (option === void 0) {
      option = "legacy";
    }
  
    var hasHtmlSuffix = input.endsWith(".html");
    if (input === "/") return input;
  
    if (hasHtmlSuffix) {
      option = "never";
    }
  
    if (option === "always") {
      return input.endsWith("/") ? input : input + "/";
    }
  
    if (option === "never") {
      return input.endsWith("/") ? input.slice(0, -1) : input;
    }
  
    return input;
  };
  
  exports.applyTrailingSlashOption = applyTrailingSlashOption;
  
  /***/ }),
  
  /***/ 9679:
  /***/ ((__unused_webpack_module, exports, __webpack_require__) => {
  
  "use strict";
  var __webpack_unused_export__;
  
  
  __webpack_unused_export__ = true;
  exports.p2 = __webpack_unused_export__ = void 0;
  
  var _scrollHandler = __webpack_require__(1432);
  
  __webpack_unused_export__ = _scrollHandler.ScrollHandler;
  
  var _useScrollRestoration = __webpack_require__(4855);
  
  exports.p2 = _useScrollRestoration.useScrollRestoration;
  
  /***/ }),
  
  /***/ 1432:
  /***/ ((__unused_webpack_module, exports, __webpack_require__) => {
  
  "use strict";
  
  
  var _interopRequireDefault = __webpack_require__(5318);
  
  exports.__esModule = true;
  exports.ScrollHandler = exports.ScrollContext = void 0;
  
  var _assertThisInitialized2 = _interopRequireDefault(__webpack_require__(1506));
  
  var _inheritsLoose2 = _interopRequireDefault(__webpack_require__(5354));
  
  var React = _interopRequireWildcard(__webpack_require__(7294));
  
  var _propTypes = _interopRequireDefault(__webpack_require__(5697));
  
  var _sessionStorage = __webpack_require__(1142);
  
  function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
  
  function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
  
  var ScrollContext = /*#__PURE__*/React.createContext(new _sessionStorage.SessionStorage());
  exports.ScrollContext = ScrollContext;
  ScrollContext.displayName = "GatsbyScrollContext";
  
  var ScrollHandler = /*#__PURE__*/function (_React$Component) {
    (0, _inheritsLoose2.default)(ScrollHandler, _React$Component);
  
    function ScrollHandler() {
      var _this;
  
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
  
      _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;
      _this._stateStorage = new _sessionStorage.SessionStorage();
      _this._isTicking = false;
      _this._latestKnownScrollY = 0;
  
      _this.scrollListener = function () {
        _this._latestKnownScrollY = window.scrollY;
  
        if (!_this._isTicking) {
          _this._isTicking = true;
          requestAnimationFrame(_this._saveScroll.bind((0, _assertThisInitialized2.default)(_this)));
        }
      };
  
      _this.windowScroll = function (position, prevProps) {
        if (_this.shouldUpdateScroll(prevProps, _this.props)) {
          window.scrollTo(0, position);
        }
      };
  
      _this.scrollToHash = function (hash, prevProps) {
        var node = document.getElementById(hash.substring(1));
  
        if (node && _this.shouldUpdateScroll(prevProps, _this.props)) {
          node.scrollIntoView();
        }
      };
  
      _this.shouldUpdateScroll = function (prevRouterProps, routerProps) {
        var shouldUpdateScroll = _this.props.shouldUpdateScroll;
  
        if (!shouldUpdateScroll) {
          return true;
        } // Hack to allow accessing this._stateStorage.
  
  
        return shouldUpdateScroll.call((0, _assertThisInitialized2.default)(_this), prevRouterProps, routerProps);
      };
  
      return _this;
    }
  
    var _proto = ScrollHandler.prototype;
  
    _proto._saveScroll = function _saveScroll() {
      var key = this.props.location.key || null;
  
      if (key) {
        this._stateStorage.save(this.props.location, key, this._latestKnownScrollY);
      }
  
      this._isTicking = false;
    };
  
    _proto.componentDidMount = function componentDidMount() {
      window.addEventListener("scroll", this.scrollListener);
      var scrollPosition;
      var _this$props$location = this.props.location,
          key = _this$props$location.key,
          hash = _this$props$location.hash;
  
      if (key) {
        scrollPosition = this._stateStorage.read(this.props.location, key);
      }
  
      if (scrollPosition) {
        this.windowScroll(scrollPosition, undefined);
      } else if (hash) {
        this.scrollToHash(decodeURI(hash), undefined);
      }
    };
  
    _proto.componentWillUnmount = function componentWillUnmount() {
      window.removeEventListener("scroll", this.scrollListener);
    };
  
    _proto.componentDidUpdate = function componentDidUpdate(prevProps) {
      var _this$props$location2 = this.props.location,
          hash = _this$props$location2.hash,
          key = _this$props$location2.key;
      var scrollPosition;
  
      if (key) {
        scrollPosition = this._stateStorage.read(this.props.location, key);
      }
      /**  There are two pieces of state: the browser url and
       * history state which keeps track of scroll position
       * Native behaviour prescribes that we ought to restore scroll position
       * when a user navigates back in their browser (this is the `POP` action)
       * Currently, reach router has a bug that prevents this at https://github.com/reach/router/issues/228
       * So we _always_ stick to the url as a source of truth — if the url
       * contains a hash, we scroll to it
       */
  
  
      if (hash) {
        this.scrollToHash(decodeURI(hash), prevProps);
      } else {
        this.windowScroll(scrollPosition, prevProps);
      }
    };
  
    _proto.render = function render() {
      return /*#__PURE__*/React.createElement(ScrollContext.Provider, {
        value: this._stateStorage
      }, this.props.children);
    };
  
    return ScrollHandler;
  }(React.Component);
  
  exports.ScrollHandler = ScrollHandler;
  ScrollHandler.propTypes = {
    shouldUpdateScroll: _propTypes.default.func,
    children: _propTypes.default.element.isRequired,
    location: _propTypes.default.object.isRequired
  };
  
  /***/ }),
  
  /***/ 1142:
  /***/ ((__unused_webpack_module, exports) => {
  
  "use strict";
  
  
  exports.__esModule = true;
  exports.SessionStorage = void 0;
  var STATE_KEY_PREFIX = "@@scroll|";
  var GATSBY_ROUTER_SCROLL_STATE = "___GATSBY_REACT_ROUTER_SCROLL";
  
  var SessionStorage = /*#__PURE__*/function () {
    function SessionStorage() {}
  
    var _proto = SessionStorage.prototype;
  
    _proto.read = function read(location, key) {
      var stateKey = this.getStateKey(location, key);
  
      try {
        var value = window.sessionStorage.getItem(stateKey);
        return value ? JSON.parse(value) : 0;
      } catch (e) {
        if (false) {}
  
        if (window && window[GATSBY_ROUTER_SCROLL_STATE] && window[GATSBY_ROUTER_SCROLL_STATE][stateKey]) {
          return window[GATSBY_ROUTER_SCROLL_STATE][stateKey];
        }
  
        return 0;
      }
    };
  
    _proto.save = function save(location, key, value) {
      var stateKey = this.getStateKey(location, key);
      var storedValue = JSON.stringify(value);
  
      try {
        window.sessionStorage.setItem(stateKey, storedValue);
      } catch (e) {
        if (window && window[GATSBY_ROUTER_SCROLL_STATE]) {
          window[GATSBY_ROUTER_SCROLL_STATE][stateKey] = JSON.parse(storedValue);
        } else {
          window[GATSBY_ROUTER_SCROLL_STATE] = {};
          window[GATSBY_ROUTER_SCROLL_STATE][stateKey] = JSON.parse(storedValue);
        }
  
        if (false) {}
      }
    };
  
    _proto.getStateKey = function getStateKey(location, key) {
      var stateKeyBase = "" + STATE_KEY_PREFIX + location.pathname;
      return key === null || typeof key === "undefined" ? stateKeyBase : stateKeyBase + "|" + key;
    };
  
    return SessionStorage;
  }();
  
  exports.SessionStorage = SessionStorage;
  
  /***/ }),
  
  /***/ 4855:
  /***/ ((__unused_webpack_module, exports, __webpack_require__) => {
  
  "use strict";
  
  
  exports.__esModule = true;
  exports.useScrollRestoration = useScrollRestoration;
  
  var _scrollHandler = __webpack_require__(1432);
  
  var _react = __webpack_require__(7294);
  
  var _reachRouter = __webpack_require__(3631);
  
  function useScrollRestoration(identifier) {
    var location = (0, _reachRouter.useLocation)();
    var state = (0, _react.useContext)(_scrollHandler.ScrollContext);
    var ref = (0, _react.useRef)(null);
    (0, _react.useLayoutEffect)(function () {
      if (ref.current) {
        var position = state.read(location, identifier);
        ref.current.scrollTo(0, position || 0);
      }
    }, [location.key]);
    return {
      ref: ref,
      onScroll: function onScroll() {
        if (ref.current) {
          state.save(location, identifier, ref.current.scrollTop);
        }
      }
    };
  }
  
  /***/ }),
  
  /***/ 4852:
  /***/ ((module) => {
  
  "use strict";
  
  
  module.exports = Object.assign;
  //# sourceMappingURL=object-assign.js.map
  
  /***/ }),
  
  /***/ 5418:
  /***/ ((__unused_webpack_module, exports, __webpack_require__) => {
  
  exports.components={"component---src-pages-404-js":()=>__webpack_require__.e(/* import() | component---src-pages-404-js */ 883).then(__webpack_require__.bind(__webpack_require__, 429)),"component---src-pages-index-js":()=>__webpack_require__.e(/* import() | component---src-pages-index-js */ 678).then(__webpack_require__.bind(__webpack_require__, 6558)),"component---src-pages-sort-slug-js":()=>__webpack_require__.e(/* import() | component---src-pages-sort-slug-js */ 579).then(__webpack_require__.bind(__webpack_require__, 3725)),"component---src-pages-sort-title-js":()=>__webpack_require__.e(/* import() | component---src-pages-sort-title-js */ 675).then(__webpack_require__.bind(__webpack_require__, 7202)),"component---src-pages-ssr-js":()=>__webpack_require__.e(/* import() | component---src-pages-ssr-js */ 479).then(__webpack_require__.bind(__webpack_require__, 7720)),"component---src-pages-using-typescript-tsx":()=>__webpack_require__.e(/* import() | component---src-pages-using-typescript-tsx */ 970).then(__webpack_require__.bind(__webpack_require__, 5074)),"component---src-templates-blog-post-js":()=>__webpack_require__.e(/* import() | component---src-templates-blog-post-js */ 989).then(__webpack_require__.bind(__webpack_require__, 4982)),"component---src-templates-dsg-js":()=>__webpack_require__.e(/* import() | component---src-templates-dsg-js */ 448).then(__webpack_require__.bind(__webpack_require__, 9809))};
  
  /***/ }),
  
  /***/ 4067:
  /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
  
  "use strict";
  __webpack_require__.r(__webpack_exports__);
  /* harmony export */ __webpack_require__.d(__webpack_exports__, {
  /* harmony export */   "apiRunner": () => (/* binding */ apiRunner),
  /* harmony export */   "apiRunnerAsync": () => (/* binding */ apiRunnerAsync)
  /* harmony export */ });
  var plugins=[{name:'gatsby-plugin-image',plugin:__webpack_require__(2588),options:{"plugins":[]}},{name:'gatsby-plugin-feed',plugin:__webpack_require__(6155),options:{"plugins":[],"query":"\n          {\n            site {\n              siteMetadata {\n                title\n                description\n                siteUrl\n                site_url: siteUrl\n              }\n            }\n          }\n        ","feeds":[{"query":"\n              {\n                allMarkdownRemark(\n                  sort: { order: DESC, fields: [frontmatter___date] },\n                ) {\n                  nodes {\n                    excerpt\n                    html\n                    fields {\n                      slug\n                    }\n                    frontmatter {\n                      title\n                      date\n                    }\n                  }\n                }\n              }\n            ","output":"/rss.xml","title":"Gatsby Starter Blog RSS Feed"}]}},{name:'gatsby-plugin-manifest',plugin:__webpack_require__(5822),options:{"plugins":[],"name":"Gatsby Starter Blog","short_name":"GatsbyJS","start_url":"/","background_color":"#ffffff","display":"minimal-ui","icon":"src/images/gatsby-icon.png","legacy":true,"theme_color_in_head":true,"cache_busting_mode":"query","crossOrigin":"anonymous","include_favicon":true,"cacheDigest":"4a9773549091c227cd2eb82ccd9c5e3a"}},{name:'gatsby-plugin-react-helmet',plugin:__webpack_require__(1674),options:{"plugins":[]}}];/* global plugins */ // During bootstrap, we write requires at top of this file which looks like:
  // var plugins = [
  //   {
  //     plugin: require("/path/to/plugin1/gatsby-ssr.js"),
  //     options: { ... },
  //   },
  //   {
  //     plugin: require("/path/to/plugin2/gatsby-ssr.js"),
  //     options: { ... },
  //   },
  // ]
  const apis=__webpack_require__(421);function augmentErrorWithPlugin(plugin,err){if(plugin.name!==`default-site-plugin`){// default-site-plugin is user code and will print proper stack trace,
  // so no point in annotating error message pointing out which plugin is root of the problem
  err.message+=` (from plugin: ${plugin.name})`;}throw err;}function apiRunner(api,args,defaultReturn,argTransform){if(!apis[api]){console.log(`This API doesn't exist`,api);}const results=[];plugins.forEach(plugin=>{const apiFn=plugin.plugin[api];if(!apiFn){return;}try{const result=apiFn(args,plugin.options);if(result&&argTransform){args=argTransform({args,result});}// This if case keeps behaviour as before, we should allow undefined here as the api is defined
  // TODO V4
  if(typeof result!==`undefined`){results.push(result);}}catch(e){augmentErrorWithPlugin(plugin,e);}});return results.length?results:[defaultReturn];}async function apiRunnerAsync(api,args,defaultReturn,argTransform){if(!apis[api]){console.log(`This API doesn't exist`,api);}const results=[];for(const plugin of plugins){const apiFn=plugin.plugin[api];if(!apiFn){continue;}try{const result=await apiFn(args,plugin.options);if(result&&argTransform){args=argTransform({args,result});}// This if case keeps behaviour as before, we should allow undefined here as the api is defined
  // TODO V4
  if(typeof result!==`undefined`){results.push(result);}}catch(e){augmentErrorWithPlugin(plugin,e);}}return results.length?results:[defaultReturn];}
  
  /***/ }),
  
  /***/ 421:
  /***/ ((__unused_webpack_module, exports) => {
  
  /**
   * Object containing options defined in `gatsby-config.js`
   * @typedef {object} pluginOptions
   */ /**
   * Replace the default server renderer. This is useful for integration with
   * Redux, css-in-js libraries, etc. that need custom setups for server
   * rendering.
   * @param {object} $0
   * @param {string} $0.pathname The pathname of the page currently being rendered.
   * @param {ReactNode} $0.bodyComponent The React element to be rendered as the page body
   * @param {function} $0.replaceBodyHTMLString Call this with the HTML string
   * you render. **WARNING** if multiple plugins implement this API it's the
   * last plugin that "wins". TODO implement an automated warning against this.
   * @param {function} $0.setHeadComponents Takes an array of components as its
   * first argument which are added to the `headComponents` array which is passed
   * to the `html.js` component.
   * @param {function} $0.setHtmlAttributes Takes an object of props which will
   * spread into the `<html>` component.
   * @param {function} $0.setBodyAttributes Takes an object of props which will
   * spread into the `<body>` component.
   * @param {function} $0.setPreBodyComponents Takes an array of components as its
   * first argument which are added to the `preBodyComponents` array which is passed
   * to the `html.js` component.
   * @param {function} $0.setPostBodyComponents Takes an array of components as its
   * first argument which are added to the `postBodyComponents` array which is passed
   * to the `html.js` component.
   * @param {function} $0.setBodyProps Takes an object of data which
   * is merged with other body props and passed to `html.js` as `bodyProps`.
   * @param {pluginOptions} pluginOptions
   * @returns {void | Promise<void>}
   * @example
   * // From gatsby-plugin-glamor
   * const { renderToString } = require("react-dom/server")
   * const inline = require("glamor-inline")
   *
   * exports.replaceRenderer = ({ bodyComponent, replaceBodyHTMLString }) => {
   *   const bodyHTML = renderToString(bodyComponent)
   *   const inlinedHTML = inline(bodyHTML)
   *
   *   replaceBodyHTMLString(inlinedHTML)
   * }
   */exports.replaceRenderer=true;/**
   * Called after every page Gatsby server renders while building HTML so you can
   * set head and body components to be rendered in your `html.js`.
   *
   * Gatsby does a two-pass render for HTML. It loops through your pages first
   * rendering only the body and then takes the result body HTML string and
   * passes it as the `body` prop to your `html.js` to complete the render.
   *
   * It's often handy to be able to send custom components to your `html.js`.
   * For example, it's a very common pattern for React.js libraries that
   * support server rendering to pull out data generated during the render to
   * add to your HTML.
   *
   * Using this API over [`replaceRenderer`](#replaceRenderer) is preferable as
   * multiple plugins can implement this API where only one plugin can take
   * over server rendering. However, if your plugin requires taking over server
   * rendering then that's the one to
   * use
   * @param {object} $0
   * @param {string} $0.pathname The pathname of the page currently being rendered.
   * @param {function} $0.setHeadComponents Takes an array of components as its
   * first argument which are added to the `headComponents` array which is passed
   * to the `html.js` component.
   * @param {function} $0.setHtmlAttributes Takes an object of props which will
   * spread into the `<html>` component.
   * @param {function} $0.setBodyAttributes Takes an object of props which will
   * spread into the `<body>` component.
   * @param {function} $0.setPreBodyComponents Takes an array of components as its
   * first argument which are added to the `preBodyComponents` array which is passed
   * to the `html.js` component.
   * @param {function} $0.setPostBodyComponents Takes an array of components as its
   * first argument which are added to the `postBodyComponents` array which is passed
   * to the `html.js` component.
   * @param {function} $0.setBodyProps Takes an object of data which
   * is merged with other body props and passed to `html.js` as `bodyProps`.
   * @param {pluginOptions} pluginOptions
   * @example
   * // Import React so that you can use JSX in HeadComponents
   * const React = require("react")
   *
   * const HtmlAttributes = {
   *   lang: "en"
   * }
   *
   * const HeadComponents = [
   *   <script key="my-script" src="https://gatsby.dev/my-script" />
   * ]
   *
   * const BodyAttributes = {
   *   "data-theme": "dark"
   * }
   *
   * exports.onRenderBody = ({
   *   setHeadComponents,
   *   setHtmlAttributes,
   *   setBodyAttributes
   * }, pluginOptions) => {
   *   setHtmlAttributes(HtmlAttributes)
   *   setHeadComponents(HeadComponents)
   *   setBodyAttributes(BodyAttributes)
   * }
   */exports.onRenderBody=true;/**
   * Called after every page Gatsby server renders while building HTML so you can
   * replace head components to be rendered in your `html.js`. This is useful if
   * you need to reorder scripts or styles added by other plugins.
   * @param {object} $0
   * @param {string} $0.pathname The pathname of the page currently being rendered.
   * @param {Array<ReactNode>} $0.getHeadComponents Returns the current `headComponents` array.
   * @param {function} $0.replaceHeadComponents Takes an array of components as its
   * first argument which replace the `headComponents` array which is passed
   * to the `html.js` component. **WARNING** if multiple plugins implement this
   * API it's the last plugin that "wins".
   * @param {Array<ReactNode>} $0.getPreBodyComponents Returns the current `preBodyComponents` array.
   *  @param {function} $0.replacePreBodyComponents Takes an array of components as its
   * first argument which replace the `preBodyComponents` array which is passed
   * to the `html.js` component. **WARNING** if multiple plugins implement this
   * API it's the last plugin that "wins".
   * @param {Array<ReactNode>} $0.getPostBodyComponents Returns the current `postBodyComponents` array.
   *  @param {function} $0.replacePostBodyComponents Takes an array of components as its
   * first argument which replace the `postBodyComponents` array which is passed
   * to the `html.js` component. **WARNING** if multiple plugins implement this
   * API it's the last plugin that "wins".
   * @param {pluginOptions} pluginOptions
   * @example
   * // Move Typography.js styles to the top of the head section so they're loaded first.
   * exports.onPreRenderHTML = ({ getHeadComponents, replaceHeadComponents }) => {
   *   const headComponents = getHeadComponents()
   *   headComponents.sort((x, y) => {
   *     if (x.key === 'TypographyStyle') {
   *       return -1
   *     } else if (y.key === 'TypographyStyle') {
   *       return 1
   *     }
   *     return 0
   *   })
   *   replaceHeadComponents(headComponents)
   * }
   */exports.onPreRenderHTML=true;/**
   * Allow a plugin to wrap the page element.
   *
   * This is useful for setting wrapper components around pages that won't get
   * unmounted on page changes. For setting Provider components, use [wrapRootElement](#wrapRootElement).
   *
   * _Note:_
   * There is an equivalent hook in Gatsby's [Browser API](/docs/browser-apis/#wrapPageElement).
   * It is recommended to use both APIs together.
   * For example usage, check out [Using i18n](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-i18n).
   * @param {object} $0
   * @param {ReactNode} $0.element The "Page" React Element built by Gatsby.
   * @param {object} $0.props Props object used by page.
   * @param {pluginOptions} pluginOptions
   * @returns {ReactNode} Wrapped element
   * @example
   * const React = require("react")
   * const Layout = require("./src/components/layout").default
   *
   * exports.wrapPageElement = ({ element, props }) => {
   *   // props provide same data to Layout as Page element will get
   *   // including location, data, etc - you don't need to pass it
   *   return <Layout {...props}>{element}</Layout>
   * }
   */exports.wrapPageElement=true;/**
   * Allow a plugin to wrap the root element.
   *
   * This is useful to set up any Provider components that will wrap your application.
   * For setting persistent UI elements around pages use [wrapPageElement](#wrapPageElement).
   *
   * _Note:_
   * There is an equivalent hook in Gatsby's [Browser API](/docs/browser-apis/#wrapRootElement).
   * It is recommended to use both APIs together.
   * For example usage, check out [Using redux](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-redux).
   * @param {object} $0
   * @param {string} $0.pathname The pathname of the page currently being rendered.
   * @param {ReactNode} $0.element The "Root" React Element built by Gatsby.
   * @param {pluginOptions} pluginOptions
   * @returns {ReactNode} Wrapped element
   * @example
   * const React = require("react")
   * const { Provider } = require("react-redux")
   *
   * const createStore = require("./src/state/createStore")
   * const store = createStore()
   *
   * exports.wrapRootElement = ({ element }) => {
   *   return (
   *     <Provider store={store}>
   *       {element}
   *     </Provider>
   *   )
   * }
   */exports.wrapRootElement=true;
  
  /***/ }),
  
  /***/ 9079:
  /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
  
  "use strict";
  __webpack_require__.r(__webpack_exports__);
  /* harmony export */ __webpack_require__.d(__webpack_exports__, {
  /* harmony export */   "default": () => (/* binding */ HTML)
  /* harmony export */ });
  /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7294);
  /* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5697);
  /* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_1__);
  function HTML(props){return/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("html",props.htmlAttributes,/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("head",null,/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("meta",{charSet:"utf-8"}),/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("meta",{httpEquiv:"x-ua-compatible",content:"ie=edge"}),/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("meta",{name:"viewport",content:"width=device-width, initial-scale=1, shrink-to-fit=no"}),props.headComponents),/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("body",props.bodyAttributes,props.preBodyComponents,/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("div",{key:`body`,id:"___gatsby",dangerouslySetInnerHTML:{__html:props.body}}),props.postBodyComponents));}HTML.propTypes={htmlAttributes:(prop_types__WEBPACK_IMPORTED_MODULE_1___default().object),headComponents:(prop_types__WEBPACK_IMPORTED_MODULE_1___default().array),bodyAttributes:(prop_types__WEBPACK_IMPORTED_MODULE_1___default().object),preBodyComponents:(prop_types__WEBPACK_IMPORTED_MODULE_1___default().array),body:(prop_types__WEBPACK_IMPORTED_MODULE_1___default().string),postBodyComponents:(prop_types__WEBPACK_IMPORTED_MODULE_1___default().array)};
  
  /***/ }),
  
  /***/ 9755:
  /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
  
  "use strict";
  // ESM COMPAT FLAG
  __webpack_require__.r(__webpack_exports__);
  
  // EXPORTS
  __webpack_require__.d(__webpack_exports__, {
    "cleanPath": () => (/* binding */ cleanPath),
    "findMatchPath": () => (/* binding */ findMatchPath),
    "findPath": () => (/* binding */ findPath),
    "grabMatchParams": () => (/* binding */ grabMatchParams),
    "setMatchPaths": () => (/* binding */ setMatchPaths)
  });
  
  // EXTERNAL MODULE: ./node_modules/@gatsbyjs/reach-router/lib/utils.js
  var utils = __webpack_require__(1122);
  ;// CONCATENATED MODULE: ./.cache/strip-prefix.js
  /**
   * Remove a prefix from a string. Return the input string if the given prefix
   * isn't found.
   */function stripPrefix(str,prefix=``){if(!prefix){return str;}if(str===prefix){return`/`;}if(str.startsWith(`${prefix}/`)){return str.slice(prefix.length);}return str;}
  ;// CONCATENATED MODULE: ./.cache/normalize-page-path.js
  /* harmony default export */ const normalize_page_path = (pathAndSearch=>{if(pathAndSearch===undefined){return pathAndSearch;}let[path,search=``]=pathAndSearch.split(`?`);if(search){search=`?`+search;}if(path===`/`){return`/`+search;}if(path.charAt(path.length-1)===`/`){return path.slice(0,-1)+search;}return path+search;});
  ;// CONCATENATED MODULE: ./.cache/redirects.json
  const redirects_namespaceObject = [];
  ;// CONCATENATED MODULE: ./.cache/redirect-utils.js
  // Convert to a map for faster lookup in maybeRedirect()
  const redirectMap=new Map();const redirectIgnoreCaseMap=new Map();redirects_namespaceObject.forEach(redirect=>{if(redirect.ignoreCase){redirectIgnoreCaseMap.set(redirect.fromPath,redirect);}else{redirectMap.set(redirect.fromPath,redirect);}});function maybeGetBrowserRedirect(pathname){let redirect=redirectMap.get(pathname);if(!redirect){redirect=redirectIgnoreCaseMap.get(pathname.toLowerCase());}return redirect;}
  ;// CONCATENATED MODULE: ./.cache/find-path.js
  const pathCache=new Map();let matchPaths=[];const trimPathname=rawPathname=>{let newRawPathname=rawPathname;const queryIndex=rawPathname.indexOf(`?`);if(queryIndex!==-1){const[path,qs]=rawPathname.split(`?`);newRawPathname=`${path}?${encodeURIComponent(qs)}`;}const pathname=decodeURIComponent(newRawPathname);// Remove the pathPrefix from the pathname.
  const trimmedPathname=stripPrefix(pathname,decodeURIComponent(""))// Remove any hashfragment
  .split(`#`)[0];return trimmedPathname;};function absolutify(path){// If it's already absolute, return as-is
  if(path.startsWith(`/`)||path.startsWith(`https://`)||path.startsWith(`http://`)){return path;}// Calculate path relative to current location, adding a trailing slash to
  // match behavior of @reach/router
  return new URL(path,window.location.href+(window.location.href.endsWith(`/`)?``:`/`)).pathname;}/**
   * Set list of matchPaths
   *
   * @param {Array<{path: string, matchPath: string}>} value collection of matchPaths
   */const setMatchPaths=value=>{matchPaths=value;};/**
   * Return a matchpath url
   * if `match-paths.json` contains `{ "/foo*": "/page1", ...}`, then
   * `/foo?bar=far` => `/page1`
   *
   * @param {string} rawPathname A raw pathname
   * @return {string|null}
   */const findMatchPath=rawPathname=>{const trimmedPathname=cleanPath(rawPathname);const pickPaths=matchPaths.map(({path,matchPath})=>{return{path:matchPath,originalPath:path};});const path=(0,utils.pick)(pickPaths,trimmedPathname);if(path){return normalize_page_path(path.route.originalPath);}return null;};/**
   * Return a matchpath params from reach/router rules
   * if `match-paths.json` contains `{ ":bar/*foo" }`, and the path is /baz/zaz/zoo
   * then it returns
   *  { bar: baz, foo: zaz/zoo }
   *
   * @param {string} rawPathname A raw pathname
   * @return {object}
   */const grabMatchParams=rawPathname=>{const trimmedPathname=cleanPath(rawPathname);const pickPaths=matchPaths.map(({path,matchPath})=>{return{path:matchPath,originalPath:path};});const path=(0,utils.pick)(pickPaths,trimmedPathname);if(path){return path.params;}return{};};// Given a raw URL path, returns the cleaned version of it (trim off
  // `#` and query params), or if it matches an entry in
  // `match-paths.json`, its matched path is returned
  //
  // E.g. `/foo?bar=far` => `/foo`
  //
  // Or if `match-paths.json` contains `{ "/foo*": "/page1", ...}`, then
  // `/foo?bar=far` => `/page1`
  const findPath=rawPathname=>{const trimmedPathname=trimPathname(absolutify(rawPathname));if(pathCache.has(trimmedPathname)){return pathCache.get(trimmedPathname);}const redirect=maybeGetBrowserRedirect(rawPathname);if(redirect){return findPath(redirect.toPath);}let foundPath=findMatchPath(trimmedPathname);if(!foundPath){foundPath=cleanPath(rawPathname);}pathCache.set(trimmedPathname,foundPath);return foundPath;};/**
   * Clean a url and converts /index.html => /
   * E.g. `/foo?bar=far` => `/foo`
   *
   * @param {string} rawPathname A raw pathname
   * @return {string}
   */const cleanPath=rawPathname=>{const trimmedPathname=trimPathname(absolutify(rawPathname));let foundPath=trimmedPathname;if(foundPath===`/index.html`){foundPath=`/`;}foundPath=normalize_page_path(foundPath);return foundPath;};
  
  /***/ }),
  
  /***/ 7533:
  /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
  
  "use strict";
  // ESM COMPAT FLAG
  __webpack_require__.r(__webpack_exports__);
  
  // EXPORTS
  __webpack_require__.d(__webpack_exports__, {
    "Link": () => (/* reexport */ gatsby_link["default"]),
    "PageRenderer": () => (/* reexport */ (public_page_renderer_default())),
    "StaticQuery": () => (/* binding */ StaticQuery),
    "StaticQueryContext": () => (/* binding */ StaticQueryContext),
    "graphql": () => (/* binding */ graphql),
    "navigate": () => (/* reexport */ gatsby_link.navigate),
    "parsePath": () => (/* reexport */ gatsby_link.parsePath),
    "prefetchPathname": () => (/* binding */ prefetchPathname),
    "useScrollRestoration": () => (/* reexport */ gatsby_react_router_scroll/* useScrollRestoration */.p2),
    "useStaticQuery": () => (/* binding */ useStaticQuery),
    "withAssetPrefix": () => (/* reexport */ gatsby_link.withAssetPrefix),
    "withPrefix": () => (/* reexport */ gatsby_link.withPrefix)
  });
  
  // EXTERNAL MODULE: ./node_modules/react/index.js
  var react = __webpack_require__(7294);
  // EXTERNAL MODULE: ./node_modules/prop-types/index.js
  var prop_types = __webpack_require__(5697);
  var prop_types_default = /*#__PURE__*/__webpack_require__.n(prop_types);
  // EXTERNAL MODULE: ./node_modules/gatsby-link/index.js
  var gatsby_link = __webpack_require__(8037);
  // EXTERNAL MODULE: ./node_modules/gatsby-react-router-scroll/index.js
  var gatsby_react_router_scroll = __webpack_require__(9679);
  // EXTERNAL MODULE: ./.cache/public-page-renderer.js
  var public_page_renderer = __webpack_require__(2743);
  var public_page_renderer_default = /*#__PURE__*/__webpack_require__.n(public_page_renderer);
  ;// CONCATENATED MODULE: ./.cache/prefetch.js
  const support=function(feature){if(typeof document===`undefined`){return false;}const fakeLink=document.createElement(`link`);try{if(fakeLink.relList&&typeof fakeLink.relList.supports===`function`){return fakeLink.relList.supports(feature);}}catch(err){return false;}return false;};const linkPrefetchStrategy=function(url,options){return new Promise((resolve,reject)=>{if(typeof document===`undefined`){reject();return;}const link=document.createElement(`link`);link.setAttribute(`rel`,`prefetch`);link.setAttribute(`href`,url);Object.keys(options).forEach(key=>{link.setAttribute(key,options[key]);});link.onload=resolve;link.onerror=reject;const parentElement=document.getElementsByTagName(`head`)[0]||document.getElementsByName(`script`)[0].parentNode;parentElement.appendChild(link);});};const xhrPrefetchStrategy=function(url){return new Promise((resolve,reject)=>{const req=new XMLHttpRequest();req.open(`GET`,url,true);req.onload=()=>{if(req.status===200){resolve();}else{reject();}};req.send(null);});};const supportedPrefetchStrategy=support(`prefetch`)?linkPrefetchStrategy:xhrPrefetchStrategy;const preFetched={};const prefetch=function(url,options){return new Promise(resolve=>{if(preFetched[url]){resolve();return;}supportedPrefetchStrategy(url,options).then(()=>{resolve();preFetched[url]=true;}).catch(()=>{});// 404s are logged to the console anyway
  });};/* harmony default export */ const _cache_prefetch = ((/* unused pure expression or super */ null && (prefetch)));
  ;// CONCATENATED MODULE: ./node_modules/mitt/dist/mitt.es.js
  //      
  // An event handler can take an optional event argument
  // and should not return a value
                                            
                                                                 
  
  // An array of all currently registered event handlers for a type
                                              
                                                              
  // A map of event types and their corresponding event handlers.
                          
                                   
                                     
    
  
  /** Mitt: Tiny (~200b) functional event emitter / pubsub.
   *  @name mitt
   *  @returns {Mitt}
   */
  function mitt(all                 ) {
    all = all || Object.create(null);
  
    return {
      /**
       * Register an event handler for the given type.
       *
       * @param  {String} type	Type of event to listen for, or `"*"` for all events
       * @param  {Function} handler Function to call in response to given event
       * @memberOf mitt
       */
      on: function on(type        , handler              ) {
        (all[type] || (all[type] = [])).push(handler);
      },
  
      /**
       * Remove an event handler for the given type.
       *
       * @param  {String} type	Type of event to unregister `handler` from, or `"*"`
       * @param  {Function} handler Handler function to remove
       * @memberOf mitt
       */
      off: function off(type        , handler              ) {
        if (all[type]) {
          all[type].splice(all[type].indexOf(handler) >>> 0, 1);
        }
      },
  
      /**
       * Invoke all handlers for the given type.
       * If present, `"*"` handlers are invoked after type-matched handlers.
       *
       * @param {String} type  The event type to invoke
       * @param {Any} [evt]  Any value (object is recommended and powerful), passed to each handler
       * @memberOf mitt
       */
      emit: function emit(type        , evt     ) {
        (all[type] || []).slice().map(function (handler) { handler(evt); });
        (all['*'] || []).slice().map(function (handler) { handler(type, evt); });
      }
    };
  }
  
  /* harmony default export */ const mitt_es = (mitt);
  //# sourceMappingURL=mitt.es.js.map
  
  ;// CONCATENATED MODULE: ./.cache/emitter.js
  const emitter_emitter=mitt_es();/* harmony default export */ const _cache_emitter = ((/* unused pure expression or super */ null && (emitter_emitter)));
  // EXTERNAL MODULE: ./.cache/find-path.js + 4 modules
  var find_path = __webpack_require__(9755);
  ;// CONCATENATED MODULE: ./.cache/loader.js
  /**
   * Available resource loading statuses
   */const PageResourceStatus={/**
     * At least one of critical resources failed to load
     */Error:`error`,/**
     * Resources loaded successfully
     */Success:`success`};const preferDefault=m=>m&&m.default||m;const stripSurroundingSlashes=s=>{s=s[0]===`/`?s.slice(1):s;s=s.endsWith(`/`)?s.slice(0,-1):s;return s;};const createPageDataUrl=rawPath=>{const[path,maybeSearch]=rawPath.split(`?`);const fixedPath=path===`/`?`index`:stripSurroundingSlashes(path);return`${""}/page-data/${fixedPath}/page-data.json${maybeSearch?`?${maybeSearch}`:``}`;};function doFetch(url,method=`GET`){return new Promise(resolve=>{const req=new XMLHttpRequest();req.open(method,url,true);req.onreadystatechange=()=>{if(req.readyState==4){resolve(req);}};req.send(null);});}const doesConnectionSupportPrefetch=()=>{if(`connection`in navigator&&typeof navigator.connection!==`undefined`){if((navigator.connection.effectiveType||``).includes(`2g`)){return false;}if(navigator.connection.saveData){return false;}}return true;};// Regex that matches common search crawlers
  const BOT_REGEX=/bot|crawler|spider|crawling/i;const toPageResources=(pageData,component=null)=>{const page={componentChunkName:pageData.componentChunkName,path:pageData.path,webpackCompilationHash:pageData.webpackCompilationHash,matchPath:pageData.matchPath,staticQueryHashes:pageData.staticQueryHashes,getServerDataError:pageData.getServerDataError};return{component,json:pageData.result,page};};class BaseLoader{constructor(loadComponent,matchPaths){this.inFlightNetworkRequests=new Map();// Map of pagePath -> Page. Where Page is an object with: {
  //   status: PageResourceStatus.Success || PageResourceStatus.Error,
  //   payload: PageResources, // undefined if PageResourceStatus.Error
  // }
  // PageResources is {
  //   component,
  //   json: pageData.result,
  //   page: {
  //     componentChunkName,
  //     path,
  //     webpackCompilationHash,
  //     staticQueryHashes
  //   },
  //   staticQueryResults
  // }
  this.pageDb=new Map();this.inFlightDb=new Map();this.staticQueryDb={};this.pageDataDb=new Map();this.isPrefetchQueueRunning=false;this.prefetchQueued=[];this.prefetchTriggered=new Set();this.prefetchCompleted=new Set();this.loadComponent=loadComponent;setMatchPaths(matchPaths);}memoizedGet(url){let inFlightPromise=this.inFlightNetworkRequests.get(url);if(!inFlightPromise){inFlightPromise=doFetch(url,`GET`);this.inFlightNetworkRequests.set(url,inFlightPromise);}// Prefer duplication with then + catch over .finally to prevent problems in ie11 + firefox
  return inFlightPromise.then(response=>{this.inFlightNetworkRequests.delete(url);return response;}).catch(err=>{this.inFlightNetworkRequests.delete(url);throw err;});}setApiRunner(apiRunner){this.apiRunner=apiRunner;this.prefetchDisabled=apiRunner(`disableCorePrefetching`).some(a=>a);}fetchPageDataJson(loadObj){const{pagePath,retries=0}=loadObj;const url=createPageDataUrl(pagePath);return this.memoizedGet(url).then(req=>{const{status,responseText}=req;// Handle 200
  if(status===200){try{const jsonPayload=JSON.parse(responseText);if(jsonPayload.path===undefined){throw new Error(`not a valid pageData response`);}const maybeSearch=pagePath.split(`?`)[1];if(maybeSearch&&!jsonPayload.path.includes(maybeSearch)){jsonPayload.path+=`?${maybeSearch}`;}return Object.assign(loadObj,{status:PageResourceStatus.Success,payload:jsonPayload});}catch(err){// continue regardless of error
  }}// Handle 404
  if(status===404||status===200){// If the request was for a 404/500 page and it doesn't exist, we're done
  if(pagePath===`/404.html`||pagePath===`/500.html`){return Object.assign(loadObj,{status:PageResourceStatus.Error});}// Need some code here to cache the 404 request. In case
  // multiple loadPageDataJsons result in 404s
  return this.fetchPageDataJson(Object.assign(loadObj,{pagePath:`/404.html`,notFound:true}));}// handle 500 response (Unrecoverable)
  if(status===500){return this.fetchPageDataJson(Object.assign(loadObj,{pagePath:`/500.html`,internalServerError:true}));}// Handle everything else, including status === 0, and 503s. Should retry
  if(retries<3){return this.fetchPageDataJson(Object.assign(loadObj,{retries:retries+1}));}// Retried 3 times already, result is an error.
  return Object.assign(loadObj,{status:PageResourceStatus.Error});});}loadPageDataJson(rawPath){const pagePath=findPath(rawPath);if(this.pageDataDb.has(pagePath)){const pageData=this.pageDataDb.get(pagePath);if(true){return Promise.resolve(pageData);}}return this.fetchPageDataJson({pagePath}).then(pageData=>{this.pageDataDb.set(pagePath,pageData);return pageData;});}findMatchPath(rawPath){return findMatchPath(rawPath);}// TODO check all uses of this and whether they use undefined for page resources not exist
  loadPage(rawPath){const pagePath=findPath(rawPath);if(this.pageDb.has(pagePath)){const page=this.pageDb.get(pagePath);if(true){if(page.error){return{error:page.error,status:page.status};}return Promise.resolve(page.payload);}}if(this.inFlightDb.has(pagePath)){return this.inFlightDb.get(pagePath);}const inFlightPromise=Promise.all([this.loadAppData(),this.loadPageDataJson(pagePath)]).then(allData=>{const result=allData[1];if(result.status===PageResourceStatus.Error){return{status:PageResourceStatus.Error};}let pageData=result.payload;const{componentChunkName,staticQueryHashes=[]}=pageData;const finalResult={};const componentChunkPromise=this.loadComponent(componentChunkName).then(component=>{finalResult.createdAt=new Date();let pageResources;if(!component||component instanceof Error){finalResult.status=PageResourceStatus.Error;finalResult.error=component;}else{finalResult.status=PageResourceStatus.Success;if(result.notFound===true){finalResult.notFound=true;}pageData=Object.assign(pageData,{webpackCompilationHash:allData[0]?allData[0].webpackCompilationHash:``});pageResources=toPageResources(pageData,component);}// undefined if final result is an error
  return pageResources;});const staticQueryBatchPromise=Promise.all(staticQueryHashes.map(staticQueryHash=>{// Check for cache in case this static query result has already been loaded
  if(this.staticQueryDb[staticQueryHash]){const jsonPayload=this.staticQueryDb[staticQueryHash];return{staticQueryHash,jsonPayload};}return this.memoizedGet(`${""}/page-data/sq/d/${staticQueryHash}.json`).then(req=>{const jsonPayload=JSON.parse(req.responseText);return{staticQueryHash,jsonPayload};}).catch(()=>{throw new Error(`We couldn't load "${""}/page-data/sq/d/${staticQueryHash}.json"`);});})).then(staticQueryResults=>{const staticQueryResultsMap={};staticQueryResults.forEach(({staticQueryHash,jsonPayload})=>{staticQueryResultsMap[staticQueryHash]=jsonPayload;this.staticQueryDb[staticQueryHash]=jsonPayload;});return staticQueryResultsMap;});return Promise.all([componentChunkPromise,staticQueryBatchPromise]).then(([pageResources,staticQueryResults])=>{let payload;if(pageResources){payload={...pageResources,staticQueryResults};finalResult.payload=payload;emitter.emit(`onPostLoadPageResources`,{page:payload,pageResources:payload});}this.pageDb.set(pagePath,finalResult);if(finalResult.error){return{error:finalResult.error,status:finalResult.status};}return payload;})// when static-query fail to load we throw a better error
  .catch(err=>{return{error:err,status:PageResourceStatus.Error};});});inFlightPromise.then(()=>{this.inFlightDb.delete(pagePath);}).catch(error=>{this.inFlightDb.delete(pagePath);throw error;});this.inFlightDb.set(pagePath,inFlightPromise);return inFlightPromise;}// returns undefined if the page does not exists in cache
  loadPageSync(rawPath,options={}){const pagePath=findPath(rawPath);if(this.pageDb.has(pagePath)){const pageData=this.pageDb.get(pagePath);if(pageData.payload){return pageData.payload;}if(options!==null&&options!==void 0&&options.withErrorDetails){return{error:pageData.error,status:pageData.status};}}return undefined;}shouldPrefetch(pagePath){// Skip prefetching if we know user is on slow or constrained connection
  if(!doesConnectionSupportPrefetch()){return false;}// Don't prefetch if this is a crawler bot
  if(navigator.userAgent&&BOT_REGEX.test(navigator.userAgent)){return false;}// Check if the page exists.
  if(this.pageDb.has(pagePath)){return false;}return true;}prefetch(pagePath){if(!this.shouldPrefetch(pagePath)){return{then:resolve=>resolve(false),abort:()=>{}};}if(this.prefetchTriggered.has(pagePath)){return{then:resolve=>resolve(true),abort:()=>{}};}const defer={resolve:null,reject:null,promise:null};defer.promise=new Promise((resolve,reject)=>{defer.resolve=resolve;defer.reject=reject;});this.prefetchQueued.push([pagePath,defer]);const abortC=new AbortController();abortC.signal.addEventListener(`abort`,()=>{const index=this.prefetchQueued.findIndex(([p])=>p===pagePath);// remove from the queue
  if(index!==-1){this.prefetchQueued.splice(index,1);}});if(!this.isPrefetchQueueRunning){this.isPrefetchQueueRunning=true;setTimeout(()=>{this._processNextPrefetchBatch();},3000);}return{then:(resolve,reject)=>defer.promise.then(resolve,reject),abort:abortC.abort.bind(abortC)};}_processNextPrefetchBatch(){const idleCallback=window.requestIdleCallback||(cb=>setTimeout(cb,0));idleCallback(()=>{const toPrefetch=this.prefetchQueued.splice(0,4);const prefetches=Promise.all(toPrefetch.map(([pagePath,dPromise])=>{// Tell plugins with custom prefetching logic that they should start
  // prefetching this path.
  if(!this.prefetchTriggered.has(pagePath)){this.apiRunner(`onPrefetchPathname`,{pathname:pagePath});this.prefetchTriggered.add(pagePath);}// If a plugin has disabled core prefetching, stop now.
  if(this.prefetchDisabled){return dPromise.resolve(false);}return this.doPrefetch(findPath(pagePath)).then(()=>{if(!this.prefetchCompleted.has(pagePath)){this.apiRunner(`onPostPrefetchPathname`,{pathname:pagePath});this.prefetchCompleted.add(pagePath);}dPromise.resolve(true);});}));if(this.prefetchQueued.length){prefetches.then(()=>{setTimeout(()=>{this._processNextPrefetchBatch();},3000);});}else{this.isPrefetchQueueRunning=false;}});}doPrefetch(pagePath){const pageDataUrl=createPageDataUrl(pagePath);return prefetchHelper(pageDataUrl,{crossOrigin:`anonymous`,as:`fetch`}).then(()=>// This was just prefetched, so will return a response from
  // the cache instead of making another request to the server
  this.loadPageDataJson(pagePath));}hovering(rawPath){this.loadPage(rawPath);}getResourceURLsForPathname(rawPath){const pagePath=findPath(rawPath);const page=this.pageDataDb.get(pagePath);if(page){const pageResources=toPageResources(page.payload);return[...createComponentUrls(pageResources.page.componentChunkName),createPageDataUrl(pagePath)];}else{return null;}}isPageNotFound(rawPath){const pagePath=findPath(rawPath);const page=this.pageDb.get(pagePath);return!page||page.notFound;}loadAppData(retries=0){return this.memoizedGet(`${""}/page-data/app-data.json`).then(req=>{const{status,responseText}=req;let appData;if(status!==200&&retries<3){// Retry 3 times incase of non-200 responses
  return this.loadAppData(retries+1);}// Handle 200
  if(status===200){try{const jsonPayload=JSON.parse(responseText);if(jsonPayload.webpackCompilationHash===undefined){throw new Error(`not a valid app-data response`);}appData=jsonPayload;}catch(err){// continue regardless of error
  }}return appData;});}}const createComponentUrls=componentChunkName=>(window.___chunkMapping[componentChunkName]||[]).map(chunk=>""+chunk);class ProdLoader extends (/* unused pure expression or super */ null && (BaseLoader)){constructor(asyncRequires,matchPaths,pageData){const loadComponent=chunkName=>{if(!asyncRequires.components[chunkName]){throw new Error(`We couldn't find the correct component chunk with the name ${chunkName}`);}return asyncRequires.components[chunkName]().then(preferDefault)// loader will handle the case when component is error
  .catch(err=>err);};super(loadComponent,matchPaths);if(pageData){this.pageDataDb.set(findPath(pageData.path),{pagePath:pageData.path,payload:pageData,status:`success`});}}doPrefetch(pagePath){return super.doPrefetch(pagePath).then(result=>{if(result.status!==PageResourceStatus.Success){return Promise.resolve();}const pageData=result.payload;const chunkName=pageData.componentChunkName;const componentUrls=createComponentUrls(chunkName);return Promise.all(componentUrls.map(prefetchHelper)).then(()=>pageData);});}loadPageDataJson(rawPath){return super.loadPageDataJson(rawPath).then(data=>{if(data.notFound){// check if html file exist using HEAD request:
  // if it does we should navigate to it instead of showing 404
  return doFetch(rawPath,`HEAD`).then(req=>{if(req.status===200){// page (.html file) actually exist (or we asked for 404 )
  // returning page resources status as errored to trigger
  // regular browser navigation to given page
  return{status:PageResourceStatus.Error};}// if HEAD request wasn't 200, return notFound result
  // and show 404 page
  return data;});}return data;});}}let instance;const setLoader=_loader=>{instance=_loader;};const publicLoader={enqueue:rawPath=>instance.prefetch(rawPath),// Real methods
  getResourceURLsForPathname:rawPath=>instance.getResourceURLsForPathname(rawPath),loadPage:rawPath=>instance.loadPage(rawPath),// TODO add deprecation to v4 so people use withErrorDetails and then we can remove in v5 and change default behaviour
  loadPageSync:(rawPath,options={})=>instance.loadPageSync(rawPath,options),prefetch:rawPath=>instance.prefetch(rawPath),isPageNotFound:rawPath=>instance.isPageNotFound(rawPath),hovering:rawPath=>instance.hovering(rawPath),loadAppData:()=>instance.loadAppData()};/* harmony default export */ const loader = (publicLoader);function getStaticQueryResults(){if(instance){return instance.staticQueryDb;}else{return{};}}
  ;// CONCATENATED MODULE: ./.cache/gatsby-browser-entry.js
  const prefetchPathname=loader.enqueue;const StaticQueryContext=/*#__PURE__*/react.createContext({});function StaticQueryDataRenderer({staticQueryData,data,query,render}){const finalData=data?data.data:staticQueryData[query]&&staticQueryData[query].data;return/*#__PURE__*/react.createElement(react.Fragment,null,finalData&&render(finalData),!finalData&&/*#__PURE__*/react.createElement("div",null,"Loading (StaticQuery)"));}const StaticQuery=props=>{const{data,query,render,children}=props;return/*#__PURE__*/react.createElement(StaticQueryContext.Consumer,null,staticQueryData=>/*#__PURE__*/react.createElement(StaticQueryDataRenderer,{data:data,query:query,render:render||children,staticQueryData:staticQueryData}));};const useStaticQuery=query=>{var _context$query;if(typeof react.useContext!==`function`&&"production"===`development`){}const context=react.useContext(StaticQueryContext);// query is a stringified number like `3303882` when wrapped with graphql, If a user forgets
  // to wrap the query in a grqphql, then casting it to a Number results in `NaN` allowing us to
  // catch the misuse of the API and give proper direction
  if(isNaN(Number(query))){throw new Error(`useStaticQuery was called with a string but expects to be called using \`graphql\`. Try this:
  
  import { useStaticQuery, graphql } from 'gatsby';
  
  useStaticQuery(graphql\`${query}\`);
  `);}if((_context$query=context[query])!==null&&_context$query!==void 0&&_context$query.data){return context[query].data;}else{throw new Error(`The result of this StaticQuery could not be fetched.\n\n`+`This is likely a bug in Gatsby and if refreshing the page does not fix it, `+`please open an issue in https://github.com/gatsbyjs/gatsby/issues`);}};StaticQuery.propTypes={data:(prop_types_default()).object,query:(prop_types_default()).string.isRequired,render:(prop_types_default()).func,children:(prop_types_default()).func};function graphql(){throw new Error(`It appears like Gatsby is misconfigured. Gatsby related \`graphql\` calls `+`are supposed to only be evaluated at compile time, and then compiled away. `+`Unfortunately, something went wrong and the query was left in the compiled code.\n\n`+`Unless your site has a complex or custom babel/Gatsby configuration this is likely a bug in Gatsby.`);}
  
  /***/ }),
  
  /***/ 2743:
  /***/ ((module) => {
  
  const preferDefault=m=>m&&m.default||m;if(false){}else if(false){}else{module.exports=()=>null;}
  
  /***/ }),
  
  /***/ 9712:
  /***/ ((__unused_webpack_module, exports) => {
  
  exports.O=Component=>Component;
  
  /***/ }),
  
  /***/ 236:
  /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
  
  "use strict";
  __webpack_require__.r(__webpack_exports__);
  /* harmony export */ __webpack_require__.d(__webpack_exports__, {
  /* harmony export */   "RouteAnnouncerProps": () => (/* binding */ RouteAnnouncerProps)
  /* harmony export */ });
  // This is extracted to separate module because it's shared
  // between browser and SSR code
  const RouteAnnouncerProps={id:`gatsby-announcer`,style:{position:`absolute`,top:0,width:1,height:1,padding:0,overflow:`hidden`,clip:`rect(0, 0, 0, 0)`,whiteSpace:`nowrap`,border:0},"aria-live":`assertive`,"aria-atomic":`true`};
  
  /***/ }),
  
  /***/ 1034:
  /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
  
  "use strict";
  __webpack_require__.r(__webpack_exports__);
  /* harmony export */ __webpack_require__.d(__webpack_exports__, {
  /* harmony export */   "WritableAsPromise": () => (/* binding */ WritableAsPromise)
  /* harmony export */ });
  /* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2781);
  /* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_0__);
  class WritableAsPromise extends stream__WEBPACK_IMPORTED_MODULE_0__.Writable{constructor(){super();this._output=``;this._deferred={promise:null,resolve:null,reject:null};this._deferred.promise=new Promise((resolve,reject)=>{this._deferred.resolve=resolve;this._deferred.reject=reject;});}_write(chunk,enc,cb){this._output+=chunk.toString();cb();}end(){this._deferred.resolve(this._output);this.destroy();}// disguise us as a promise
  then(resolve,reject){return this._deferred.promise.then(resolve,reject);}}
  
  /***/ }),
  
  /***/ 6155:
  /***/ ((__unused_webpack_module, exports, __webpack_require__) => {
  
  "use strict";
  var _interopRequireDefault=__webpack_require__(5318);var _extends2=_interopRequireDefault(__webpack_require__(7154));var _react=_interopRequireDefault(__webpack_require__(7294));var _gatsby=__webpack_require__(7533);var _internals=__webpack_require__(8524);// TODO: remove for v3
  var withPrefix=_gatsby.withAssetPrefix||_gatsby.withPrefix;exports.onRenderBody=function(_ref,pluginOptions){var setHeadComponents=_ref.setHeadComponents,pathname=_ref.pathname;var _defaultOptions$plugi=(0,_extends2.default)({},_internals.defaultOptions,pluginOptions),feeds=_defaultOptions$plugi.feeds;var links=feeds.filter(function(_ref2){var match=_ref2.match;if(typeof match==="string")return new RegExp(match).exec(pathname);return true;}).map(function(_ref3,i){var output=_ref3.output,title=_ref3.title,link=_ref3.link;var href=link||withPrefix(output.replace(/^\/?/,"/"));return/*#__PURE__*/_react.default.createElement("link",{key:"gatsby-plugin-feed-"+i,rel:"alternate",type:"application/rss+xml",title:title,href:href});});setHeadComponents(links);};
  
  /***/ }),
  
  /***/ 8524:
  /***/ ((__unused_webpack_module, exports, __webpack_require__) => {
  
  "use strict";
  var _interopRequireDefault=__webpack_require__(5318);exports.__esModule=true;exports.defaultOptions=exports.runQuery=void 0;var _extends2=_interopRequireDefault(__webpack_require__(7154));var _objectWithoutPropertiesLoose2=_interopRequireDefault(__webpack_require__(7316));var _excluded=["query"];var runQuery=function runQuery(handler,query){return handler(query).then(function(r){if(r.errors){throw new Error(r.errors.join(", "));}return r.data;});};exports.runQuery=runQuery;var defaultOptions={// Override if you want to manually specify the RSS "generator" tag.
  generator:"GatsbyJS",// Run a default query to gather some information about the site.
  query:"\n    {\n      site {\n        siteMetadata {\n          title\n          description\n          siteUrl\n          site_url: siteUrl\n        }\n      }\n    }\n  ",// Setup an RSS object, merging on various feed-specific options.
  setup:function setup(_ref){var siteMetadata=_ref.query.site.siteMetadata,rest=(0,_objectWithoutPropertiesLoose2.default)(_ref,_excluded);return(0,_extends2.default)({},siteMetadata,rest);},// Create a default RSS feed. Others may be added by using the format below.
  feeds:[{query:"\n      {\n        allMarkdownRemark(\n          limit: 1000,\n          sort: {\n            order: DESC,\n            fields: [frontmatter___date]\n          }\n        ) {\n          edges {\n            node {\n              frontmatter {\n                title\n                date\n              }\n              fields {\n                slug\n              }\n              excerpt\n              html\n            }\n          }\n        }\n      }\n    ",// Where we will save the feed generated by this query.
  output:"rss.xml"}]};exports.defaultOptions=defaultOptions;
  
  /***/ }),
  
  /***/ 2588:
  /***/ ((__unused_webpack_module, exports, __webpack_require__) => {
  
  var React=__webpack_require__(7294);var commonTags=__webpack_require__(5863);function _interopNamespace(e){if(e&&e.__esModule)return e;var n=Object.create(null);if(e){Object.keys(e).forEach(function(k){if(k!=='default'){var d=Object.getOwnPropertyDescriptor(e,k);Object.defineProperty(n,k,d.get?d:{enumerable:true,get:function(){return e[k];}});}});}n["default"]=e;return n;}var React__namespace=/*#__PURE__*/_interopNamespace(React);var generateHtml=function generateHtml(str){return{__html:commonTags.oneLine(str)};};function onRenderBody(_ref){var setHeadComponents=_ref.setHeadComponents;setHeadComponents([React__namespace.createElement("style",{key:"gatsby-image-style",dangerouslySetInnerHTML:generateHtml(".gatsby-image-wrapper{position:relative;overflow:hidden}.gatsby-image-wrapper picture.object-fit-polyfill{position:static!important}.gatsby-image-wrapper img{bottom:0;height:100%;left:0;margin:0;max-width:none;padding:0;position:absolute;right:0;top:0;width:100%;object-fit:cover}.gatsby-image-wrapper [data-main-image]{opacity:0;transform:translateZ(0);transition:opacity .25s linear;will-change:opacity}.gatsby-image-wrapper-constrained{display:inline-block;vertical-align:top}")}),React__namespace.createElement("noscript",{key:"gatsby-image-style-noscript",dangerouslySetInnerHTML:generateHtml("<style>"+".gatsby-image-wrapper noscript [data-main-image]{opacity:1!important}.gatsby-image-wrapper [data-placeholder-image]{opacity:0!important}"+"</style>")}),React__namespace.createElement("script",{key:"gatsby-image-style-script",type:"module",dangerouslySetInnerHTML:generateHtml("const e=\"undefined\"!=typeof HTMLImageElement&&\"loading\"in HTMLImageElement.prototype;e&&document.body.addEventListener(\"load\",(function(e){if(void 0===e.target.dataset.mainImage)return;if(void 0===e.target.dataset.gatsbyImageSsr)return;const t=e.target;let a=null,n=t;for(;null===a&&n;)void 0!==n.parentNode.dataset.gatsbyImageWrapper&&(a=n.parentNode),n=n.parentNode;const o=a.querySelector(\"[data-placeholder-image]\"),r=new Image;r.src=t.currentSrc,r.decode().catch((()=>{})).then((()=>{t.style.opacity=1,o&&(o.style.opacity=0,o.style.transition=\"opacity 500ms linear\")}))}),!0);")})]);}exports.onRenderBody=onRenderBody;
  
  /***/ }),
  
  /***/ 5428:
  /***/ ((__unused_webpack_module, exports, __webpack_require__) => {
  
  "use strict";
  var _interopRequireDefault=__webpack_require__(5318);var _path=_interopRequireDefault(__webpack_require__(1017));exports.favicons=[{src:`favicon-32x32.png`,sizes:`32x32`,type:`image/png`}];// default icons for generating icons
  exports.defaultIcons=[{src:`icons/icon-48x48.png`,sizes:`48x48`,type:`image/png`},{src:`icons/icon-72x72.png`,sizes:`72x72`,type:`image/png`},{src:`icons/icon-96x96.png`,sizes:`96x96`,type:`image/png`},{src:`icons/icon-144x144.png`,sizes:`144x144`,type:`image/png`},{src:`icons/icon-192x192.png`,sizes:`192x192`,type:`image/png`},{src:`icons/icon-256x256.png`,sizes:`256x256`,type:`image/png`},{src:`icons/icon-384x384.png`,sizes:`384x384`,type:`image/png`},{src:`icons/icon-512x512.png`,sizes:`512x512`,type:`image/png`}];/**
   * @param {string} path The generic path to an icon
   * @param {string} digest The digest of the icon provided in the plugin's options.
   */exports.addDigestToPath=function(path,digest,method){if(method===`name`){const parsedPath=_path.default.parse(path);return`${parsedPath.dir}/${parsedPath.name}-${digest}${parsedPath.ext}`;}if(method===`query`){return`${path}?v=${digest}`;}return path;};
  
  /***/ }),
  
  /***/ 5822:
  /***/ ((__unused_webpack_module, exports, __webpack_require__) => {
  
  "use strict";
  var _interopRequireDefault=__webpack_require__(5318);var React=_interopRequireWildcard(__webpack_require__(7294));var _gatsby=__webpack_require__(7533);var _common=__webpack_require__(5428);var _getManifestPathname=_interopRequireDefault(__webpack_require__(292));function _getRequireWildcardCache(nodeInterop){if(typeof WeakMap!=="function")return null;var cacheBabelInterop=new WeakMap();var cacheNodeInterop=new WeakMap();return(_getRequireWildcardCache=function(nodeInterop){return nodeInterop?cacheNodeInterop:cacheBabelInterop;})(nodeInterop);}function _interopRequireWildcard(obj,nodeInterop){if(!nodeInterop&&obj&&obj.__esModule){return obj;}if(obj===null||typeof obj!=="object"&&typeof obj!=="function"){return{default:obj};}var cache=_getRequireWildcardCache(nodeInterop);if(cache&&cache.has(obj)){return cache.get(obj);}var newObj={};var hasPropertyDescriptor=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var key in obj){if(key!=="default"&&Object.prototype.hasOwnProperty.call(obj,key)){var desc=hasPropertyDescriptor?Object.getOwnPropertyDescriptor(obj,key):null;if(desc&&(desc.get||desc.set)){Object.defineProperty(newObj,key,desc);}else{newObj[key]=obj[key];}}}newObj.default=obj;if(cache){cache.set(obj,newObj);}return newObj;}// TODO: remove for v3
  const withPrefix=_gatsby.withAssetPrefix||_gatsby.withPrefix;exports.onRenderBody=({setHeadComponents,pathname=`/`},{localize,legacy,cache_busting_mode:cacheBusting,cacheDigest,icon,icons:pluginIcons,include_favicon:insertFaviconLinkTag,theme_color_in_head:insertMetaTag,theme_color:themeColor,crossOrigin=`anonymous`})=>{// We use this to build a final array to pass as the argument to setHeadComponents at the end of onRenderBody.
  const headComponents=[];const srcIconExists=!!icon;const icons=pluginIcons||_common.defaultIcons;const manifestFileName=(0,_getManifestPathname.default)(pathname,localize);// If icons were generated, also add a favicon link.
  if(srcIconExists){if(insertFaviconLinkTag){_common.favicons.forEach(favicon=>{headComponents.push(/*#__PURE__*/React.createElement("link",{key:`gatsby-plugin-manifest-icon-link-png`,rel:"icon",href:withPrefix((0,_common.addDigestToPath)(favicon.src,cacheDigest,cacheBusting)),type:"image/png"}));});if(icon!==null&&icon!==void 0&&icon.endsWith(`.svg`)){headComponents.push(/*#__PURE__*/React.createElement("link",{key:`gatsby-plugin-manifest-icon-link-svg`,rel:"icon",href:withPrefix((0,_common.addDigestToPath)(`favicon.svg`,cacheDigest,cacheBusting)),type:"image/svg+xml"}));}}}// Add manifest link tag.
  headComponents.push(/*#__PURE__*/React.createElement("link",{key:`gatsby-plugin-manifest-link`,rel:"manifest",href:(0,_gatsby.withPrefix)(`/${manifestFileName}`),crossOrigin:crossOrigin}));// The user has an option to opt out of the theme_color meta tag being inserted into the head.
  if(themeColor&&insertMetaTag){headComponents.push(/*#__PURE__*/React.createElement("meta",{key:`gatsby-plugin-manifest-meta`,name:"theme-color",content:themeColor}));}if(legacy){icons.forEach(icon=>{headComponents.push(/*#__PURE__*/React.createElement("link",{key:`gatsby-plugin-manifest-apple-touch-icon-${icon.sizes}`,rel:"apple-touch-icon",sizes:icon.sizes,href:withPrefix((0,_common.addDigestToPath)(icon.src,cacheDigest,srcIconExists?cacheBusting:`none`))}));});}setHeadComponents(headComponents);return true;};
  
  /***/ }),
  
  /***/ 292:
  /***/ ((__unused_webpack_module, exports, __webpack_require__) => {
  
  "use strict";
  exports.__esModule=true;exports["default"]=void 0;var _gatsby=__webpack_require__(7533);/**
   * Get a manifest filename depending on localized pathname
   *
   * @param {string} pathname
   * @param {Array<{start_url: string, lang: string}>} localizedManifests
   * @param {boolean} shouldPrependPathPrefix
   * @return string
   */var _default=(pathname,localizedManifests,shouldPrependPathPrefix=false)=>{const defaultFilename=`manifest.webmanifest`;if(!Array.isArray(localizedManifests)){return defaultFilename;}const localizedManifest=localizedManifests.find(app=>{let startUrl=app.start_url;if(shouldPrependPathPrefix){startUrl=(0,_gatsby.withPrefix)(startUrl);}return pathname.startsWith(startUrl);});if(!localizedManifest){return defaultFilename;}return`manifest_${localizedManifest.lang}.webmanifest`;};exports["default"]=_default;
  
  /***/ }),
  
  /***/ 1674:
  /***/ ((__unused_webpack_module, exports, __webpack_require__) => {
  
  "use strict";
  exports.__esModule=true;exports.onRenderBody=void 0;var _reactHelmet=__webpack_require__(4593);var onRenderBody=function onRenderBody(_ref){var setHeadComponents=_ref.setHeadComponents,setHtmlAttributes=_ref.setHtmlAttributes,setBodyAttributes=_ref.setBodyAttributes;var helmet=_reactHelmet.Helmet.renderStatic();// These action functions were added partway through the Gatsby 1.x cycle.
  if(setHtmlAttributes){setHtmlAttributes(helmet.htmlAttributes.toComponent());}if(setBodyAttributes){setBodyAttributes(helmet.bodyAttributes.toComponent());}setHeadComponents([helmet.title.toComponent(),helmet.link.toComponent(),helmet.meta.toComponent(),helmet.noscript.toComponent(),helmet.script.toComponent(),helmet.style.toComponent(),helmet.base.toComponent()]);};exports.onRenderBody=onRenderBody;
  
  /***/ }),
  
  /***/ 3631:
  /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
  
  "use strict";
  // ESM COMPAT FLAG
  __webpack_require__.r(__webpack_exports__);
  
  // EXPORTS
  __webpack_require__.d(__webpack_exports__, {
    "BaseContext": () => (/* binding */ BaseContext),
    "Link": () => (/* binding */ Link),
    "Location": () => (/* binding */ Location),
    "LocationProvider": () => (/* binding */ LocationProvider),
    "Match": () => (/* binding */ Match),
    "Redirect": () => (/* binding */ Redirect),
    "Router": () => (/* binding */ Router),
    "ServerLocation": () => (/* binding */ ServerLocation),
    "createHistory": () => (/* reexport */ createHistory),
    "createMemorySource": () => (/* reexport */ createMemorySource),
    "globalHistory": () => (/* reexport */ globalHistory),
    "isRedirect": () => (/* binding */ isRedirect),
    "matchPath": () => (/* reexport */ match),
    "navigate": () => (/* reexport */ history_navigate),
    "redirectTo": () => (/* binding */ redirectTo),
    "useLocation": () => (/* binding */ useLocation),
    "useMatch": () => (/* binding */ useMatch),
    "useNavigate": () => (/* binding */ useNavigate),
    "useParams": () => (/* binding */ useParams)
  });
  
  // EXTERNAL MODULE: ./node_modules/react/index.js
  var react = __webpack_require__(7294);
  // EXTERNAL MODULE: ./node_modules/invariant/invariant.js
  var invariant = __webpack_require__(6128);
  var invariant_default = /*#__PURE__*/__webpack_require__.n(invariant);
  // EXTERNAL MODULE: ./.cache/react-lifecycles-compat.js
  var react_lifecycles_compat = __webpack_require__(9712);
  ;// CONCATENATED MODULE: ./node_modules/@gatsbyjs/reach-router/es/lib/utils.js
  
  
  ////////////////////////////////////////////////////////////////////////////////
  // startsWith(string, search) - Check if `string` starts with `search`
  var startsWith = function startsWith(string, search) {
    return string.substr(0, search.length) === search;
  };
  
  ////////////////////////////////////////////////////////////////////////////////
  // pick(routes, uri)
  //
  // Ranks and picks the best route to match. Each segment gets the highest
  // amount of points, then the type of segment gets an additional amount of
  // points where
  //
  //     static > dynamic > splat > root
  //
  // This way we don't have to worry about the order of our routes, let the
  // computers do it.
  //
  // A route looks like this
  //
  //     { path, default, value }
  //
  // And a returned match looks like:
  //
  //     { route, params, uri }
  //
  // I know, I should use TypeScript not comments for these types.
  var pick = function pick(routes, uri) {
    var match = void 0;
    var default_ = void 0;
  
    var _uri$split = uri.split("?"),
        uriPathname = _uri$split[0];
  
    var uriSegments = segmentize(uriPathname);
    var isRootUri = uriSegments[0] === "";
    var ranked = rankRoutes(routes);
  
    for (var i = 0, l = ranked.length; i < l; i++) {
      var missed = false;
      var route = ranked[i].route;
  
      if (route.default) {
        default_ = {
          route: route,
          params: {},
          uri: uri
        };
        continue;
      }
  
      var routeSegments = segmentize(route.path);
      var params = {};
      var max = Math.max(uriSegments.length, routeSegments.length);
      var index = 0;
  
      for (; index < max; index++) {
        var routeSegment = routeSegments[index];
        var uriSegment = uriSegments[index];
  
        if (isSplat(routeSegment)) {
          // Hit a splat, just grab the rest, and return a match
          // uri:   /files/documents/work
          // route: /files/*
          var param = routeSegment.slice(1) || "*";
          params[param] = uriSegments.slice(index).map(decodeURIComponent).join("/");
          break;
        }
  
        if (uriSegment === undefined) {
          // URI is shorter than the route, no match
          // uri:   /users
          // route: /users/:userId
          missed = true;
          break;
        }
  
        var dynamicMatch = paramRe.exec(routeSegment);
  
        if (dynamicMatch && !isRootUri) {
          var matchIsNotReserved = reservedNames.indexOf(dynamicMatch[1]) === -1;
          !matchIsNotReserved ?  false ? 0 : invariant_default()(false) : void 0;
          var value = decodeURIComponent(uriSegment);
          params[dynamicMatch[1]] = value;
        } else if (routeSegment !== uriSegment) {
          // Current segments don't match, not dynamic, not splat, so no match
          // uri:   /users/123/settings
          // route: /users/:id/profile
          missed = true;
          break;
        }
      }
  
      if (!missed) {
        match = {
          route: route,
          params: params,
          uri: "/" + uriSegments.slice(0, index).join("/")
        };
        break;
      }
    }
  
    return match || default_ || null;
  };
  
  ////////////////////////////////////////////////////////////////////////////////
  // match(path, uri) - Matches just one path to a uri, also lol
  var match = function match(path, uri) {
    return pick([{ path: path }], uri);
  };
  
  ////////////////////////////////////////////////////////////////////////////////
  // resolve(to, basepath)
  //
  // Resolves URIs as though every path is a directory, no files.  Relative URIs
  // in the browser can feel awkward because not only can you be "in a directory"
  // you can be "at a file", too. For example
  //
  //     browserSpecResolve('foo', '/bar/') => /bar/foo
  //     browserSpecResolve('foo', '/bar') => /foo
  //
  // But on the command line of a file system, it's not as complicated, you can't
  // `cd` from a file, only directories.  This way, links have to know less about
  // their current path. To go deeper you can do this:
  //
  //     <Link to="deeper"/>
  //     // instead of
  //     <Link to=`{${props.uri}/deeper}`/>
  //
  // Just like `cd`, if you want to go deeper from the command line, you do this:
  //
  //     cd deeper
  //     # not
  //     cd $(pwd)/deeper
  //
  // By treating every path as a directory, linking to relative paths should
  // require less contextual information and (fingers crossed) be more intuitive.
  var resolve = function resolve(to, base) {
    // /foo/bar, /baz/qux => /foo/bar
    if (startsWith(to, "/")) {
      return to;
    }
  
    var _to$split = to.split("?"),
        toPathname = _to$split[0],
        toQuery = _to$split[1];
  
    var _base$split = base.split("?"),
        basePathname = _base$split[0];
  
    var toSegments = segmentize(toPathname);
    var baseSegments = segmentize(basePathname);
  
    // ?a=b, /users?b=c => /users?a=b
    if (toSegments[0] === "") {
      return addQuery(basePathname, toQuery);
    }
  
    // profile, /users/789 => /users/789/profile
    if (!startsWith(toSegments[0], ".")) {
      var pathname = baseSegments.concat(toSegments).join("/");
      return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
    }
  
    // ./         /users/123  =>  /users/123
    // ../        /users/123  =>  /users
    // ../..      /users/123  =>  /
    // ../../one  /a/b/c/d    =>  /a/b/one
    // .././one   /a/b/c/d    =>  /a/b/c/one
    var allSegments = baseSegments.concat(toSegments);
    var segments = [];
    for (var i = 0, l = allSegments.length; i < l; i++) {
      var segment = allSegments[i];
      if (segment === "..") segments.pop();else if (segment !== ".") segments.push(segment);
    }
  
    return addQuery("/" + segments.join("/"), toQuery);
  };
  
  ////////////////////////////////////////////////////////////////////////////////
  // insertParams(path, params)
  
  var insertParams = function insertParams(path, params) {
    var _path$split = path.split("?"),
        pathBase = _path$split[0],
        _path$split$ = _path$split[1],
        query = _path$split$ === undefined ? "" : _path$split$;
  
    var segments = segmentize(pathBase);
    var constructedPath = "/" + segments.map(function (segment) {
      var match = paramRe.exec(segment);
      return match ? params[match[1]] : segment;
    }).join("/");
    var _params$location = params.location;
    _params$location = _params$location === undefined ? {} : _params$location;
    var _params$location$sear = _params$location.search,
        search = _params$location$sear === undefined ? "" : _params$location$sear;
  
    var searchSplit = search.split("?")[1] || "";
    constructedPath = addQuery(constructedPath, query, searchSplit);
    return constructedPath;
  };
  
  var validateRedirect = function validateRedirect(from, to) {
    var filter = function filter(segment) {
      return isDynamic(segment);
    };
    var fromString = segmentize(from).filter(filter).sort().join("/");
    var toString = segmentize(to).filter(filter).sort().join("/");
    return fromString === toString;
  };
  
  ////////////////////////////////////////////////////////////////////////////////
  // Junk
  var paramRe = /^:(.+)/;
  
  var SEGMENT_POINTS = 4;
  var STATIC_POINTS = 3;
  var DYNAMIC_POINTS = 2;
  var SPLAT_PENALTY = 1;
  var ROOT_POINTS = 1;
  
  var isRootSegment = function isRootSegment(segment) {
    return segment === "";
  };
  var isDynamic = function isDynamic(segment) {
    return paramRe.test(segment);
  };
  var isSplat = function isSplat(segment) {
    return segment && segment[0] === "*";
  };
  
  var rankRoute = function rankRoute(route, index) {
    var score = route.default ? 0 : segmentize(route.path).reduce(function (score, segment) {
      score += SEGMENT_POINTS;
      if (isRootSegment(segment)) score += ROOT_POINTS;else if (isDynamic(segment)) score += DYNAMIC_POINTS;else if (isSplat(segment)) score -= SEGMENT_POINTS + SPLAT_PENALTY;else score += STATIC_POINTS;
      return score;
    }, 0);
    return { route: route, score: score, index: index };
  };
  
  var rankRoutes = function rankRoutes(routes) {
    return routes.map(rankRoute).sort(function (a, b) {
      return a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index;
    });
  };
  
  var segmentize = function segmentize(uri) {
    return uri
    // strip starting/ending slashes
    .replace(/(^\/+|\/+$)/g, "").split("/");
  };
  
  var addQuery = function addQuery(pathname) {
    for (var _len = arguments.length, query = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      query[_key - 1] = arguments[_key];
    }
  
    query = query.filter(function (q) {
      return q && q.length > 0;
    });
    return pathname + (query && query.length > 0 ? "?" + query.join("&") : "");
  };
  
  var reservedNames = ["uri", "path"];
  
  /**
   * Shallow compares two objects.
   * @param {Object} obj1 The first object to compare.
   * @param {Object} obj2 The second object to compare.
   */
  var shallowCompare = function shallowCompare(obj1, obj2) {
    var obj1Keys = Object.keys(obj1);
    return obj1Keys.length === Object.keys(obj2).length && obj1Keys.every(function (key) {
      return obj2.hasOwnProperty(key) && obj1[key] === obj2[key];
    });
  };
  
  ////////////////////////////////////////////////////////////////////////////////
  
  ;// CONCATENATED MODULE: ./node_modules/@gatsbyjs/reach-router/es/lib/history.js
  var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
  
  var getLocation = function getLocation(source) {
    var _source$location = source.location,
        search = _source$location.search,
        hash = _source$location.hash,
        href = _source$location.href,
        origin = _source$location.origin,
        protocol = _source$location.protocol,
        host = _source$location.host,
        hostname = _source$location.hostname,
        port = _source$location.port;
    var pathname = source.location.pathname;
  
  
    if (!pathname && href && canUseDOM) {
      var url = new URL(href);
      pathname = url.pathname;
    }
  
    return {
      pathname: encodeURI(decodeURI(pathname)),
      search: search,
      hash: hash,
      href: href,
      origin: origin,
      protocol: protocol,
      host: host,
      hostname: hostname,
      port: port,
      state: source.history.state,
      key: source.history.state && source.history.state.key || "initial"
    };
  };
  
  var createHistory = function createHistory(source, options) {
    var listeners = [];
    var location = getLocation(source);
    var transitioning = false;
    var resolveTransition = function resolveTransition() {};
  
    return {
      get location() {
        return location;
      },
  
      get transitioning() {
        return transitioning;
      },
  
      _onTransitionComplete: function _onTransitionComplete() {
        transitioning = false;
        resolveTransition();
      },
      listen: function listen(listener) {
        listeners.push(listener);
  
        var popstateListener = function popstateListener() {
          location = getLocation(source);
          listener({ location: location, action: "POP" });
        };
  
        source.addEventListener("popstate", popstateListener);
  
        return function () {
          source.removeEventListener("popstate", popstateListener);
          listeners = listeners.filter(function (fn) {
            return fn !== listener;
          });
        };
      },
      navigate: function navigate(to) {
        var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
            state = _ref.state,
            _ref$replace = _ref.replace,
            replace = _ref$replace === undefined ? false : _ref$replace;
  
        if (typeof to === "number") {
          source.history.go(to);
        } else {
          state = _extends({}, state, { key: Date.now() + "" });
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (transitioning || replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }
        }
  
        location = getLocation(source);
        transitioning = true;
        var transition = new Promise(function (res) {
          return resolveTransition = res;
        });
        listeners.forEach(function (listener) {
          return listener({ location: location, action: "PUSH" });
        });
        return transition;
      }
    };
  };
  
  ////////////////////////////////////////////////////////////////////////////////
  // Stores history entries in memory for testing or other platforms like Native
  var createMemorySource = function createMemorySource() {
    var initialPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "/";
  
    var searchIndex = initialPath.indexOf("?");
    var initialLocation = {
      pathname: searchIndex > -1 ? initialPath.substr(0, searchIndex) : initialPath,
      search: searchIndex > -1 ? initialPath.substr(searchIndex) : ""
    };
    var index = 0;
    var stack = [initialLocation];
    var states = [null];
  
    return {
      get location() {
        return stack[index];
      },
      addEventListener: function addEventListener(name, fn) {},
      removeEventListener: function removeEventListener(name, fn) {},
  
      history: {
        get entries() {
          return stack;
        },
        get index() {
          return index;
        },
        get state() {
          return states[index];
        },
        pushState: function pushState(state, _, uri) {
          var _uri$split = uri.split("?"),
              pathname = _uri$split[0],
              _uri$split$ = _uri$split[1],
              search = _uri$split$ === undefined ? "" : _uri$split$;
  
          index++;
          stack.push({ pathname: pathname, search: search.length ? "?" + search : search });
          states.push(state);
        },
        replaceState: function replaceState(state, _, uri) {
          var _uri$split2 = uri.split("?"),
              pathname = _uri$split2[0],
              _uri$split2$ = _uri$split2[1],
              search = _uri$split2$ === undefined ? "" : _uri$split2$;
  
          stack[index] = { pathname: pathname, search: search };
          states[index] = state;
        },
        go: function go(to) {
          var newIndex = index + to;
  
          if (newIndex < 0 || newIndex > states.length - 1) {
            return;
          }
  
          index = newIndex;
        }
      }
    };
  };
  
  ////////////////////////////////////////////////////////////////////////////////
  // global history - uses window.history as the source if available, otherwise a
  // memory history
  var canUseDOM = !!(typeof window !== "undefined" && window.document && window.document.createElement);
  var getSource = function getSource() {
    return canUseDOM ? window : createMemorySource();
  };
  
  var globalHistory = createHistory(getSource());
  var history_navigate = globalHistory.navigate;
  
  ////////////////////////////////////////////////////////////////////////////////
  
  
  ;// CONCATENATED MODULE: ./node_modules/@gatsbyjs/reach-router/es/index.js
  var es_extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
  
  function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
  
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  
  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
  
  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
  
  /* eslint-disable jsx-a11y/anchor-has-content */
  
  
  
  
  
  
  
  ////////////////////////////////////////////////////////////////////////////////
  
  var createNamedContext = function createNamedContext(name, defaultValue) {
    var Ctx = (0,react.createContext)(defaultValue);
    Ctx.displayName = name;
    return Ctx;
  };
  
  ////////////////////////////////////////////////////////////////////////////////
  // Location Context/Provider
  var LocationContext = createNamedContext("Location");
  
  // sets up a listener if there isn't one already so apps don't need to be
  // wrapped in some top level provider
  var Location = function Location(_ref) {
    var children = _ref.children;
    return react.createElement(
      LocationContext.Consumer,
      null,
      function (context) {
        return context ? children(context) : react.createElement(
          LocationProvider,
          null,
          children
        );
      }
    );
  };
  
  var LocationProvider = function (_React$Component) {
    _inherits(LocationProvider, _React$Component);
  
    function LocationProvider() {
      var _temp, _this, _ret;
  
      _classCallCheck(this, LocationProvider);
  
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
  
      return _ret = (_temp = (_this = _possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.state = {
        context: _this.getContext(),
        refs: { unlisten: null }
      }, _temp), _possibleConstructorReturn(_this, _ret);
    }
  
    LocationProvider.prototype.getContext = function getContext() {
      var _props$history = this.props.history,
          navigate = _props$history.navigate,
          location = _props$history.location;
  
      return { navigate: navigate, location: location };
    };
  
    LocationProvider.prototype.componentDidCatch = function componentDidCatch(error, info) {
      if (isRedirect(error)) {
        var _navigate = this.props.history.navigate;
  
        _navigate(error.uri, { replace: true });
      } else {
        throw error;
      }
    };
  
    LocationProvider.prototype.componentDidUpdate = function componentDidUpdate(prevProps, prevState) {
      if (prevState.context.location !== this.state.context.location) {
        this.props.history._onTransitionComplete();
      }
    };
  
    LocationProvider.prototype.componentDidMount = function componentDidMount() {
      var _this2 = this;
  
      var refs = this.state.refs,
          history = this.props.history;
  
      history._onTransitionComplete();
      refs.unlisten = history.listen(function () {
        Promise.resolve().then(function () {
          // TODO: replace rAF with react deferred update API when it's ready https://github.com/facebook/react/issues/13306
          requestAnimationFrame(function () {
            if (!_this2.unmounted) {
              _this2.setState(function () {
                return { context: _this2.getContext() };
              });
            }
          });
        });
      });
    };
  
    LocationProvider.prototype.componentWillUnmount = function componentWillUnmount() {
      var refs = this.state.refs;
  
      this.unmounted = true;
      refs.unlisten();
    };
  
    LocationProvider.prototype.render = function render() {
      var context = this.state.context,
          children = this.props.children;
  
      return react.createElement(
        LocationContext.Provider,
        { value: context },
        typeof children === "function" ? children(context) : children || null
      );
    };
  
    return LocationProvider;
  }(react.Component);
  
  ////////////////////////////////////////////////////////////////////////////////
  
  
  LocationProvider.defaultProps = {
    history: globalHistory
  };
   false ? 0 : void 0;
  var ServerLocation = function ServerLocation(_ref2) {
    var url = _ref2.url,
        children = _ref2.children;
  
    var searchIndex = url.indexOf("?");
    var searchExists = searchIndex > -1;
    var pathname = void 0;
    var search = "";
    var hash = "";
  
    if (searchExists) {
      pathname = url.substring(0, searchIndex);
      search = url.substring(searchIndex);
    } else {
      pathname = url;
    }
  
    return react.createElement(
      LocationContext.Provider,
      {
        value: {
          location: {
            pathname: pathname,
            search: search,
            hash: hash
          },
          navigate: function navigate() {
            throw new Error("You can't call navigate on the server.");
          }
        }
      },
      children
    );
  };
  ////////////////////////////////////////////////////////////////////////////////
  // Sets baseuri and basepath for nested routers and links
  var BaseContext = createNamedContext("Base", {
    baseuri: "/",
    basepath: "/",
    navigate: globalHistory.navigate
  });
  
  ////////////////////////////////////////////////////////////////////////////////
  // The main event, welcome to the show everybody.
  var Router = function Router(props) {
    return react.createElement(
      BaseContext.Consumer,
      null,
      function (baseContext) {
        return react.createElement(
          Location,
          null,
          function (locationContext) {
            return react.createElement(RouterImpl, es_extends({}, baseContext, locationContext, props));
          }
        );
      }
    );
  };
  
  var RouterImpl = function (_React$PureComponent) {
    _inherits(RouterImpl, _React$PureComponent);
  
    function RouterImpl() {
      _classCallCheck(this, RouterImpl);
  
      return _possibleConstructorReturn(this, _React$PureComponent.apply(this, arguments));
    }
  
    RouterImpl.prototype.render = function render() {
      var _props = this.props,
          location = _props.location,
          _navigate2 = _props.navigate,
          basepath = _props.basepath,
          primary = _props.primary,
          children = _props.children,
          baseuri = _props.baseuri,
          _props$component = _props.component,
          component = _props$component === undefined ? "div" : _props$component,
          domProps = _objectWithoutProperties(_props, ["location", "navigate", "basepath", "primary", "children", "baseuri", "component"]);
  
      var routes = react.Children.toArray(children).reduce(function (array, child) {
        var routes = createRoute(basepath)(child);
        return array.concat(routes);
      }, []);
      var pathname = location.pathname;
  
  
      var match = pick(routes, pathname);
  
      if (match) {
        var params = match.params,
            uri = match.uri,
            route = match.route,
            element = match.route.value;
  
        // remove the /* from the end for child routes relative paths
  
        basepath = route.default ? basepath : route.path.replace(/\*$/, "");
  
        var props = es_extends({}, params, {
          uri: uri,
          location: location,
          navigate: function navigate(to, options) {
            return _navigate2(resolve(to, uri), options);
          }
        });
  
        var clone = react.cloneElement(element, props, element.props.children ? react.createElement(
          Router,
          { location: location, primary: primary },
          element.props.children
        ) : undefined);
  
        // using 'div' for < 16.3 support
        var FocusWrapper = primary ? FocusHandler : component;
        // don't pass any props to 'div'
        var wrapperProps = primary ? es_extends({ uri: uri, location: location, component: component }, domProps) : domProps;
  
        return react.createElement(
          BaseContext.Provider,
          {
            value: { baseuri: uri, basepath: basepath, navigate: props.navigate }
          },
          react.createElement(
            FocusWrapper,
            wrapperProps,
            clone
          )
        );
      } else {
        // Not sure if we want this, would require index routes at every level
        // warning(
        //   false,
        //   `<Router basepath="${basepath}">\n\nNothing matched:\n\t${
        //     location.pathname
        //   }\n\nPaths checked: \n\t${routes
        //     .map(route => route.path)
        //     .join(
        //       "\n\t"
        //     )}\n\nTo get rid of this warning, add a default NotFound component as child of Router:
        //   \n\tlet NotFound = () => <div>Not Found!</div>
        //   \n\t<Router>\n\t  <NotFound default/>\n\t  {/* ... */}\n\t</Router>`
        // );
        return null;
      }
    };
  
    return RouterImpl;
  }(react.PureComponent);
  
  RouterImpl.defaultProps = {
    primary: true
  };
  
  
  var FocusContext = createNamedContext("Focus");
  
  var FocusHandler = function FocusHandler(_ref3) {
    var uri = _ref3.uri,
        location = _ref3.location,
        component = _ref3.component,
        domProps = _objectWithoutProperties(_ref3, ["uri", "location", "component"]);
  
    return react.createElement(
      FocusContext.Consumer,
      null,
      function (requestFocus) {
        return react.createElement(FocusHandlerImpl, es_extends({}, domProps, {
          component: component,
          requestFocus: requestFocus,
          uri: uri,
          location: location
        }));
      }
    );
  };
  
  // don't focus on initial render
  var initialRender = true;
  var focusHandlerCount = 0;
  
  var FocusHandlerImpl = function (_React$Component2) {
    _inherits(FocusHandlerImpl, _React$Component2);
  
    function FocusHandlerImpl() {
      var _temp2, _this4, _ret2;
  
      _classCallCheck(this, FocusHandlerImpl);
  
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
  
      return _ret2 = (_temp2 = (_this4 = _possibleConstructorReturn(this, _React$Component2.call.apply(_React$Component2, [this].concat(args))), _this4), _this4.state = {}, _this4.requestFocus = function (node) {
        if (!_this4.state.shouldFocus && node) {
          node.focus();
        }
      }, _temp2), _possibleConstructorReturn(_this4, _ret2);
    }
  
    FocusHandlerImpl.getDerivedStateFromProps = function getDerivedStateFromProps(nextProps, prevState) {
      var initial = prevState.uri == null;
      if (initial) {
        return es_extends({
          shouldFocus: true
        }, nextProps);
      } else {
        var myURIChanged = nextProps.uri !== prevState.uri;
        var navigatedUpToMe = prevState.location.pathname !== nextProps.location.pathname && nextProps.location.pathname === nextProps.uri;
        return es_extends({
          shouldFocus: myURIChanged || navigatedUpToMe
        }, nextProps);
      }
    };
  
    FocusHandlerImpl.prototype.componentDidMount = function componentDidMount() {
      focusHandlerCount++;
      this.focus();
    };
  
    FocusHandlerImpl.prototype.componentWillUnmount = function componentWillUnmount() {
      focusHandlerCount--;
      if (focusHandlerCount === 0) {
        initialRender = true;
      }
    };
  
    FocusHandlerImpl.prototype.componentDidUpdate = function componentDidUpdate(prevProps, prevState) {
      if (prevProps.location !== this.props.location && this.state.shouldFocus) {
        this.focus();
      }
    };
  
    FocusHandlerImpl.prototype.focus = function focus() {
      if (false) {}
  
      var requestFocus = this.props.requestFocus;
  
  
      if (requestFocus) {
        requestFocus(this.node);
      } else {
        if (initialRender) {
          initialRender = false;
        } else if (this.node) {
          // React polyfills [autofocus] and it fires earlier than cDM,
          // so we were stealing focus away, this line prevents that.
          if (!this.node.contains(document.activeElement)) {
            this.node.focus();
          }
        }
      }
    };
  
    FocusHandlerImpl.prototype.render = function render() {
      var _this5 = this;
  
      var _props2 = this.props,
          children = _props2.children,
          style = _props2.style,
          requestFocus = _props2.requestFocus,
          _props2$component = _props2.component,
          Comp = _props2$component === undefined ? "div" : _props2$component,
          uri = _props2.uri,
          location = _props2.location,
          domProps = _objectWithoutProperties(_props2, ["children", "style", "requestFocus", "component", "uri", "location"]);
  
      return react.createElement(
        Comp,
        es_extends({
          style: es_extends({ outline: "none" }, style),
          tabIndex: "-1",
          ref: function ref(n) {
            return _this5.node = n;
          }
        }, domProps),
        react.createElement(
          FocusContext.Provider,
          { value: this.requestFocus },
          this.props.children
        )
      );
    };
  
    return FocusHandlerImpl;
  }(react.Component);
  
  (0,react_lifecycles_compat/* polyfill */.O)(FocusHandlerImpl);
  
  var k = function k() {};
  
  ////////////////////////////////////////////////////////////////////////////////
  var forwardRef = react.forwardRef;
  
  if (typeof forwardRef === "undefined") {
    forwardRef = function forwardRef(C) {
      return C;
    };
  }
  
  var Link = forwardRef(function (_ref4, ref) {
    var innerRef = _ref4.innerRef,
        props = _objectWithoutProperties(_ref4, ["innerRef"]);
  
    return react.createElement(
      BaseContext.Consumer,
      null,
      function (_ref5) {
        var basepath = _ref5.basepath,
            baseuri = _ref5.baseuri;
        return react.createElement(
          Location,
          null,
          function (_ref6) {
            var location = _ref6.location,
                navigate = _ref6.navigate;
  
            var to = props.to,
                state = props.state,
                replace = props.replace,
                _props$getProps = props.getProps,
                getProps = _props$getProps === undefined ? k : _props$getProps,
                anchorProps = _objectWithoutProperties(props, ["to", "state", "replace", "getProps"]);
  
            var href = resolve(to, baseuri);
            var encodedHref = encodeURI(href);
            var isCurrent = location.pathname === encodedHref;
            var isPartiallyCurrent = startsWith(location.pathname, encodedHref);
  
            return react.createElement("a", es_extends({
              ref: ref || innerRef,
              "aria-current": isCurrent ? "page" : undefined
            }, anchorProps, getProps({ isCurrent: isCurrent, isPartiallyCurrent: isPartiallyCurrent, href: href, location: location }), {
              href: href,
              onClick: function onClick(event) {
                if (anchorProps.onClick) anchorProps.onClick(event);
                if (shouldNavigate(event)) {
                  event.preventDefault();
                  var shouldReplace = replace;
                  if (typeof replace !== "boolean" && isCurrent) {
                    var _location$state = es_extends({}, location.state),
                        key = _location$state.key,
                        restState = _objectWithoutProperties(_location$state, ["key"]);
  
                    shouldReplace = shallowCompare(es_extends({}, state), restState);
                  }
                  navigate(href, {
                    state: state,
                    replace: shouldReplace
                  });
                }
              }
            }));
          }
        );
      }
    );
  });
  
  Link.displayName = "Link";
  
   false ? 0 : void 0;
  
  ////////////////////////////////////////////////////////////////////////////////
  function RedirectRequest(uri) {
    this.uri = uri;
  }
  
  var isRedirect = function isRedirect(o) {
    return o instanceof RedirectRequest;
  };
  
  var redirectTo = function redirectTo(to) {
    throw new RedirectRequest(to);
  };
  
  var RedirectImpl = function (_React$Component3) {
    _inherits(RedirectImpl, _React$Component3);
  
    function RedirectImpl() {
      _classCallCheck(this, RedirectImpl);
  
      return _possibleConstructorReturn(this, _React$Component3.apply(this, arguments));
    }
  
    // Support React < 16 with this hook
    RedirectImpl.prototype.componentDidMount = function componentDidMount() {
      var _props3 = this.props,
          navigate = _props3.navigate,
          to = _props3.to,
          from = _props3.from,
          _props3$replace = _props3.replace,
          replace = _props3$replace === undefined ? true : _props3$replace,
          state = _props3.state,
          noThrow = _props3.noThrow,
          baseuri = _props3.baseuri,
          props = _objectWithoutProperties(_props3, ["navigate", "to", "from", "replace", "state", "noThrow", "baseuri"]);
  
      Promise.resolve().then(function () {
        var resolvedTo = resolve(to, baseuri);
        navigate(insertParams(resolvedTo, props), { replace: replace, state: state });
      });
    };
  
    RedirectImpl.prototype.render = function render() {
      var _props4 = this.props,
          navigate = _props4.navigate,
          to = _props4.to,
          from = _props4.from,
          replace = _props4.replace,
          state = _props4.state,
          noThrow = _props4.noThrow,
          baseuri = _props4.baseuri,
          props = _objectWithoutProperties(_props4, ["navigate", "to", "from", "replace", "state", "noThrow", "baseuri"]);
  
      var resolvedTo = resolve(to, baseuri);
      if (!noThrow) redirectTo(insertParams(resolvedTo, props));
      return null;
    };
  
    return RedirectImpl;
  }(react.Component);
  
  var Redirect = function Redirect(props) {
    return react.createElement(
      BaseContext.Consumer,
      null,
      function (_ref7) {
        var baseuri = _ref7.baseuri;
        return react.createElement(
          Location,
          null,
          function (locationContext) {
            return react.createElement(RedirectImpl, es_extends({}, locationContext, { baseuri: baseuri }, props));
          }
        );
      }
    );
  };
  
   false ? 0 : void 0;
  
  ////////////////////////////////////////////////////////////////////////////////
  var Match = function Match(_ref8) {
    var path = _ref8.path,
        children = _ref8.children;
    return react.createElement(
      BaseContext.Consumer,
      null,
      function (_ref9) {
        var baseuri = _ref9.baseuri;
        return react.createElement(
          Location,
          null,
          function (_ref10) {
            var navigate = _ref10.navigate,
                location = _ref10.location;
  
            var resolvedPath = resolve(path, baseuri);
            var result = match(resolvedPath, location.pathname);
            return children({
              navigate: navigate,
              location: location,
              match: result ? es_extends({}, result.params, {
                uri: result.uri,
                path: path
              }) : null
            });
          }
        );
      }
    );
  };
  
  ////////////////////////////////////////////////////////////////////////////////
  // Hooks
  
  var useLocation = function useLocation() {
    var context = (0,react.useContext)(LocationContext);
  
    if (!context) {
      throw new Error("useLocation hook was used but a LocationContext.Provider was not found in the parent tree. Make sure this is used in a component that is a child of Router");
    }
  
    return context.location;
  };
  
  var useNavigate = function useNavigate() {
    var context = (0,react.useContext)(BaseContext);
  
    if (!context) {
      throw new Error("useNavigate hook was used but a BaseContext.Provider was not found in the parent tree. Make sure this is used in a component that is a child of Router");
    }
  
    return context.navigate;
  };
  
  var useParams = function useParams() {
    var context = (0,react.useContext)(BaseContext);
  
    if (!context) {
      throw new Error("useParams hook was used but a LocationContext.Provider was not found in the parent tree. Make sure this is used in a component that is a child of Router");
    }
  
    var location = useLocation();
  
    var results = match(context.basepath, location.pathname);
  
    return results ? results.params : null;
  };
  
  var useMatch = function useMatch(path) {
    if (!path) {
      throw new Error("useMatch(path: string) requires an argument of a string to match against");
    }
    var context = (0,react.useContext)(BaseContext);
  
    if (!context) {
      throw new Error("useMatch hook was used but a LocationContext.Provider was not found in the parent tree. Make sure this is used in a component that is a child of Router");
    }
  
    var location = useLocation();
  
    var resolvedPath = resolve(path, context.baseuri);
    var result = match(resolvedPath, location.pathname);
    return result ? es_extends({}, result.params, {
      uri: result.uri,
      path: path
    }) : null;
  };
  
  ////////////////////////////////////////////////////////////////////////////////
  // Junk
  var stripSlashes = function stripSlashes(str) {
    return str.replace(/(^\/+|\/+$)/g, "");
  };
  
  var createRoute = function createRoute(basepath) {
    return function (element) {
      if (!element) {
        return null;
      }
  
      if (element.type === react.Fragment && element.props.children) {
        return react.Children.map(element.props.children, createRoute(basepath));
      }
      !(element.props.path || element.props.default || element.type === Redirect) ?  false ? 0 : invariant_default()(false) : void 0;
  
      !!(element.type === Redirect && (!element.props.from || !element.props.to)) ?  false ? 0 : invariant_default()(false) : void 0;
  
      !!(element.type === Redirect && !validateRedirect(element.props.from, element.props.to)) ?  false ? 0 : invariant_default()(false) : void 0;
  
      if (element.props.default) {
        return { value: element, default: true };
      }
  
      var elementPath = element.type === Redirect ? element.props.from : element.props.path;
  
      var path = elementPath === "/" ? basepath : stripSlashes(basepath) + "/" + stripSlashes(elementPath);
  
      return {
        value: element,
        default: element.props.default,
        path: element.props.children ? stripSlashes(path) + "/*" : path
      };
    };
  };
  
  var shouldNavigate = function shouldNavigate(event) {
    return !event.defaultPrevented && event.button === 0 && !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
  };
  
  ////////////////////////////////////////////////////////////////////////
  
  
  /***/ }),
  
  /***/ 6128:
  /***/ ((module) => {
  
  "use strict";
  /**
   * Copyright (c) 2013-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  
  
  
  /**
   * Use invariant() to assert state which your program assumes to be true.
   *
   * Provide sprintf-style format (only %s is supported) and arguments
   * to provide information about what broke and what you were
   * expecting.
   *
   * The invariant message will be stripped in production, but the invariant
   * will remain to ensure logic does not differ in production.
   */
  
  var NODE_ENV = "production";
  
  var invariant = function(condition, format, a, b, c, d, e, f) {
    if (NODE_ENV !== 'production') {
      if (format === undefined) {
        throw new Error('invariant requires an error message argument');
      }
    }
  
    if (!condition) {
      var error;
      if (format === undefined) {
        error = new Error(
          'Minified exception occurred; use the non-minified dev environment ' +
          'for the full error message and additional helpful warnings.'
        );
      } else {
        var args = [a, b, c, d, e, f];
        var argIndex = 0;
        error = new Error(
          format.replace(/%s/g, function() { return args[argIndex++]; })
        );
        error.name = 'Invariant Violation';
      }
  
      error.framesToPop = 1; // we don't care about invariant's own frame
      throw error;
    }
  };
  
  module.exports = invariant;
  
  
  /***/ }),
  
  /***/ 2703:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {
  
  "use strict";
  /**
   * Copyright (c) 2013-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  
  
  
  var ReactPropTypesSecret = __webpack_require__(414);
  
  function emptyFunction() {}
  function emptyFunctionWithReset() {}
  emptyFunctionWithReset.resetWarningCache = emptyFunction;
  
  module.exports = function() {
    function shim(props, propName, componentName, location, propFullName, secret) {
      if (secret === ReactPropTypesSecret) {
        // It is still safe when called from React.
        return;
      }
      var err = new Error(
        'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
        'Use PropTypes.checkPropTypes() to call them. ' +
        'Read more at http://fb.me/use-check-prop-types'
      );
      err.name = 'Invariant Violation';
      throw err;
    };
    shim.isRequired = shim;
    function getShim() {
      return shim;
    };
    // Important!
    // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
    var ReactPropTypes = {
      array: shim,
      bigint: shim,
      bool: shim,
      func: shim,
      number: shim,
      object: shim,
      string: shim,
      symbol: shim,
  
      any: shim,
      arrayOf: getShim,
      element: shim,
      elementType: shim,
      instanceOf: getShim,
      node: shim,
      objectOf: getShim,
      oneOf: getShim,
      oneOfType: getShim,
      shape: getShim,
      exact: getShim,
  
      checkPropTypes: emptyFunctionWithReset,
      resetWarningCache: emptyFunction
    };
  
    ReactPropTypes.PropTypes = ReactPropTypes;
  
    return ReactPropTypes;
  };
  
  
  /***/ }),
  
  /***/ 5697:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {
  
  /**
   * Copyright (c) 2013-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  
  if (false) { var throwOnDirectAccess, ReactIs; } else {
    // By explicitly using `prop-types` you are opting into new production behavior.
    // http://fb.me/prop-types-in-prod
    module.exports = __webpack_require__(2703)();
  }
  
  
  /***/ }),
  
  /***/ 414:
  /***/ ((module) => {
  
  "use strict";
  /**
   * Copyright (c) 2013-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  
  
  
  var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';
  
  module.exports = ReactPropTypesSecret;
  
  
  /***/ }),
  
  /***/ 4798:
  /***/ ((__unused_webpack_module, exports, __webpack_require__) => {
  
  "use strict";
  /** @license React v17.0.2
   * react-dom-server.node.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  var l=__webpack_require__(4852),n=__webpack_require__(7294),aa=__webpack_require__(2781);function p(a){for(var b="https://reactjs.org/docs/error-decoder.html?invariant="+a,c=1;c<arguments.length;c++)b+="&args[]="+encodeURIComponent(arguments[c]);return"Minified React error #"+a+"; visit "+b+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}
  var q=60106,r=60107,u=60108,z=60114,B=60109,ba=60110,ca=60112,D=60113,da=60120,ea=60115,fa=60116,ha=60121,ia=60117,ja=60119,ka=60129,la=60131;
  if("function"===typeof Symbol&&Symbol.for){var E=Symbol.for;q=E("react.portal");r=E("react.fragment");u=E("react.strict_mode");z=E("react.profiler");B=E("react.provider");ba=E("react.context");ca=E("react.forward_ref");D=E("react.suspense");da=E("react.suspense_list");ea=E("react.memo");fa=E("react.lazy");ha=E("react.block");ia=E("react.fundamental");ja=E("react.scope");ka=E("react.debug_trace_mode");la=E("react.legacy_hidden")}
  function F(a){if(null==a)return null;if("function"===typeof a)return a.displayName||a.name||null;if("string"===typeof a)return a;switch(a){case r:return"Fragment";case q:return"Portal";case z:return"Profiler";case u:return"StrictMode";case D:return"Suspense";case da:return"SuspenseList"}if("object"===typeof a)switch(a.$$typeof){case ba:return(a.displayName||"Context")+".Consumer";case B:return(a._context.displayName||"Context")+".Provider";case ca:var b=a.render;b=b.displayName||b.name||"";return a.displayName||
  (""!==b?"ForwardRef("+b+")":"ForwardRef");case ea:return F(a.type);case ha:return F(a._render);case fa:b=a._payload;a=a._init;try{return F(a(b))}catch(c){}}return null}var ma=n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,na={};function I(a,b){for(var c=a._threadCount|0;c<=b;c++)a[c]=a._currentValue2,a._threadCount=c+1}function oa(a,b,c,d){if(d&&(d=a.contextType,"object"===typeof d&&null!==d))return I(d,c),d[c];if(a=a.contextTypes){c={};for(var f in a)c[f]=b[f];b=c}else b=na;return b}
  for(var J=new Uint16Array(16),K=0;15>K;K++)J[K]=K+1;J[15]=0;var pa=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,qa=Object.prototype.hasOwnProperty,ra={},sa={};
  function ta(a){if(qa.call(sa,a))return!0;if(qa.call(ra,a))return!1;if(pa.test(a))return sa[a]=!0;ra[a]=!0;return!1}function ua(a,b,c,d){if(null!==c&&0===c.type)return!1;switch(typeof b){case "function":case "symbol":return!0;case "boolean":if(d)return!1;if(null!==c)return!c.acceptsBooleans;a=a.toLowerCase().slice(0,5);return"data-"!==a&&"aria-"!==a;default:return!1}}
  function va(a,b,c,d){if(null===b||"undefined"===typeof b||ua(a,b,c,d))return!0;if(d)return!1;if(null!==c)switch(c.type){case 3:return!b;case 4:return!1===b;case 5:return isNaN(b);case 6:return isNaN(b)||1>b}return!1}function M(a,b,c,d,f,h,t){this.acceptsBooleans=2===b||3===b||4===b;this.attributeName=d;this.attributeNamespace=f;this.mustUseProperty=c;this.propertyName=a;this.type=b;this.sanitizeURL=h;this.removeEmptyString=t}var N={};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a){N[a]=new M(a,0,!1,a,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(a){var b=a[0];N[b]=new M(b,1,!1,a[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(a){N[a]=new M(a,2,!1,a.toLowerCase(),null,!1,!1)});
  ["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(a){N[a]=new M(a,2,!1,a,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a){N[a]=new M(a,3,!1,a.toLowerCase(),null,!1,!1)});
  ["checked","multiple","muted","selected"].forEach(function(a){N[a]=new M(a,3,!0,a,null,!1,!1)});["capture","download"].forEach(function(a){N[a]=new M(a,4,!1,a,null,!1,!1)});["cols","rows","size","span"].forEach(function(a){N[a]=new M(a,6,!1,a,null,!1,!1)});["rowSpan","start"].forEach(function(a){N[a]=new M(a,5,!1,a.toLowerCase(),null,!1,!1)});var wa=/[\-:]([a-z])/g;function xa(a){return a[1].toUpperCase()}
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a){var b=a.replace(wa,
  xa);N[b]=new M(b,1,!1,a,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a){var b=a.replace(wa,xa);N[b]=new M(b,1,!1,a,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(a){var b=a.replace(wa,xa);N[b]=new M(b,1,!1,a,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(a){N[a]=new M(a,1,!1,a.toLowerCase(),null,!1,!1)});
  N.xlinkHref=new M("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(a){N[a]=new M(a,1,!1,a.toLowerCase(),null,!0,!0)});var ya=/["'&<>]/;
  function O(a){if("boolean"===typeof a||"number"===typeof a)return""+a;a=""+a;var b=ya.exec(a);if(b){var c="",d,f=0;for(d=b.index;d<a.length;d++){switch(a.charCodeAt(d)){case 34:b="&quot;";break;case 38:b="&amp;";break;case 39:b="&#x27;";break;case 60:b="&lt;";break;case 62:b="&gt;";break;default:continue}f!==d&&(c+=a.substring(f,d));f=d+1;c+=b}a=f!==d?c+a.substring(f,d):c}return a}
  function za(a,b){var c=N.hasOwnProperty(a)?N[a]:null;var d;if(d="style"!==a)d=null!==c?0===c.type:!(2<a.length)||"o"!==a[0]&&"O"!==a[0]||"n"!==a[1]&&"N"!==a[1]?!1:!0;if(d||va(a,b,c,!1))return"";if(null!==c){a=c.attributeName;d=c.type;if(3===d||4===d&&!0===b)return a+'=""';c.sanitizeURL&&(b=""+b);return a+'="'+(O(b)+'"')}return ta(a)?a+'="'+(O(b)+'"'):""}function Aa(a,b){return a===b&&(0!==a||1/a===1/b)||a!==a&&b!==b}
  var Ba="function"===typeof Object.is?Object.is:Aa,P=null,Q=null,R=null,S=!1,T=!1,U=null,V=0;function W(){if(null===P)throw Error(p(321));return P}function Ca(){if(0<V)throw Error(p(312));return{memoizedState:null,queue:null,next:null}}function Da(){null===R?null===Q?(S=!1,Q=R=Ca()):(S=!0,R=Q):null===R.next?(S=!1,R=R.next=Ca()):(S=!0,R=R.next);return R}function Ea(a,b,c,d){for(;T;)T=!1,V+=1,R=null,c=a(b,d);Fa();return c}function Fa(){P=null;T=!1;Q=null;V=0;R=U=null}
  function Ga(a,b){return"function"===typeof b?b(a):b}function Ha(a,b,c){P=W();R=Da();if(S){var d=R.queue;b=d.dispatch;if(null!==U&&(c=U.get(d),void 0!==c)){U.delete(d);d=R.memoizedState;do d=a(d,c.action),c=c.next;while(null!==c);R.memoizedState=d;return[d,b]}return[R.memoizedState,b]}a=a===Ga?"function"===typeof b?b():b:void 0!==c?c(b):b;R.memoizedState=a;a=R.queue={last:null,dispatch:null};a=a.dispatch=Ia.bind(null,P,a);return[R.memoizedState,a]}
  function Ja(a,b){P=W();R=Da();b=void 0===b?null:b;if(null!==R){var c=R.memoizedState;if(null!==c&&null!==b){var d=c[1];a:if(null===d)d=!1;else{for(var f=0;f<d.length&&f<b.length;f++)if(!Ba(b[f],d[f])){d=!1;break a}d=!0}if(d)return c[0]}}a=a();R.memoizedState=[a,b];return a}function Ia(a,b,c){if(!(25>V))throw Error(p(301));if(a===P)if(T=!0,a={action:c,next:null},null===U&&(U=new Map),c=U.get(b),void 0===c)U.set(b,a);else{for(b=c;null!==b.next;)b=b.next;b.next=a}}function Ka(){}
  var X=null,La={readContext:function(a){var b=X.threadID;I(a,b);return a[b]},useContext:function(a){W();var b=X.threadID;I(a,b);return a[b]},useMemo:Ja,useReducer:Ha,useRef:function(a){P=W();R=Da();var b=R.memoizedState;return null===b?(a={current:a},R.memoizedState=a):b},useState:function(a){return Ha(Ga,a)},useLayoutEffect:function(){},useCallback:function(a,b){return Ja(function(){return a},b)},useImperativeHandle:Ka,useEffect:Ka,useDebugValue:Ka,useDeferredValue:function(a){W();return a},useTransition:function(){W();
  return[function(a){a()},!1]},useOpaqueIdentifier:function(){return(X.identifierPrefix||"")+"R:"+(X.uniqueID++).toString(36)},useMutableSource:function(a,b){W();return b(a._source)}},Ma={html:"http://www.w3.org/1999/xhtml",mathml:"http://www.w3.org/1998/Math/MathML",svg:"http://www.w3.org/2000/svg"};function Na(a){switch(a){case "svg":return"http://www.w3.org/2000/svg";case "math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}
  var Oa={area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0},Pa=l({menuitem:!0},Oa),Y={animationIterationCount:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,
  gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Qa=["Webkit","ms","Moz","O"];Object.keys(Y).forEach(function(a){Qa.forEach(function(b){b=b+a.charAt(0).toUpperCase()+a.substring(1);Y[b]=Y[a]})});
  var Ra=/([A-Z])/g,Sa=/^ms-/,Z=n.Children.toArray,Ta=ma.ReactCurrentDispatcher,Ua={listing:!0,pre:!0,textarea:!0},Va=/^[a-zA-Z][a-zA-Z:_\.\-\d]*$/,Wa={},Xa={};function Ya(a){if(void 0===a||null===a)return a;var b="";n.Children.forEach(a,function(a){null!=a&&(b+=a)});return b}var Za=Object.prototype.hasOwnProperty,$a={children:null,dangerouslySetInnerHTML:null,suppressContentEditableWarning:null,suppressHydrationWarning:null};function ab(a,b){if(void 0===a)throw Error(p(152,F(b)||"Component"));}
  function bb(a,b,c){function d(d,h){var e=h.prototype&&h.prototype.isReactComponent,f=oa(h,b,c,e),t=[],g=!1,m={isMounted:function(){return!1},enqueueForceUpdate:function(){if(null===t)return null},enqueueReplaceState:function(a,b){g=!0;t=[b]},enqueueSetState:function(a,b){if(null===t)return null;t.push(b)}};if(e){if(e=new h(d.props,f,m),"function"===typeof h.getDerivedStateFromProps){var k=h.getDerivedStateFromProps.call(null,d.props,e.state);null!=k&&(e.state=l({},e.state,k))}}else if(P={},e=h(d.props,
  f,m),e=Ea(h,d.props,e,f),null==e||null==e.render){a=e;ab(a,h);return}e.props=d.props;e.context=f;e.updater=m;m=e.state;void 0===m&&(e.state=m=null);if("function"===typeof e.UNSAFE_componentWillMount||"function"===typeof e.componentWillMount)if("function"===typeof e.componentWillMount&&"function"!==typeof h.getDerivedStateFromProps&&e.componentWillMount(),"function"===typeof e.UNSAFE_componentWillMount&&"function"!==typeof h.getDerivedStateFromProps&&e.UNSAFE_componentWillMount(),t.length){m=t;var v=
  g;t=null;g=!1;if(v&&1===m.length)e.state=m[0];else{k=v?m[0]:e.state;var H=!0;for(v=v?1:0;v<m.length;v++){var x=m[v];x="function"===typeof x?x.call(e,k,d.props,f):x;null!=x&&(H?(H=!1,k=l({},k,x)):l(k,x))}e.state=k}}else t=null;a=e.render();ab(a,h);if("function"===typeof e.getChildContext&&(d=h.childContextTypes,"object"===typeof d)){var y=e.getChildContext();for(var A in y)if(!(A in d))throw Error(p(108,F(h)||"Unknown",A));}y&&(b=l({},b,y))}for(;n.isValidElement(a);){var f=a,h=f.type;if("function"!==
  typeof h)break;d(f,h)}return{child:a,context:b}}
  var cb=function(){function a(a,b,f){n.isValidElement(a)?a.type!==r?a=[a]:(a=a.props.children,a=n.isValidElement(a)?[a]:Z(a)):a=Z(a);a={type:null,domNamespace:Ma.html,children:a,childIndex:0,context:na,footer:""};var c=J[0];if(0===c){var d=J;c=d.length;var g=2*c;if(!(65536>=g))throw Error(p(304));var e=new Uint16Array(g);e.set(d);J=e;J[0]=c+1;for(d=c;d<g-1;d++)J[d]=d+1;J[g-1]=0}else J[0]=J[c];this.threadID=c;this.stack=[a];this.exhausted=!1;this.currentSelectValue=null;this.previousWasTextNode=!1;
  this.makeStaticMarkup=b;this.suspenseDepth=0;this.contextIndex=-1;this.contextStack=[];this.contextValueStack=[];this.uniqueID=0;this.identifierPrefix=f&&f.identifierPrefix||""}var b=a.prototype;b.destroy=function(){if(!this.exhausted){this.exhausted=!0;this.clearProviders();var a=this.threadID;J[a]=J[0];J[0]=a}};b.pushProvider=function(a){var b=++this.contextIndex,c=a.type._context,h=this.threadID;I(c,h);var t=c[h];this.contextStack[b]=c;this.contextValueStack[b]=t;c[h]=a.props.value};b.popProvider=
  function(){var a=this.contextIndex,b=this.contextStack[a],f=this.contextValueStack[a];this.contextStack[a]=null;this.contextValueStack[a]=null;this.contextIndex--;b[this.threadID]=f};b.clearProviders=function(){for(var a=this.contextIndex;0<=a;a--)this.contextStack[a][this.threadID]=this.contextValueStack[a]};b.read=function(a){if(this.exhausted)return null;var b=X;X=this;var c=Ta.current;Ta.current=La;try{for(var h=[""],t=!1;h[0].length<a;){if(0===this.stack.length){this.exhausted=!0;var g=this.threadID;
  J[g]=J[0];J[0]=g;break}var e=this.stack[this.stack.length-1];if(t||e.childIndex>=e.children.length){var L=e.footer;""!==L&&(this.previousWasTextNode=!1);this.stack.pop();if("select"===e.type)this.currentSelectValue=null;else if(null!=e.type&&null!=e.type.type&&e.type.type.$$typeof===B)this.popProvider(e.type);else if(e.type===D){this.suspenseDepth--;var G=h.pop();if(t){t=!1;var C=e.fallbackFrame;if(!C)throw Error(p(303));this.stack.push(C);h[this.suspenseDepth]+="\x3c!--$!--\x3e";continue}else h[this.suspenseDepth]+=
  G}h[this.suspenseDepth]+=L}else{var m=e.children[e.childIndex++],k="";try{k+=this.render(m,e.context,e.domNamespace)}catch(v){if(null!=v&&"function"===typeof v.then)throw Error(p(294));throw v;}finally{}h.length<=this.suspenseDepth&&h.push("");h[this.suspenseDepth]+=k}}return h[0]}finally{Ta.current=c,X=b,Fa()}};b.render=function(a,b,f){if("string"===typeof a||"number"===typeof a){f=""+a;if(""===f)return"";if(this.makeStaticMarkup)return O(f);if(this.previousWasTextNode)return"\x3c!-- --\x3e"+O(f);
  this.previousWasTextNode=!0;return O(f)}b=bb(a,b,this.threadID);a=b.child;b=b.context;if(null===a||!1===a)return"";if(!n.isValidElement(a)){if(null!=a&&null!=a.$$typeof){f=a.$$typeof;if(f===q)throw Error(p(257));throw Error(p(258,f.toString()));}a=Z(a);this.stack.push({type:null,domNamespace:f,children:a,childIndex:0,context:b,footer:""});return""}var c=a.type;if("string"===typeof c)return this.renderDOM(a,b,f);switch(c){case la:case ka:case u:case z:case da:case r:return a=Z(a.props.children),this.stack.push({type:null,
  domNamespace:f,children:a,childIndex:0,context:b,footer:""}),"";case D:throw Error(p(294));case ja:throw Error(p(343));}if("object"===typeof c&&null!==c)switch(c.$$typeof){case ca:P={};var d=c.render(a.props,a.ref);d=Ea(c.render,a.props,d,a.ref);d=Z(d);this.stack.push({type:null,domNamespace:f,children:d,childIndex:0,context:b,footer:""});return"";case ea:return a=[n.createElement(c.type,l({ref:a.ref},a.props))],this.stack.push({type:null,domNamespace:f,children:a,childIndex:0,context:b,footer:""}),
  "";case B:return c=Z(a.props.children),f={type:a,domNamespace:f,children:c,childIndex:0,context:b,footer:""},this.pushProvider(a),this.stack.push(f),"";case ba:c=a.type;d=a.props;var g=this.threadID;I(c,g);c=Z(d.children(c[g]));this.stack.push({type:a,domNamespace:f,children:c,childIndex:0,context:b,footer:""});return"";case ia:throw Error(p(338));case fa:return c=a.type,d=c._init,c=d(c._payload),a=[n.createElement(c,l({ref:a.ref},a.props))],this.stack.push({type:null,domNamespace:f,children:a,childIndex:0,
  context:b,footer:""}),""}throw Error(p(130,null==c?c:typeof c,""));};b.renderDOM=function(a,b,f){var c=a.type.toLowerCase();f===Ma.html&&Na(c);if(!Wa.hasOwnProperty(c)){if(!Va.test(c))throw Error(p(65,c));Wa[c]=!0}var d=a.props;if("input"===c)d=l({type:void 0},d,{defaultChecked:void 0,defaultValue:void 0,value:null!=d.value?d.value:d.defaultValue,checked:null!=d.checked?d.checked:d.defaultChecked});else if("textarea"===c){var g=d.value;if(null==g){g=d.defaultValue;var e=d.children;if(null!=e){if(null!=
  g)throw Error(p(92));if(Array.isArray(e)){if(!(1>=e.length))throw Error(p(93));e=e[0]}g=""+e}null==g&&(g="")}d=l({},d,{value:void 0,children:""+g})}else if("select"===c)this.currentSelectValue=null!=d.value?d.value:d.defaultValue,d=l({},d,{value:void 0});else if("option"===c){e=this.currentSelectValue;var L=Ya(d.children);if(null!=e){var G=null!=d.value?d.value+"":L;g=!1;if(Array.isArray(e))for(var C=0;C<e.length;C++){if(""+e[C]===G){g=!0;break}}else g=""+e===G;d=l({selected:void 0,children:void 0},
  d,{selected:g,children:L})}}if(g=d){if(Pa[c]&&(null!=g.children||null!=g.dangerouslySetInnerHTML))throw Error(p(137,c));if(null!=g.dangerouslySetInnerHTML){if(null!=g.children)throw Error(p(60));if(!("object"===typeof g.dangerouslySetInnerHTML&&"__html"in g.dangerouslySetInnerHTML))throw Error(p(61));}if(null!=g.style&&"object"!==typeof g.style)throw Error(p(62));}g=d;e=this.makeStaticMarkup;L=1===this.stack.length;G="<"+a.type;b:if(-1===c.indexOf("-"))C="string"===typeof g.is;else switch(c){case "annotation-xml":case "color-profile":case "font-face":case "font-face-src":case "font-face-uri":case "font-face-format":case "font-face-name":case "missing-glyph":C=
  !1;break b;default:C=!0}for(w in g)if(Za.call(g,w)){var m=g[w];if(null!=m){if("style"===w){var k=void 0,v="",H="";for(k in m)if(m.hasOwnProperty(k)){var x=0===k.indexOf("--"),y=m[k];if(null!=y){if(x)var A=k;else if(A=k,Xa.hasOwnProperty(A))A=Xa[A];else{var eb=A.replace(Ra,"-$1").toLowerCase().replace(Sa,"-ms-");A=Xa[A]=eb}v+=H+A+":";H=k;x=null==y||"boolean"===typeof y||""===y?"":x||"number"!==typeof y||0===y||Y.hasOwnProperty(H)&&Y[H]?(""+y).trim():y+"px";v+=x;H=";"}}m=v||null}k=null;C?$a.hasOwnProperty(w)||
  (k=w,k=ta(k)&&null!=m?k+'="'+(O(m)+'"'):""):k=za(w,m);k&&(G+=" "+k)}}e||L&&(G+=' data-reactroot=""');var w=G;g="";Oa.hasOwnProperty(c)?w+="/>":(w+=">",g="</"+a.type+">");a:{e=d.dangerouslySetInnerHTML;if(null!=e){if(null!=e.__html){e=e.__html;break a}}else if(e=d.children,"string"===typeof e||"number"===typeof e){e=O(e);break a}e=null}null!=e?(d=[],Ua.hasOwnProperty(c)&&"\n"===e.charAt(0)&&(w+="\n"),w+=e):d=Z(d.children);a=a.type;f=null==f||"http://www.w3.org/1999/xhtml"===f?Na(a):"http://www.w3.org/2000/svg"===
  f&&"foreignObject"===a?"http://www.w3.org/1999/xhtml":f;this.stack.push({domNamespace:f,type:c,children:d,childIndex:0,context:b,footer:g});this.previousWasTextNode=!1;return w};return a}();function db(a,b){a.prototype=Object.create(b.prototype);a.prototype.constructor=a;a.__proto__=b}
  var fb=function(a){function b(b,c,h){var d=a.call(this,{})||this;d.partialRenderer=new cb(b,c,h);return d}db(b,a);var c=b.prototype;c._destroy=function(a,b){this.partialRenderer.destroy();b(a)};c._read=function(a){try{this.push(this.partialRenderer.read(a))}catch(f){this.destroy(f)}};return b}(aa.Readable);exports.renderToNodeStream=function(a,b){return new fb(a,!1,b)};exports.renderToStaticMarkup=function(a,b){a=new cb(a,!0,b);try{return a.read(Infinity)}finally{a.destroy()}};
  exports.renderToStaticNodeStream=function(a,b){return new fb(a,!0,b)};exports.renderToString=function(a,b){a=new cb(a,!1,b);try{return a.read(Infinity)}finally{a.destroy()}};exports.version="17.0.2";
  
  
  /***/ }),
  
  /***/ 1152:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {
  
  "use strict";
  
  
  module.exports = __webpack_require__(9680);
  
  
  /***/ }),
  
  /***/ 9680:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {
  
  "use strict";
  
  
  if (true) {
    module.exports = __webpack_require__(4798);
  } else {}
  
  
  /***/ }),
  
  /***/ 9590:
  /***/ ((module) => {
  
  /* global Map:readonly, Set:readonly, ArrayBuffer:readonly */
  
  var hasElementType = typeof Element !== 'undefined';
  var hasMap = typeof Map === 'function';
  var hasSet = typeof Set === 'function';
  var hasArrayBuffer = typeof ArrayBuffer === 'function' && !!ArrayBuffer.isView;
  
  // Note: We **don't** need `envHasBigInt64Array` in fde es6/index.js
  
  function equal(a, b) {
    // START: fast-deep-equal es6/index.js 3.1.1
    if (a === b) return true;
  
    if (a && b && typeof a == 'object' && typeof b == 'object') {
      if (a.constructor !== b.constructor) return false;
  
      var length, i, keys;
      if (Array.isArray(a)) {
        length = a.length;
        if (length != b.length) return false;
        for (i = length; i-- !== 0;)
          if (!equal(a[i], b[i])) return false;
        return true;
      }
  
      // START: Modifications:
      // 1. Extra `has<Type> &&` helpers in initial condition allow es6 code
      //    to co-exist with es5.
      // 2. Replace `for of` with es5 compliant iteration using `for`.
      //    Basically, take:
      //
      //    ```js
      //    for (i of a.entries())
      //      if (!b.has(i[0])) return false;
      //    ```
      //
      //    ... and convert to:
      //
      //    ```js
      //    it = a.entries();
      //    while (!(i = it.next()).done)
      //      if (!b.has(i.value[0])) return false;
      //    ```
      //
      //    **Note**: `i` access switches to `i.value`.
      var it;
      if (hasMap && (a instanceof Map) && (b instanceof Map)) {
        if (a.size !== b.size) return false;
        it = a.entries();
        while (!(i = it.next()).done)
          if (!b.has(i.value[0])) return false;
        it = a.entries();
        while (!(i = it.next()).done)
          if (!equal(i.value[1], b.get(i.value[0]))) return false;
        return true;
      }
  
      if (hasSet && (a instanceof Set) && (b instanceof Set)) {
        if (a.size !== b.size) return false;
        it = a.entries();
        while (!(i = it.next()).done)
          if (!b.has(i.value[0])) return false;
        return true;
      }
      // END: Modifications
  
      if (hasArrayBuffer && ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
        length = a.length;
        if (length != b.length) return false;
        for (i = length; i-- !== 0;)
          if (a[i] !== b[i]) return false;
        return true;
      }
  
      if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
      if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
      if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
  
      keys = Object.keys(a);
      length = keys.length;
      if (length !== Object.keys(b).length) return false;
  
      for (i = length; i-- !== 0;)
        if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
      // END: fast-deep-equal
  
      // START: react-fast-compare
      // custom handling for DOM elements
      if (hasElementType && a instanceof Element) return false;
  
      // custom handling for React/Preact
      for (i = length; i-- !== 0;) {
        if ((keys[i] === '_owner' || keys[i] === '__v' || keys[i] === '__o') && a.$$typeof) {
          // React-specific: avoid traversing React elements' _owner
          // Preact-specific: avoid traversing Preact elements' __v and __o
          //    __v = $_original / $_vnode
          //    __o = $_owner
          // These properties contain circular references and are not needed when
          // comparing the actual elements (and not their owners)
          // .$$typeof and ._store on just reasonable markers of elements
  
          continue;
        }
  
        // all other properties should be traversed as usual
        if (!equal(a[keys[i]], b[keys[i]])) return false;
      }
      // END: react-fast-compare
  
      // START: fast-deep-equal
      return true;
    }
  
    return a !== a && b !== b;
  }
  // end fast-deep-equal
  
  module.exports = function isEqual(a, b) {
    try {
      return equal(a, b);
    } catch (error) {
      if (((error.message || '').match(/stack|recursion/i))) {
        // warn on circular references, don't crash
        // browsers give this different errors name and messages:
        // chrome/safari: "RangeError", "Maximum call stack size exceeded"
        // firefox: "InternalError", too much recursion"
        // edge: "Error", "Out of stack space"
        console.warn('react-fast-compare cannot handle circular refs');
        return false;
      }
      // some other error. we should definitely know about these
      throw error;
    }
  };
  
  
  /***/ }),
  
  /***/ 4593:
  /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
  
  "use strict";
  __webpack_require__.r(__webpack_exports__);
  /* harmony export */ __webpack_require__.d(__webpack_exports__, {
  /* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
  /* harmony export */   "Helmet": () => (/* binding */ HelmetExport)
  /* harmony export */ });
  /* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(5697);
  /* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_4__);
  /* harmony import */ var react_side_effect__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3524);
  /* harmony import */ var react_side_effect__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_side_effect__WEBPACK_IMPORTED_MODULE_0__);
  /* harmony import */ var react_fast_compare__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9590);
  /* harmony import */ var react_fast_compare__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_fast_compare__WEBPACK_IMPORTED_MODULE_1__);
  /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7294);
  /* harmony import */ var object_assign__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(4852);
  /* harmony import */ var object_assign__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(object_assign__WEBPACK_IMPORTED_MODULE_3__);
  
  
  
  
  
  
  var ATTRIBUTE_NAMES = {
      BODY: "bodyAttributes",
      HTML: "htmlAttributes",
      TITLE: "titleAttributes"
  };
  
  var TAG_NAMES = {
      BASE: "base",
      BODY: "body",
      HEAD: "head",
      HTML: "html",
      LINK: "link",
      META: "meta",
      NOSCRIPT: "noscript",
      SCRIPT: "script",
      STYLE: "style",
      TITLE: "title"
  };
  
  var VALID_TAG_NAMES = Object.keys(TAG_NAMES).map(function (name) {
      return TAG_NAMES[name];
  });
  
  var TAG_PROPERTIES = {
      CHARSET: "charset",
      CSS_TEXT: "cssText",
      HREF: "href",
      HTTPEQUIV: "http-equiv",
      INNER_HTML: "innerHTML",
      ITEM_PROP: "itemprop",
      NAME: "name",
      PROPERTY: "property",
      REL: "rel",
      SRC: "src",
      TARGET: "target"
  };
  
  var REACT_TAG_MAP = {
      accesskey: "accessKey",
      charset: "charSet",
      class: "className",
      contenteditable: "contentEditable",
      contextmenu: "contextMenu",
      "http-equiv": "httpEquiv",
      itemprop: "itemProp",
      tabindex: "tabIndex"
  };
  
  var HELMET_PROPS = {
      DEFAULT_TITLE: "defaultTitle",
      DEFER: "defer",
      ENCODE_SPECIAL_CHARACTERS: "encodeSpecialCharacters",
      ON_CHANGE_CLIENT_STATE: "onChangeClientState",
      TITLE_TEMPLATE: "titleTemplate"
  };
  
  var HTML_TAG_MAP = Object.keys(REACT_TAG_MAP).reduce(function (obj, key) {
      obj[REACT_TAG_MAP[key]] = key;
      return obj;
  }, {});
  
  var SELF_CLOSING_TAGS = [TAG_NAMES.NOSCRIPT, TAG_NAMES.SCRIPT, TAG_NAMES.STYLE];
  
  var HELMET_ATTRIBUTE = "data-react-helmet";
  
  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };
  
  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };
  
  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }
  
    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();
  
  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
  
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
  
    return target;
  };
  
  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }
  
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };
  
  var objectWithoutProperties = function (obj, keys) {
    var target = {};
  
    for (var i in obj) {
      if (keys.indexOf(i) >= 0) continue;
      if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
      target[i] = obj[i];
    }
  
    return target;
  };
  
  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
  
    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };
  
  var encodeSpecialCharacters = function encodeSpecialCharacters(str) {
      var encode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  
      if (encode === false) {
          return String(str);
      }
  
      return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
  };
  
  var getTitleFromPropsList = function getTitleFromPropsList(propsList) {
      var innermostTitle = getInnermostProperty(propsList, TAG_NAMES.TITLE);
      var innermostTemplate = getInnermostProperty(propsList, HELMET_PROPS.TITLE_TEMPLATE);
  
      if (innermostTemplate && innermostTitle) {
          // use function arg to avoid need to escape $ characters
          return innermostTemplate.replace(/%s/g, function () {
              return Array.isArray(innermostTitle) ? innermostTitle.join("") : innermostTitle;
          });
      }
  
      var innermostDefaultTitle = getInnermostProperty(propsList, HELMET_PROPS.DEFAULT_TITLE);
  
      return innermostTitle || innermostDefaultTitle || undefined;
  };
  
  var getOnChangeClientState = function getOnChangeClientState(propsList) {
      return getInnermostProperty(propsList, HELMET_PROPS.ON_CHANGE_CLIENT_STATE) || function () {};
  };
  
  var getAttributesFromPropsList = function getAttributesFromPropsList(tagType, propsList) {
      return propsList.filter(function (props) {
          return typeof props[tagType] !== "undefined";
      }).map(function (props) {
          return props[tagType];
      }).reduce(function (tagAttrs, current) {
          return _extends({}, tagAttrs, current);
      }, {});
  };
  
  var getBaseTagFromPropsList = function getBaseTagFromPropsList(primaryAttributes, propsList) {
      return propsList.filter(function (props) {
          return typeof props[TAG_NAMES.BASE] !== "undefined";
      }).map(function (props) {
          return props[TAG_NAMES.BASE];
      }).reverse().reduce(function (innermostBaseTag, tag) {
          if (!innermostBaseTag.length) {
              var keys = Object.keys(tag);
  
              for (var i = 0; i < keys.length; i++) {
                  var attributeKey = keys[i];
                  var lowerCaseAttributeKey = attributeKey.toLowerCase();
  
                  if (primaryAttributes.indexOf(lowerCaseAttributeKey) !== -1 && tag[lowerCaseAttributeKey]) {
                      return innermostBaseTag.concat(tag);
                  }
              }
          }
  
          return innermostBaseTag;
      }, []);
  };
  
  var getTagsFromPropsList = function getTagsFromPropsList(tagName, primaryAttributes, propsList) {
      // Calculate list of tags, giving priority innermost component (end of the propslist)
      var approvedSeenTags = {};
  
      return propsList.filter(function (props) {
          if (Array.isArray(props[tagName])) {
              return true;
          }
          if (typeof props[tagName] !== "undefined") {
              warn("Helmet: " + tagName + " should be of type \"Array\". Instead found type \"" + _typeof(props[tagName]) + "\"");
          }
          return false;
      }).map(function (props) {
          return props[tagName];
      }).reverse().reduce(function (approvedTags, instanceTags) {
          var instanceSeenTags = {};
  
          instanceTags.filter(function (tag) {
              var primaryAttributeKey = void 0;
              var keys = Object.keys(tag);
              for (var i = 0; i < keys.length; i++) {
                  var attributeKey = keys[i];
                  var lowerCaseAttributeKey = attributeKey.toLowerCase();
  
                  // Special rule with link tags, since rel and href are both primary tags, rel takes priority
                  if (primaryAttributes.indexOf(lowerCaseAttributeKey) !== -1 && !(primaryAttributeKey === TAG_PROPERTIES.REL && tag[primaryAttributeKey].toLowerCase() === "canonical") && !(lowerCaseAttributeKey === TAG_PROPERTIES.REL && tag[lowerCaseAttributeKey].toLowerCase() === "stylesheet")) {
                      primaryAttributeKey = lowerCaseAttributeKey;
                  }
                  // Special case for innerHTML which doesn't work lowercased
                  if (primaryAttributes.indexOf(attributeKey) !== -1 && (attributeKey === TAG_PROPERTIES.INNER_HTML || attributeKey === TAG_PROPERTIES.CSS_TEXT || attributeKey === TAG_PROPERTIES.ITEM_PROP)) {
                      primaryAttributeKey = attributeKey;
                  }
              }
  
              if (!primaryAttributeKey || !tag[primaryAttributeKey]) {
                  return false;
              }
  
              var value = tag[primaryAttributeKey].toLowerCase();
  
              if (!approvedSeenTags[primaryAttributeKey]) {
                  approvedSeenTags[primaryAttributeKey] = {};
              }
  
              if (!instanceSeenTags[primaryAttributeKey]) {
                  instanceSeenTags[primaryAttributeKey] = {};
              }
  
              if (!approvedSeenTags[primaryAttributeKey][value]) {
                  instanceSeenTags[primaryAttributeKey][value] = true;
                  return true;
              }
  
              return false;
          }).reverse().forEach(function (tag) {
              return approvedTags.push(tag);
          });
  
          // Update seen tags with tags from this instance
          var keys = Object.keys(instanceSeenTags);
          for (var i = 0; i < keys.length; i++) {
              var attributeKey = keys[i];
              var tagUnion = object_assign__WEBPACK_IMPORTED_MODULE_3___default()({}, approvedSeenTags[attributeKey], instanceSeenTags[attributeKey]);
  
              approvedSeenTags[attributeKey] = tagUnion;
          }
  
          return approvedTags;
      }, []).reverse();
  };
  
  var getInnermostProperty = function getInnermostProperty(propsList, property) {
      for (var i = propsList.length - 1; i >= 0; i--) {
          var props = propsList[i];
  
          if (props.hasOwnProperty(property)) {
              return props[property];
          }
      }
  
      return null;
  };
  
  var reducePropsToState = function reducePropsToState(propsList) {
      return {
          baseTag: getBaseTagFromPropsList([TAG_PROPERTIES.HREF, TAG_PROPERTIES.TARGET], propsList),
          bodyAttributes: getAttributesFromPropsList(ATTRIBUTE_NAMES.BODY, propsList),
          defer: getInnermostProperty(propsList, HELMET_PROPS.DEFER),
          encode: getInnermostProperty(propsList, HELMET_PROPS.ENCODE_SPECIAL_CHARACTERS),
          htmlAttributes: getAttributesFromPropsList(ATTRIBUTE_NAMES.HTML, propsList),
          linkTags: getTagsFromPropsList(TAG_NAMES.LINK, [TAG_PROPERTIES.REL, TAG_PROPERTIES.HREF], propsList),
          metaTags: getTagsFromPropsList(TAG_NAMES.META, [TAG_PROPERTIES.NAME, TAG_PROPERTIES.CHARSET, TAG_PROPERTIES.HTTPEQUIV, TAG_PROPERTIES.PROPERTY, TAG_PROPERTIES.ITEM_PROP], propsList),
          noscriptTags: getTagsFromPropsList(TAG_NAMES.NOSCRIPT, [TAG_PROPERTIES.INNER_HTML], propsList),
          onChangeClientState: getOnChangeClientState(propsList),
          scriptTags: getTagsFromPropsList(TAG_NAMES.SCRIPT, [TAG_PROPERTIES.SRC, TAG_PROPERTIES.INNER_HTML], propsList),
          styleTags: getTagsFromPropsList(TAG_NAMES.STYLE, [TAG_PROPERTIES.CSS_TEXT], propsList),
          title: getTitleFromPropsList(propsList),
          titleAttributes: getAttributesFromPropsList(ATTRIBUTE_NAMES.TITLE, propsList)
      };
  };
  
  var rafPolyfill = function () {
      var clock = Date.now();
  
      return function (callback) {
          var currentTime = Date.now();
  
          if (currentTime - clock > 16) {
              clock = currentTime;
              callback(currentTime);
          } else {
              setTimeout(function () {
                  rafPolyfill(callback);
              }, 0);
          }
      };
  }();
  
  var cafPolyfill = function cafPolyfill(id) {
      return clearTimeout(id);
  };
  
  var requestAnimationFrame = typeof window !== "undefined" ? window.requestAnimationFrame && window.requestAnimationFrame.bind(window) || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || rafPolyfill : global.requestAnimationFrame || rafPolyfill;
  
  var cancelAnimationFrame = typeof window !== "undefined" ? window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || cafPolyfill : global.cancelAnimationFrame || cafPolyfill;
  
  var warn = function warn(msg) {
      return console && typeof console.warn === "function" && console.warn(msg);
  };
  
  var _helmetCallback = null;
  
  var handleClientStateChange = function handleClientStateChange(newState) {
      if (_helmetCallback) {
          cancelAnimationFrame(_helmetCallback);
      }
  
      if (newState.defer) {
          _helmetCallback = requestAnimationFrame(function () {
              commitTagChanges(newState, function () {
                  _helmetCallback = null;
              });
          });
      } else {
          commitTagChanges(newState);
          _helmetCallback = null;
      }
  };
  
  var commitTagChanges = function commitTagChanges(newState, cb) {
      var baseTag = newState.baseTag,
          bodyAttributes = newState.bodyAttributes,
          htmlAttributes = newState.htmlAttributes,
          linkTags = newState.linkTags,
          metaTags = newState.metaTags,
          noscriptTags = newState.noscriptTags,
          onChangeClientState = newState.onChangeClientState,
          scriptTags = newState.scriptTags,
          styleTags = newState.styleTags,
          title = newState.title,
          titleAttributes = newState.titleAttributes;
  
      updateAttributes(TAG_NAMES.BODY, bodyAttributes);
      updateAttributes(TAG_NAMES.HTML, htmlAttributes);
  
      updateTitle(title, titleAttributes);
  
      var tagUpdates = {
          baseTag: updateTags(TAG_NAMES.BASE, baseTag),
          linkTags: updateTags(TAG_NAMES.LINK, linkTags),
          metaTags: updateTags(TAG_NAMES.META, metaTags),
          noscriptTags: updateTags(TAG_NAMES.NOSCRIPT, noscriptTags),
          scriptTags: updateTags(TAG_NAMES.SCRIPT, scriptTags),
          styleTags: updateTags(TAG_NAMES.STYLE, styleTags)
      };
  
      var addedTags = {};
      var removedTags = {};
  
      Object.keys(tagUpdates).forEach(function (tagType) {
          var _tagUpdates$tagType = tagUpdates[tagType],
              newTags = _tagUpdates$tagType.newTags,
              oldTags = _tagUpdates$tagType.oldTags;
  
  
          if (newTags.length) {
              addedTags[tagType] = newTags;
          }
          if (oldTags.length) {
              removedTags[tagType] = tagUpdates[tagType].oldTags;
          }
      });
  
      cb && cb();
  
      onChangeClientState(newState, addedTags, removedTags);
  };
  
  var flattenArray = function flattenArray(possibleArray) {
      return Array.isArray(possibleArray) ? possibleArray.join("") : possibleArray;
  };
  
  var updateTitle = function updateTitle(title, attributes) {
      if (typeof title !== "undefined" && document.title !== title) {
          document.title = flattenArray(title);
      }
  
      updateAttributes(TAG_NAMES.TITLE, attributes);
  };
  
  var updateAttributes = function updateAttributes(tagName, attributes) {
      var elementTag = document.getElementsByTagName(tagName)[0];
  
      if (!elementTag) {
          return;
      }
  
      var helmetAttributeString = elementTag.getAttribute(HELMET_ATTRIBUTE);
      var helmetAttributes = helmetAttributeString ? helmetAttributeString.split(",") : [];
      var attributesToRemove = [].concat(helmetAttributes);
      var attributeKeys = Object.keys(attributes);
  
      for (var i = 0; i < attributeKeys.length; i++) {
          var attribute = attributeKeys[i];
          var value = attributes[attribute] || "";
  
          if (elementTag.getAttribute(attribute) !== value) {
              elementTag.setAttribute(attribute, value);
          }
  
          if (helmetAttributes.indexOf(attribute) === -1) {
              helmetAttributes.push(attribute);
          }
  
          var indexToSave = attributesToRemove.indexOf(attribute);
          if (indexToSave !== -1) {
              attributesToRemove.splice(indexToSave, 1);
          }
      }
  
      for (var _i = attributesToRemove.length - 1; _i >= 0; _i--) {
          elementTag.removeAttribute(attributesToRemove[_i]);
      }
  
      if (helmetAttributes.length === attributesToRemove.length) {
          elementTag.removeAttribute(HELMET_ATTRIBUTE);
      } else if (elementTag.getAttribute(HELMET_ATTRIBUTE) !== attributeKeys.join(",")) {
          elementTag.setAttribute(HELMET_ATTRIBUTE, attributeKeys.join(","));
      }
  };
  
  var updateTags = function updateTags(type, tags) {
      var headElement = document.head || document.querySelector(TAG_NAMES.HEAD);
      var tagNodes = headElement.querySelectorAll(type + "[" + HELMET_ATTRIBUTE + "]");
      var oldTags = Array.prototype.slice.call(tagNodes);
      var newTags = [];
      var indexToDelete = void 0;
  
      if (tags && tags.length) {
          tags.forEach(function (tag) {
              var newElement = document.createElement(type);
  
              for (var attribute in tag) {
                  if (tag.hasOwnProperty(attribute)) {
                      if (attribute === TAG_PROPERTIES.INNER_HTML) {
                          newElement.innerHTML = tag.innerHTML;
                      } else if (attribute === TAG_PROPERTIES.CSS_TEXT) {
                          if (newElement.styleSheet) {
                              newElement.styleSheet.cssText = tag.cssText;
                          } else {
                              newElement.appendChild(document.createTextNode(tag.cssText));
                          }
                      } else {
                          var value = typeof tag[attribute] === "undefined" ? "" : tag[attribute];
                          newElement.setAttribute(attribute, value);
                      }
                  }
              }
  
              newElement.setAttribute(HELMET_ATTRIBUTE, "true");
  
              // Remove a duplicate tag from domTagstoRemove, so it isn't cleared.
              if (oldTags.some(function (existingTag, index) {
                  indexToDelete = index;
                  return newElement.isEqualNode(existingTag);
              })) {
                  oldTags.splice(indexToDelete, 1);
              } else {
                  newTags.push(newElement);
              }
          });
      }
  
      oldTags.forEach(function (tag) {
          return tag.parentNode.removeChild(tag);
      });
      newTags.forEach(function (tag) {
          return headElement.appendChild(tag);
      });
  
      return {
          oldTags: oldTags,
          newTags: newTags
      };
  };
  
  var generateElementAttributesAsString = function generateElementAttributesAsString(attributes) {
      return Object.keys(attributes).reduce(function (str, key) {
          var attr = typeof attributes[key] !== "undefined" ? key + "=\"" + attributes[key] + "\"" : "" + key;
          return str ? str + " " + attr : attr;
      }, "");
  };
  
  var generateTitleAsString = function generateTitleAsString(type, title, attributes, encode) {
      var attributeString = generateElementAttributesAsString(attributes);
      var flattenedTitle = flattenArray(title);
      return attributeString ? "<" + type + " " + HELMET_ATTRIBUTE + "=\"true\" " + attributeString + ">" + encodeSpecialCharacters(flattenedTitle, encode) + "</" + type + ">" : "<" + type + " " + HELMET_ATTRIBUTE + "=\"true\">" + encodeSpecialCharacters(flattenedTitle, encode) + "</" + type + ">";
  };
  
  var generateTagsAsString = function generateTagsAsString(type, tags, encode) {
      return tags.reduce(function (str, tag) {
          var attributeHtml = Object.keys(tag).filter(function (attribute) {
              return !(attribute === TAG_PROPERTIES.INNER_HTML || attribute === TAG_PROPERTIES.CSS_TEXT);
          }).reduce(function (string, attribute) {
              var attr = typeof tag[attribute] === "undefined" ? attribute : attribute + "=\"" + encodeSpecialCharacters(tag[attribute], encode) + "\"";
              return string ? string + " " + attr : attr;
          }, "");
  
          var tagContent = tag.innerHTML || tag.cssText || "";
  
          var isSelfClosing = SELF_CLOSING_TAGS.indexOf(type) === -1;
  
          return str + "<" + type + " " + HELMET_ATTRIBUTE + "=\"true\" " + attributeHtml + (isSelfClosing ? "/>" : ">" + tagContent + "</" + type + ">");
      }, "");
  };
  
  var convertElementAttributestoReactProps = function convertElementAttributestoReactProps(attributes) {
      var initProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  
      return Object.keys(attributes).reduce(function (obj, key) {
          obj[REACT_TAG_MAP[key] || key] = attributes[key];
          return obj;
      }, initProps);
  };
  
  var convertReactPropstoHtmlAttributes = function convertReactPropstoHtmlAttributes(props) {
      var initAttributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  
      return Object.keys(props).reduce(function (obj, key) {
          obj[HTML_TAG_MAP[key] || key] = props[key];
          return obj;
      }, initAttributes);
  };
  
  var generateTitleAsReactComponent = function generateTitleAsReactComponent(type, title, attributes) {
      var _initProps;
  
      // assigning into an array to define toString function on it
      var initProps = (_initProps = {
          key: title
      }, _initProps[HELMET_ATTRIBUTE] = true, _initProps);
      var props = convertElementAttributestoReactProps(attributes, initProps);
  
      return [react__WEBPACK_IMPORTED_MODULE_2__.createElement(TAG_NAMES.TITLE, props, title)];
  };
  
  var generateTagsAsReactComponent = function generateTagsAsReactComponent(type, tags) {
      return tags.map(function (tag, i) {
          var _mappedTag;
  
          var mappedTag = (_mappedTag = {
              key: i
          }, _mappedTag[HELMET_ATTRIBUTE] = true, _mappedTag);
  
          Object.keys(tag).forEach(function (attribute) {
              var mappedAttribute = REACT_TAG_MAP[attribute] || attribute;
  
              if (mappedAttribute === TAG_PROPERTIES.INNER_HTML || mappedAttribute === TAG_PROPERTIES.CSS_TEXT) {
                  var content = tag.innerHTML || tag.cssText;
                  mappedTag.dangerouslySetInnerHTML = { __html: content };
              } else {
                  mappedTag[mappedAttribute] = tag[attribute];
              }
          });
  
          return react__WEBPACK_IMPORTED_MODULE_2__.createElement(type, mappedTag);
      });
  };
  
  var getMethodsForTag = function getMethodsForTag(type, tags, encode) {
      switch (type) {
          case TAG_NAMES.TITLE:
              return {
                  toComponent: function toComponent() {
                      return generateTitleAsReactComponent(type, tags.title, tags.titleAttributes, encode);
                  },
                  toString: function toString() {
                      return generateTitleAsString(type, tags.title, tags.titleAttributes, encode);
                  }
              };
          case ATTRIBUTE_NAMES.BODY:
          case ATTRIBUTE_NAMES.HTML:
              return {
                  toComponent: function toComponent() {
                      return convertElementAttributestoReactProps(tags);
                  },
                  toString: function toString() {
                      return generateElementAttributesAsString(tags);
                  }
              };
          default:
              return {
                  toComponent: function toComponent() {
                      return generateTagsAsReactComponent(type, tags);
                  },
                  toString: function toString() {
                      return generateTagsAsString(type, tags, encode);
                  }
              };
      }
  };
  
  var mapStateOnServer = function mapStateOnServer(_ref) {
      var baseTag = _ref.baseTag,
          bodyAttributes = _ref.bodyAttributes,
          encode = _ref.encode,
          htmlAttributes = _ref.htmlAttributes,
          linkTags = _ref.linkTags,
          metaTags = _ref.metaTags,
          noscriptTags = _ref.noscriptTags,
          scriptTags = _ref.scriptTags,
          styleTags = _ref.styleTags,
          _ref$title = _ref.title,
          title = _ref$title === undefined ? "" : _ref$title,
          titleAttributes = _ref.titleAttributes;
      return {
          base: getMethodsForTag(TAG_NAMES.BASE, baseTag, encode),
          bodyAttributes: getMethodsForTag(ATTRIBUTE_NAMES.BODY, bodyAttributes, encode),
          htmlAttributes: getMethodsForTag(ATTRIBUTE_NAMES.HTML, htmlAttributes, encode),
          link: getMethodsForTag(TAG_NAMES.LINK, linkTags, encode),
          meta: getMethodsForTag(TAG_NAMES.META, metaTags, encode),
          noscript: getMethodsForTag(TAG_NAMES.NOSCRIPT, noscriptTags, encode),
          script: getMethodsForTag(TAG_NAMES.SCRIPT, scriptTags, encode),
          style: getMethodsForTag(TAG_NAMES.STYLE, styleTags, encode),
          title: getMethodsForTag(TAG_NAMES.TITLE, { title: title, titleAttributes: titleAttributes }, encode)
      };
  };
  
  var Helmet = function Helmet(Component) {
      var _class, _temp;
  
      return _temp = _class = function (_React$Component) {
          inherits(HelmetWrapper, _React$Component);
  
          function HelmetWrapper() {
              classCallCheck(this, HelmetWrapper);
              return possibleConstructorReturn(this, _React$Component.apply(this, arguments));
          }
  
          HelmetWrapper.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps) {
              return !react_fast_compare__WEBPACK_IMPORTED_MODULE_1___default()(this.props, nextProps);
          };
  
          HelmetWrapper.prototype.mapNestedChildrenToProps = function mapNestedChildrenToProps(child, nestedChildren) {
              if (!nestedChildren) {
                  return null;
              }
  
              switch (child.type) {
                  case TAG_NAMES.SCRIPT:
                  case TAG_NAMES.NOSCRIPT:
                      return {
                          innerHTML: nestedChildren
                      };
  
                  case TAG_NAMES.STYLE:
                      return {
                          cssText: nestedChildren
                      };
              }
  
              throw new Error("<" + child.type + " /> elements are self-closing and can not contain children. Refer to our API for more information.");
          };
  
          HelmetWrapper.prototype.flattenArrayTypeChildren = function flattenArrayTypeChildren(_ref) {
              var _babelHelpers$extends;
  
              var child = _ref.child,
                  arrayTypeChildren = _ref.arrayTypeChildren,
                  newChildProps = _ref.newChildProps,
                  nestedChildren = _ref.nestedChildren;
  
              return _extends({}, arrayTypeChildren, (_babelHelpers$extends = {}, _babelHelpers$extends[child.type] = [].concat(arrayTypeChildren[child.type] || [], [_extends({}, newChildProps, this.mapNestedChildrenToProps(child, nestedChildren))]), _babelHelpers$extends));
          };
  
          HelmetWrapper.prototype.mapObjectTypeChildren = function mapObjectTypeChildren(_ref2) {
              var _babelHelpers$extends2, _babelHelpers$extends3;
  
              var child = _ref2.child,
                  newProps = _ref2.newProps,
                  newChildProps = _ref2.newChildProps,
                  nestedChildren = _ref2.nestedChildren;
  
              switch (child.type) {
                  case TAG_NAMES.TITLE:
                      return _extends({}, newProps, (_babelHelpers$extends2 = {}, _babelHelpers$extends2[child.type] = nestedChildren, _babelHelpers$extends2.titleAttributes = _extends({}, newChildProps), _babelHelpers$extends2));
  
                  case TAG_NAMES.BODY:
                      return _extends({}, newProps, {
                          bodyAttributes: _extends({}, newChildProps)
                      });
  
                  case TAG_NAMES.HTML:
                      return _extends({}, newProps, {
                          htmlAttributes: _extends({}, newChildProps)
                      });
              }
  
              return _extends({}, newProps, (_babelHelpers$extends3 = {}, _babelHelpers$extends3[child.type] = _extends({}, newChildProps), _babelHelpers$extends3));
          };
  
          HelmetWrapper.prototype.mapArrayTypeChildrenToProps = function mapArrayTypeChildrenToProps(arrayTypeChildren, newProps) {
              var newFlattenedProps = _extends({}, newProps);
  
              Object.keys(arrayTypeChildren).forEach(function (arrayChildName) {
                  var _babelHelpers$extends4;
  
                  newFlattenedProps = _extends({}, newFlattenedProps, (_babelHelpers$extends4 = {}, _babelHelpers$extends4[arrayChildName] = arrayTypeChildren[arrayChildName], _babelHelpers$extends4));
              });
  
              return newFlattenedProps;
          };
  
          HelmetWrapper.prototype.warnOnInvalidChildren = function warnOnInvalidChildren(child, nestedChildren) {
              if (false) {}
  
              return true;
          };
  
          HelmetWrapper.prototype.mapChildrenToProps = function mapChildrenToProps(children, newProps) {
              var _this2 = this;
  
              var arrayTypeChildren = {};
  
              react__WEBPACK_IMPORTED_MODULE_2__.Children.forEach(children, function (child) {
                  if (!child || !child.props) {
                      return;
                  }
  
                  var _child$props = child.props,
                      nestedChildren = _child$props.children,
                      childProps = objectWithoutProperties(_child$props, ["children"]);
  
                  var newChildProps = convertReactPropstoHtmlAttributes(childProps);
  
                  _this2.warnOnInvalidChildren(child, nestedChildren);
  
                  switch (child.type) {
                      case TAG_NAMES.LINK:
                      case TAG_NAMES.META:
                      case TAG_NAMES.NOSCRIPT:
                      case TAG_NAMES.SCRIPT:
                      case TAG_NAMES.STYLE:
                          arrayTypeChildren = _this2.flattenArrayTypeChildren({
                              child: child,
                              arrayTypeChildren: arrayTypeChildren,
                              newChildProps: newChildProps,
                              nestedChildren: nestedChildren
                          });
                          break;
  
                      default:
                          newProps = _this2.mapObjectTypeChildren({
                              child: child,
                              newProps: newProps,
                              newChildProps: newChildProps,
                              nestedChildren: nestedChildren
                          });
                          break;
                  }
              });
  
              newProps = this.mapArrayTypeChildrenToProps(arrayTypeChildren, newProps);
              return newProps;
          };
  
          HelmetWrapper.prototype.render = function render() {
              var _props = this.props,
                  children = _props.children,
                  props = objectWithoutProperties(_props, ["children"]);
  
              var newProps = _extends({}, props);
  
              if (children) {
                  newProps = this.mapChildrenToProps(children, newProps);
              }
  
              return react__WEBPACK_IMPORTED_MODULE_2__.createElement(Component, newProps);
          };
  
          createClass(HelmetWrapper, null, [{
              key: "canUseDOM",
  
  
              // Component.peek comes from react-side-effect:
              // For testing, you may use a static peek() method available on the returned component.
              // It lets you get the current state without resetting the mounted instance stack.
              // Don’t use it for anything other than testing.
  
              /**
               * @param {Object} base: {"target": "_blank", "href": "http://mysite.com/"}
               * @param {Object} bodyAttributes: {"className": "root"}
               * @param {String} defaultTitle: "Default Title"
               * @param {Boolean} defer: true
               * @param {Boolean} encodeSpecialCharacters: true
               * @param {Object} htmlAttributes: {"lang": "en", "amp": undefined}
               * @param {Array} link: [{"rel": "canonical", "href": "http://mysite.com/example"}]
               * @param {Array} meta: [{"name": "description", "content": "Test description"}]
               * @param {Array} noscript: [{"innerHTML": "<img src='http://mysite.com/js/test.js'"}]
               * @param {Function} onChangeClientState: "(newState) => console.log(newState)"
               * @param {Array} script: [{"type": "text/javascript", "src": "http://mysite.com/js/test.js"}]
               * @param {Array} style: [{"type": "text/css", "cssText": "div { display: block; color: blue; }"}]
               * @param {String} title: "Title"
               * @param {Object} titleAttributes: {"itemprop": "name"}
               * @param {String} titleTemplate: "MySite.com - %s"
               */
              set: function set$$1(canUseDOM) {
                  Component.canUseDOM = canUseDOM;
              }
          }]);
          return HelmetWrapper;
      }(react__WEBPACK_IMPORTED_MODULE_2__.Component), _class.propTypes = {
          base: (prop_types__WEBPACK_IMPORTED_MODULE_4___default().object),
          bodyAttributes: (prop_types__WEBPACK_IMPORTED_MODULE_4___default().object),
          children: prop_types__WEBPACK_IMPORTED_MODULE_4___default().oneOfType([prop_types__WEBPACK_IMPORTED_MODULE_4___default().arrayOf((prop_types__WEBPACK_IMPORTED_MODULE_4___default().node)), (prop_types__WEBPACK_IMPORTED_MODULE_4___default().node)]),
          defaultTitle: (prop_types__WEBPACK_IMPORTED_MODULE_4___default().string),
          defer: (prop_types__WEBPACK_IMPORTED_MODULE_4___default().bool),
          encodeSpecialCharacters: (prop_types__WEBPACK_IMPORTED_MODULE_4___default().bool),
          htmlAttributes: (prop_types__WEBPACK_IMPORTED_MODULE_4___default().object),
          link: prop_types__WEBPACK_IMPORTED_MODULE_4___default().arrayOf((prop_types__WEBPACK_IMPORTED_MODULE_4___default().object)),
          meta: prop_types__WEBPACK_IMPORTED_MODULE_4___default().arrayOf((prop_types__WEBPACK_IMPORTED_MODULE_4___default().object)),
          noscript: prop_types__WEBPACK_IMPORTED_MODULE_4___default().arrayOf((prop_types__WEBPACK_IMPORTED_MODULE_4___default().object)),
          onChangeClientState: (prop_types__WEBPACK_IMPORTED_MODULE_4___default().func),
          script: prop_types__WEBPACK_IMPORTED_MODULE_4___default().arrayOf((prop_types__WEBPACK_IMPORTED_MODULE_4___default().object)),
          style: prop_types__WEBPACK_IMPORTED_MODULE_4___default().arrayOf((prop_types__WEBPACK_IMPORTED_MODULE_4___default().object)),
          title: (prop_types__WEBPACK_IMPORTED_MODULE_4___default().string),
          titleAttributes: (prop_types__WEBPACK_IMPORTED_MODULE_4___default().object),
          titleTemplate: (prop_types__WEBPACK_IMPORTED_MODULE_4___default().string)
      }, _class.defaultProps = {
          defer: true,
          encodeSpecialCharacters: true
      }, _class.peek = Component.peek, _class.rewind = function () {
          var mappedState = Component.rewind();
          if (!mappedState) {
              // provide fallback if mappedState is undefined
              mappedState = mapStateOnServer({
                  baseTag: [],
                  bodyAttributes: {},
                  encodeSpecialCharacters: true,
                  htmlAttributes: {},
                  linkTags: [],
                  metaTags: [],
                  noscriptTags: [],
                  scriptTags: [],
                  styleTags: [],
                  title: "",
                  titleAttributes: {}
              });
          }
  
          return mappedState;
      }, _temp;
  };
  
  var NullComponent = function NullComponent() {
      return null;
  };
  
  var HelmetSideEffects = react_side_effect__WEBPACK_IMPORTED_MODULE_0___default()(reducePropsToState, handleClientStateChange, mapStateOnServer)(NullComponent);
  
  var HelmetExport = Helmet(HelmetSideEffects);
  HelmetExport.renderStatic = HelmetExport.rewind;
  
  /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (HelmetExport);
  
  
  
  /***/ }),
  
  /***/ 3524:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {
  
  "use strict";
  
  
  function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }
  
  var React = __webpack_require__(7294);
  var React__default = _interopDefault(React);
  
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
  
    return obj;
  }
  
  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }
  
  var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);
  function withSideEffect(reducePropsToState, handleStateChangeOnClient, mapStateOnServer) {
    if (typeof reducePropsToState !== 'function') {
      throw new Error('Expected reducePropsToState to be a function.');
    }
  
    if (typeof handleStateChangeOnClient !== 'function') {
      throw new Error('Expected handleStateChangeOnClient to be a function.');
    }
  
    if (typeof mapStateOnServer !== 'undefined' && typeof mapStateOnServer !== 'function') {
      throw new Error('Expected mapStateOnServer to either be undefined or a function.');
    }
  
    function getDisplayName(WrappedComponent) {
      return WrappedComponent.displayName || WrappedComponent.name || 'Component';
    }
  
    return function wrap(WrappedComponent) {
      if (typeof WrappedComponent !== 'function') {
        throw new Error('Expected WrappedComponent to be a React component.');
      }
  
      var mountedInstances = [];
      var state;
  
      function emitChange() {
        state = reducePropsToState(mountedInstances.map(function (instance) {
          return instance.props;
        }));
  
        if (SideEffect.canUseDOM) {
          handleStateChangeOnClient(state);
        } else if (mapStateOnServer) {
          state = mapStateOnServer(state);
        }
      }
  
      var SideEffect = /*#__PURE__*/function (_PureComponent) {
        _inheritsLoose(SideEffect, _PureComponent);
  
        function SideEffect() {
          return _PureComponent.apply(this, arguments) || this;
        }
  
        // Try to use displayName of wrapped component
        // Expose canUseDOM so tests can monkeypatch it
        SideEffect.peek = function peek() {
          return state;
        };
  
        SideEffect.rewind = function rewind() {
          if (SideEffect.canUseDOM) {
            throw new Error('You may only call rewind() on the server. Call peek() to read the current state.');
          }
  
          var recordedState = state;
          state = undefined;
          mountedInstances = [];
          return recordedState;
        };
  
        var _proto = SideEffect.prototype;
  
        _proto.UNSAFE_componentWillMount = function UNSAFE_componentWillMount() {
          mountedInstances.push(this);
          emitChange();
        };
  
        _proto.componentDidUpdate = function componentDidUpdate() {
          emitChange();
        };
  
        _proto.componentWillUnmount = function componentWillUnmount() {
          var index = mountedInstances.indexOf(this);
          mountedInstances.splice(index, 1);
          emitChange();
        };
  
        _proto.render = function render() {
          return /*#__PURE__*/React__default.createElement(WrappedComponent, this.props);
        };
  
        return SideEffect;
      }(React.PureComponent);
  
      _defineProperty(SideEffect, "displayName", "SideEffect(" + getDisplayName(WrappedComponent) + ")");
  
      _defineProperty(SideEffect, "canUseDOM", canUseDOM);
  
      return SideEffect;
    };
  }
  
  module.exports = withSideEffect;
  
  
  /***/ }),
  
  /***/ 2408:
  /***/ ((__unused_webpack_module, exports, __webpack_require__) => {
  
  "use strict";
  /** @license React v17.0.2
   * react.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  var l=__webpack_require__(4852),n=60103,p=60106;exports.Fragment=60107;exports.StrictMode=60108;exports.Profiler=60114;var q=60109,r=60110,t=60112;exports.Suspense=60113;var u=60115,v=60116;
  if("function"===typeof Symbol&&Symbol.for){var w=Symbol.for;n=w("react.element");p=w("react.portal");exports.Fragment=w("react.fragment");exports.StrictMode=w("react.strict_mode");exports.Profiler=w("react.profiler");q=w("react.provider");r=w("react.context");t=w("react.forward_ref");exports.Suspense=w("react.suspense");u=w("react.memo");v=w("react.lazy")}var x="function"===typeof Symbol&&Symbol.iterator;
  function y(a){if(null===a||"object"!==typeof a)return null;a=x&&a[x]||a["@@iterator"];return"function"===typeof a?a:null}function z(a){for(var b="https://reactjs.org/docs/error-decoder.html?invariant="+a,c=1;c<arguments.length;c++)b+="&args[]="+encodeURIComponent(arguments[c]);return"Minified React error #"+a+"; visit "+b+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}
  var A={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},B={};function C(a,b,c){this.props=a;this.context=b;this.refs=B;this.updater=c||A}C.prototype.isReactComponent={};C.prototype.setState=function(a,b){if("object"!==typeof a&&"function"!==typeof a&&null!=a)throw Error(z(85));this.updater.enqueueSetState(this,a,b,"setState")};C.prototype.forceUpdate=function(a){this.updater.enqueueForceUpdate(this,a,"forceUpdate")};
  function D(){}D.prototype=C.prototype;function E(a,b,c){this.props=a;this.context=b;this.refs=B;this.updater=c||A}var F=E.prototype=new D;F.constructor=E;l(F,C.prototype);F.isPureReactComponent=!0;var G={current:null},H=Object.prototype.hasOwnProperty,I={key:!0,ref:!0,__self:!0,__source:!0};
  function J(a,b,c){var e,d={},k=null,h=null;if(null!=b)for(e in void 0!==b.ref&&(h=b.ref),void 0!==b.key&&(k=""+b.key),b)H.call(b,e)&&!I.hasOwnProperty(e)&&(d[e]=b[e]);var g=arguments.length-2;if(1===g)d.children=c;else if(1<g){for(var f=Array(g),m=0;m<g;m++)f[m]=arguments[m+2];d.children=f}if(a&&a.defaultProps)for(e in g=a.defaultProps,g)void 0===d[e]&&(d[e]=g[e]);return{$$typeof:n,type:a,key:k,ref:h,props:d,_owner:G.current}}
  function K(a,b){return{$$typeof:n,type:a.type,key:b,ref:a.ref,props:a.props,_owner:a._owner}}function L(a){return"object"===typeof a&&null!==a&&a.$$typeof===n}function escape(a){var b={"=":"=0",":":"=2"};return"$"+a.replace(/[=:]/g,function(a){return b[a]})}var M=/\/+/g;function N(a,b){return"object"===typeof a&&null!==a&&null!=a.key?escape(""+a.key):b.toString(36)}
  function O(a,b,c,e,d){var k=typeof a;if("undefined"===k||"boolean"===k)a=null;var h=!1;if(null===a)h=!0;else switch(k){case "string":case "number":h=!0;break;case "object":switch(a.$$typeof){case n:case p:h=!0}}if(h)return h=a,d=d(h),a=""===e?"."+N(h,0):e,Array.isArray(d)?(c="",null!=a&&(c=a.replace(M,"$&/")+"/"),O(d,b,c,"",function(a){return a})):null!=d&&(L(d)&&(d=K(d,c+(!d.key||h&&h.key===d.key?"":(""+d.key).replace(M,"$&/")+"/")+a)),b.push(d)),1;h=0;e=""===e?".":e+":";if(Array.isArray(a))for(var g=
  0;g<a.length;g++){k=a[g];var f=e+N(k,g);h+=O(k,b,c,f,d)}else if(f=y(a),"function"===typeof f)for(a=f.call(a),g=0;!(k=a.next()).done;)k=k.value,f=e+N(k,g++),h+=O(k,b,c,f,d);else if("object"===k)throw b=""+a,Error(z(31,"[object Object]"===b?"object with keys {"+Object.keys(a).join(", ")+"}":b));return h}function P(a,b,c){if(null==a)return a;var e=[],d=0;O(a,e,"","",function(a){return b.call(c,a,d++)});return e}
  function Q(a){if(-1===a._status){var b=a._result;b=b();a._status=0;a._result=b;b.then(function(b){0===a._status&&(b=b.default,a._status=1,a._result=b)},function(b){0===a._status&&(a._status=2,a._result=b)})}if(1===a._status)return a._result;throw a._result;}var R={current:null};function S(){var a=R.current;if(null===a)throw Error(z(321));return a}var T={ReactCurrentDispatcher:R,ReactCurrentBatchConfig:{transition:0},ReactCurrentOwner:G,IsSomeRendererActing:{current:!1},assign:l};
  exports.Children={map:P,forEach:function(a,b,c){P(a,function(){b.apply(this,arguments)},c)},count:function(a){var b=0;P(a,function(){b++});return b},toArray:function(a){return P(a,function(a){return a})||[]},only:function(a){if(!L(a))throw Error(z(143));return a}};exports.Component=C;exports.PureComponent=E;exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=T;
  exports.cloneElement=function(a,b,c){if(null===a||void 0===a)throw Error(z(267,a));var e=l({},a.props),d=a.key,k=a.ref,h=a._owner;if(null!=b){void 0!==b.ref&&(k=b.ref,h=G.current);void 0!==b.key&&(d=""+b.key);if(a.type&&a.type.defaultProps)var g=a.type.defaultProps;for(f in b)H.call(b,f)&&!I.hasOwnProperty(f)&&(e[f]=void 0===b[f]&&void 0!==g?g[f]:b[f])}var f=arguments.length-2;if(1===f)e.children=c;else if(1<f){g=Array(f);for(var m=0;m<f;m++)g[m]=arguments[m+2];e.children=g}return{$$typeof:n,type:a.type,
  key:d,ref:k,props:e,_owner:h}};exports.createContext=function(a,b){void 0===b&&(b=null);a={$$typeof:r,_calculateChangedBits:b,_currentValue:a,_currentValue2:a,_threadCount:0,Provider:null,Consumer:null};a.Provider={$$typeof:q,_context:a};return a.Consumer=a};exports.createElement=J;exports.createFactory=function(a){var b=J.bind(null,a);b.type=a;return b};exports.createRef=function(){return{current:null}};exports.forwardRef=function(a){return{$$typeof:t,render:a}};exports.isValidElement=L;
  exports.lazy=function(a){return{$$typeof:v,_payload:{_status:-1,_result:a},_init:Q}};exports.memo=function(a,b){return{$$typeof:u,type:a,compare:void 0===b?null:b}};exports.useCallback=function(a,b){return S().useCallback(a,b)};exports.useContext=function(a,b){return S().useContext(a,b)};exports.useDebugValue=function(){};exports.useEffect=function(a,b){return S().useEffect(a,b)};exports.useImperativeHandle=function(a,b,c){return S().useImperativeHandle(a,b,c)};
  exports.useLayoutEffect=function(a,b){return S().useLayoutEffect(a,b)};exports.useMemo=function(a,b){return S().useMemo(a,b)};exports.useReducer=function(a,b,c){return S().useReducer(a,b,c)};exports.useRef=function(a){return S().useRef(a)};exports.useState=function(a){return S().useState(a)};exports.version="17.0.2";
  
  
  /***/ }),
  
  /***/ 7294:
  /***/ ((module, __unused_webpack_exports, __webpack_require__) => {
  
  "use strict";
  
  
  if (true) {
    module.exports = __webpack_require__(2408);
  } else {}
  
  
  /***/ }),
  
  /***/ 7147:
  /***/ ((module) => {
  
  "use strict";
  module.exports = require("fs");
  
  /***/ }),
  
  /***/ 3685:
  /***/ ((module) => {
  
  "use strict";
  module.exports = require("http");
  
  /***/ }),
  
  /***/ 5687:
  /***/ ((module) => {
  
  "use strict";
  module.exports = require("https");
  
  /***/ }),
  
  /***/ 1017:
  /***/ ((module) => {
  
  "use strict";
  module.exports = require("path");
  
  /***/ }),
  
  /***/ 5477:
  /***/ ((module) => {
  
  "use strict";
  module.exports = require("punycode");
  
  /***/ }),
  
  /***/ 2781:
  /***/ ((module) => {
  
  "use strict";
  module.exports = require("stream");
  
  /***/ }),
  
  /***/ 7310:
  /***/ ((module) => {
  
  "use strict";
  module.exports = require("url");
  
  /***/ }),
  
  /***/ 9796:
  /***/ ((module) => {
  
  "use strict";
  module.exports = require("zlib");
  
  /***/ }),
  
  /***/ 1741:
  /***/ ((module) => {
  
  "use strict";
  module.exports = JSON.parse('{"name":"gatsby","description":"Blazing fast modern site generator for React","version":"4.13.0-next.0-dev-1649964042186","author":"Kyle Mathews <mathews.kyle@gmail.com>","bin":{"gatsby":"./cli.js"},"bugs":{"url":"https://github.com/gatsbyjs/gatsby/issues"},"dependencies":{"@babel/code-frame":"^7.14.0","@babel/core":"^7.15.5","@babel/eslint-parser":"^7.15.4","@babel/helper-plugin-utils":"^7.14.5","@babel/parser":"^7.15.5","@babel/runtime":"^7.15.4","@babel/traverse":"^7.15.4","@babel/types":"^7.15.4","@gatsbyjs/reach-router":"^1.3.6","@gatsbyjs/webpack-hot-middleware":"^2.25.2","@nodelib/fs.walk":"^1.2.8","@parcel/config-default":"2.4.1","@parcel/core":"2.4.1","@pmmmwh/react-refresh-webpack-plugin":"^0.4.3","@types/http-proxy":"^1.17.7","@typescript-eslint/eslint-plugin":"^4.33.0","@typescript-eslint/parser":"^4.33.0","@vercel/webpack-asset-relocator-loader":"^1.7.0","address":"1.1.2","anser":"^2.1.0","autoprefixer":"^10.4.0","axios":"^0.21.1","babel-loader":"^8.2.3","babel-plugin-add-module-exports":"^1.0.4","babel-plugin-dynamic-import-node":"^2.3.3","babel-plugin-lodash":"^3.3.4","babel-plugin-remove-graphql-queries":"^4.13.0-next.0","babel-preset-gatsby":"^2.13.0-next.0","better-opn":"^2.1.1","bluebird":"^3.7.2","body-parser":"^1.19.0","browserslist":"^4.17.5","cache-manager":"^2.11.1","chalk":"^4.1.2","chokidar":"^3.5.2","common-tags":"^1.8.0","compression":"^1.7.4","cookie":"^0.4.1","core-js":"^3.17.2","cors":"^2.8.5","css-loader":"^5.2.7","css-minimizer-webpack-plugin":"^2.0.0","css.escape":"^1.5.1","date-fns":"^2.25.0","debug":"^3.2.7","deepmerge":"^4.2.2","detect-port":"^1.3.0","devcert":"^1.2.0","dotenv":"^8.6.0","enhanced-resolve":"^5.8.3","eslint":"^7.32.0","eslint-config-react-app":"^6.0.0","eslint-plugin-flowtype":"^5.10.0","eslint-plugin-graphql":"^4.0.0","eslint-plugin-import":"^2.25.4","eslint-plugin-jsx-a11y":"^6.5.1","eslint-plugin-react":"^7.29.4","eslint-plugin-react-hooks":"^4.4.0","eslint-webpack-plugin":"^2.6.0","event-source-polyfill":"^1.0.25","execa":"^5.1.1","express":"^4.17.1","express-graphql":"^0.12.0","fastest-levenshtein":"^1.0.12","fastq":"^1.13.0","file-loader":"^6.2.0","find-cache-dir":"^3.3.2","fs-exists-cached":"1.0.0","fs-extra":"^10.0.0","gatsby-cli":"^4.13.0-next.0","gatsby-core-utils":"^3.13.0-next.0","gatsby-graphiql-explorer":"^2.13.0-next.0","gatsby-legacy-polyfills":"^2.13.0-next.0","gatsby-link":"^4.13.0-next.0","gatsby-page-utils":"^2.13.0-next.0","gatsby-parcel-config":"^0.3.1","gatsby-plugin-page-creator":"^4.13.0-next.0","gatsby-plugin-typescript":"^4.13.0-next.0","gatsby-plugin-utils":"^3.7.0-next.0","gatsby-react-router-scroll":"^5.13.0-next.0","gatsby-telemetry":"^3.13.0-next.0","gatsby-worker":"^1.13.0-next.0","glob":"^7.2.0","globby":"^11.1.0","got":"^11.8.2","graphql":"^15.7.2","graphql-compose":"^9.0.7","graphql-playground-middleware-express":"^1.7.22","hasha":"^5.2.2","http-proxy":"^1.18.1","invariant":"^2.2.4","is-relative":"^1.0.0","is-relative-url":"^3.0.0","joi":"^17.4.2","json-loader":"^0.5.7","latest-version":"5.1.0","lmdb":"^2.2.3","lodash":"^4.17.21","md5-file":"^5.0.0","meant":"^1.0.3","memoizee":"^0.4.15","micromatch":"^4.0.4","mime":"^2.5.2","mini-css-extract-plugin":"1.6.2","mitt":"^1.2.0","moment":"^2.29.1","multer":"^1.4.3","node-fetch":"^2.6.6","normalize-path":"^3.0.0","null-loader":"^4.0.1","opentracing":"^0.14.5","p-defer":"^3.0.0","parcel":"2.4.1","parcel-resolver-render-page":"link:../../parcel/parcel-resolver-render-page.js","parseurl":"^1.3.3","physical-cpu-count":"^2.0.0","platform":"^1.3.6","postcss":"^8.3.11","postcss-flexbugs-fixes":"^5.0.2","postcss-loader":"^5.3.0","prompts":"^2.4.2","prop-types":"^15.7.2","query-string":"^6.14.1","raw-loader":"^4.0.2","react-dev-utils":"^11.0.4","react-refresh":"^0.9.0","redux":"4.1.2","redux-thunk":"^2.4.0","resolve-from":"^5.0.0","semver":"^7.3.5","shallow-compare":"^1.2.2","signal-exit":"^3.0.5","slugify":"^1.6.1","socket.io":"3.1.2","socket.io-client":"3.1.3","source-map":"^0.7.3","source-map-support":"^0.5.20","st":"^2.0.0","stack-trace":"^0.0.10","string-similarity":"^1.2.2","strip-ansi":"^6.0.1","style-loader":"^2.0.0","terser-webpack-plugin":"^5.2.4","tmp":"^0.2.1","true-case-path":"^2.2.1","type-of":"^2.0.1","url-loader":"^4.1.1","uuid":"^8.3.2","webpack":"^5.61.0","webpack-dev-middleware":"^4.3.0","webpack-merge":"^5.8.0","webpack-stats-plugin":"^1.0.3","webpack-virtual-modules":"^0.3.2","xstate":"^4.26.0","yaml-loader":"^0.6.0"},"devDependencies":{"@babel/cli":"^7.15.4","@babel/helper-plugin-utils":"^7.14.5","@babel/register":"^7.15.3","@types/eslint":"^8.2.1","@types/express":"^4.17.13","@types/micromatch":"^4.0.1","@types/normalize-path":"^3.0.0","@types/reach__router":"^1.3.5","@types/react-dom":"^17.0.9","@types/semver":"^7.3.9","@types/sharp":"^0.30.0","@types/signal-exit":"^3.0.0","@types/string-similarity":"^4.0.0","@types/tmp":"^0.2.0","@types/webpack-virtual-modules":"^0.1.1","babel-preset-gatsby-package":"^2.13.0-next.0","copyfiles":"^2.3.0","cross-env":"^7.0.3","documentation":"^13.1.0","react":"^16.12.0","react-dom":"^16.12.0","rimraf":"^3.0.2","typescript":"^4.5.5","xhr-mock":"^2.5.1","zipkin":"^0.22.0","zipkin-javascript-opentracing":"^3.0.0","zipkin-transport-http":"^0.22.0"},"optionalDependencies":{"gatsby-sharp":"^0.7.0-next.0"},"engines":{"node":">=14.15.0"},"files":["apis.json","ipc.json","cache-dir/","cli.js","dist/","graphql.js","graphql.d.ts","reporter.js","reporter.d.ts","index.d.ts","scripts/postinstall.js","utils.js","internal.js","internal.d.ts","webpack.js","webpack.d.ts","!**/__tests__/"],"homepage":"https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby#readme","keywords":["blog","generator","jekyll","markdown","react","ssg","website"],"license":"MIT","main":"cache-dir/commonjs/gatsby-browser-entry.js","module":"cache-dir/gatsby-browser-entry.js","peerDependencies":{"react":"^16.9.0 || ^17.0.0 || ^18.0.0","react-dom":"^16.9.0 || ^17.0.0 || ^18.0.0"},"repository":{"type":"git","url":"git+https://github.com/gatsbyjs/gatsby.git"},"resolutions":{"graphql":"^15.8.0","@mdx-js/mdx":"^2.0.0-next.3","@mdx-js/react":"^2.0.0-next.3","@mdx-js/runtime":"^2.0.0-next.3","remark-mdx":"2.0.0-next.7","remark-mdxjs":"^2.0.0-next.3"},"scripts":{"build":"npm run build:types && npm run build:src && npm run build:internal-plugins && npm run build:rawfiles && npm run build:cjs","postbuild":"node scripts/output-api-file.js","build:internal-plugins":"copyfiles -u 1 src/internal-plugins/**/package.json dist && copyfiles -u 1 src/internal-plugins/**/*.parcelrc dist && copyfiles -u 1 src/internal-plugins/**/*.json dist","build:rawfiles":"copyfiles -u 1 src/internal-plugins/**/raw_* dist","build:cjs":"babel cache-dir --out-dir cache-dir/commonjs --ignore \\"**/__tests__\\" --ignore \\"**/__mocks__\\" --ignore \\"*.parcelrc\\" && copyfiles -u 1 cache-dir/**/*.json cache-dir/commonjs","build:src":"babel src --out-dir dist --source-maps --verbose --ignore \\"**/gatsby-cli.js,src/internal-plugins/dev-404-page/raw_dev-404-page.js,**/__tests__,**/__mocks__,*.parcelrc\\" --extensions \\".ts,.js\\"","build:types":"tsc --emitDeclarationOnly --declaration --declarationDir dist && node scripts/check-declaration.js","clean-test-bundles":"find test/ -type f -name bundle.js* -exec rm -rf {} +","prebuild":"rimraf dist && rimraf cache-dir/commonjs","postinstall":"node scripts/postinstall.js","prepare":"cross-env NODE_ENV=production npm run build","watch":"rimraf dist && mkdir dist && npm run build:internal-plugins && npm run build:rawfiles && npm run build:src -- --watch","typecheck":"tsc --noEmit"},"types":"index.d.ts","yargs":{"boolean-negation":false}}');
  
  /***/ }),
  
  /***/ 9804:
  /***/ ((module) => {
  
  "use strict";
  module.exports = JSON.parse('{"polyfill":["/polyfill-67664a8ccc6c9f02b880.js"],"app":["/app-b758277424ce561ce707.js"],"component---src-pages-404-js":["/component---src-pages-404-js-27981ca7dd461cb4280e.js"],"component---src-pages-index-js":["/component---src-pages-index-js-c11a2e5652f60da891e2.js"],"component---src-pages-sort-slug-js":["/component---src-pages-sort-slug-js-4e0b700cf2e50c3492ec.js"],"component---src-pages-sort-title-js":["/component---src-pages-sort-title-js-93d3772e02f2ca77fd90.js"],"component---src-pages-ssr-js":["/component---src-pages-ssr-js-e226f309a108f5f3436f.js"],"component---src-pages-using-typescript-tsx":["/component---src-pages-using-typescript-tsx-2f9b97cf148785549d09.js"],"component---src-templates-blog-post-js":["/component---src-templates-blog-post-js-7845a2823b6da48a3671.js"],"component---src-templates-dsg-js":["/component---src-templates-dsg-js-0493d520d707871e77ea.js"]}');
  
  /***/ })
  
  /******/ 	});
  /************************************************************************/
  /******/ 	// The module cache
  /******/ 	var __webpack_module_cache__ = {};
  /******/ 	
  /******/ 	// The require function
  /******/ 	function __webpack_require__(moduleId) {
  /******/ 		// Check if module is in cache
  /******/ 		var cachedModule = __webpack_module_cache__[moduleId];
  /******/ 		if (cachedModule !== undefined) {
  /******/ 			return cachedModule.exports;
  /******/ 		}
  /******/ 		// Create a new module (and put it into the cache)
  /******/ 		var module = __webpack_module_cache__[moduleId] = {
  /******/ 			// no module.id needed
  /******/ 			// no module.loaded needed
  /******/ 			exports: {}
  /******/ 		};
  /******/ 	
  /******/ 		// Execute the module function
  /******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
  /******/ 	
  /******/ 		// Return the exports of the module
  /******/ 		return module.exports;
  /******/ 	}
  /******/ 	
  /******/ 	// expose the modules object (__webpack_modules__)
  /******/ 	__webpack_require__.m = __webpack_modules__;
  /******/ 	
  /************************************************************************/
  /******/ 	/* webpack/runtime/compat get default export */
  /******/ 	(() => {
  /******/ 		// getDefaultExport function for compatibility with non-harmony modules
  /******/ 		__webpack_require__.n = (module) => {
  /******/ 			var getter = module && module.__esModule ?
  /******/ 				() => (module['default']) :
  /******/ 				() => (module);
  /******/ 			__webpack_require__.d(getter, { a: getter });
  /******/ 			return getter;
  /******/ 		};
  /******/ 	})();
  /******/ 	
  /******/ 	/* webpack/runtime/define property getters */
  /******/ 	(() => {
  /******/ 		// define getter functions for harmony exports
  /******/ 		__webpack_require__.d = (exports, definition) => {
  /******/ 			for(var key in definition) {
  /******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
  /******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
  /******/ 				}
  /******/ 			}
  /******/ 		};
  /******/ 	})();
  /******/ 	
  /******/ 	/* webpack/runtime/ensure chunk */
  /******/ 	(() => {
  /******/ 		__webpack_require__.f = {};
  /******/ 		// This file contains only the entry chunk.
  /******/ 		// The chunk loading function for additional chunks
  /******/ 		__webpack_require__.e = (chunkId) => {
  /******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
  /******/ 				__webpack_require__.f[key](chunkId, promises);
  /******/ 				return promises;
  /******/ 			}, []));
  /******/ 		};
  /******/ 	})();
  /******/ 	
  /******/ 	/* webpack/runtime/get javascript chunk filename */
  /******/ 	(() => {
  /******/ 		// This function allow to reference async chunks
  /******/ 		__webpack_require__.u = (chunkId) => {
  /******/ 			// return url for filenames based on template
  /******/ 			return "" + {"448":"component---src-templates-dsg-js","479":"component---src-pages-ssr-js","579":"component---src-pages-sort-slug-js","675":"component---src-pages-sort-title-js","678":"component---src-pages-index-js","883":"component---src-pages-404-js","970":"component---src-pages-using-typescript-tsx","989":"component---src-templates-blog-post-js"}[chunkId] + ".js";
  /******/ 		};
  /******/ 	})();
  /******/ 	
  /******/ 	/* webpack/runtime/hasOwnProperty shorthand */
  /******/ 	(() => {
  /******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
  /******/ 	})();
  /******/ 	
  /******/ 	/* webpack/runtime/make namespace object */
  /******/ 	(() => {
  /******/ 		// define __esModule on exports
  /******/ 		__webpack_require__.r = (exports) => {
  /******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
  /******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
  /******/ 			}
  /******/ 			Object.defineProperty(exports, '__esModule', { value: true });
  /******/ 		};
  /******/ 	})();
  /******/ 	
  /******/ 	/* webpack/runtime/require chunk loading */
  /******/ 	(() => {
  /******/ 		// no baseURI
  /******/ 		
  /******/ 		// object to store loaded chunks
  /******/ 		// "1" means "loaded", otherwise not loaded yet
  /******/ 		var installedChunks = {
  /******/ 			418: 1
  /******/ 		};
  /******/ 		
  /******/ 		// no on chunks loaded
  /******/ 		
  /******/ 		var installChunk = (chunk) => {
  /******/ 			var moreModules = chunk.modules, chunkIds = chunk.ids, runtime = chunk.runtime;
  /******/ 			for(var moduleId in moreModules) {
  /******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
  /******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
  /******/ 				}
  /******/ 			}
  /******/ 			if(runtime) runtime(__webpack_require__);
  /******/ 			for(var i = 0; i < chunkIds.length; i++)
  /******/ 				installedChunks[chunkIds[i]] = 1;
  /******/ 		
  /******/ 		};
  /******/ 		
  /******/ 		// require() chunk loading for javascript
  /******/ 		__webpack_require__.f.require = (chunkId, promises) => {
  /******/ 			// "1" is the signal for "already loaded"
  /******/ 			if(!installedChunks[chunkId]) {
  /******/ 				if(true) { // all chunks have JS
  /******/ 					installChunk(require("./" + __webpack_require__.u(chunkId)));
  /******/ 				} else installedChunks[chunkId] = 1;
  /******/ 			}
  /******/ 		};
  /******/ 		
  /******/ 		// no external install chunk
  /******/ 		
  /******/ 		// no HMR
  /******/ 		
  /******/ 		// no HMR manifest
  /******/ 	})();
  /******/ 	
  /************************************************************************/
  var __webpack_exports__ = {};
  // This entry need to be wrapped in an IIFE because it need to be in strict mode.
  (() => {
  "use strict";
  __webpack_require__.r(__webpack_exports__);
  /* harmony export */ __webpack_require__.d(__webpack_exports__, {
  /* harmony export */   "sanitizeComponents": () => (/* binding */ sanitizeComponents),
  /* harmony export */   "default": () => (/* binding */ staticPage),
  /* harmony export */   "getPageChunk": () => (/* binding */ getPageChunk)
  /* harmony export */ });
  /* global HAS_REACT_18 */const React=__webpack_require__(7294);const path=__webpack_require__(1017);const{renderToString,renderToStaticMarkup,renderToPipeableStream}=__webpack_require__(1152);const{ServerLocation,Router,isRedirect}=__webpack_require__(3631);const merge=__webpack_require__(9996);const{StaticQueryContext}=__webpack_require__(7533);const fs=__webpack_require__(7147);const{WritableAsPromise}=__webpack_require__(1034);const{RouteAnnouncerProps}=__webpack_require__(236);const{apiRunner,apiRunnerAsync}=__webpack_require__(4067);const asyncRequires=__webpack_require__(5418);const{version:gatsbyVersion}=__webpack_require__(1741);const{grabMatchParams}=__webpack_require__(9755);const chunkMapping=__webpack_require__(9804);// we want to force posix-style joins, so Windows doesn't produce backslashes for urls
  const{join}=path.posix;// const testRequireError = require("./test-require-error")
  // For some extremely mysterious reason, webpack adds the above module *after*
  // this module so that when this code runs, testRequireError is undefined.
  // So in the meantime, we'll just inline it.
  const testRequireError=(moduleName,err)=>{const regex=new RegExp(`Error: Cannot find module\\s.${moduleName}`);const firstLine=err.toString().split(`\n`)[0];return regex.test(firstLine);};let Html;try{Html=__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module '../src/html'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));}catch(err){if(testRequireError(`../src/html`,err)){Html=__webpack_require__(9079);}else{throw err;}}Html=Html&&Html.__esModule?Html.default:Html;const getPageDataPath=path=>{const fixedPagePath=path===`/`?`index`:path;return join(`page-data`,fixedPagePath,`page-data.json`);};const getPageDataUrl=pagePath=>{const pageDataPath=getPageDataPath(pagePath);return`${""}/${pageDataPath}`;};const getStaticQueryPath=hash=>join(`page-data`,`sq`,`d`,`${hash}.json`);const getStaticQueryUrl=hash=>`${""}/${getStaticQueryPath(hash)}`;const getAppDataUrl=()=>`${""}/${join(`page-data`,`app-data.json`)}`;const createElement=React.createElement;const sanitizeComponents=components=>{const componentsArray=[].concat(components).flat(Infinity).filter(Boolean);return componentsArray.map(component=>{// Ensure manifest is always loaded from content server
  // And not asset server when an assetPrefix is used
  if(false){}return component;});};function deepMerge(a,b){const combineMerge=(target,source,options)=>{const destination=target.slice();source.forEach((item,index)=>{if(typeof destination[index]===`undefined`){destination[index]=options.cloneUnlessOtherwiseSpecified(item,options);}else if(options.isMergeableObject(item)){destination[index]=merge(target[index],item,options);}else if(target.indexOf(item)===-1){destination.push(item);}});return destination;};return merge(a,b,{arrayMerge:combineMerge});}async function staticPage({pagePath,pageData,staticQueryContext,styles,scripts,reversedStyles,reversedScripts,inlinePageData=false,webpackCompilationHash}){// for this to work we need this function to be sync or at least ensure there is single execution of it at a time
  global.unsafeBuiltinUsage=[];try{let bodyHtml=``;let headComponents=[/*#__PURE__*/React.createElement("meta",{name:"generator",content:`Gatsby ${gatsbyVersion}`,key:`generator-${gatsbyVersion}`})];let htmlAttributes={};let bodyAttributes={};let preBodyComponents=[];let postBodyComponents=[];let bodyProps={};function loadPageDataSync(_pagePath){if(_pagePath===pagePath){// no need to use fs if we are asking for pageData of current page
  return pageData;}const pageDataPath=getPageDataPath(_pagePath);const pageDataFile=join(process.cwd(),`public`,pageDataPath);try{// deprecation notice
  const myErrorHolder={name:`Usage of loadPageDataSync for page other than currently generated page disables incremental html generation in future builds`};Error.captureStackTrace(myErrorHolder,loadPageDataSync);global.unsafeBuiltinUsage.push(myErrorHolder.stack);const pageDataJson=fs.readFileSync(pageDataFile);return JSON.parse(pageDataJson);}catch(error){// not an error if file is not found. There's just no page data
  return null;}}const replaceBodyHTMLString=body=>{bodyHtml=body;};const setHeadComponents=components=>{headComponents=headComponents.concat(sanitizeComponents(components));};const setHtmlAttributes=attributes=>{// TODO - we should remove deep merges
  htmlAttributes=deepMerge(htmlAttributes,attributes);};const setBodyAttributes=attributes=>{// TODO - we should remove deep merges
  bodyAttributes=deepMerge(bodyAttributes,attributes);};const setPreBodyComponents=components=>{preBodyComponents=preBodyComponents.concat(sanitizeComponents(components));};const setPostBodyComponents=components=>{postBodyComponents=postBodyComponents.concat(sanitizeComponents(components));};const setBodyProps=props=>{// TODO - we should remove deep merges
  bodyProps=deepMerge({},bodyProps,props);};const getHeadComponents=()=>headComponents;const replaceHeadComponents=components=>{headComponents=sanitizeComponents(components);};const getPreBodyComponents=()=>preBodyComponents;const replacePreBodyComponents=components=>{preBodyComponents=sanitizeComponents(components);};const getPostBodyComponents=()=>postBodyComponents;const replacePostBodyComponents=components=>{postBodyComponents=sanitizeComponents(components);};const pageDataUrl=getPageDataUrl(pagePath);const{componentChunkName,staticQueryHashes=[]}=pageData;const pageComponent=await asyncRequires.components[componentChunkName]();const staticQueryUrls=staticQueryHashes.map(getStaticQueryUrl);class RouteHandler extends React.Component{render(){var _pageData$result,_pageData$result$page;const props={...this.props,...pageData.result,params:{...grabMatchParams(this.props.location.pathname),...(((_pageData$result=pageData.result)===null||_pageData$result===void 0?void 0:(_pageData$result$page=_pageData$result.pageContext)===null||_pageData$result$page===void 0?void 0:_pageData$result$page.__params)||{})}};const pageElement=createElement(pageComponent.default,props);const wrappedPage=apiRunner(`wrapPageElement`,{element:pageElement,props},pageElement,({result})=>{return{element:result,props};}).pop();return wrappedPage;}}const routerElement=/*#__PURE__*/React.createElement(ServerLocation,{url:`${""}${pagePath}`},/*#__PURE__*/React.createElement(Router,{id:"gatsby-focus-wrapper",baseuri:""},/*#__PURE__*/React.createElement(RouteHandler,{path:"/*"})),/*#__PURE__*/React.createElement("div",RouteAnnouncerProps));const bodyComponent=/*#__PURE__*/React.createElement(StaticQueryContext.Provider,{value:staticQueryContext},apiRunner(`wrapRootElement`,{element:routerElement,pathname:pagePath},routerElement,({result})=>{return{element:result,pathname:pagePath};}).pop());// Let the site or plugin render the page component.
  await apiRunnerAsync(`replaceRenderer`,{bodyComponent,replaceBodyHTMLString,setHeadComponents,setHtmlAttributes,setBodyAttributes,setPreBodyComponents,setPostBodyComponents,setBodyProps,pathname:pagePath,pathPrefix:""});// If no one stepped up, we'll handle it.
  if(!bodyHtml){try{// react 18 enabled
  if(false){}else{bodyHtml=renderToString(bodyComponent);}}catch(e){// ignore @reach/router redirect errors
  if(!isRedirect(e))throw e;}}apiRunner(`onRenderBody`,{setHeadComponents,setHtmlAttributes,setBodyAttributes,setPreBodyComponents,setPostBodyComponents,setBodyProps,pathname:pagePath,loadPageDataSync,bodyHtml,scripts,styles,pathPrefix:""});reversedScripts.forEach(script=>{// Add preload/prefetch <link>s for scripts.
  headComponents.push(/*#__PURE__*/React.createElement("link",{as:"script",rel:script.rel,key:script.name,href:`${""}/${script.name}`}));});if(pageData&&!inlinePageData){headComponents.push(/*#__PURE__*/React.createElement("link",{as:"fetch",rel:"preload",key:pageDataUrl,href:pageDataUrl,crossOrigin:"anonymous"}));}staticQueryUrls.forEach(staticQueryUrl=>headComponents.push(/*#__PURE__*/React.createElement("link",{as:"fetch",rel:"preload",key:staticQueryUrl,href:staticQueryUrl,crossOrigin:"anonymous"})));const appDataUrl=getAppDataUrl();if(appDataUrl){headComponents.push(/*#__PURE__*/React.createElement("link",{as:"fetch",rel:"preload",key:appDataUrl,href:appDataUrl,crossOrigin:"anonymous"}));}reversedStyles.forEach(style=>{// Add <link>s for styles that should be prefetched
  // otherwise, inline as a <style> tag
  if(style.rel===`prefetch`){headComponents.push(/*#__PURE__*/React.createElement("link",{as:"style",rel:style.rel,key:style.name,href:`${""}/${style.name}`}));}else{headComponents.unshift(/*#__PURE__*/React.createElement("style",{"data-href":`${""}/${style.name}`,"data-identity":`gatsby-global-css`,dangerouslySetInnerHTML:{__html:style.content}}));}});// Add page metadata for the current page
  const windowPageData=`/*<![CDATA[*/window.pagePath="${pagePath}";window.___webpackCompilationHash="${webpackCompilationHash}";${inlinePageData?`window.pageData=${JSON.stringify(pageData)};`:``}/*]]>*/`;postBodyComponents.push(/*#__PURE__*/React.createElement("script",{key:`script-loader`,id:`gatsby-script-loader`,dangerouslySetInnerHTML:{__html:windowPageData}}));// Add chunk mapping metadata
  const scriptChunkMapping=`/*<![CDATA[*/window.___chunkMapping=${JSON.stringify(chunkMapping)};/*]]>*/`;postBodyComponents.push(/*#__PURE__*/React.createElement("script",{key:`chunk-mapping`,id:`gatsby-chunk-mapping`,dangerouslySetInnerHTML:{__html:scriptChunkMapping}}));let bodyScripts=[];if(chunkMapping[`polyfill`]){chunkMapping[`polyfill`].forEach(script=>{const scriptPath=`${""}${script}`;bodyScripts.push(/*#__PURE__*/React.createElement("script",{key:scriptPath,src:scriptPath,noModule:true}));});}// Filter out prefetched bundles as adding them as a script tag
  // would force high priority fetching.
  bodyScripts=bodyScripts.concat(scripts.filter(s=>s.rel!==`prefetch`).map(s=>{const scriptPath=`${""}/${JSON.stringify(s.name).slice(1,-1)}`;return/*#__PURE__*/React.createElement("script",{key:scriptPath,src:scriptPath,async:true});}));postBodyComponents.push(...bodyScripts);// Reorder headComponents so meta tags are always at the top and aren't missed by crawlers
  // by being pushed down by large inline styles, etc.
  // https://github.com/gatsbyjs/gatsby/issues/22206
  headComponents.sort((a,b)=>{if(a.type&&a.type===`meta`){return-1;}return 0;});apiRunner(`onPreRenderHTML`,{getHeadComponents,replaceHeadComponents,getPreBodyComponents,replacePreBodyComponents,getPostBodyComponents,replacePostBodyComponents,pathname:pagePath,pathPrefix:""});const html=`<!DOCTYPE html>${renderToStaticMarkup(/*#__PURE__*/React.createElement(Html,Object.assign({},bodyProps,{headComponents:headComponents,htmlAttributes:htmlAttributes,bodyAttributes:bodyAttributes,preBodyComponents:preBodyComponents,postBodyComponents:postBodyComponents,body:bodyHtml,path:pagePath})))}`;return{html,unsafeBuiltinsUsage:global.unsafeBuiltinUsage};}catch(e){e.unsafeBuiltinsUsage=global.unsafeBuiltinUsage;throw e;}}function getPageChunk({componentChunkName}){return asyncRequires.components[componentChunkName]();}
  })();
  
  var __webpack_export_target__ = exports;
  for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
  if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
  /******/ })()
  ;
  //# sourceMappingURL=render-page.js.map