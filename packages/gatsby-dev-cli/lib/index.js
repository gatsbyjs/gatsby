System.register(['configstore', 'path', 'os', 'chokidar', 'del', 'fs-extra', 'find-yarn-workspace-root', 'verdaccio', 'node:path', 'node:os', 'signal-exit', 'execa', 'got', 'yargs'], (function () {
	'use strict';
	var Configstore, dirname, join, path$1, os$1, chokidar, del, readFileSync, outputFileSync, removeSync, fs, findWorkspaceRoot, start, path, os, signalExit, execa, got, argv;
	return {
		setters: [function (module) {
			Configstore = module.default;
		}, function (module) {
			dirname = module.dirname;
			join = module.join;
			path$1 = module.default;
		}, function (module) {
			os$1 = module.default;
		}, function (module) {
			chokidar = module.default;
		}, function (module) {
			del = module.default;
		}, function (module) {
			readFileSync = module.readFileSync;
			outputFileSync = module.outputFileSync;
			removeSync = module.removeSync;
			fs = module.default;
		}, function (module) {
			findWorkspaceRoot = module.default;
		}, function (module) {
			start = module.default;
		}, function (module) {
			path = module.default;
		}, function (module) {
			os = module.default;
		}, function (module) {
			signalExit = module.default;
		}, function (module) {
			execa = module.default;
		}, function (module) {
			got = module.default;
		}, function (module) {
			argv = module.default;
		}],
		execute: (function () {

			var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

			function getDefaultExportFromCjs (x) {
				return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
			}

			/** Used for built-in method references. */

			var objectProto$f = Object.prototype;

			/**
			 * Checks if `value` is likely a prototype object.
			 *
			 * @private
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
			 */
			function isPrototype$4(value) {
			  var Ctor = value && value.constructor,
			    proto = typeof Ctor == 'function' && Ctor.prototype || objectProto$f;
			  return value === proto;
			}
			var _isPrototype = isPrototype$4;

			/**
			 * Creates a unary function that invokes `func` with its argument transformed.
			 *
			 * @private
			 * @param {Function} func The function to wrap.
			 * @param {Function} transform The argument transform.
			 * @returns {Function} Returns the new function.
			 */

			function overArg$2(func, transform) {
			  return function (arg) {
			    return func(transform(arg));
			  };
			}
			var _overArg = overArg$2;

			var overArg$1 = _overArg;

			/* Built-in method references for those with the same name as other `lodash` methods. */
			var nativeKeys$1 = overArg$1(Object.keys, Object);
			var _nativeKeys = nativeKeys$1;

			var isPrototype$3 = _isPrototype,
			  nativeKeys = _nativeKeys;

			/** Used for built-in method references. */
			var objectProto$e = Object.prototype;

			/** Used to check objects for own properties. */
			var hasOwnProperty$c = objectProto$e.hasOwnProperty;

			/**
			 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
			 *
			 * @private
			 * @param {Object} object The object to query.
			 * @returns {Array} Returns the array of property names.
			 */
			function baseKeys$2(object) {
			  if (!isPrototype$3(object)) {
			    return nativeKeys(object);
			  }
			  var result = [];
			  for (var key in Object(object)) {
			    if (hasOwnProperty$c.call(object, key) && key != 'constructor') {
			      result.push(key);
			    }
			  }
			  return result;
			}
			var _baseKeys = baseKeys$2;

			/** Detect free variable `global` from Node.js. */

			var freeGlobal$1 = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
			var _freeGlobal = freeGlobal$1;

			var freeGlobal = _freeGlobal;

			/** Detect free variable `self`. */
			var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

			/** Used as a reference to the global object. */
			var root$8 = freeGlobal || freeSelf || Function('return this')();
			var _root = root$8;

			var root$7 = _root;

			/** Built-in value references. */
			var Symbol$5 = root$7.Symbol;
			var _Symbol = Symbol$5;

			var Symbol$4 = _Symbol;

			/** Used for built-in method references. */
			var objectProto$d = Object.prototype;

			/** Used to check objects for own properties. */
			var hasOwnProperty$b = objectProto$d.hasOwnProperty;

			/**
			 * Used to resolve the
			 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
			 * of values.
			 */
			var nativeObjectToString$1 = objectProto$d.toString;

			/** Built-in value references. */
			var symToStringTag$1 = Symbol$4 ? Symbol$4.toStringTag : undefined;

			/**
			 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
			 *
			 * @private
			 * @param {*} value The value to query.
			 * @returns {string} Returns the raw `toStringTag`.
			 */
			function getRawTag$1(value) {
			  var isOwn = hasOwnProperty$b.call(value, symToStringTag$1),
			    tag = value[symToStringTag$1];
			  try {
			    value[symToStringTag$1] = undefined;
			    var unmasked = true;
			  } catch (e) {}
			  var result = nativeObjectToString$1.call(value);
			  if (unmasked) {
			    if (isOwn) {
			      value[symToStringTag$1] = tag;
			    } else {
			      delete value[symToStringTag$1];
			    }
			  }
			  return result;
			}
			var _getRawTag = getRawTag$1;

			/** Used for built-in method references. */

			var objectProto$c = Object.prototype;

			/**
			 * Used to resolve the
			 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
			 * of values.
			 */
			var nativeObjectToString = objectProto$c.toString;

			/**
			 * Converts `value` to a string using `Object.prototype.toString`.
			 *
			 * @private
			 * @param {*} value The value to convert.
			 * @returns {string} Returns the converted string.
			 */
			function objectToString$1(value) {
			  return nativeObjectToString.call(value);
			}
			var _objectToString = objectToString$1;

			var Symbol$3 = _Symbol,
			  getRawTag = _getRawTag,
			  objectToString = _objectToString;

			/** `Object#toString` result references. */
			var nullTag = '[object Null]',
			  undefinedTag = '[object Undefined]';

			/** Built-in value references. */
			var symToStringTag = Symbol$3 ? Symbol$3.toStringTag : undefined;

			/**
			 * The base implementation of `getTag` without fallbacks for buggy environments.
			 *
			 * @private
			 * @param {*} value The value to query.
			 * @returns {string} Returns the `toStringTag`.
			 */
			function baseGetTag$7(value) {
			  if (value == null) {
			    return value === undefined ? undefinedTag : nullTag;
			  }
			  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
			}
			var _baseGetTag = baseGetTag$7;

			/**
			 * Checks if `value` is the
			 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
			 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
			 *
			 * @static
			 * @memberOf _
			 * @since 0.1.0
			 * @category Lang
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
			 * @example
			 *
			 * _.isObject({});
			 * // => true
			 *
			 * _.isObject([1, 2, 3]);
			 * // => true
			 *
			 * _.isObject(_.noop);
			 * // => true
			 *
			 * _.isObject(null);
			 * // => false
			 */

			function isObject$a(value) {
			  var type = typeof value;
			  return value != null && (type == 'object' || type == 'function');
			}
			var isObject_1 = isObject$a;

			var _isObject = /*@__PURE__*/getDefaultExportFromCjs(isObject_1);

			var baseGetTag$6 = _baseGetTag,
			  isObject$9 = isObject_1;

			/** `Object#toString` result references. */
			var asyncTag = '[object AsyncFunction]',
			  funcTag$1 = '[object Function]',
			  genTag = '[object GeneratorFunction]',
			  proxyTag = '[object Proxy]';

			/**
			 * Checks if `value` is classified as a `Function` object.
			 *
			 * @static
			 * @memberOf _
			 * @since 0.1.0
			 * @category Lang
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
			 * @example
			 *
			 * _.isFunction(_);
			 * // => true
			 *
			 * _.isFunction(/abc/);
			 * // => false
			 */
			function isFunction$4(value) {
			  if (!isObject$9(value)) {
			    return false;
			  }
			  // The use of `Object#toString` avoids issues with the `typeof` operator
			  // in Safari 9 which returns 'object' for typed arrays and other constructors.
			  var tag = baseGetTag$6(value);
			  return tag == funcTag$1 || tag == genTag || tag == asyncTag || tag == proxyTag;
			}
			var isFunction_1 = isFunction$4;

			var root$6 = _root;

			/** Used to detect overreaching core-js shims. */
			var coreJsData$1 = root$6['__core-js_shared__'];
			var _coreJsData = coreJsData$1;

			var coreJsData = _coreJsData;

			/** Used to detect methods masquerading as native. */
			var maskSrcKey = function () {
			  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
			  return uid ? 'Symbol(src)_1.' + uid : '';
			}();

			/**
			 * Checks if `func` has its source masked.
			 *
			 * @private
			 * @param {Function} func The function to check.
			 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
			 */
			function isMasked$1(func) {
			  return !!maskSrcKey && maskSrcKey in func;
			}
			var _isMasked = isMasked$1;

			/** Used for built-in method references. */

			var funcProto$2 = Function.prototype;

			/** Used to resolve the decompiled source of functions. */
			var funcToString$2 = funcProto$2.toString;

			/**
			 * Converts `func` to its source code.
			 *
			 * @private
			 * @param {Function} func The function to convert.
			 * @returns {string} Returns the source code.
			 */
			function toSource$2(func) {
			  if (func != null) {
			    try {
			      return funcToString$2.call(func);
			    } catch (e) {}
			    try {
			      return func + '';
			    } catch (e) {}
			  }
			  return '';
			}
			var _toSource = toSource$2;

			var isFunction$3 = isFunction_1,
			  isMasked = _isMasked,
			  isObject$8 = isObject_1,
			  toSource$1 = _toSource;

			/**
			 * Used to match `RegExp`
			 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
			 */
			var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

			/** Used to detect host constructors (Safari). */
			var reIsHostCtor = /^\[object .+?Constructor\]$/;

			/** Used for built-in method references. */
			var funcProto$1 = Function.prototype,
			  objectProto$b = Object.prototype;

			/** Used to resolve the decompiled source of functions. */
			var funcToString$1 = funcProto$1.toString;

			/** Used to check objects for own properties. */
			var hasOwnProperty$a = objectProto$b.hasOwnProperty;

			/** Used to detect if a method is native. */
			var reIsNative = RegExp('^' + funcToString$1.call(hasOwnProperty$a).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');

			/**
			 * The base implementation of `_.isNative` without bad shim checks.
			 *
			 * @private
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is a native function,
			 *  else `false`.
			 */
			function baseIsNative$1(value) {
			  if (!isObject$8(value) || isMasked(value)) {
			    return false;
			  }
			  var pattern = isFunction$3(value) ? reIsNative : reIsHostCtor;
			  return pattern.test(toSource$1(value));
			}
			var _baseIsNative = baseIsNative$1;

			/**
			 * Gets the value at `key` of `object`.
			 *
			 * @private
			 * @param {Object} [object] The object to query.
			 * @param {string} key The key of the property to get.
			 * @returns {*} Returns the property value.
			 */

			function getValue$1(object, key) {
			  return object == null ? undefined : object[key];
			}
			var _getValue = getValue$1;

			var baseIsNative = _baseIsNative,
			  getValue = _getValue;

			/**
			 * Gets the native function at `key` of `object`.
			 *
			 * @private
			 * @param {Object} object The object to query.
			 * @param {string} key The key of the method to get.
			 * @returns {*} Returns the function if it's native, else `undefined`.
			 */
			function getNative$7(object, key) {
			  var value = getValue(object, key);
			  return baseIsNative(value) ? value : undefined;
			}
			var _getNative = getNative$7;

			var getNative$6 = _getNative,
			  root$5 = _root;

			/* Built-in method references that are verified to be native. */
			var DataView$1 = getNative$6(root$5, 'DataView');
			var _DataView = DataView$1;

			var getNative$5 = _getNative,
			  root$4 = _root;

			/* Built-in method references that are verified to be native. */
			var Map$4 = getNative$5(root$4, 'Map');
			var _Map = Map$4;

			var getNative$4 = _getNative,
			  root$3 = _root;

			/* Built-in method references that are verified to be native. */
			var Promise$2 = getNative$4(root$3, 'Promise');
			var _Promise = Promise$2;

			var getNative$3 = _getNative,
			  root$2 = _root;

			/* Built-in method references that are verified to be native. */
			var Set$3 = getNative$3(root$2, 'Set');
			var _Set = Set$3;

			var getNative$2 = _getNative,
			  root$1 = _root;

			/* Built-in method references that are verified to be native. */
			var WeakMap$1 = getNative$2(root$1, 'WeakMap');
			var _WeakMap = WeakMap$1;

			var DataView = _DataView,
			  Map$3 = _Map,
			  Promise$1 = _Promise,
			  Set$2 = _Set,
			  WeakMap = _WeakMap,
			  baseGetTag$5 = _baseGetTag,
			  toSource = _toSource;

			/** `Object#toString` result references. */
			var mapTag$3 = '[object Map]',
			  objectTag$3 = '[object Object]',
			  promiseTag = '[object Promise]',
			  setTag$3 = '[object Set]',
			  weakMapTag$1 = '[object WeakMap]';
			var dataViewTag$2 = '[object DataView]';

			/** Used to detect maps, sets, and weakmaps. */
			var dataViewCtorString = toSource(DataView),
			  mapCtorString = toSource(Map$3),
			  promiseCtorString = toSource(Promise$1),
			  setCtorString = toSource(Set$2),
			  weakMapCtorString = toSource(WeakMap);

			/**
			 * Gets the `toStringTag` of `value`.
			 *
			 * @private
			 * @param {*} value The value to query.
			 * @returns {string} Returns the `toStringTag`.
			 */
			var getTag$2 = baseGetTag$5;

			// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
			if (DataView && getTag$2(new DataView(new ArrayBuffer(1))) != dataViewTag$2 || Map$3 && getTag$2(new Map$3()) != mapTag$3 || Promise$1 && getTag$2(Promise$1.resolve()) != promiseTag || Set$2 && getTag$2(new Set$2()) != setTag$3 || WeakMap && getTag$2(new WeakMap()) != weakMapTag$1) {
			  getTag$2 = function (value) {
			    var result = baseGetTag$5(value),
			      Ctor = result == objectTag$3 ? value.constructor : undefined,
			      ctorString = Ctor ? toSource(Ctor) : '';
			    if (ctorString) {
			      switch (ctorString) {
			        case dataViewCtorString:
			          return dataViewTag$2;
			        case mapCtorString:
			          return mapTag$3;
			        case promiseCtorString:
			          return promiseTag;
			        case setCtorString:
			          return setTag$3;
			        case weakMapCtorString:
			          return weakMapTag$1;
			      }
			    }
			    return result;
			  };
			}
			var _getTag = getTag$2;

			/**
			 * Checks if `value` is object-like. A value is object-like if it's not `null`
			 * and has a `typeof` result of "object".
			 *
			 * @static
			 * @memberOf _
			 * @since 4.0.0
			 * @category Lang
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
			 * @example
			 *
			 * _.isObjectLike({});
			 * // => true
			 *
			 * _.isObjectLike([1, 2, 3]);
			 * // => true
			 *
			 * _.isObjectLike(_.noop);
			 * // => false
			 *
			 * _.isObjectLike(null);
			 * // => false
			 */

			function isObjectLike$8(value) {
			  return value != null && typeof value == 'object';
			}
			var isObjectLike_1 = isObjectLike$8;

			var baseGetTag$4 = _baseGetTag,
			  isObjectLike$7 = isObjectLike_1;

			/** `Object#toString` result references. */
			var argsTag$2 = '[object Arguments]';

			/**
			 * The base implementation of `_.isArguments`.
			 *
			 * @private
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
			 */
			function baseIsArguments$1(value) {
			  return isObjectLike$7(value) && baseGetTag$4(value) == argsTag$2;
			}
			var _baseIsArguments = baseIsArguments$1;

			var baseIsArguments = _baseIsArguments,
			  isObjectLike$6 = isObjectLike_1;

			/** Used for built-in method references. */
			var objectProto$a = Object.prototype;

			/** Used to check objects for own properties. */
			var hasOwnProperty$9 = objectProto$a.hasOwnProperty;

			/** Built-in value references. */
			var propertyIsEnumerable$1 = objectProto$a.propertyIsEnumerable;

			/**
			 * Checks if `value` is likely an `arguments` object.
			 *
			 * @static
			 * @memberOf _
			 * @since 0.1.0
			 * @category Lang
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
			 *  else `false`.
			 * @example
			 *
			 * _.isArguments(function() { return arguments; }());
			 * // => true
			 *
			 * _.isArguments([1, 2, 3]);
			 * // => false
			 */
			var isArguments$5 = baseIsArguments(function () {
			  return arguments;
			}()) ? baseIsArguments : function (value) {
			  return isObjectLike$6(value) && hasOwnProperty$9.call(value, 'callee') && !propertyIsEnumerable$1.call(value, 'callee');
			};
			var isArguments_1 = isArguments$5;

			/**
			 * Checks if `value` is classified as an `Array` object.
			 *
			 * @static
			 * @memberOf _
			 * @since 0.1.0
			 * @category Lang
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
			 * @example
			 *
			 * _.isArray([1, 2, 3]);
			 * // => true
			 *
			 * _.isArray(document.body.children);
			 * // => false
			 *
			 * _.isArray('abc');
			 * // => false
			 *
			 * _.isArray(_.noop);
			 * // => false
			 */

			var isArray$e = Array.isArray;
			var isArray_1 = isArray$e;

			/** Used as references for various `Number` constants. */

			var MAX_SAFE_INTEGER$1 = 9007199254740991;

			/**
			 * Checks if `value` is a valid array-like length.
			 *
			 * **Note:** This method is loosely based on
			 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
			 *
			 * @static
			 * @memberOf _
			 * @since 4.0.0
			 * @category Lang
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
			 * @example
			 *
			 * _.isLength(3);
			 * // => true
			 *
			 * _.isLength(Number.MIN_VALUE);
			 * // => false
			 *
			 * _.isLength(Infinity);
			 * // => false
			 *
			 * _.isLength('3');
			 * // => false
			 */
			function isLength$3(value) {
			  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
			}
			var isLength_1 = isLength$3;

			var isFunction$2 = isFunction_1,
			  isLength$2 = isLength_1;

			/**
			 * Checks if `value` is array-like. A value is considered array-like if it's
			 * not a function and has a `value.length` that's an integer greater than or
			 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
			 *
			 * @static
			 * @memberOf _
			 * @since 4.0.0
			 * @category Lang
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
			 * @example
			 *
			 * _.isArrayLike([1, 2, 3]);
			 * // => true
			 *
			 * _.isArrayLike(document.body.children);
			 * // => true
			 *
			 * _.isArrayLike('abc');
			 * // => true
			 *
			 * _.isArrayLike(_.noop);
			 * // => false
			 */
			function isArrayLike$7(value) {
			  return value != null && isLength$2(value.length) && !isFunction$2(value);
			}
			var isArrayLike_1 = isArrayLike$7;

			var isBuffer$5 = {exports: {}};

			/**
			 * This method returns `false`.
			 *
			 * @static
			 * @memberOf _
			 * @since 4.13.0
			 * @category Util
			 * @returns {boolean} Returns `false`.
			 * @example
			 *
			 * _.times(2, _.stubFalse);
			 * // => [false, false]
			 */

			function stubFalse() {
			  return false;
			}
			var stubFalse_1 = stubFalse;

			isBuffer$5.exports;

			(function (module, exports) {
				var root = _root,
				  stubFalse = stubFalse_1;

				/** Detect free variable `exports`. */
				var freeExports = exports && !exports.nodeType && exports;

				/** Detect free variable `module`. */
				var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

				/** Detect the popular CommonJS extension `module.exports`. */
				var moduleExports = freeModule && freeModule.exports === freeExports;

				/** Built-in value references. */
				var Buffer = moduleExports ? root.Buffer : undefined;

				/* Built-in method references for those with the same name as other `lodash` methods. */
				var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

				/**
				 * Checks if `value` is a buffer.
				 *
				 * @static
				 * @memberOf _
				 * @since 4.3.0
				 * @category Lang
				 * @param {*} value The value to check.
				 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
				 * @example
				 *
				 * _.isBuffer(new Buffer(2));
				 * // => true
				 *
				 * _.isBuffer(new Uint8Array(2));
				 * // => false
				 */
				var isBuffer = nativeIsBuffer || stubFalse;
				module.exports = isBuffer; 
			} (isBuffer$5, isBuffer$5.exports));

			var isBufferExports = isBuffer$5.exports;

			var baseGetTag$3 = _baseGetTag,
			  isLength$1 = isLength_1,
			  isObjectLike$5 = isObjectLike_1;

			/** `Object#toString` result references. */
			var argsTag$1 = '[object Arguments]',
			  arrayTag$1 = '[object Array]',
			  boolTag$1 = '[object Boolean]',
			  dateTag$1 = '[object Date]',
			  errorTag$1 = '[object Error]',
			  funcTag = '[object Function]',
			  mapTag$2 = '[object Map]',
			  numberTag$1 = '[object Number]',
			  objectTag$2 = '[object Object]',
			  regexpTag$1 = '[object RegExp]',
			  setTag$2 = '[object Set]',
			  stringTag$2 = '[object String]',
			  weakMapTag = '[object WeakMap]';
			var arrayBufferTag$1 = '[object ArrayBuffer]',
			  dataViewTag$1 = '[object DataView]',
			  float32Tag = '[object Float32Array]',
			  float64Tag = '[object Float64Array]',
			  int8Tag = '[object Int8Array]',
			  int16Tag = '[object Int16Array]',
			  int32Tag = '[object Int32Array]',
			  uint8Tag = '[object Uint8Array]',
			  uint8ClampedTag = '[object Uint8ClampedArray]',
			  uint16Tag = '[object Uint16Array]',
			  uint32Tag = '[object Uint32Array]';

			/** Used to identify `toStringTag` values of typed arrays. */
			var typedArrayTags = {};
			typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
			typedArrayTags[argsTag$1] = typedArrayTags[arrayTag$1] = typedArrayTags[arrayBufferTag$1] = typedArrayTags[boolTag$1] = typedArrayTags[dataViewTag$1] = typedArrayTags[dateTag$1] = typedArrayTags[errorTag$1] = typedArrayTags[funcTag] = typedArrayTags[mapTag$2] = typedArrayTags[numberTag$1] = typedArrayTags[objectTag$2] = typedArrayTags[regexpTag$1] = typedArrayTags[setTag$2] = typedArrayTags[stringTag$2] = typedArrayTags[weakMapTag] = false;

			/**
			 * The base implementation of `_.isTypedArray` without Node.js optimizations.
			 *
			 * @private
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
			 */
			function baseIsTypedArray$1(value) {
			  return isObjectLike$5(value) && isLength$1(value.length) && !!typedArrayTags[baseGetTag$3(value)];
			}
			var _baseIsTypedArray = baseIsTypedArray$1;

			/**
			 * The base implementation of `_.unary` without support for storing metadata.
			 *
			 * @private
			 * @param {Function} func The function to cap arguments for.
			 * @returns {Function} Returns the new capped function.
			 */

			function baseUnary$3(func) {
			  return function (value) {
			    return func(value);
			  };
			}
			var _baseUnary = baseUnary$3;

			var _nodeUtil = {exports: {}};

			_nodeUtil.exports;

			(function (module, exports) {
				var freeGlobal = _freeGlobal;

				/** Detect free variable `exports`. */
				var freeExports = exports && !exports.nodeType && exports;

				/** Detect free variable `module`. */
				var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

				/** Detect the popular CommonJS extension `module.exports`. */
				var moduleExports = freeModule && freeModule.exports === freeExports;

				/** Detect free variable `process` from Node.js. */
				var freeProcess = moduleExports && freeGlobal.process;

				/** Used to access faster Node.js helpers. */
				var nodeUtil = function () {
				  try {
				    // Use `util.types` for Node.js 10+.
				    var types = freeModule && freeModule.require && freeModule.require('util').types;
				    if (types) {
				      return types;
				    }

				    // Legacy `process.binding('util')` for Node.js < 10.
				    return freeProcess && freeProcess.binding && freeProcess.binding('util');
				  } catch (e) {}
				}();
				module.exports = nodeUtil; 
			} (_nodeUtil, _nodeUtil.exports));

			var _nodeUtilExports = _nodeUtil.exports;

			var baseIsTypedArray = _baseIsTypedArray,
			  baseUnary$2 = _baseUnary,
			  nodeUtil = _nodeUtilExports;

			/* Node.js helper references. */
			var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

			/**
			 * Checks if `value` is classified as a typed array.
			 *
			 * @static
			 * @memberOf _
			 * @since 3.0.0
			 * @category Lang
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
			 * @example
			 *
			 * _.isTypedArray(new Uint8Array);
			 * // => true
			 *
			 * _.isTypedArray([]);
			 * // => false
			 */
			var isTypedArray$5 = nodeIsTypedArray ? baseUnary$2(nodeIsTypedArray) : baseIsTypedArray;
			var isTypedArray_1 = isTypedArray$5;

			var baseKeys$1 = _baseKeys,
			  getTag$1 = _getTag,
			  isArguments$4 = isArguments_1,
			  isArray$d = isArray_1,
			  isArrayLike$6 = isArrayLike_1,
			  isBuffer$4 = isBufferExports,
			  isPrototype$2 = _isPrototype,
			  isTypedArray$4 = isTypedArray_1;

			/** `Object#toString` result references. */
			var mapTag$1 = '[object Map]',
			  setTag$1 = '[object Set]';

			/** Used for built-in method references. */
			var objectProto$9 = Object.prototype;

			/** Used to check objects for own properties. */
			var hasOwnProperty$8 = objectProto$9.hasOwnProperty;

			/**
			 * Checks if `value` is an empty object, collection, map, or set.
			 *
			 * Objects are considered empty if they have no own enumerable string keyed
			 * properties.
			 *
			 * Array-like values such as `arguments` objects, arrays, buffers, strings, or
			 * jQuery-like collections are considered empty if they have a `length` of `0`.
			 * Similarly, maps and sets are considered empty if they have a `size` of `0`.
			 *
			 * @static
			 * @memberOf _
			 * @since 0.1.0
			 * @category Lang
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
			 * @example
			 *
			 * _.isEmpty(null);
			 * // => true
			 *
			 * _.isEmpty(true);
			 * // => true
			 *
			 * _.isEmpty(1);
			 * // => true
			 *
			 * _.isEmpty([1, 2, 3]);
			 * // => false
			 *
			 * _.isEmpty({ 'a': 1 });
			 * // => false
			 */
			function isEmpty(value) {
			  if (value == null) {
			    return true;
			  }
			  if (isArrayLike$6(value) && (isArray$d(value) || typeof value == 'string' || typeof value.splice == 'function' || isBuffer$4(value) || isTypedArray$4(value) || isArguments$4(value))) {
			    return !value.length;
			  }
			  var tag = getTag$1(value);
			  if (tag == mapTag$1 || tag == setTag$1) {
			    return !value.size;
			  }
			  if (isPrototype$2(value)) {
			    return !baseKeys$1(value).length;
			  }
			  for (var key in value) {
			    if (hasOwnProperty$8.call(value, key)) {
			      return false;
			    }
			  }
			  return true;
			}
			var isEmpty_1 = isEmpty;

			var _isEmpty = /*@__PURE__*/getDefaultExportFromCjs(isEmpty_1);

			/**
			 * Removes all key-value entries from the list cache.
			 *
			 * @private
			 * @name clear
			 * @memberOf ListCache
			 */

			function listCacheClear$1() {
			  this.__data__ = [];
			  this.size = 0;
			}
			var _listCacheClear = listCacheClear$1;

			/**
			 * Performs a
			 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
			 * comparison between two values to determine if they are equivalent.
			 *
			 * @static
			 * @memberOf _
			 * @since 4.0.0
			 * @category Lang
			 * @param {*} value The value to compare.
			 * @param {*} other The other value to compare.
			 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
			 * @example
			 *
			 * var object = { 'a': 1 };
			 * var other = { 'a': 1 };
			 *
			 * _.eq(object, object);
			 * // => true
			 *
			 * _.eq(object, other);
			 * // => false
			 *
			 * _.eq('a', 'a');
			 * // => true
			 *
			 * _.eq('a', Object('a'));
			 * // => false
			 *
			 * _.eq(NaN, NaN);
			 * // => true
			 */

			function eq$5(value, other) {
			  return value === other || value !== value && other !== other;
			}
			var eq_1 = eq$5;

			var eq$4 = eq_1;

			/**
			 * Gets the index at which the `key` is found in `array` of key-value pairs.
			 *
			 * @private
			 * @param {Array} array The array to inspect.
			 * @param {*} key The key to search for.
			 * @returns {number} Returns the index of the matched value, else `-1`.
			 */
			function assocIndexOf$4(array, key) {
			  var length = array.length;
			  while (length--) {
			    if (eq$4(array[length][0], key)) {
			      return length;
			    }
			  }
			  return -1;
			}
			var _assocIndexOf = assocIndexOf$4;

			var assocIndexOf$3 = _assocIndexOf;

			/** Used for built-in method references. */
			var arrayProto = Array.prototype;

			/** Built-in value references. */
			var splice = arrayProto.splice;

			/**
			 * Removes `key` and its value from the list cache.
			 *
			 * @private
			 * @name delete
			 * @memberOf ListCache
			 * @param {string} key The key of the value to remove.
			 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
			 */
			function listCacheDelete$1(key) {
			  var data = this.__data__,
			    index = assocIndexOf$3(data, key);
			  if (index < 0) {
			    return false;
			  }
			  var lastIndex = data.length - 1;
			  if (index == lastIndex) {
			    data.pop();
			  } else {
			    splice.call(data, index, 1);
			  }
			  --this.size;
			  return true;
			}
			var _listCacheDelete = listCacheDelete$1;

			var assocIndexOf$2 = _assocIndexOf;

			/**
			 * Gets the list cache value for `key`.
			 *
			 * @private
			 * @name get
			 * @memberOf ListCache
			 * @param {string} key The key of the value to get.
			 * @returns {*} Returns the entry value.
			 */
			function listCacheGet$1(key) {
			  var data = this.__data__,
			    index = assocIndexOf$2(data, key);
			  return index < 0 ? undefined : data[index][1];
			}
			var _listCacheGet = listCacheGet$1;

			var assocIndexOf$1 = _assocIndexOf;

			/**
			 * Checks if a list cache value for `key` exists.
			 *
			 * @private
			 * @name has
			 * @memberOf ListCache
			 * @param {string} key The key of the entry to check.
			 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
			 */
			function listCacheHas$1(key) {
			  return assocIndexOf$1(this.__data__, key) > -1;
			}
			var _listCacheHas = listCacheHas$1;

			var assocIndexOf = _assocIndexOf;

			/**
			 * Sets the list cache `key` to `value`.
			 *
			 * @private
			 * @name set
			 * @memberOf ListCache
			 * @param {string} key The key of the value to set.
			 * @param {*} value The value to set.
			 * @returns {Object} Returns the list cache instance.
			 */
			function listCacheSet$1(key, value) {
			  var data = this.__data__,
			    index = assocIndexOf(data, key);
			  if (index < 0) {
			    ++this.size;
			    data.push([key, value]);
			  } else {
			    data[index][1] = value;
			  }
			  return this;
			}
			var _listCacheSet = listCacheSet$1;

			var listCacheClear = _listCacheClear,
			  listCacheDelete = _listCacheDelete,
			  listCacheGet = _listCacheGet,
			  listCacheHas = _listCacheHas,
			  listCacheSet = _listCacheSet;

			/**
			 * Creates an list cache object.
			 *
			 * @private
			 * @constructor
			 * @param {Array} [entries] The key-value pairs to cache.
			 */
			function ListCache$4(entries) {
			  var index = -1,
			    length = entries == null ? 0 : entries.length;
			  this.clear();
			  while (++index < length) {
			    var entry = entries[index];
			    this.set(entry[0], entry[1]);
			  }
			}

			// Add methods to `ListCache`.
			ListCache$4.prototype.clear = listCacheClear;
			ListCache$4.prototype['delete'] = listCacheDelete;
			ListCache$4.prototype.get = listCacheGet;
			ListCache$4.prototype.has = listCacheHas;
			ListCache$4.prototype.set = listCacheSet;
			var _ListCache = ListCache$4;

			var ListCache$3 = _ListCache;

			/**
			 * Removes all key-value entries from the stack.
			 *
			 * @private
			 * @name clear
			 * @memberOf Stack
			 */
			function stackClear$1() {
			  this.__data__ = new ListCache$3();
			  this.size = 0;
			}
			var _stackClear = stackClear$1;

			/**
			 * Removes `key` and its value from the stack.
			 *
			 * @private
			 * @name delete
			 * @memberOf Stack
			 * @param {string} key The key of the value to remove.
			 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
			 */

			function stackDelete$1(key) {
			  var data = this.__data__,
			    result = data['delete'](key);
			  this.size = data.size;
			  return result;
			}
			var _stackDelete = stackDelete$1;

			/**
			 * Gets the stack value for `key`.
			 *
			 * @private
			 * @name get
			 * @memberOf Stack
			 * @param {string} key The key of the value to get.
			 * @returns {*} Returns the entry value.
			 */

			function stackGet$1(key) {
			  return this.__data__.get(key);
			}
			var _stackGet = stackGet$1;

			/**
			 * Checks if a stack value for `key` exists.
			 *
			 * @private
			 * @name has
			 * @memberOf Stack
			 * @param {string} key The key of the entry to check.
			 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
			 */

			function stackHas$1(key) {
			  return this.__data__.has(key);
			}
			var _stackHas = stackHas$1;

			var getNative$1 = _getNative;

			/* Built-in method references that are verified to be native. */
			var nativeCreate$4 = getNative$1(Object, 'create');
			var _nativeCreate = nativeCreate$4;

			var nativeCreate$3 = _nativeCreate;

			/**
			 * Removes all key-value entries from the hash.
			 *
			 * @private
			 * @name clear
			 * @memberOf Hash
			 */
			function hashClear$1() {
			  this.__data__ = nativeCreate$3 ? nativeCreate$3(null) : {};
			  this.size = 0;
			}
			var _hashClear = hashClear$1;

			/**
			 * Removes `key` and its value from the hash.
			 *
			 * @private
			 * @name delete
			 * @memberOf Hash
			 * @param {Object} hash The hash to modify.
			 * @param {string} key The key of the value to remove.
			 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
			 */

			function hashDelete$1(key) {
			  var result = this.has(key) && delete this.__data__[key];
			  this.size -= result ? 1 : 0;
			  return result;
			}
			var _hashDelete = hashDelete$1;

			var nativeCreate$2 = _nativeCreate;

			/** Used to stand-in for `undefined` hash values. */
			var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

			/** Used for built-in method references. */
			var objectProto$8 = Object.prototype;

			/** Used to check objects for own properties. */
			var hasOwnProperty$7 = objectProto$8.hasOwnProperty;

			/**
			 * Gets the hash value for `key`.
			 *
			 * @private
			 * @name get
			 * @memberOf Hash
			 * @param {string} key The key of the value to get.
			 * @returns {*} Returns the entry value.
			 */
			function hashGet$1(key) {
			  var data = this.__data__;
			  if (nativeCreate$2) {
			    var result = data[key];
			    return result === HASH_UNDEFINED$2 ? undefined : result;
			  }
			  return hasOwnProperty$7.call(data, key) ? data[key] : undefined;
			}
			var _hashGet = hashGet$1;

			var nativeCreate$1 = _nativeCreate;

			/** Used for built-in method references. */
			var objectProto$7 = Object.prototype;

			/** Used to check objects for own properties. */
			var hasOwnProperty$6 = objectProto$7.hasOwnProperty;

			/**
			 * Checks if a hash value for `key` exists.
			 *
			 * @private
			 * @name has
			 * @memberOf Hash
			 * @param {string} key The key of the entry to check.
			 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
			 */
			function hashHas$1(key) {
			  var data = this.__data__;
			  return nativeCreate$1 ? data[key] !== undefined : hasOwnProperty$6.call(data, key);
			}
			var _hashHas = hashHas$1;

			var nativeCreate = _nativeCreate;

			/** Used to stand-in for `undefined` hash values. */
			var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

			/**
			 * Sets the hash `key` to `value`.
			 *
			 * @private
			 * @name set
			 * @memberOf Hash
			 * @param {string} key The key of the value to set.
			 * @param {*} value The value to set.
			 * @returns {Object} Returns the hash instance.
			 */
			function hashSet$1(key, value) {
			  var data = this.__data__;
			  this.size += this.has(key) ? 0 : 1;
			  data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED$1 : value;
			  return this;
			}
			var _hashSet = hashSet$1;

			var hashClear = _hashClear,
			  hashDelete = _hashDelete,
			  hashGet = _hashGet,
			  hashHas = _hashHas,
			  hashSet = _hashSet;

			/**
			 * Creates a hash object.
			 *
			 * @private
			 * @constructor
			 * @param {Array} [entries] The key-value pairs to cache.
			 */
			function Hash$1(entries) {
			  var index = -1,
			    length = entries == null ? 0 : entries.length;
			  this.clear();
			  while (++index < length) {
			    var entry = entries[index];
			    this.set(entry[0], entry[1]);
			  }
			}

			// Add methods to `Hash`.
			Hash$1.prototype.clear = hashClear;
			Hash$1.prototype['delete'] = hashDelete;
			Hash$1.prototype.get = hashGet;
			Hash$1.prototype.has = hashHas;
			Hash$1.prototype.set = hashSet;
			var _Hash = Hash$1;

			var Hash = _Hash,
			  ListCache$2 = _ListCache,
			  Map$2 = _Map;

			/**
			 * Removes all key-value entries from the map.
			 *
			 * @private
			 * @name clear
			 * @memberOf MapCache
			 */
			function mapCacheClear$1() {
			  this.size = 0;
			  this.__data__ = {
			    'hash': new Hash(),
			    'map': new (Map$2 || ListCache$2)(),
			    'string': new Hash()
			  };
			}
			var _mapCacheClear = mapCacheClear$1;

			/**
			 * Checks if `value` is suitable for use as unique object key.
			 *
			 * @private
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
			 */

			function isKeyable$1(value) {
			  var type = typeof value;
			  return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
			}
			var _isKeyable = isKeyable$1;

			var isKeyable = _isKeyable;

			/**
			 * Gets the data for `map`.
			 *
			 * @private
			 * @param {Object} map The map to query.
			 * @param {string} key The reference key.
			 * @returns {*} Returns the map data.
			 */
			function getMapData$4(map, key) {
			  var data = map.__data__;
			  return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
			}
			var _getMapData = getMapData$4;

			var getMapData$3 = _getMapData;

			/**
			 * Removes `key` and its value from the map.
			 *
			 * @private
			 * @name delete
			 * @memberOf MapCache
			 * @param {string} key The key of the value to remove.
			 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
			 */
			function mapCacheDelete$1(key) {
			  var result = getMapData$3(this, key)['delete'](key);
			  this.size -= result ? 1 : 0;
			  return result;
			}
			var _mapCacheDelete = mapCacheDelete$1;

			var getMapData$2 = _getMapData;

			/**
			 * Gets the map value for `key`.
			 *
			 * @private
			 * @name get
			 * @memberOf MapCache
			 * @param {string} key The key of the value to get.
			 * @returns {*} Returns the entry value.
			 */
			function mapCacheGet$1(key) {
			  return getMapData$2(this, key).get(key);
			}
			var _mapCacheGet = mapCacheGet$1;

			var getMapData$1 = _getMapData;

			/**
			 * Checks if a map value for `key` exists.
			 *
			 * @private
			 * @name has
			 * @memberOf MapCache
			 * @param {string} key The key of the entry to check.
			 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
			 */
			function mapCacheHas$1(key) {
			  return getMapData$1(this, key).has(key);
			}
			var _mapCacheHas = mapCacheHas$1;

			var getMapData = _getMapData;

			/**
			 * Sets the map `key` to `value`.
			 *
			 * @private
			 * @name set
			 * @memberOf MapCache
			 * @param {string} key The key of the value to set.
			 * @param {*} value The value to set.
			 * @returns {Object} Returns the map cache instance.
			 */
			function mapCacheSet$1(key, value) {
			  var data = getMapData(this, key),
			    size = data.size;
			  data.set(key, value);
			  this.size += data.size == size ? 0 : 1;
			  return this;
			}
			var _mapCacheSet = mapCacheSet$1;

			var mapCacheClear = _mapCacheClear,
			  mapCacheDelete = _mapCacheDelete,
			  mapCacheGet = _mapCacheGet,
			  mapCacheHas = _mapCacheHas,
			  mapCacheSet = _mapCacheSet;

			/**
			 * Creates a map cache object to store key-value pairs.
			 *
			 * @private
			 * @constructor
			 * @param {Array} [entries] The key-value pairs to cache.
			 */
			function MapCache$3(entries) {
			  var index = -1,
			    length = entries == null ? 0 : entries.length;
			  this.clear();
			  while (++index < length) {
			    var entry = entries[index];
			    this.set(entry[0], entry[1]);
			  }
			}

			// Add methods to `MapCache`.
			MapCache$3.prototype.clear = mapCacheClear;
			MapCache$3.prototype['delete'] = mapCacheDelete;
			MapCache$3.prototype.get = mapCacheGet;
			MapCache$3.prototype.has = mapCacheHas;
			MapCache$3.prototype.set = mapCacheSet;
			var _MapCache = MapCache$3;

			var ListCache$1 = _ListCache,
			  Map$1 = _Map,
			  MapCache$2 = _MapCache;

			/** Used as the size to enable large array optimizations. */
			var LARGE_ARRAY_SIZE$2 = 200;

			/**
			 * Sets the stack `key` to `value`.
			 *
			 * @private
			 * @name set
			 * @memberOf Stack
			 * @param {string} key The key of the value to set.
			 * @param {*} value The value to set.
			 * @returns {Object} Returns the stack cache instance.
			 */
			function stackSet$1(key, value) {
			  var data = this.__data__;
			  if (data instanceof ListCache$1) {
			    var pairs = data.__data__;
			    if (!Map$1 || pairs.length < LARGE_ARRAY_SIZE$2 - 1) {
			      pairs.push([key, value]);
			      this.size = ++data.size;
			      return this;
			    }
			    data = this.__data__ = new MapCache$2(pairs);
			  }
			  data.set(key, value);
			  this.size = data.size;
			  return this;
			}
			var _stackSet = stackSet$1;

			var ListCache = _ListCache,
			  stackClear = _stackClear,
			  stackDelete = _stackDelete,
			  stackGet = _stackGet,
			  stackHas = _stackHas,
			  stackSet = _stackSet;

			/**
			 * Creates a stack cache object to store key-value pairs.
			 *
			 * @private
			 * @constructor
			 * @param {Array} [entries] The key-value pairs to cache.
			 */
			function Stack$3(entries) {
			  var data = this.__data__ = new ListCache(entries);
			  this.size = data.size;
			}

			// Add methods to `Stack`.
			Stack$3.prototype.clear = stackClear;
			Stack$3.prototype['delete'] = stackDelete;
			Stack$3.prototype.get = stackGet;
			Stack$3.prototype.has = stackHas;
			Stack$3.prototype.set = stackSet;
			var _Stack = Stack$3;

			var getNative = _getNative;
			var defineProperty$2 = function () {
			  try {
			    var func = getNative(Object, 'defineProperty');
			    func({}, '', {});
			    return func;
			  } catch (e) {}
			}();
			var _defineProperty = defineProperty$2;

			var defineProperty$1 = _defineProperty;

			/**
			 * The base implementation of `assignValue` and `assignMergeValue` without
			 * value checks.
			 *
			 * @private
			 * @param {Object} object The object to modify.
			 * @param {string} key The key of the property to assign.
			 * @param {*} value The value to assign.
			 */
			function baseAssignValue$3(object, key, value) {
			  if (key == '__proto__' && defineProperty$1) {
			    defineProperty$1(object, key, {
			      'configurable': true,
			      'enumerable': true,
			      'value': value,
			      'writable': true
			    });
			  } else {
			    object[key] = value;
			  }
			}
			var _baseAssignValue = baseAssignValue$3;

			var baseAssignValue$2 = _baseAssignValue,
			  eq$3 = eq_1;

			/**
			 * This function is like `assignValue` except that it doesn't assign
			 * `undefined` values.
			 *
			 * @private
			 * @param {Object} object The object to modify.
			 * @param {string} key The key of the property to assign.
			 * @param {*} value The value to assign.
			 */
			function assignMergeValue$2(object, key, value) {
			  if (value !== undefined && !eq$3(object[key], value) || value === undefined && !(key in object)) {
			    baseAssignValue$2(object, key, value);
			  }
			}
			var _assignMergeValue = assignMergeValue$2;

			/**
			 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
			 *
			 * @private
			 * @param {boolean} [fromRight] Specify iterating from right to left.
			 * @returns {Function} Returns the new base function.
			 */

			function createBaseFor$1(fromRight) {
			  return function (object, iteratee, keysFunc) {
			    var index = -1,
			      iterable = Object(object),
			      props = keysFunc(object),
			      length = props.length;
			    while (length--) {
			      var key = props[fromRight ? length : ++index];
			      if (iteratee(iterable[key], key, iterable) === false) {
			        break;
			      }
			    }
			    return object;
			  };
			}
			var _createBaseFor = createBaseFor$1;

			var createBaseFor = _createBaseFor;

			/**
			 * The base implementation of `baseForOwn` which iterates over `object`
			 * properties returned by `keysFunc` and invokes `iteratee` for each property.
			 * Iteratee functions may exit iteration early by explicitly returning `false`.
			 *
			 * @private
			 * @param {Object} object The object to iterate over.
			 * @param {Function} iteratee The function invoked per iteration.
			 * @param {Function} keysFunc The function to get the keys of `object`.
			 * @returns {Object} Returns `object`.
			 */
			var baseFor$2 = createBaseFor();
			var _baseFor = baseFor$2;

			var _cloneBuffer = {exports: {}};

			_cloneBuffer.exports;

			(function (module, exports) {
				var root = _root;

				/** Detect free variable `exports`. */
				var freeExports = exports && !exports.nodeType && exports;

				/** Detect free variable `module`. */
				var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

				/** Detect the popular CommonJS extension `module.exports`. */
				var moduleExports = freeModule && freeModule.exports === freeExports;

				/** Built-in value references. */
				var Buffer = moduleExports ? root.Buffer : undefined,
				  allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

				/**
				 * Creates a clone of  `buffer`.
				 *
				 * @private
				 * @param {Buffer} buffer The buffer to clone.
				 * @param {boolean} [isDeep] Specify a deep clone.
				 * @returns {Buffer} Returns the cloned buffer.
				 */
				function cloneBuffer(buffer, isDeep) {
				  if (isDeep) {
				    return buffer.slice();
				  }
				  var length = buffer.length,
				    result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
				  buffer.copy(result);
				  return result;
				}
				module.exports = cloneBuffer; 
			} (_cloneBuffer, _cloneBuffer.exports));

			var _cloneBufferExports = _cloneBuffer.exports;

			var root = _root;

			/** Built-in value references. */
			var Uint8Array$2 = root.Uint8Array;
			var _Uint8Array = Uint8Array$2;

			var Uint8Array$1 = _Uint8Array;

			/**
			 * Creates a clone of `arrayBuffer`.
			 *
			 * @private
			 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
			 * @returns {ArrayBuffer} Returns the cloned array buffer.
			 */
			function cloneArrayBuffer$1(arrayBuffer) {
			  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
			  new Uint8Array$1(result).set(new Uint8Array$1(arrayBuffer));
			  return result;
			}
			var _cloneArrayBuffer = cloneArrayBuffer$1;

			var cloneArrayBuffer = _cloneArrayBuffer;

			/**
			 * Creates a clone of `typedArray`.
			 *
			 * @private
			 * @param {Object} typedArray The typed array to clone.
			 * @param {boolean} [isDeep] Specify a deep clone.
			 * @returns {Object} Returns the cloned typed array.
			 */
			function cloneTypedArray$1(typedArray, isDeep) {
			  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
			  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
			}
			var _cloneTypedArray = cloneTypedArray$1;

			/**
			 * Copies the values of `source` to `array`.
			 *
			 * @private
			 * @param {Array} source The array to copy values from.
			 * @param {Array} [array=[]] The array to copy values to.
			 * @returns {Array} Returns `array`.
			 */

			function copyArray$1(source, array) {
			  var index = -1,
			    length = source.length;
			  array || (array = Array(length));
			  while (++index < length) {
			    array[index] = source[index];
			  }
			  return array;
			}
			var _copyArray = copyArray$1;

			var isObject$7 = isObject_1;

			/** Built-in value references. */
			var objectCreate = Object.create;

			/**
			 * The base implementation of `_.create` without support for assigning
			 * properties to the created object.
			 *
			 * @private
			 * @param {Object} proto The object to inherit from.
			 * @returns {Object} Returns the new object.
			 */
			var baseCreate$2 = function () {
			  function object() {}
			  return function (proto) {
			    if (!isObject$7(proto)) {
			      return {};
			    }
			    if (objectCreate) {
			      return objectCreate(proto);
			    }
			    object.prototype = proto;
			    var result = new object();
			    object.prototype = undefined;
			    return result;
			  };
			}();
			var _baseCreate = baseCreate$2;

			var overArg = _overArg;

			/** Built-in value references. */
			var getPrototype$3 = overArg(Object.getPrototypeOf, Object);
			var _getPrototype = getPrototype$3;

			var baseCreate$1 = _baseCreate,
			  getPrototype$2 = _getPrototype,
			  isPrototype$1 = _isPrototype;

			/**
			 * Initializes an object clone.
			 *
			 * @private
			 * @param {Object} object The object to clone.
			 * @returns {Object} Returns the initialized clone.
			 */
			function initCloneObject$1(object) {
			  return typeof object.constructor == 'function' && !isPrototype$1(object) ? baseCreate$1(getPrototype$2(object)) : {};
			}
			var _initCloneObject = initCloneObject$1;

			var isArrayLike$5 = isArrayLike_1,
			  isObjectLike$4 = isObjectLike_1;

			/**
			 * This method is like `_.isArrayLike` except that it also checks if `value`
			 * is an object.
			 *
			 * @static
			 * @memberOf _
			 * @since 4.0.0
			 * @category Lang
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is an array-like object,
			 *  else `false`.
			 * @example
			 *
			 * _.isArrayLikeObject([1, 2, 3]);
			 * // => true
			 *
			 * _.isArrayLikeObject(document.body.children);
			 * // => true
			 *
			 * _.isArrayLikeObject('abc');
			 * // => false
			 *
			 * _.isArrayLikeObject(_.noop);
			 * // => false
			 */
			function isArrayLikeObject$3(value) {
			  return isObjectLike$4(value) && isArrayLike$5(value);
			}
			var isArrayLikeObject_1 = isArrayLikeObject$3;

			var baseGetTag$2 = _baseGetTag,
			  getPrototype$1 = _getPrototype,
			  isObjectLike$3 = isObjectLike_1;

			/** `Object#toString` result references. */
			var objectTag$1 = '[object Object]';

			/** Used for built-in method references. */
			var funcProto = Function.prototype,
			  objectProto$6 = Object.prototype;

			/** Used to resolve the decompiled source of functions. */
			var funcToString = funcProto.toString;

			/** Used to check objects for own properties. */
			var hasOwnProperty$5 = objectProto$6.hasOwnProperty;

			/** Used to infer the `Object` constructor. */
			var objectCtorString = funcToString.call(Object);

			/**
			 * Checks if `value` is a plain object, that is, an object created by the
			 * `Object` constructor or one with a `[[Prototype]]` of `null`.
			 *
			 * @static
			 * @memberOf _
			 * @since 0.8.0
			 * @category Lang
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
			 * @example
			 *
			 * function Foo() {
			 *   this.a = 1;
			 * }
			 *
			 * _.isPlainObject(new Foo);
			 * // => false
			 *
			 * _.isPlainObject([1, 2, 3]);
			 * // => false
			 *
			 * _.isPlainObject({ 'x': 0, 'y': 0 });
			 * // => true
			 *
			 * _.isPlainObject(Object.create(null));
			 * // => true
			 */
			function isPlainObject$1(value) {
			  if (!isObjectLike$3(value) || baseGetTag$2(value) != objectTag$1) {
			    return false;
			  }
			  var proto = getPrototype$1(value);
			  if (proto === null) {
			    return true;
			  }
			  var Ctor = hasOwnProperty$5.call(proto, 'constructor') && proto.constructor;
			  return typeof Ctor == 'function' && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
			}
			var isPlainObject_1 = isPlainObject$1;

			/**
			 * Gets the value at `key`, unless `key` is "__proto__" or "constructor".
			 *
			 * @private
			 * @param {Object} object The object to query.
			 * @param {string} key The key of the property to get.
			 * @returns {*} Returns the property value.
			 */

			function safeGet$2(object, key) {
			  if (key === 'constructor' && typeof object[key] === 'function') {
			    return;
			  }
			  if (key == '__proto__') {
			    return;
			  }
			  return object[key];
			}
			var _safeGet = safeGet$2;

			var baseAssignValue$1 = _baseAssignValue,
			  eq$2 = eq_1;

			/** Used for built-in method references. */
			var objectProto$5 = Object.prototype;

			/** Used to check objects for own properties. */
			var hasOwnProperty$4 = objectProto$5.hasOwnProperty;

			/**
			 * Assigns `value` to `key` of `object` if the existing value is not equivalent
			 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
			 * for equality comparisons.
			 *
			 * @private
			 * @param {Object} object The object to modify.
			 * @param {string} key The key of the property to assign.
			 * @param {*} value The value to assign.
			 */
			function assignValue$1(object, key, value) {
			  var objValue = object[key];
			  if (!(hasOwnProperty$4.call(object, key) && eq$2(objValue, value)) || value === undefined && !(key in object)) {
			    baseAssignValue$1(object, key, value);
			  }
			}
			var _assignValue = assignValue$1;

			var assignValue = _assignValue,
			  baseAssignValue = _baseAssignValue;

			/**
			 * Copies properties of `source` to `object`.
			 *
			 * @private
			 * @param {Object} source The object to copy properties from.
			 * @param {Array} props The property identifiers to copy.
			 * @param {Object} [object={}] The object to copy properties to.
			 * @param {Function} [customizer] The function to customize copied values.
			 * @returns {Object} Returns `object`.
			 */
			function copyObject$1(source, props, object, customizer) {
			  var isNew = !object;
			  object || (object = {});
			  var index = -1,
			    length = props.length;
			  while (++index < length) {
			    var key = props[index];
			    var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;
			    if (newValue === undefined) {
			      newValue = source[key];
			    }
			    if (isNew) {
			      baseAssignValue(object, key, newValue);
			    } else {
			      assignValue(object, key, newValue);
			    }
			  }
			  return object;
			}
			var _copyObject = copyObject$1;

			/**
			 * The base implementation of `_.times` without support for iteratee shorthands
			 * or max array length checks.
			 *
			 * @private
			 * @param {number} n The number of times to invoke `iteratee`.
			 * @param {Function} iteratee The function invoked per iteration.
			 * @returns {Array} Returns the array of results.
			 */

			function baseTimes$1(n, iteratee) {
			  var index = -1,
			    result = Array(n);
			  while (++index < n) {
			    result[index] = iteratee(index);
			  }
			  return result;
			}
			var _baseTimes = baseTimes$1;

			/** Used as references for various `Number` constants. */

			var MAX_SAFE_INTEGER = 9007199254740991;

			/** Used to detect unsigned integer values. */
			var reIsUint = /^(?:0|[1-9]\d*)$/;

			/**
			 * Checks if `value` is a valid array-like index.
			 *
			 * @private
			 * @param {*} value The value to check.
			 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
			 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
			 */
			function isIndex$3(value, length) {
			  var type = typeof value;
			  length = length == null ? MAX_SAFE_INTEGER : length;
			  return !!length && (type == 'number' || type != 'symbol' && reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
			}
			var _isIndex = isIndex$3;

			var baseTimes = _baseTimes,
			  isArguments$3 = isArguments_1,
			  isArray$c = isArray_1,
			  isBuffer$3 = isBufferExports,
			  isIndex$2 = _isIndex,
			  isTypedArray$3 = isTypedArray_1;

			/** Used for built-in method references. */
			var objectProto$4 = Object.prototype;

			/** Used to check objects for own properties. */
			var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

			/**
			 * Creates an array of the enumerable property names of the array-like `value`.
			 *
			 * @private
			 * @param {*} value The value to query.
			 * @param {boolean} inherited Specify returning inherited property names.
			 * @returns {Array} Returns the array of property names.
			 */
			function arrayLikeKeys$2(value, inherited) {
			  var isArr = isArray$c(value),
			    isArg = !isArr && isArguments$3(value),
			    isBuff = !isArr && !isArg && isBuffer$3(value),
			    isType = !isArr && !isArg && !isBuff && isTypedArray$3(value),
			    skipIndexes = isArr || isArg || isBuff || isType,
			    result = skipIndexes ? baseTimes(value.length, String) : [],
			    length = result.length;
			  for (var key in value) {
			    if ((inherited || hasOwnProperty$3.call(value, key)) && !(skipIndexes && (
			    // Safari 9 has enumerable `arguments.length` in strict mode.
			    key == 'length' ||
			    // Node.js 0.10 has enumerable non-index properties on buffers.
			    isBuff && (key == 'offset' || key == 'parent') ||
			    // PhantomJS 2 has enumerable non-index properties on typed arrays.
			    isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset') ||
			    // Skip index properties.
			    isIndex$2(key, length)))) {
			      result.push(key);
			    }
			  }
			  return result;
			}
			var _arrayLikeKeys = arrayLikeKeys$2;

			/**
			 * This function is like
			 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
			 * except that it includes inherited enumerable properties.
			 *
			 * @private
			 * @param {Object} object The object to query.
			 * @returns {Array} Returns the array of property names.
			 */

			function nativeKeysIn$1(object) {
			  var result = [];
			  if (object != null) {
			    for (var key in Object(object)) {
			      result.push(key);
			    }
			  }
			  return result;
			}
			var _nativeKeysIn = nativeKeysIn$1;

			var isObject$6 = isObject_1,
			  isPrototype = _isPrototype,
			  nativeKeysIn = _nativeKeysIn;

			/** Used for built-in method references. */
			var objectProto$3 = Object.prototype;

			/** Used to check objects for own properties. */
			var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

			/**
			 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
			 *
			 * @private
			 * @param {Object} object The object to query.
			 * @returns {Array} Returns the array of property names.
			 */
			function baseKeysIn$1(object) {
			  if (!isObject$6(object)) {
			    return nativeKeysIn(object);
			  }
			  var isProto = isPrototype(object),
			    result = [];
			  for (var key in object) {
			    if (!(key == 'constructor' && (isProto || !hasOwnProperty$2.call(object, key)))) {
			      result.push(key);
			    }
			  }
			  return result;
			}
			var _baseKeysIn = baseKeysIn$1;

			var arrayLikeKeys$1 = _arrayLikeKeys,
			  baseKeysIn = _baseKeysIn,
			  isArrayLike$4 = isArrayLike_1;

			/**
			 * Creates an array of the own and inherited enumerable property names of `object`.
			 *
			 * **Note:** Non-object values are coerced to objects.
			 *
			 * @static
			 * @memberOf _
			 * @since 3.0.0
			 * @category Object
			 * @param {Object} object The object to query.
			 * @returns {Array} Returns the array of property names.
			 * @example
			 *
			 * function Foo() {
			 *   this.a = 1;
			 *   this.b = 2;
			 * }
			 *
			 * Foo.prototype.c = 3;
			 *
			 * _.keysIn(new Foo);
			 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
			 */
			function keysIn$2(object) {
			  return isArrayLike$4(object) ? arrayLikeKeys$1(object, true) : baseKeysIn(object);
			}
			var keysIn_1 = keysIn$2;

			var copyObject = _copyObject,
			  keysIn$1 = keysIn_1;

			/**
			 * Converts `value` to a plain object flattening inherited enumerable string
			 * keyed properties of `value` to own properties of the plain object.
			 *
			 * @static
			 * @memberOf _
			 * @since 3.0.0
			 * @category Lang
			 * @param {*} value The value to convert.
			 * @returns {Object} Returns the converted plain object.
			 * @example
			 *
			 * function Foo() {
			 *   this.b = 2;
			 * }
			 *
			 * Foo.prototype.c = 3;
			 *
			 * _.assign({ 'a': 1 }, new Foo);
			 * // => { 'a': 1, 'b': 2 }
			 *
			 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
			 * // => { 'a': 1, 'b': 2, 'c': 3 }
			 */
			function toPlainObject$1(value) {
			  return copyObject(value, keysIn$1(value));
			}
			var toPlainObject_1 = toPlainObject$1;

			var assignMergeValue$1 = _assignMergeValue,
			  cloneBuffer = _cloneBufferExports,
			  cloneTypedArray = _cloneTypedArray,
			  copyArray = _copyArray,
			  initCloneObject = _initCloneObject,
			  isArguments$2 = isArguments_1,
			  isArray$b = isArray_1,
			  isArrayLikeObject$2 = isArrayLikeObject_1,
			  isBuffer$2 = isBufferExports,
			  isFunction$1 = isFunction_1,
			  isObject$5 = isObject_1,
			  isPlainObject = isPlainObject_1,
			  isTypedArray$2 = isTypedArray_1,
			  safeGet$1 = _safeGet,
			  toPlainObject = toPlainObject_1;

			/**
			 * A specialized version of `baseMerge` for arrays and objects which performs
			 * deep merges and tracks traversed objects enabling objects with circular
			 * references to be merged.
			 *
			 * @private
			 * @param {Object} object The destination object.
			 * @param {Object} source The source object.
			 * @param {string} key The key of the value to merge.
			 * @param {number} srcIndex The index of `source`.
			 * @param {Function} mergeFunc The function to merge values.
			 * @param {Function} [customizer] The function to customize assigned values.
			 * @param {Object} [stack] Tracks traversed source values and their merged
			 *  counterparts.
			 */
			function baseMergeDeep$1(object, source, key, srcIndex, mergeFunc, customizer, stack) {
			  var objValue = safeGet$1(object, key),
			    srcValue = safeGet$1(source, key),
			    stacked = stack.get(srcValue);
			  if (stacked) {
			    assignMergeValue$1(object, key, stacked);
			    return;
			  }
			  var newValue = customizer ? customizer(objValue, srcValue, key + '', object, source, stack) : undefined;
			  var isCommon = newValue === undefined;
			  if (isCommon) {
			    var isArr = isArray$b(srcValue),
			      isBuff = !isArr && isBuffer$2(srcValue),
			      isTyped = !isArr && !isBuff && isTypedArray$2(srcValue);
			    newValue = srcValue;
			    if (isArr || isBuff || isTyped) {
			      if (isArray$b(objValue)) {
			        newValue = objValue;
			      } else if (isArrayLikeObject$2(objValue)) {
			        newValue = copyArray(objValue);
			      } else if (isBuff) {
			        isCommon = false;
			        newValue = cloneBuffer(srcValue, true);
			      } else if (isTyped) {
			        isCommon = false;
			        newValue = cloneTypedArray(srcValue, true);
			      } else {
			        newValue = [];
			      }
			    } else if (isPlainObject(srcValue) || isArguments$2(srcValue)) {
			      newValue = objValue;
			      if (isArguments$2(objValue)) {
			        newValue = toPlainObject(objValue);
			      } else if (!isObject$5(objValue) || isFunction$1(objValue)) {
			        newValue = initCloneObject(srcValue);
			      }
			    } else {
			      isCommon = false;
			    }
			  }
			  if (isCommon) {
			    // Recursively merge objects and arrays (susceptible to call stack limits).
			    stack.set(srcValue, newValue);
			    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
			    stack['delete'](srcValue);
			  }
			  assignMergeValue$1(object, key, newValue);
			}
			var _baseMergeDeep = baseMergeDeep$1;

			var Stack$2 = _Stack,
			  assignMergeValue = _assignMergeValue,
			  baseFor$1 = _baseFor,
			  baseMergeDeep = _baseMergeDeep,
			  isObject$4 = isObject_1,
			  keysIn = keysIn_1,
			  safeGet = _safeGet;

			/**
			 * The base implementation of `_.merge` without support for multiple sources.
			 *
			 * @private
			 * @param {Object} object The destination object.
			 * @param {Object} source The source object.
			 * @param {number} srcIndex The index of `source`.
			 * @param {Function} [customizer] The function to customize merged values.
			 * @param {Object} [stack] Tracks traversed source values and their merged
			 *  counterparts.
			 */
			function baseMerge$1(object, source, srcIndex, customizer, stack) {
			  if (object === source) {
			    return;
			  }
			  baseFor$1(source, function (srcValue, key) {
			    stack || (stack = new Stack$2());
			    if (isObject$4(srcValue)) {
			      baseMergeDeep(object, source, key, srcIndex, baseMerge$1, customizer, stack);
			    } else {
			      var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + '', object, source, stack) : undefined;
			      if (newValue === undefined) {
			        newValue = srcValue;
			      }
			      assignMergeValue(object, key, newValue);
			    }
			  }, keysIn);
			}
			var _baseMerge = baseMerge$1;

			/**
			 * This method returns the first argument it receives.
			 *
			 * @static
			 * @since 0.1.0
			 * @memberOf _
			 * @category Util
			 * @param {*} value Any value.
			 * @returns {*} Returns `value`.
			 * @example
			 *
			 * var object = { 'a': 1 };
			 *
			 * console.log(_.identity(object) === object);
			 * // => true
			 */

			function identity$3(value) {
			  return value;
			}
			var identity_1 = identity$3;

			/**
			 * A faster alternative to `Function#apply`, this function invokes `func`
			 * with the `this` binding of `thisArg` and the arguments of `args`.
			 *
			 * @private
			 * @param {Function} func The function to invoke.
			 * @param {*} thisArg The `this` binding of `func`.
			 * @param {Array} args The arguments to invoke `func` with.
			 * @returns {*} Returns the result of `func`.
			 */

			function apply$1(func, thisArg, args) {
			  switch (args.length) {
			    case 0:
			      return func.call(thisArg);
			    case 1:
			      return func.call(thisArg, args[0]);
			    case 2:
			      return func.call(thisArg, args[0], args[1]);
			    case 3:
			      return func.call(thisArg, args[0], args[1], args[2]);
			  }
			  return func.apply(thisArg, args);
			}
			var _apply = apply$1;

			var apply = _apply;

			/* Built-in method references for those with the same name as other `lodash` methods. */
			var nativeMax$1 = Math.max;

			/**
			 * A specialized version of `baseRest` which transforms the rest array.
			 *
			 * @private
			 * @param {Function} func The function to apply a rest parameter to.
			 * @param {number} [start=func.length-1] The start position of the rest parameter.
			 * @param {Function} transform The rest array transform.
			 * @returns {Function} Returns the new function.
			 */
			function overRest$1(func, start, transform) {
			  start = nativeMax$1(start === undefined ? func.length - 1 : start, 0);
			  return function () {
			    var args = arguments,
			      index = -1,
			      length = nativeMax$1(args.length - start, 0),
			      array = Array(length);
			    while (++index < length) {
			      array[index] = args[start + index];
			    }
			    index = -1;
			    var otherArgs = Array(start + 1);
			    while (++index < start) {
			      otherArgs[index] = args[index];
			    }
			    otherArgs[start] = transform(array);
			    return apply(func, this, otherArgs);
			  };
			}
			var _overRest = overRest$1;

			/**
			 * Creates a function that returns `value`.
			 *
			 * @static
			 * @memberOf _
			 * @since 2.4.0
			 * @category Util
			 * @param {*} value The value to return from the new function.
			 * @returns {Function} Returns the new constant function.
			 * @example
			 *
			 * var objects = _.times(2, _.constant({ 'a': 1 }));
			 *
			 * console.log(objects);
			 * // => [{ 'a': 1 }, { 'a': 1 }]
			 *
			 * console.log(objects[0] === objects[1]);
			 * // => true
			 */

			function constant$1(value) {
			  return function () {
			    return value;
			  };
			}
			var constant_1 = constant$1;

			var constant = constant_1,
			  defineProperty = _defineProperty,
			  identity$2 = identity_1;

			/**
			 * The base implementation of `setToString` without support for hot loop shorting.
			 *
			 * @private
			 * @param {Function} func The function to modify.
			 * @param {Function} string The `toString` result.
			 * @returns {Function} Returns `func`.
			 */
			var baseSetToString$1 = !defineProperty ? identity$2 : function (func, string) {
			  return defineProperty(func, 'toString', {
			    'configurable': true,
			    'enumerable': false,
			    'value': constant(string),
			    'writable': true
			  });
			};
			var _baseSetToString = baseSetToString$1;

			/** Used to detect hot functions by number of calls within a span of milliseconds. */

			var HOT_COUNT = 800,
			  HOT_SPAN = 16;

			/* Built-in method references for those with the same name as other `lodash` methods. */
			var nativeNow = Date.now;

			/**
			 * Creates a function that'll short out and invoke `identity` instead
			 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
			 * milliseconds.
			 *
			 * @private
			 * @param {Function} func The function to restrict.
			 * @returns {Function} Returns the new shortable function.
			 */
			function shortOut$1(func) {
			  var count = 0,
			    lastCalled = 0;
			  return function () {
			    var stamp = nativeNow(),
			      remaining = HOT_SPAN - (stamp - lastCalled);
			    lastCalled = stamp;
			    if (remaining > 0) {
			      if (++count >= HOT_COUNT) {
			        return arguments[0];
			      }
			    } else {
			      count = 0;
			    }
			    return func.apply(undefined, arguments);
			  };
			}
			var _shortOut = shortOut$1;

			var baseSetToString = _baseSetToString,
			  shortOut = _shortOut;

			/**
			 * Sets the `toString` method of `func` to return `string`.
			 *
			 * @private
			 * @param {Function} func The function to modify.
			 * @param {Function} string The `toString` result.
			 * @returns {Function} Returns `func`.
			 */
			var setToString$1 = shortOut(baseSetToString);
			var _setToString = setToString$1;

			var identity$1 = identity_1,
			  overRest = _overRest,
			  setToString = _setToString;

			/**
			 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
			 *
			 * @private
			 * @param {Function} func The function to apply a rest parameter to.
			 * @param {number} [start=func.length-1] The start position of the rest parameter.
			 * @returns {Function} Returns the new function.
			 */
			function baseRest$3(func, start) {
			  return setToString(overRest(func, start, identity$1), func + '');
			}
			var _baseRest = baseRest$3;

			var eq$1 = eq_1,
			  isArrayLike$3 = isArrayLike_1,
			  isIndex$1 = _isIndex,
			  isObject$3 = isObject_1;

			/**
			 * Checks if the given arguments are from an iteratee call.
			 *
			 * @private
			 * @param {*} value The potential iteratee value argument.
			 * @param {*} index The potential iteratee index or key argument.
			 * @param {*} object The potential iteratee object argument.
			 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
			 *  else `false`.
			 */
			function isIterateeCall$2(value, index, object) {
			  if (!isObject$3(object)) {
			    return false;
			  }
			  var type = typeof index;
			  if (type == 'number' ? isArrayLike$3(object) && isIndex$1(index, object.length) : type == 'string' && index in object) {
			    return eq$1(object[index], value);
			  }
			  return false;
			}
			var _isIterateeCall = isIterateeCall$2;

			var baseRest$2 = _baseRest,
			  isIterateeCall$1 = _isIterateeCall;

			/**
			 * Creates a function like `_.assign`.
			 *
			 * @private
			 * @param {Function} assigner The function to assign values.
			 * @returns {Function} Returns the new assigner function.
			 */
			function createAssigner$1(assigner) {
			  return baseRest$2(function (object, sources) {
			    var index = -1,
			      length = sources.length,
			      customizer = length > 1 ? sources[length - 1] : undefined,
			      guard = length > 2 ? sources[2] : undefined;
			    customizer = assigner.length > 3 && typeof customizer == 'function' ? (length--, customizer) : undefined;
			    if (guard && isIterateeCall$1(sources[0], sources[1], guard)) {
			      customizer = length < 3 ? undefined : customizer;
			      length = 1;
			    }
			    object = Object(object);
			    while (++index < length) {
			      var source = sources[index];
			      if (source) {
			        assigner(object, source, index, customizer);
			      }
			    }
			    return object;
			  });
			}
			var _createAssigner = createAssigner$1;

			var baseMerge = _baseMerge,
			  createAssigner = _createAssigner;

			/**
			 * This method is like `_.assign` except that it recursively merges own and
			 * inherited enumerable string keyed properties of source objects into the
			 * destination object. Source properties that resolve to `undefined` are
			 * skipped if a destination value exists. Array and plain object properties
			 * are merged recursively. Other objects and value types are overridden by
			 * assignment. Source objects are applied from left to right. Subsequent
			 * sources overwrite property assignments of previous sources.
			 *
			 * **Note:** This method mutates `object`.
			 *
			 * @static
			 * @memberOf _
			 * @since 0.5.0
			 * @category Object
			 * @param {Object} object The destination object.
			 * @param {...Object} [sources] The source objects.
			 * @returns {Object} Returns `object`.
			 * @example
			 *
			 * var object = {
			 *   'a': [{ 'b': 2 }, { 'd': 4 }]
			 * };
			 *
			 * var other = {
			 *   'a': [{ 'c': 3 }, { 'e': 5 }]
			 * };
			 *
			 * _.merge(object, other);
			 * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
			 */
			var merge = createAssigner(function (object, source, srcIndex) {
			  baseMerge(object, source, srcIndex);
			});
			var merge_1 = merge;

			var _merge = /*@__PURE__*/getDefaultExportFromCjs(merge_1);

			/**
			 * A specialized version of `_.map` for arrays without support for iteratee
			 * shorthands.
			 *
			 * @private
			 * @param {Array} [array] The array to iterate over.
			 * @param {Function} iteratee The function invoked per iteration.
			 * @returns {Array} Returns the new mapped array.
			 */

			function arrayMap$5(array, iteratee) {
			  var index = -1,
			    length = array == null ? 0 : array.length,
			    result = Array(length);
			  while (++index < length) {
			    result[index] = iteratee(array[index], index, array);
			  }
			  return result;
			}
			var _arrayMap = arrayMap$5;

			/** Used to stand-in for `undefined` hash values. */

			var HASH_UNDEFINED = '__lodash_hash_undefined__';

			/**
			 * Adds `value` to the array cache.
			 *
			 * @private
			 * @name add
			 * @memberOf SetCache
			 * @alias push
			 * @param {*} value The value to cache.
			 * @returns {Object} Returns the cache instance.
			 */
			function setCacheAdd$1(value) {
			  this.__data__.set(value, HASH_UNDEFINED);
			  return this;
			}
			var _setCacheAdd = setCacheAdd$1;

			/**
			 * Checks if `value` is in the array cache.
			 *
			 * @private
			 * @name has
			 * @memberOf SetCache
			 * @param {*} value The value to search for.
			 * @returns {number} Returns `true` if `value` is found, else `false`.
			 */

			function setCacheHas$1(value) {
			  return this.__data__.has(value);
			}
			var _setCacheHas = setCacheHas$1;

			var MapCache$1 = _MapCache,
			  setCacheAdd = _setCacheAdd,
			  setCacheHas = _setCacheHas;

			/**
			 *
			 * Creates an array cache object to store unique values.
			 *
			 * @private
			 * @constructor
			 * @param {Array} [values] The values to cache.
			 */
			function SetCache$4(values) {
			  var index = -1,
			    length = values == null ? 0 : values.length;
			  this.__data__ = new MapCache$1();
			  while (++index < length) {
			    this.add(values[index]);
			  }
			}

			// Add methods to `SetCache`.
			SetCache$4.prototype.add = SetCache$4.prototype.push = setCacheAdd;
			SetCache$4.prototype.has = setCacheHas;
			var _SetCache = SetCache$4;

			/**
			 * The base implementation of `_.findIndex` and `_.findLastIndex` without
			 * support for iteratee shorthands.
			 *
			 * @private
			 * @param {Array} array The array to inspect.
			 * @param {Function} predicate The function invoked per iteration.
			 * @param {number} fromIndex The index to search from.
			 * @param {boolean} [fromRight] Specify iterating from right to left.
			 * @returns {number} Returns the index of the matched value, else `-1`.
			 */

			function baseFindIndex$1(array, predicate, fromIndex, fromRight) {
			  var length = array.length,
			    index = fromIndex + (fromRight ? 1 : -1);
			  while (fromRight ? index-- : ++index < length) {
			    if (predicate(array[index], index, array)) {
			      return index;
			    }
			  }
			  return -1;
			}
			var _baseFindIndex = baseFindIndex$1;

			/**
			 * The base implementation of `_.isNaN` without support for number objects.
			 *
			 * @private
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
			 */

			function baseIsNaN$1(value) {
			  return value !== value;
			}
			var _baseIsNaN = baseIsNaN$1;

			/**
			 * A specialized version of `_.indexOf` which performs strict equality
			 * comparisons of values, i.e. `===`.
			 *
			 * @private
			 * @param {Array} array The array to inspect.
			 * @param {*} value The value to search for.
			 * @param {number} fromIndex The index to search from.
			 * @returns {number} Returns the index of the matched value, else `-1`.
			 */

			function strictIndexOf$1(array, value, fromIndex) {
			  var index = fromIndex - 1,
			    length = array.length;
			  while (++index < length) {
			    if (array[index] === value) {
			      return index;
			    }
			  }
			  return -1;
			}
			var _strictIndexOf = strictIndexOf$1;

			var baseFindIndex = _baseFindIndex,
			  baseIsNaN = _baseIsNaN,
			  strictIndexOf = _strictIndexOf;

			/**
			 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
			 *
			 * @private
			 * @param {Array} array The array to inspect.
			 * @param {*} value The value to search for.
			 * @param {number} fromIndex The index to search from.
			 * @returns {number} Returns the index of the matched value, else `-1`.
			 */
			function baseIndexOf$2(array, value, fromIndex) {
			  return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
			}
			var _baseIndexOf = baseIndexOf$2;

			var baseIndexOf$1 = _baseIndexOf;

			/**
			 * A specialized version of `_.includes` for arrays without support for
			 * specifying an index to search from.
			 *
			 * @private
			 * @param {Array} [array] The array to inspect.
			 * @param {*} target The value to search for.
			 * @returns {boolean} Returns `true` if `target` is found, else `false`.
			 */
			function arrayIncludes$3(array, value) {
			  var length = array == null ? 0 : array.length;
			  return !!length && baseIndexOf$1(array, value, 0) > -1;
			}
			var _arrayIncludes = arrayIncludes$3;

			/**
			 * This function is like `arrayIncludes` except that it accepts a comparator.
			 *
			 * @private
			 * @param {Array} [array] The array to inspect.
			 * @param {*} target The value to search for.
			 * @param {Function} comparator The comparator invoked per element.
			 * @returns {boolean} Returns `true` if `target` is found, else `false`.
			 */

			function arrayIncludesWith$3(array, value, comparator) {
			  var index = -1,
			    length = array == null ? 0 : array.length;
			  while (++index < length) {
			    if (comparator(value, array[index])) {
			      return true;
			    }
			  }
			  return false;
			}
			var _arrayIncludesWith = arrayIncludesWith$3;

			/**
			 * Checks if a `cache` value for `key` exists.
			 *
			 * @private
			 * @param {Object} cache The cache to query.
			 * @param {string} key The key of the entry to check.
			 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
			 */

			function cacheHas$4(cache, key) {
			  return cache.has(key);
			}
			var _cacheHas = cacheHas$4;

			var SetCache$3 = _SetCache,
			  arrayIncludes$2 = _arrayIncludes,
			  arrayIncludesWith$2 = _arrayIncludesWith,
			  arrayMap$4 = _arrayMap,
			  baseUnary$1 = _baseUnary,
			  cacheHas$3 = _cacheHas;

			/* Built-in method references for those with the same name as other `lodash` methods. */
			var nativeMin = Math.min;

			/**
			 * The base implementation of methods like `_.intersection`, without support
			 * for iteratee shorthands, that accepts an array of arrays to inspect.
			 *
			 * @private
			 * @param {Array} arrays The arrays to inspect.
			 * @param {Function} [iteratee] The iteratee invoked per element.
			 * @param {Function} [comparator] The comparator invoked per element.
			 * @returns {Array} Returns the new array of shared values.
			 */
			function baseIntersection$1(arrays, iteratee, comparator) {
			  var includes = comparator ? arrayIncludesWith$2 : arrayIncludes$2,
			    length = arrays[0].length,
			    othLength = arrays.length,
			    othIndex = othLength,
			    caches = Array(othLength),
			    maxLength = Infinity,
			    result = [];
			  while (othIndex--) {
			    var array = arrays[othIndex];
			    if (othIndex && iteratee) {
			      array = arrayMap$4(array, baseUnary$1(iteratee));
			    }
			    maxLength = nativeMin(array.length, maxLength);
			    caches[othIndex] = !comparator && (iteratee || length >= 120 && array.length >= 120) ? new SetCache$3(othIndex && array) : undefined;
			  }
			  array = arrays[0];
			  var index = -1,
			    seen = caches[0];
			  outer: while (++index < length && result.length < maxLength) {
			    var value = array[index],
			      computed = iteratee ? iteratee(value) : value;
			    value = comparator || value !== 0 ? value : 0;
			    if (!(seen ? cacheHas$3(seen, computed) : includes(result, computed, comparator))) {
			      othIndex = othLength;
			      while (--othIndex) {
			        var cache = caches[othIndex];
			        if (!(cache ? cacheHas$3(cache, computed) : includes(arrays[othIndex], computed, comparator))) {
			          continue outer;
			        }
			      }
			      if (seen) {
			        seen.push(computed);
			      }
			      result.push(value);
			    }
			  }
			  return result;
			}
			var _baseIntersection = baseIntersection$1;

			var isArrayLikeObject$1 = isArrayLikeObject_1;

			/**
			 * Casts `value` to an empty array if it's not an array like object.
			 *
			 * @private
			 * @param {*} value The value to inspect.
			 * @returns {Array|Object} Returns the cast array-like object.
			 */
			function castArrayLikeObject$1(value) {
			  return isArrayLikeObject$1(value) ? value : [];
			}
			var _castArrayLikeObject = castArrayLikeObject$1;

			var arrayMap$3 = _arrayMap,
			  baseIntersection = _baseIntersection,
			  baseRest$1 = _baseRest,
			  castArrayLikeObject = _castArrayLikeObject;

			/**
			 * Creates an array of unique values that are included in all given arrays
			 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
			 * for equality comparisons. The order and references of result values are
			 * determined by the first array.
			 *
			 * @static
			 * @memberOf _
			 * @since 0.1.0
			 * @category Array
			 * @param {...Array} [arrays] The arrays to inspect.
			 * @returns {Array} Returns the new array of intersecting values.
			 * @example
			 *
			 * _.intersection([2, 1], [2, 3]);
			 * // => [2]
			 */
			var intersection = baseRest$1(function (arrays) {
			  var mapped = arrayMap$3(arrays, castArrayLikeObject);
			  return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped) : [];
			});
			var intersection_1 = intersection;

			var _intersection = /*@__PURE__*/getDefaultExportFromCjs(intersection_1);

			var packageManager = "pnpm@9.0.5";
			var name = "gatsby-dev-cli";
			var description = "CLI helpers for contributors working on Gatsby";
			var version = "5.14.0-next.2";
			var author = "Kyle Mathews <mathews.kyle@gmail.com>";
			var bin = {
			  "gatsby-dev": "./dist/index.js"
			};
			var bugs = {
			  url: "https://github.com/gatsbyjs/gatsby/issues"
			};
			var dependencies = {
			  "@babel/runtime": "^7.24.4",
			  chokidar: "^3.6.0",
			  configstore: "^6.0.0",
			  del: "^7.1.0",
			  execa: "^8.0.1",
			  "find-yarn-workspace-root": "^2.0.0",
			  "fs-extra": "^11.2.0",
			  got: "^14.2.1",
			  "is-absolute": "^1.0.0",
			  lodash: "^4.17.21",
			  "signal-exit": "^4.1.0",
			  verdaccio: "^5.30.3",
			  yargs: "^17.7.2"
			};
			var devDependencies = {
			  "@total-typescript/ts-reset": "^0.5.1",
			  "@babel/cli": "^7.24.1",
			  "@babel/core": "^7.24.4",
			  "@types/signal-exit": "^3.0.4",
			  "babel-preset-gatsby-package": "^3.14.0-next.2",
			  rollup: "^4.16.0",
			  "rollup-plugin-auto-external": "^2.0.0",
			  "rollup-plugin-internal": "^1.0.4",
			  "@rollup/plugin-babel": "^6.0.4",
			  "@rollup/plugin-commonjs": "^25.0.7",
			  "@rollup/plugin-json": "^6.1.0",
			  "@rollup/plugin-node-resolve": "^15.2.3",
			  "@rollup/plugin-replace": "^5.0.5",
			  "cross-env": "^7.0.3",
			  typescript: "^5.4.5"
			};
			var homepage = "https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-dev-cli#readme";
			var keywords = ["gatsby"];
			var license = "MIT";
			var main = "lib/index.js";
			var repository = {
			  type: "git",
			  url: "https://github.com/gatsbyjs/gatsby.git",
			  directory: "packages/gatsby-dev-cli"
			};
			var scripts = {
			  "build:babel": "babel src --out-dir dist --ignore \"**/__tests__\" --ignore \"src/reporter/loggers/ink/**/*\" --extensions \".ts,.js,.tsx\"",
			  "build:rollup": "rollup -c",
			  build: "npm-run-all --npm-path pnpm -p build:babel build:rollup",
			  prepare: "cross-env NODE_ENV=production pnpm run build && pnpm run typegen",
			  typegen: "rimraf \"dist/**/*.d.ts\" && tsc --emitDeclarationOnly --declaration --declarationDir dist/",
			  "watch:babel": "pnpm run build:babel -- --watch",
			  "watch:rollup": "pnpm run build:rollup -- -w",
			  watch: "npm-run-all --npm-path pnpm -p watch:babel watch:rollup"
			};
			var engines = {
			  node: ">=20.12.2"
			};
			var pkg = {
			  packageManager: packageManager,
			  name: name,
			  description: description,
			  version: version,
			  author: author,
			  bin: bin,
			  bugs: bugs,
			  dependencies: dependencies,
			  devDependencies: devDependencies,
			  homepage: homepage,
			  keywords: keywords,
			  license: license,
			  main: main,
			  repository: repository,
			  scripts: scripts,
			  engines: engines
			};

			var baseGetTag$1 = _baseGetTag,
			  isArray$a = isArray_1,
			  isObjectLike$2 = isObjectLike_1;

			/** `Object#toString` result references. */
			var stringTag$1 = '[object String]';

			/**
			 * Checks if `value` is classified as a `String` primitive or object.
			 *
			 * @static
			 * @since 0.1.0
			 * @memberOf _
			 * @category Lang
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
			 * @example
			 *
			 * _.isString('abc');
			 * // => true
			 *
			 * _.isString(1);
			 * // => false
			 */
			function isString$1(value) {
			  return typeof value == 'string' || !isArray$a(value) && isObjectLike$2(value) && baseGetTag$1(value) == stringTag$1;
			}
			var isString_1 = isString$1;

			/** Used to match a single whitespace character. */

			var reWhitespace = /\s/;

			/**
			 * Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
			 * character of `string`.
			 *
			 * @private
			 * @param {string} string The string to inspect.
			 * @returns {number} Returns the index of the last non-whitespace character.
			 */
			function trimmedEndIndex$1(string) {
			  var index = string.length;
			  while (index-- && reWhitespace.test(string.charAt(index))) {}
			  return index;
			}
			var _trimmedEndIndex = trimmedEndIndex$1;

			var trimmedEndIndex = _trimmedEndIndex;

			/** Used to match leading whitespace. */
			var reTrimStart = /^\s+/;

			/**
			 * The base implementation of `_.trim`.
			 *
			 * @private
			 * @param {string} string The string to trim.
			 * @returns {string} Returns the trimmed string.
			 */
			function baseTrim$1(string) {
			  return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, '') : string;
			}
			var _baseTrim = baseTrim$1;

			var baseGetTag = _baseGetTag,
			  isObjectLike$1 = isObjectLike_1;

			/** `Object#toString` result references. */
			var symbolTag$1 = '[object Symbol]';

			/**
			 * Checks if `value` is classified as a `Symbol` primitive or object.
			 *
			 * @static
			 * @memberOf _
			 * @since 4.0.0
			 * @category Lang
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
			 * @example
			 *
			 * _.isSymbol(Symbol.iterator);
			 * // => true
			 *
			 * _.isSymbol('abc');
			 * // => false
			 */
			function isSymbol$4(value) {
			  return typeof value == 'symbol' || isObjectLike$1(value) && baseGetTag(value) == symbolTag$1;
			}
			var isSymbol_1 = isSymbol$4;

			var baseTrim = _baseTrim,
			  isObject$2 = isObject_1,
			  isSymbol$3 = isSymbol_1;

			/** Used as references for various `Number` constants. */
			var NAN = 0 / 0;

			/** Used to detect bad signed hexadecimal string values. */
			var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

			/** Used to detect binary string values. */
			var reIsBinary = /^0b[01]+$/i;

			/** Used to detect octal string values. */
			var reIsOctal = /^0o[0-7]+$/i;

			/** Built-in method references without a dependency on `root`. */
			var freeParseInt = parseInt;

			/**
			 * Converts `value` to a number.
			 *
			 * @static
			 * @memberOf _
			 * @since 4.0.0
			 * @category Lang
			 * @param {*} value The value to process.
			 * @returns {number} Returns the number.
			 * @example
			 *
			 * _.toNumber(3.2);
			 * // => 3.2
			 *
			 * _.toNumber(Number.MIN_VALUE);
			 * // => 5e-324
			 *
			 * _.toNumber(Infinity);
			 * // => Infinity
			 *
			 * _.toNumber('3.2');
			 * // => 3.2
			 */
			function toNumber$1(value) {
			  if (typeof value == 'number') {
			    return value;
			  }
			  if (isSymbol$3(value)) {
			    return NAN;
			  }
			  if (isObject$2(value)) {
			    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
			    value = isObject$2(other) ? other + '' : other;
			  }
			  if (typeof value != 'string') {
			    return value === 0 ? value : +value;
			  }
			  value = baseTrim(value);
			  var isBinary = reIsBinary.test(value);
			  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
			}
			var toNumber_1 = toNumber$1;

			var toNumber = toNumber_1;

			/** Used as references for various `Number` constants. */
			var INFINITY$3 = 1 / 0,
			  MAX_INTEGER = 1.7976931348623157e+308;

			/**
			 * Converts `value` to a finite number.
			 *
			 * @static
			 * @memberOf _
			 * @since 4.12.0
			 * @category Lang
			 * @param {*} value The value to convert.
			 * @returns {number} Returns the converted number.
			 * @example
			 *
			 * _.toFinite(3.2);
			 * // => 3.2
			 *
			 * _.toFinite(Number.MIN_VALUE);
			 * // => 5e-324
			 *
			 * _.toFinite(Infinity);
			 * // => 1.7976931348623157e+308
			 *
			 * _.toFinite('3.2');
			 * // => 3.2
			 */
			function toFinite$1(value) {
			  if (!value) {
			    return value === 0 ? value : 0;
			  }
			  value = toNumber(value);
			  if (value === INFINITY$3 || value === -INFINITY$3) {
			    var sign = value < 0 ? -1 : 1;
			    return sign * MAX_INTEGER;
			  }
			  return value === value ? value : 0;
			}
			var toFinite_1 = toFinite$1;

			var toFinite = toFinite_1;

			/**
			 * Converts `value` to an integer.
			 *
			 * **Note:** This method is loosely based on
			 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
			 *
			 * @static
			 * @memberOf _
			 * @since 4.0.0
			 * @category Lang
			 * @param {*} value The value to convert.
			 * @returns {number} Returns the converted integer.
			 * @example
			 *
			 * _.toInteger(3.2);
			 * // => 3
			 *
			 * _.toInteger(Number.MIN_VALUE);
			 * // => 0
			 *
			 * _.toInteger(Infinity);
			 * // => 1.7976931348623157e+308
			 *
			 * _.toInteger('3.2');
			 * // => 3
			 */
			function toInteger$1(value) {
			  var result = toFinite(value),
			    remainder = result % 1;
			  return result === result ? remainder ? result - remainder : result : 0;
			}
			var toInteger_1 = toInteger$1;

			var arrayMap$2 = _arrayMap;

			/**
			 * The base implementation of `_.values` and `_.valuesIn` which creates an
			 * array of `object` property values corresponding to the property names
			 * of `props`.
			 *
			 * @private
			 * @param {Object} object The object to query.
			 * @param {Array} props The property names to get values for.
			 * @returns {Object} Returns the array of property values.
			 */
			function baseValues$1(object, props) {
			  return arrayMap$2(props, function (key) {
			    return object[key];
			  });
			}
			var _baseValues = baseValues$1;

			var arrayLikeKeys = _arrayLikeKeys,
			  baseKeys = _baseKeys,
			  isArrayLike$2 = isArrayLike_1;

			/**
			 * Creates an array of the own enumerable property names of `object`.
			 *
			 * **Note:** Non-object values are coerced to objects. See the
			 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
			 * for more details.
			 *
			 * @static
			 * @since 0.1.0
			 * @memberOf _
			 * @category Object
			 * @param {Object} object The object to query.
			 * @returns {Array} Returns the array of property names.
			 * @example
			 *
			 * function Foo() {
			 *   this.a = 1;
			 *   this.b = 2;
			 * }
			 *
			 * Foo.prototype.c = 3;
			 *
			 * _.keys(new Foo);
			 * // => ['a', 'b'] (iteration order is not guaranteed)
			 *
			 * _.keys('hi');
			 * // => ['0', '1']
			 */
			function keys$4(object) {
			  return isArrayLike$2(object) ? arrayLikeKeys(object) : baseKeys(object);
			}
			var keys_1 = keys$4;

			var baseValues = _baseValues,
			  keys$3 = keys_1;

			/**
			 * Creates an array of the own enumerable string keyed property values of `object`.
			 *
			 * **Note:** Non-object values are coerced to objects.
			 *
			 * @static
			 * @since 0.1.0
			 * @memberOf _
			 * @category Object
			 * @param {Object} object The object to query.
			 * @returns {Array} Returns the array of property values.
			 * @example
			 *
			 * function Foo() {
			 *   this.a = 1;
			 *   this.b = 2;
			 * }
			 *
			 * Foo.prototype.c = 3;
			 *
			 * _.values(new Foo);
			 * // => [1, 2] (iteration order is not guaranteed)
			 *
			 * _.values('hi');
			 * // => ['h', 'i']
			 */
			function values$1(object) {
			  return object == null ? [] : baseValues(object, keys$3(object));
			}
			var values_1 = values$1;

			var baseIndexOf = _baseIndexOf,
			  isArrayLike$1 = isArrayLike_1,
			  isString = isString_1,
			  toInteger = toInteger_1,
			  values = values_1;

			/* Built-in method references for those with the same name as other `lodash` methods. */
			var nativeMax = Math.max;

			/**
			 * Checks if `value` is in `collection`. If `collection` is a string, it's
			 * checked for a substring of `value`, otherwise
			 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
			 * is used for equality comparisons. If `fromIndex` is negative, it's used as
			 * the offset from the end of `collection`.
			 *
			 * @static
			 * @memberOf _
			 * @since 0.1.0
			 * @category Collection
			 * @param {Array|Object|string} collection The collection to inspect.
			 * @param {*} value The value to search for.
			 * @param {number} [fromIndex=0] The index to search from.
			 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
			 * @returns {boolean} Returns `true` if `value` is found, else `false`.
			 * @example
			 *
			 * _.includes([1, 2, 3], 1);
			 * // => true
			 *
			 * _.includes([1, 2, 3], 1, 2);
			 * // => false
			 *
			 * _.includes({ 'a': 1, 'b': 2 }, 1);
			 * // => true
			 *
			 * _.includes('abcd', 'bc');
			 * // => true
			 */
			function includes(collection, value, fromIndex, guard) {
			  collection = isArrayLike$1(collection) ? collection : values(collection);
			  fromIndex = fromIndex && !guard ? toInteger(fromIndex) : 0;
			  var length = collection.length;
			  if (fromIndex < 0) {
			    fromIndex = nativeMax(length + fromIndex, 0);
			  }
			  return isString(collection) ? fromIndex <= length && collection.indexOf(value, fromIndex) > -1 : !!length && baseIndexOf(collection, value, fromIndex) > -1;
			}
			var includes_1 = includes;

			var _includes = /*@__PURE__*/getDefaultExportFromCjs(includes_1);

			/**
			 * A specialized version of `_.some` for arrays without support for iteratee
			 * shorthands.
			 *
			 * @private
			 * @param {Array} [array] The array to iterate over.
			 * @param {Function} predicate The function invoked per iteration.
			 * @returns {boolean} Returns `true` if any element passes the predicate check,
			 *  else `false`.
			 */

			function arraySome$2(array, predicate) {
			  var index = -1,
			    length = array == null ? 0 : array.length;
			  while (++index < length) {
			    if (predicate(array[index], index, array)) {
			      return true;
			    }
			  }
			  return false;
			}
			var _arraySome = arraySome$2;

			var SetCache$2 = _SetCache,
			  arraySome$1 = _arraySome,
			  cacheHas$2 = _cacheHas;

			/** Used to compose bitmasks for value comparisons. */
			var COMPARE_PARTIAL_FLAG$5 = 1,
			  COMPARE_UNORDERED_FLAG$3 = 2;

			/**
			 * A specialized version of `baseIsEqualDeep` for arrays with support for
			 * partial deep comparisons.
			 *
			 * @private
			 * @param {Array} array The array to compare.
			 * @param {Array} other The other array to compare.
			 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
			 * @param {Function} customizer The function to customize comparisons.
			 * @param {Function} equalFunc The function to determine equivalents of values.
			 * @param {Object} stack Tracks traversed `array` and `other` objects.
			 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
			 */
			function equalArrays$2(array, other, bitmask, customizer, equalFunc, stack) {
			  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$5,
			    arrLength = array.length,
			    othLength = other.length;
			  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
			    return false;
			  }
			  // Check that cyclic values are equal.
			  var arrStacked = stack.get(array);
			  var othStacked = stack.get(other);
			  if (arrStacked && othStacked) {
			    return arrStacked == other && othStacked == array;
			  }
			  var index = -1,
			    result = true,
			    seen = bitmask & COMPARE_UNORDERED_FLAG$3 ? new SetCache$2() : undefined;
			  stack.set(array, other);
			  stack.set(other, array);

			  // Ignore non-index properties.
			  while (++index < arrLength) {
			    var arrValue = array[index],
			      othValue = other[index];
			    if (customizer) {
			      var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
			    }
			    if (compared !== undefined) {
			      if (compared) {
			        continue;
			      }
			      result = false;
			      break;
			    }
			    // Recursively compare arrays (susceptible to call stack limits).
			    if (seen) {
			      if (!arraySome$1(other, function (othValue, othIndex) {
			        if (!cacheHas$2(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
			          return seen.push(othIndex);
			        }
			      })) {
			        result = false;
			        break;
			      }
			    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
			      result = false;
			      break;
			    }
			  }
			  stack['delete'](array);
			  stack['delete'](other);
			  return result;
			}
			var _equalArrays = equalArrays$2;

			/**
			 * Converts `map` to its key-value pairs.
			 *
			 * @private
			 * @param {Object} map The map to convert.
			 * @returns {Array} Returns the key-value pairs.
			 */

			function mapToArray$1(map) {
			  var index = -1,
			    result = Array(map.size);
			  map.forEach(function (value, key) {
			    result[++index] = [key, value];
			  });
			  return result;
			}
			var _mapToArray = mapToArray$1;

			/**
			 * Converts `set` to an array of its values.
			 *
			 * @private
			 * @param {Object} set The set to convert.
			 * @returns {Array} Returns the values.
			 */

			function setToArray$3(set) {
			  var index = -1,
			    result = Array(set.size);
			  set.forEach(function (value) {
			    result[++index] = value;
			  });
			  return result;
			}
			var _setToArray = setToArray$3;

			var Symbol$2 = _Symbol,
			  Uint8Array = _Uint8Array,
			  eq = eq_1,
			  equalArrays$1 = _equalArrays,
			  mapToArray = _mapToArray,
			  setToArray$2 = _setToArray;

			/** Used to compose bitmasks for value comparisons. */
			var COMPARE_PARTIAL_FLAG$4 = 1,
			  COMPARE_UNORDERED_FLAG$2 = 2;

			/** `Object#toString` result references. */
			var boolTag = '[object Boolean]',
			  dateTag = '[object Date]',
			  errorTag = '[object Error]',
			  mapTag = '[object Map]',
			  numberTag = '[object Number]',
			  regexpTag = '[object RegExp]',
			  setTag = '[object Set]',
			  stringTag = '[object String]',
			  symbolTag = '[object Symbol]';
			var arrayBufferTag = '[object ArrayBuffer]',
			  dataViewTag = '[object DataView]';

			/** Used to convert symbols to primitives and strings. */
			var symbolProto$1 = Symbol$2 ? Symbol$2.prototype : undefined,
			  symbolValueOf = symbolProto$1 ? symbolProto$1.valueOf : undefined;

			/**
			 * A specialized version of `baseIsEqualDeep` for comparing objects of
			 * the same `toStringTag`.
			 *
			 * **Note:** This function only supports comparing values with tags of
			 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
			 *
			 * @private
			 * @param {Object} object The object to compare.
			 * @param {Object} other The other object to compare.
			 * @param {string} tag The `toStringTag` of the objects to compare.
			 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
			 * @param {Function} customizer The function to customize comparisons.
			 * @param {Function} equalFunc The function to determine equivalents of values.
			 * @param {Object} stack Tracks traversed `object` and `other` objects.
			 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
			 */
			function equalByTag$1(object, other, tag, bitmask, customizer, equalFunc, stack) {
			  switch (tag) {
			    case dataViewTag:
			      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
			        return false;
			      }
			      object = object.buffer;
			      other = other.buffer;
			    case arrayBufferTag:
			      if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
			        return false;
			      }
			      return true;
			    case boolTag:
			    case dateTag:
			    case numberTag:
			      // Coerce booleans to `1` or `0` and dates to milliseconds.
			      // Invalid dates are coerced to `NaN`.
			      return eq(+object, +other);
			    case errorTag:
			      return object.name == other.name && object.message == other.message;
			    case regexpTag:
			    case stringTag:
			      // Coerce regexes to strings and treat strings, primitives and objects,
			      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
			      // for more details.
			      return object == other + '';
			    case mapTag:
			      var convert = mapToArray;
			    case setTag:
			      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$4;
			      convert || (convert = setToArray$2);
			      if (object.size != other.size && !isPartial) {
			        return false;
			      }
			      // Assume cyclic values are equal.
			      var stacked = stack.get(object);
			      if (stacked) {
			        return stacked == other;
			      }
			      bitmask |= COMPARE_UNORDERED_FLAG$2;

			      // Recursively compare objects (susceptible to call stack limits).
			      stack.set(object, other);
			      var result = equalArrays$1(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
			      stack['delete'](object);
			      return result;
			    case symbolTag:
			      if (symbolValueOf) {
			        return symbolValueOf.call(object) == symbolValueOf.call(other);
			      }
			  }
			  return false;
			}
			var _equalByTag = equalByTag$1;

			/**
			 * Appends the elements of `values` to `array`.
			 *
			 * @private
			 * @param {Array} array The array to modify.
			 * @param {Array} values The values to append.
			 * @returns {Array} Returns `array`.
			 */

			function arrayPush$2(array, values) {
			  var index = -1,
			    length = values.length,
			    offset = array.length;
			  while (++index < length) {
			    array[offset + index] = values[index];
			  }
			  return array;
			}
			var _arrayPush = arrayPush$2;

			var arrayPush$1 = _arrayPush,
			  isArray$9 = isArray_1;

			/**
			 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
			 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
			 * symbols of `object`.
			 *
			 * @private
			 * @param {Object} object The object to query.
			 * @param {Function} keysFunc The function to get the keys of `object`.
			 * @param {Function} symbolsFunc The function to get the symbols of `object`.
			 * @returns {Array} Returns the array of property names and symbols.
			 */
			function baseGetAllKeys$1(object, keysFunc, symbolsFunc) {
			  var result = keysFunc(object);
			  return isArray$9(object) ? result : arrayPush$1(result, symbolsFunc(object));
			}
			var _baseGetAllKeys = baseGetAllKeys$1;

			/**
			 * A specialized version of `_.filter` for arrays without support for
			 * iteratee shorthands.
			 *
			 * @private
			 * @param {Array} [array] The array to iterate over.
			 * @param {Function} predicate The function invoked per iteration.
			 * @returns {Array} Returns the new filtered array.
			 */

			function arrayFilter$1(array, predicate) {
			  var index = -1,
			    length = array == null ? 0 : array.length,
			    resIndex = 0,
			    result = [];
			  while (++index < length) {
			    var value = array[index];
			    if (predicate(value, index, array)) {
			      result[resIndex++] = value;
			    }
			  }
			  return result;
			}
			var _arrayFilter = arrayFilter$1;

			/**
			 * This method returns a new empty array.
			 *
			 * @static
			 * @memberOf _
			 * @since 4.13.0
			 * @category Util
			 * @returns {Array} Returns the new empty array.
			 * @example
			 *
			 * var arrays = _.times(2, _.stubArray);
			 *
			 * console.log(arrays);
			 * // => [[], []]
			 *
			 * console.log(arrays[0] === arrays[1]);
			 * // => false
			 */

			function stubArray$1() {
			  return [];
			}
			var stubArray_1 = stubArray$1;

			var arrayFilter = _arrayFilter,
			  stubArray = stubArray_1;

			/** Used for built-in method references. */
			var objectProto$2 = Object.prototype;

			/** Built-in value references. */
			var propertyIsEnumerable = objectProto$2.propertyIsEnumerable;

			/* Built-in method references for those with the same name as other `lodash` methods. */
			var nativeGetSymbols = Object.getOwnPropertySymbols;

			/**
			 * Creates an array of the own enumerable symbols of `object`.
			 *
			 * @private
			 * @param {Object} object The object to query.
			 * @returns {Array} Returns the array of symbols.
			 */
			var getSymbols$1 = !nativeGetSymbols ? stubArray : function (object) {
			  if (object == null) {
			    return [];
			  }
			  object = Object(object);
			  return arrayFilter(nativeGetSymbols(object), function (symbol) {
			    return propertyIsEnumerable.call(object, symbol);
			  });
			};
			var _getSymbols = getSymbols$1;

			var baseGetAllKeys = _baseGetAllKeys,
			  getSymbols = _getSymbols,
			  keys$2 = keys_1;

			/**
			 * Creates an array of own enumerable property names and symbols of `object`.
			 *
			 * @private
			 * @param {Object} object The object to query.
			 * @returns {Array} Returns the array of property names and symbols.
			 */
			function getAllKeys$1(object) {
			  return baseGetAllKeys(object, keys$2, getSymbols);
			}
			var _getAllKeys = getAllKeys$1;

			var getAllKeys = _getAllKeys;

			/** Used to compose bitmasks for value comparisons. */
			var COMPARE_PARTIAL_FLAG$3 = 1;

			/** Used for built-in method references. */
			var objectProto$1 = Object.prototype;

			/** Used to check objects for own properties. */
			var hasOwnProperty$1 = objectProto$1.hasOwnProperty;

			/**
			 * A specialized version of `baseIsEqualDeep` for objects with support for
			 * partial deep comparisons.
			 *
			 * @private
			 * @param {Object} object The object to compare.
			 * @param {Object} other The other object to compare.
			 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
			 * @param {Function} customizer The function to customize comparisons.
			 * @param {Function} equalFunc The function to determine equivalents of values.
			 * @param {Object} stack Tracks traversed `object` and `other` objects.
			 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
			 */
			function equalObjects$1(object, other, bitmask, customizer, equalFunc, stack) {
			  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3,
			    objProps = getAllKeys(object),
			    objLength = objProps.length,
			    othProps = getAllKeys(other),
			    othLength = othProps.length;
			  if (objLength != othLength && !isPartial) {
			    return false;
			  }
			  var index = objLength;
			  while (index--) {
			    var key = objProps[index];
			    if (!(isPartial ? key in other : hasOwnProperty$1.call(other, key))) {
			      return false;
			    }
			  }
			  // Check that cyclic values are equal.
			  var objStacked = stack.get(object);
			  var othStacked = stack.get(other);
			  if (objStacked && othStacked) {
			    return objStacked == other && othStacked == object;
			  }
			  var result = true;
			  stack.set(object, other);
			  stack.set(other, object);
			  var skipCtor = isPartial;
			  while (++index < objLength) {
			    key = objProps[index];
			    var objValue = object[key],
			      othValue = other[key];
			    if (customizer) {
			      var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
			    }
			    // Recursively compare objects (susceptible to call stack limits).
			    if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
			      result = false;
			      break;
			    }
			    skipCtor || (skipCtor = key == 'constructor');
			  }
			  if (result && !skipCtor) {
			    var objCtor = object.constructor,
			      othCtor = other.constructor;

			    // Non `Object` object instances with different constructors are not equal.
			    if (objCtor != othCtor && 'constructor' in object && 'constructor' in other && !(typeof objCtor == 'function' && objCtor instanceof objCtor && typeof othCtor == 'function' && othCtor instanceof othCtor)) {
			      result = false;
			    }
			  }
			  stack['delete'](object);
			  stack['delete'](other);
			  return result;
			}
			var _equalObjects = equalObjects$1;

			var Stack$1 = _Stack,
			  equalArrays = _equalArrays,
			  equalByTag = _equalByTag,
			  equalObjects = _equalObjects,
			  getTag = _getTag,
			  isArray$8 = isArray_1,
			  isBuffer$1 = isBufferExports,
			  isTypedArray$1 = isTypedArray_1;

			/** Used to compose bitmasks for value comparisons. */
			var COMPARE_PARTIAL_FLAG$2 = 1;

			/** `Object#toString` result references. */
			var argsTag = '[object Arguments]',
			  arrayTag = '[object Array]',
			  objectTag = '[object Object]';

			/** Used for built-in method references. */
			var objectProto = Object.prototype;

			/** Used to check objects for own properties. */
			var hasOwnProperty = objectProto.hasOwnProperty;

			/**
			 * A specialized version of `baseIsEqual` for arrays and objects which performs
			 * deep comparisons and tracks traversed objects enabling objects with circular
			 * references to be compared.
			 *
			 * @private
			 * @param {Object} object The object to compare.
			 * @param {Object} other The other object to compare.
			 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
			 * @param {Function} customizer The function to customize comparisons.
			 * @param {Function} equalFunc The function to determine equivalents of values.
			 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
			 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
			 */
			function baseIsEqualDeep$1(object, other, bitmask, customizer, equalFunc, stack) {
			  var objIsArr = isArray$8(object),
			    othIsArr = isArray$8(other),
			    objTag = objIsArr ? arrayTag : getTag(object),
			    othTag = othIsArr ? arrayTag : getTag(other);
			  objTag = objTag == argsTag ? objectTag : objTag;
			  othTag = othTag == argsTag ? objectTag : othTag;
			  var objIsObj = objTag == objectTag,
			    othIsObj = othTag == objectTag,
			    isSameTag = objTag == othTag;
			  if (isSameTag && isBuffer$1(object)) {
			    if (!isBuffer$1(other)) {
			      return false;
			    }
			    objIsArr = true;
			    objIsObj = false;
			  }
			  if (isSameTag && !objIsObj) {
			    stack || (stack = new Stack$1());
			    return objIsArr || isTypedArray$1(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
			  }
			  if (!(bitmask & COMPARE_PARTIAL_FLAG$2)) {
			    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
			      othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');
			    if (objIsWrapped || othIsWrapped) {
			      var objUnwrapped = objIsWrapped ? object.value() : object,
			        othUnwrapped = othIsWrapped ? other.value() : other;
			      stack || (stack = new Stack$1());
			      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
			    }
			  }
			  if (!isSameTag) {
			    return false;
			  }
			  stack || (stack = new Stack$1());
			  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
			}
			var _baseIsEqualDeep = baseIsEqualDeep$1;

			var baseIsEqualDeep = _baseIsEqualDeep,
			  isObjectLike = isObjectLike_1;

			/**
			 * The base implementation of `_.isEqual` which supports partial comparisons
			 * and tracks traversed objects.
			 *
			 * @private
			 * @param {*} value The value to compare.
			 * @param {*} other The other value to compare.
			 * @param {boolean} bitmask The bitmask flags.
			 *  1 - Unordered comparison
			 *  2 - Partial comparison
			 * @param {Function} [customizer] The function to customize comparisons.
			 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
			 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
			 */
			function baseIsEqual$3(value, other, bitmask, customizer, stack) {
			  if (value === other) {
			    return true;
			  }
			  if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
			    return value !== value && other !== other;
			  }
			  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual$3, stack);
			}
			var _baseIsEqual = baseIsEqual$3;

			var Stack = _Stack,
			  baseIsEqual$2 = _baseIsEqual;

			/** Used to compose bitmasks for value comparisons. */
			var COMPARE_PARTIAL_FLAG$1 = 1,
			  COMPARE_UNORDERED_FLAG$1 = 2;

			/**
			 * The base implementation of `_.isMatch` without support for iteratee shorthands.
			 *
			 * @private
			 * @param {Object} object The object to inspect.
			 * @param {Object} source The object of property values to match.
			 * @param {Array} matchData The property names, values, and compare flags to match.
			 * @param {Function} [customizer] The function to customize comparisons.
			 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
			 */
			function baseIsMatch$1(object, source, matchData, customizer) {
			  var index = matchData.length,
			    length = index,
			    noCustomizer = !customizer;
			  if (object == null) {
			    return !length;
			  }
			  object = Object(object);
			  while (index--) {
			    var data = matchData[index];
			    if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
			      return false;
			    }
			  }
			  while (++index < length) {
			    data = matchData[index];
			    var key = data[0],
			      objValue = object[key],
			      srcValue = data[1];
			    if (noCustomizer && data[2]) {
			      if (objValue === undefined && !(key in object)) {
			        return false;
			      }
			    } else {
			      var stack = new Stack();
			      if (customizer) {
			        var result = customizer(objValue, srcValue, key, object, source, stack);
			      }
			      if (!(result === undefined ? baseIsEqual$2(srcValue, objValue, COMPARE_PARTIAL_FLAG$1 | COMPARE_UNORDERED_FLAG$1, customizer, stack) : result)) {
			        return false;
			      }
			    }
			  }
			  return true;
			}
			var _baseIsMatch = baseIsMatch$1;

			var isObject$1 = isObject_1;

			/**
			 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
			 *
			 * @private
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` if suitable for strict
			 *  equality comparisons, else `false`.
			 */
			function isStrictComparable$2(value) {
			  return value === value && !isObject$1(value);
			}
			var _isStrictComparable = isStrictComparable$2;

			var isStrictComparable$1 = _isStrictComparable,
			  keys$1 = keys_1;

			/**
			 * Gets the property names, values, and compare flags of `object`.
			 *
			 * @private
			 * @param {Object} object The object to query.
			 * @returns {Array} Returns the match data of `object`.
			 */
			function getMatchData$1(object) {
			  var result = keys$1(object),
			    length = result.length;
			  while (length--) {
			    var key = result[length],
			      value = object[key];
			    result[length] = [key, value, isStrictComparable$1(value)];
			  }
			  return result;
			}
			var _getMatchData = getMatchData$1;

			/**
			 * A specialized version of `matchesProperty` for source values suitable
			 * for strict equality comparisons, i.e. `===`.
			 *
			 * @private
			 * @param {string} key The key of the property to get.
			 * @param {*} srcValue The value to match.
			 * @returns {Function} Returns the new spec function.
			 */

			function matchesStrictComparable$2(key, srcValue) {
			  return function (object) {
			    if (object == null) {
			      return false;
			    }
			    return object[key] === srcValue && (srcValue !== undefined || key in Object(object));
			  };
			}
			var _matchesStrictComparable = matchesStrictComparable$2;

			var baseIsMatch = _baseIsMatch,
			  getMatchData = _getMatchData,
			  matchesStrictComparable$1 = _matchesStrictComparable;

			/**
			 * The base implementation of `_.matches` which doesn't clone `source`.
			 *
			 * @private
			 * @param {Object} source The object of property values to match.
			 * @returns {Function} Returns the new spec function.
			 */
			function baseMatches$1(source) {
			  var matchData = getMatchData(source);
			  if (matchData.length == 1 && matchData[0][2]) {
			    return matchesStrictComparable$1(matchData[0][0], matchData[0][1]);
			  }
			  return function (object) {
			    return object === source || baseIsMatch(object, source, matchData);
			  };
			}
			var _baseMatches = baseMatches$1;

			var isArray$7 = isArray_1,
			  isSymbol$2 = isSymbol_1;

			/** Used to match property names within property paths. */
			var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
			  reIsPlainProp = /^\w*$/;

			/**
			 * Checks if `value` is a property name and not a property path.
			 *
			 * @private
			 * @param {*} value The value to check.
			 * @param {Object} [object] The object to query keys on.
			 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
			 */
			function isKey$3(value, object) {
			  if (isArray$7(value)) {
			    return false;
			  }
			  var type = typeof value;
			  if (type == 'number' || type == 'symbol' || type == 'boolean' || value == null || isSymbol$2(value)) {
			    return true;
			  }
			  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
			}
			var _isKey = isKey$3;

			var MapCache = _MapCache;

			/** Error message constants. */
			var FUNC_ERROR_TEXT = 'Expected a function';

			/**
			 * Creates a function that memoizes the result of `func`. If `resolver` is
			 * provided, it determines the cache key for storing the result based on the
			 * arguments provided to the memoized function. By default, the first argument
			 * provided to the memoized function is used as the map cache key. The `func`
			 * is invoked with the `this` binding of the memoized function.
			 *
			 * **Note:** The cache is exposed as the `cache` property on the memoized
			 * function. Its creation may be customized by replacing the `_.memoize.Cache`
			 * constructor with one whose instances implement the
			 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
			 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
			 *
			 * @static
			 * @memberOf _
			 * @since 0.1.0
			 * @category Function
			 * @param {Function} func The function to have its output memoized.
			 * @param {Function} [resolver] The function to resolve the cache key.
			 * @returns {Function} Returns the new memoized function.
			 * @example
			 *
			 * var object = { 'a': 1, 'b': 2 };
			 * var other = { 'c': 3, 'd': 4 };
			 *
			 * var values = _.memoize(_.values);
			 * values(object);
			 * // => [1, 2]
			 *
			 * values(other);
			 * // => [3, 4]
			 *
			 * object.a = 2;
			 * values(object);
			 * // => [1, 2]
			 *
			 * // Modify the result cache.
			 * values.cache.set(object, ['a', 'b']);
			 * values(object);
			 * // => ['a', 'b']
			 *
			 * // Replace `_.memoize.Cache`.
			 * _.memoize.Cache = WeakMap;
			 */
			function memoize$1(func, resolver) {
			  if (typeof func != 'function' || resolver != null && typeof resolver != 'function') {
			    throw new TypeError(FUNC_ERROR_TEXT);
			  }
			  var memoized = function () {
			    var args = arguments,
			      key = resolver ? resolver.apply(this, args) : args[0],
			      cache = memoized.cache;
			    if (cache.has(key)) {
			      return cache.get(key);
			    }
			    var result = func.apply(this, args);
			    memoized.cache = cache.set(key, result) || cache;
			    return result;
			  };
			  memoized.cache = new (memoize$1.Cache || MapCache)();
			  return memoized;
			}

			// Expose `MapCache`.
			memoize$1.Cache = MapCache;
			var memoize_1 = memoize$1;

			var memoize = memoize_1;

			/** Used as the maximum memoize cache size. */
			var MAX_MEMOIZE_SIZE = 500;

			/**
			 * A specialized version of `_.memoize` which clears the memoized function's
			 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
			 *
			 * @private
			 * @param {Function} func The function to have its output memoized.
			 * @returns {Function} Returns the new memoized function.
			 */
			function memoizeCapped$1(func) {
			  var result = memoize(func, function (key) {
			    if (cache.size === MAX_MEMOIZE_SIZE) {
			      cache.clear();
			    }
			    return key;
			  });
			  var cache = result.cache;
			  return result;
			}
			var _memoizeCapped = memoizeCapped$1;

			var memoizeCapped = _memoizeCapped;

			/** Used to match property names within property paths. */
			var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

			/** Used to match backslashes in property paths. */
			var reEscapeChar = /\\(\\)?/g;

			/**
			 * Converts `string` to a property path array.
			 *
			 * @private
			 * @param {string} string The string to convert.
			 * @returns {Array} Returns the property path array.
			 */
			var stringToPath$1 = memoizeCapped(function (string) {
			  var result = [];
			  if (string.charCodeAt(0) === 46 /* . */) {
			    result.push('');
			  }
			  string.replace(rePropName, function (match, number, quote, subString) {
			    result.push(quote ? subString.replace(reEscapeChar, '$1') : number || match);
			  });
			  return result;
			});
			var _stringToPath = stringToPath$1;

			var Symbol$1 = _Symbol,
			  arrayMap$1 = _arrayMap,
			  isArray$6 = isArray_1,
			  isSymbol$1 = isSymbol_1;

			/** Used as references for various `Number` constants. */
			var INFINITY$2 = 1 / 0;

			/** Used to convert symbols to primitives and strings. */
			var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined,
			  symbolToString = symbolProto ? symbolProto.toString : undefined;

			/**
			 * The base implementation of `_.toString` which doesn't convert nullish
			 * values to empty strings.
			 *
			 * @private
			 * @param {*} value The value to process.
			 * @returns {string} Returns the string.
			 */
			function baseToString$1(value) {
			  // Exit early for strings to avoid a performance hit in some environments.
			  if (typeof value == 'string') {
			    return value;
			  }
			  if (isArray$6(value)) {
			    // Recursively convert values (susceptible to call stack limits).
			    return arrayMap$1(value, baseToString$1) + '';
			  }
			  if (isSymbol$1(value)) {
			    return symbolToString ? symbolToString.call(value) : '';
			  }
			  var result = value + '';
			  return result == '0' && 1 / value == -INFINITY$2 ? '-0' : result;
			}
			var _baseToString = baseToString$1;

			var baseToString = _baseToString;

			/**
			 * Converts `value` to a string. An empty string is returned for `null`
			 * and `undefined` values. The sign of `-0` is preserved.
			 *
			 * @static
			 * @memberOf _
			 * @since 4.0.0
			 * @category Lang
			 * @param {*} value The value to convert.
			 * @returns {string} Returns the converted string.
			 * @example
			 *
			 * _.toString(null);
			 * // => ''
			 *
			 * _.toString(-0);
			 * // => '-0'
			 *
			 * _.toString([1, 2, 3]);
			 * // => '1,2,3'
			 */
			function toString$1(value) {
			  return value == null ? '' : baseToString(value);
			}
			var toString_1 = toString$1;

			var isArray$5 = isArray_1,
			  isKey$2 = _isKey,
			  stringToPath = _stringToPath,
			  toString = toString_1;

			/**
			 * Casts `value` to a path array if it's not one.
			 *
			 * @private
			 * @param {*} value The value to inspect.
			 * @param {Object} [object] The object to query keys on.
			 * @returns {Array} Returns the cast property path array.
			 */
			function castPath$2(value, object) {
			  if (isArray$5(value)) {
			    return value;
			  }
			  return isKey$2(value, object) ? [value] : stringToPath(toString(value));
			}
			var _castPath = castPath$2;

			var isSymbol = isSymbol_1;

			/** Used as references for various `Number` constants. */
			var INFINITY$1 = 1 / 0;

			/**
			 * Converts `value` to a string key if it's not a string or symbol.
			 *
			 * @private
			 * @param {*} value The value to inspect.
			 * @returns {string|symbol} Returns the key.
			 */
			function toKey$4(value) {
			  if (typeof value == 'string' || isSymbol(value)) {
			    return value;
			  }
			  var result = value + '';
			  return result == '0' && 1 / value == -INFINITY$1 ? '-0' : result;
			}
			var _toKey = toKey$4;

			var castPath$1 = _castPath,
			  toKey$3 = _toKey;

			/**
			 * The base implementation of `_.get` without support for default values.
			 *
			 * @private
			 * @param {Object} object The object to query.
			 * @param {Array|string} path The path of the property to get.
			 * @returns {*} Returns the resolved value.
			 */
			function baseGet$2(object, path) {
			  path = castPath$1(path, object);
			  var index = 0,
			    length = path.length;
			  while (object != null && index < length) {
			    object = object[toKey$3(path[index++])];
			  }
			  return index && index == length ? object : undefined;
			}
			var _baseGet = baseGet$2;

			var baseGet$1 = _baseGet;

			/**
			 * Gets the value at `path` of `object`. If the resolved value is
			 * `undefined`, the `defaultValue` is returned in its place.
			 *
			 * @static
			 * @memberOf _
			 * @since 3.7.0
			 * @category Object
			 * @param {Object} object The object to query.
			 * @param {Array|string} path The path of the property to get.
			 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
			 * @returns {*} Returns the resolved value.
			 * @example
			 *
			 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
			 *
			 * _.get(object, 'a[0].b.c');
			 * // => 3
			 *
			 * _.get(object, ['a', '0', 'b', 'c']);
			 * // => 3
			 *
			 * _.get(object, 'a.b.c', 'default');
			 * // => 'default'
			 */
			function get$1(object, path, defaultValue) {
			  var result = object == null ? undefined : baseGet$1(object, path);
			  return result === undefined ? defaultValue : result;
			}
			var get_1 = get$1;

			/**
			 * The base implementation of `_.hasIn` without support for deep paths.
			 *
			 * @private
			 * @param {Object} [object] The object to query.
			 * @param {Array|string} key The key to check.
			 * @returns {boolean} Returns `true` if `key` exists, else `false`.
			 */

			function baseHasIn$1(object, key) {
			  return object != null && key in Object(object);
			}
			var _baseHasIn = baseHasIn$1;

			var castPath = _castPath,
			  isArguments$1 = isArguments_1,
			  isArray$4 = isArray_1,
			  isIndex = _isIndex,
			  isLength = isLength_1,
			  toKey$2 = _toKey;

			/**
			 * Checks if `path` exists on `object`.
			 *
			 * @private
			 * @param {Object} object The object to query.
			 * @param {Array|string} path The path to check.
			 * @param {Function} hasFunc The function to check properties.
			 * @returns {boolean} Returns `true` if `path` exists, else `false`.
			 */
			function hasPath$1(object, path, hasFunc) {
			  path = castPath(path, object);
			  var index = -1,
			    length = path.length,
			    result = false;
			  while (++index < length) {
			    var key = toKey$2(path[index]);
			    if (!(result = object != null && hasFunc(object, key))) {
			      break;
			    }
			    object = object[key];
			  }
			  if (result || ++index != length) {
			    return result;
			  }
			  length = object == null ? 0 : object.length;
			  return !!length && isLength(length) && isIndex(key, length) && (isArray$4(object) || isArguments$1(object));
			}
			var _hasPath = hasPath$1;

			var baseHasIn = _baseHasIn,
			  hasPath = _hasPath;

			/**
			 * Checks if `path` is a direct or inherited property of `object`.
			 *
			 * @static
			 * @memberOf _
			 * @since 4.0.0
			 * @category Object
			 * @param {Object} object The object to query.
			 * @param {Array|string} path The path to check.
			 * @returns {boolean} Returns `true` if `path` exists, else `false`.
			 * @example
			 *
			 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
			 *
			 * _.hasIn(object, 'a');
			 * // => true
			 *
			 * _.hasIn(object, 'a.b');
			 * // => true
			 *
			 * _.hasIn(object, ['a', 'b']);
			 * // => true
			 *
			 * _.hasIn(object, 'b');
			 * // => false
			 */
			function hasIn$1(object, path) {
			  return object != null && hasPath(object, path, baseHasIn);
			}
			var hasIn_1 = hasIn$1;

			var baseIsEqual$1 = _baseIsEqual,
			  get = get_1,
			  hasIn = hasIn_1,
			  isKey$1 = _isKey,
			  isStrictComparable = _isStrictComparable,
			  matchesStrictComparable = _matchesStrictComparable,
			  toKey$1 = _toKey;

			/** Used to compose bitmasks for value comparisons. */
			var COMPARE_PARTIAL_FLAG = 1,
			  COMPARE_UNORDERED_FLAG = 2;

			/**
			 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
			 *
			 * @private
			 * @param {string} path The path of the property to get.
			 * @param {*} srcValue The value to match.
			 * @returns {Function} Returns the new spec function.
			 */
			function baseMatchesProperty$1(path, srcValue) {
			  if (isKey$1(path) && isStrictComparable(srcValue)) {
			    return matchesStrictComparable(toKey$1(path), srcValue);
			  }
			  return function (object) {
			    var objValue = get(object, path);
			    return objValue === undefined && objValue === srcValue ? hasIn(object, path) : baseIsEqual$1(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
			  };
			}
			var _baseMatchesProperty = baseMatchesProperty$1;

			/**
			 * The base implementation of `_.property` without support for deep paths.
			 *
			 * @private
			 * @param {string} key The key of the property to get.
			 * @returns {Function} Returns the new accessor function.
			 */

			function baseProperty$1(key) {
			  return function (object) {
			    return object == null ? undefined : object[key];
			  };
			}
			var _baseProperty = baseProperty$1;

			var baseGet = _baseGet;

			/**
			 * A specialized version of `baseProperty` which supports deep paths.
			 *
			 * @private
			 * @param {Array|string} path The path of the property to get.
			 * @returns {Function} Returns the new accessor function.
			 */
			function basePropertyDeep$1(path) {
			  return function (object) {
			    return baseGet(object, path);
			  };
			}
			var _basePropertyDeep = basePropertyDeep$1;

			var baseProperty = _baseProperty,
			  basePropertyDeep = _basePropertyDeep,
			  isKey = _isKey,
			  toKey = _toKey;

			/**
			 * Creates a function that returns the value at `path` of a given object.
			 *
			 * @static
			 * @memberOf _
			 * @since 2.4.0
			 * @category Util
			 * @param {Array|string} path The path of the property to get.
			 * @returns {Function} Returns the new accessor function.
			 * @example
			 *
			 * var objects = [
			 *   { 'a': { 'b': 2 } },
			 *   { 'a': { 'b': 1 } }
			 * ];
			 *
			 * _.map(objects, _.property('a.b'));
			 * // => [2, 1]
			 *
			 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
			 * // => [1, 2]
			 */
			function property$1(path) {
			  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
			}
			var property_1 = property$1;

			var baseMatches = _baseMatches,
			  baseMatchesProperty = _baseMatchesProperty,
			  identity = identity_1,
			  isArray$3 = isArray_1,
			  property = property_1;

			/**
			 * The base implementation of `_.iteratee`.
			 *
			 * @private
			 * @param {*} [value=_.identity] The value to convert to an iteratee.
			 * @returns {Function} Returns the iteratee.
			 */
			function baseIteratee$2(value) {
			  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
			  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
			  if (typeof value == 'function') {
			    return value;
			  }
			  if (value == null) {
			    return identity;
			  }
			  if (typeof value == 'object') {
			    return isArray$3(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
			  }
			  return property(value);
			}
			var _baseIteratee = baseIteratee$2;

			var baseFor = _baseFor,
			  keys = keys_1;

			/**
			 * The base implementation of `_.forOwn` without support for iteratee shorthands.
			 *
			 * @private
			 * @param {Object} object The object to iterate over.
			 * @param {Function} iteratee The function invoked per iteration.
			 * @returns {Object} Returns `object`.
			 */
			function baseForOwn$2(object, iteratee) {
			  return object && baseFor(object, iteratee, keys);
			}
			var _baseForOwn = baseForOwn$2;

			var isArrayLike = isArrayLike_1;

			/**
			 * Creates a `baseEach` or `baseEachRight` function.
			 *
			 * @private
			 * @param {Function} eachFunc The function to iterate over a collection.
			 * @param {boolean} [fromRight] Specify iterating from right to left.
			 * @returns {Function} Returns the new base function.
			 */
			function createBaseEach$1(eachFunc, fromRight) {
			  return function (collection, iteratee) {
			    if (collection == null) {
			      return collection;
			    }
			    if (!isArrayLike(collection)) {
			      return eachFunc(collection, iteratee);
			    }
			    var length = collection.length,
			      index = fromRight ? length : -1,
			      iterable = Object(collection);
			    while (fromRight ? index-- : ++index < length) {
			      if (iteratee(iterable[index], index, iterable) === false) {
			        break;
			      }
			    }
			    return collection;
			  };
			}
			var _createBaseEach = createBaseEach$1;

			var baseForOwn$1 = _baseForOwn,
			  createBaseEach = _createBaseEach;

			/**
			 * The base implementation of `_.forEach` without support for iteratee shorthands.
			 *
			 * @private
			 * @param {Array|Object} collection The collection to iterate over.
			 * @param {Function} iteratee The function invoked per iteration.
			 * @returns {Array|Object} Returns `collection`.
			 */
			var baseEach$1 = createBaseEach(baseForOwn$1);
			var _baseEach = baseEach$1;

			var baseEach = _baseEach;

			/**
			 * The base implementation of `_.some` without support for iteratee shorthands.
			 *
			 * @private
			 * @param {Array|Object} collection The collection to iterate over.
			 * @param {Function} predicate The function invoked per iteration.
			 * @returns {boolean} Returns `true` if any element passes the predicate check,
			 *  else `false`.
			 */
			function baseSome$1(collection, predicate) {
			  var result;
			  baseEach(collection, function (value, index, collection) {
			    result = predicate(value, index, collection);
			    return !result;
			  });
			  return !!result;
			}
			var _baseSome = baseSome$1;

			var arraySome = _arraySome,
			  baseIteratee$1 = _baseIteratee,
			  baseSome = _baseSome,
			  isArray$2 = isArray_1,
			  isIterateeCall = _isIterateeCall;

			/**
			 * Checks if `predicate` returns truthy for **any** element of `collection`.
			 * Iteration is stopped once `predicate` returns truthy. The predicate is
			 * invoked with three arguments: (value, index|key, collection).
			 *
			 * @static
			 * @memberOf _
			 * @since 0.1.0
			 * @category Collection
			 * @param {Array|Object} collection The collection to iterate over.
			 * @param {Function} [predicate=_.identity] The function invoked per iteration.
			 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
			 * @returns {boolean} Returns `true` if any element passes the predicate check,
			 *  else `false`.
			 * @example
			 *
			 * _.some([null, 0, 'yes', false], Boolean);
			 * // => true
			 *
			 * var users = [
			 *   { 'user': 'barney', 'active': true },
			 *   { 'user': 'fred',   'active': false }
			 * ];
			 *
			 * // The `_.matches` iteratee shorthand.
			 * _.some(users, { 'user': 'barney', 'active': false });
			 * // => false
			 *
			 * // The `_.matchesProperty` iteratee shorthand.
			 * _.some(users, ['active', false]);
			 * // => true
			 *
			 * // The `_.property` iteratee shorthand.
			 * _.some(users, 'active');
			 * // => true
			 */
			function some(collection, predicate, guard) {
			  var func = isArray$2(collection) ? arraySome : baseSome;
			  if (guard && isIterateeCall(collection, predicate, guard)) {
			    predicate = undefined;
			  }
			  return func(collection, baseIteratee$1(predicate));
			}
			var some_1 = some;

			var _some = /*@__PURE__*/getDefaultExportFromCjs(some_1);

			/**
			 * This method returns `undefined`.
			 *
			 * @static
			 * @memberOf _
			 * @since 2.3.0
			 * @category Util
			 * @example
			 *
			 * _.times(2, _.noop);
			 * // => [undefined, undefined]
			 */

			function noop$1() {
			  // No operation performed.
			}
			var noop_1 = noop$1;

			var Set$1 = _Set,
			  noop = noop_1,
			  setToArray$1 = _setToArray;

			/** Used as references for various `Number` constants. */
			var INFINITY = 1 / 0;

			/**
			 * Creates a set object of `values`.
			 *
			 * @private
			 * @param {Array} values The values to add to the set.
			 * @returns {Object} Returns the new set.
			 */
			var createSet$1 = !(Set$1 && 1 / setToArray$1(new Set$1([, -0]))[1] == INFINITY) ? noop : function (values) {
			  return new Set$1(values);
			};
			var _createSet = createSet$1;

			var SetCache$1 = _SetCache,
			  arrayIncludes$1 = _arrayIncludes,
			  arrayIncludesWith$1 = _arrayIncludesWith,
			  cacheHas$1 = _cacheHas,
			  createSet = _createSet,
			  setToArray = _setToArray;

			/** Used as the size to enable large array optimizations. */
			var LARGE_ARRAY_SIZE$1 = 200;

			/**
			 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
			 *
			 * @private
			 * @param {Array} array The array to inspect.
			 * @param {Function} [iteratee] The iteratee invoked per element.
			 * @param {Function} [comparator] The comparator invoked per element.
			 * @returns {Array} Returns the new duplicate free array.
			 */
			function baseUniq$1(array, iteratee, comparator) {
			  var index = -1,
			    includes = arrayIncludes$1,
			    length = array.length,
			    isCommon = true,
			    result = [],
			    seen = result;
			  if (comparator) {
			    isCommon = false;
			    includes = arrayIncludesWith$1;
			  } else if (length >= LARGE_ARRAY_SIZE$1) {
			    var set = iteratee ? null : createSet(array);
			    if (set) {
			      return setToArray(set);
			    }
			    isCommon = false;
			    includes = cacheHas$1;
			    seen = new SetCache$1();
			  } else {
			    seen = iteratee ? [] : result;
			  }
			  outer: while (++index < length) {
			    var value = array[index],
			      computed = iteratee ? iteratee(value) : value;
			    value = comparator || value !== 0 ? value : 0;
			    if (isCommon && computed === computed) {
			      var seenIndex = seen.length;
			      while (seenIndex--) {
			        if (seen[seenIndex] === computed) {
			          continue outer;
			        }
			      }
			      if (iteratee) {
			        seen.push(computed);
			      }
			      result.push(value);
			    } else if (!includes(seen, computed, comparator)) {
			      if (seen !== result) {
			        seen.push(computed);
			      }
			      result.push(value);
			    }
			  }
			  return result;
			}
			var _baseUniq = baseUniq$1;

			var baseUniq = _baseUniq;

			/**
			 * Creates a duplicate-free version of an array, using
			 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
			 * for equality comparisons, in which only the first occurrence of each element
			 * is kept. The order of result values is determined by the order they occur
			 * in the array.
			 *
			 * @static
			 * @memberOf _
			 * @since 0.1.0
			 * @category Array
			 * @param {Array} array The array to inspect.
			 * @returns {Array} Returns the new duplicate free array.
			 * @example
			 *
			 * _.uniq([2, 1, 2]);
			 * // => [2, 1]
			 */
			function uniq(array) {
			  return array && array.length ? baseUniq(array) : [];
			}
			var uniq_1 = uniq;

			var _uniq = /*@__PURE__*/getDefaultExportFromCjs(uniq_1);

			const verdaccioConfig = {
			  storage: path.join(os.tmpdir(), `verdaccio`, `storage`),
			  port: 4873,
			  // default
			  max_body_size: `1000mb`,
			  web: {
			    enable: true,
			    title: `gatsby-dev`
			  },
			  self_path: `./`,
			  logs: {
			    type: `stdout`,
			    format: `pretty-timestamped`,
			    level: `warn`
			  },
			  packages: {
			    "**": {
			      access: `$all`,
			      publish: `$all`,
			      proxy: `npmjs`
			    }
			  },
			  uplinks: {
			    npmjs: {
			      url: `https://registry.npmjs.org/`,
			      // default is 2 max_fails - on flaky networks that cause a lot of failed installations
			      max_fails: 10
			    }
			  }
			};
			const registryUrl = `http://localhost:${verdaccioConfig.port}`;

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const cleanupTasks = new Set();

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			function registerCleanupTask(taskFn) {
			  cleanupTasks.add(taskFn);

			  // eslint-disable-next-line @typescript-eslint/no-explicit-any
			  return () => {
			    const result = taskFn();
			    cleanupTasks.delete(taskFn);
			    return result;
			  };
			}
			signalExit.onExit(() => {
			  if (cleanupTasks.size) {
			    console.log(`Process exitted in middle of publishing - cleaning up`);
			    cleanupTasks.forEach(taskFn => taskFn());
			  }
			});

			const defaultSpawnArgs = {
			  cwd: process.cwd(),
			  stdio: `inherit`
			};
			function setDefaultSpawnStdio(stdio) {
			  // @ts-ignore
			  defaultSpawnArgs.stdio = stdio;
			}
			async function promisifiedSpawn([cmd, args = [], spawnArgs = {}]) {
			  const spawnOptions = {
			    ...defaultSpawnArgs,
			    ...spawnArgs
			  };
			  try {
			    return await execa.execa(cmd, args, spawnOptions);
			  } catch (e) {
			    if (spawnOptions.stdio === `ignore`) {
			      console.log(`\nCommand "${cmd} ${args.join(` `)}" failed.\nTo see details of failed command, rerun "gatsby-dev" without "--quiet" or "-q" switch\n`);
			    }
			    throw e;
			  }
			}

			function getMonorepoPackageJsonPath({
			  packageName,
			  packageNameToPath
			}) {
			  return path.join(packageNameToPath.get(packageName), `package.json`);
			}

			const NPMRCContent = `${registryUrl.replace(/https?:/g, ``)}/:_authToken="gatsby-dev"`;

			/**
			 * Edit package.json to:
			 *  - adjust version to temporary one
			 *  - change version selectors for dependencies that
			 *    will be published, to make sure that pnpm
			 *    install them in local site
			 */
			function adjustPackageJson({
			  monoRepoPackageJsonPath,
			  packageName,
			  versionPostFix,
			  packagesToPublish,
			  ignorePackageJSONChanges,
			  packageNameToPath
			}) {
			  // we need to check if package depend on any other package to will be published and
			  // adjust version selector to point to dev version of package so local registry is used
			  // for dependencies.

			  const monorepoPKGjsonString = readFileSync(monoRepoPackageJsonPath, `utf-8`);
			  const monorepoPKGjson = JSON.parse(monorepoPKGjsonString);
			  monorepoPKGjson.version = `${monorepoPKGjson.version}-dev-${versionPostFix}`;
			  packagesToPublish.forEach(packageThatWillBePublished => {
			    if (monorepoPKGjson.dependencies && monorepoPKGjson.dependencies[packageThatWillBePublished]) {
			      const packagePath = getMonorepoPackageJsonPath({
			        packageName: packageThatWillBePublished,
			        packageNameToPath
			      });
			      const file = readFileSync(packagePath, `utf-8`);
			      const currentVersion = JSON.parse(file).version;
			      monorepoPKGjson.dependencies[packageThatWillBePublished] = `${currentVersion}-dev-${versionPostFix}`;
			    }
			  });
			  const temporaryMonorepoPKGjsonString = JSON.stringify(monorepoPKGjson);
			  const unignorePackageJSONChanges = ignorePackageJSONChanges(packageName, [monorepoPKGjsonString, temporaryMonorepoPKGjsonString]);

			  // change version and dependency versions
			  outputFileSync(monoRepoPackageJsonPath, temporaryMonorepoPKGjsonString);
			  return {
			    newPackageVersion: monorepoPKGjson.version,
			    unadjustPackageJson: registerCleanupTask(() => {
			      // restore original package.json
			      outputFileSync(monoRepoPackageJsonPath, monorepoPKGjsonString);
			      unignorePackageJSONChanges();
			    })
			  };
			}

			/**
			 * Anonymous publishing require dummy .npmrc
			 * See https://github.com/verdaccio/verdaccio/issues/212#issuecomment-308578500
			 * This is `pnpm publish` (as in linked comment) and `pnpm publish` requirement.
			 * This is not verdaccio restriction.
			 */
			function createTemporaryNPMRC({
			  pathToPackage,
			  root
			}) {
			  const NPMRCPathInPackage = join(pathToPackage, `.npmrc`);
			  outputFileSync(NPMRCPathInPackage, NPMRCContent);
			  const NPMRCPathInRoot = join(root, `.npmrc`);
			  outputFileSync(NPMRCPathInRoot, NPMRCContent);
			  return registerCleanupTask(() => {
			    removeSync(NPMRCPathInPackage);
			    removeSync(NPMRCPathInRoot);
			  });
			}
			async function publishPackage({
			  packageName,
			  packagesToPublish,
			  versionPostFix,
			  ignorePackageJSONChanges,
			  packageNameToPath,
			  root
			  // eslint-disable-next-line @typescript-eslint/no-explicit-any
			}) {
			  const monoRepoPackageJsonPath = getMonorepoPackageJsonPath({
			    packageName,
			    packageNameToPath
			  });
			  const {
			    unadjustPackageJson,
			    newPackageVersion
			  } = adjustPackageJson({
			    monoRepoPackageJsonPath,
			    packageName,
			    packageNameToPath,
			    versionPostFix,
			    packagesToPublish,
			    ignorePackageJSONChanges
			  });
			  const pathToPackage = dirname(monoRepoPackageJsonPath);
			  const uncreateTemporaryNPMRC = createTemporaryNPMRC({
			    pathToPackage,
			    root
			  });

			  // npm publish
			  const publishCmd = [`npm`, [`publish`, `--tag`, `gatsby-dev`, `--registry=${registryUrl}`], {
			    cwd: pathToPackage
			  }];
			  console.log(`Publishing ${packageName}@${newPackageVersion} to local registry`);
			  try {
			    await promisifiedSpawn(publishCmd);
			    console.log(`Published ${packageName}@${newPackageVersion} to local registry`);
			  } catch (e) {
			    console.error(`Failed to publish ${packageName}@${newPackageVersion}`, e);
			    process.exit(1);
			  }
			  uncreateTemporaryNPMRC();
			  unadjustPackageJson();
			  return newPackageVersion;
			}

			async function installPackages({
			  packagesToInstall,
			  yarnWorkspaceRoot,
			  newlyPublishedPackageVersions,
			  externalRegistry,
			  packageManager
			}) {
			  console.log(`Installing packages from local registry:\n${packagesToInstall.map(packageAndVersion => ` - ${packageAndVersion}`).join(`\n`)}`);
			  let installCmd;
			  if (yarnWorkspaceRoot) {
			    // this is very hacky - given root, we run `pnpm workspaces info`
			    // to get list of all workspaces and their locations, and manually
			    // edit package.json file for packages we want to install
			    // to make sure there are no mismatched versions of same package
			    // in workspaces which should preserve node_modules structure
			    // (packages being mostly hoisted to top-level node_modules)
			    const {
			      stdout
			    } = await promisifiedSpawn([`pnpm`, [`workspaces`, `info`, `--json`], {
			      stdio: `pipe`
			    }]);
			    let workspacesLayout;
			    try {
			      // @ts-ignore
			      workspacesLayout = JSON.parse(JSON.parse(stdout).data);
			    } catch (e) {
			      /*
			      Yarn 1.22 doesn't output pure json - it has leading and trailing text:
			      ```
			      $ yarn workspaces info --json
			      yarn workspaces v1.22.0
			      {
			        "z": {
			          "location": "z",
			          "workspaceDependencies": [],
			          "mismatchedWorkspaceDependencies": []
			        },
			        "y": {
			          "location": "y",
			          "workspaceDependencies": [],
			          "mismatchedWorkspaceDependencies": []
			        }
			      }
			      Done in 0.48s.
			      ```
			      So we need to do some sanitization. We find JSON by matching substring
			      that starts with `{` and ends with `}`
			      */
			      const regex = /^[^{]*({.*})[^}]*$/gs;
			      const sanitizedStdOut = regex.exec(stdout);
			      if ((sanitizedStdOut?.length ?? 0) >= 2) {
			        // pick content of first (and only) capturing group
			        const jsonString = sanitizedStdOut?.[1];
			        try {
			          workspacesLayout = JSON.parse(jsonString ?? ``);
			        } catch (e) {
			          console.error(`Failed to parse "sanitized" output of "yarn workspaces info" command.\n\nSanitized string: "${jsonString}`);
			          // not exitting here, because we have general check for `workspacesLayout` being set below
			        }
			      }
			    }
			    if (!workspacesLayout) {
			      console.error(`Couldn't parse output of "yarn workspaces info" command`, stdout);
			      process.exit(1);
			    }
			    function handleDeps(deps) {
			      if (!deps) {
			        return false;
			      }
			      let changed = false;
			      Object.keys(deps).forEach(depName => {
			        if (packagesToInstall.includes(depName)) {
			          deps[depName] = `gatsby-dev`;
			          changed = true;
			        }
			      });
			      return changed;
			    }
			    Object.keys(workspacesLayout).forEach(workspaceName => {
			      const {
			        location
			      } = workspacesLayout[workspaceName];
			      const pkgJsonPath = path$1.join(yarnWorkspaceRoot, location, `package.json`);
			      if (!fs.existsSync(pkgJsonPath)) {
			        return;
			      }
			      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, `utf8`));

			      // eslint-disable-next-line @babel/no-unused-expressions
			      handleDeps(pkg.dependencies);
			      // eslint-disable-next-line @babel/no-unused-expressions
			      handleDeps(pkg.devDependencies);
			      // eslint-disable-next-line @babel/no-unused-expressions
			      handleDeps(pkg.peerDependencies);
			    });

			    // package.json files are changed - so we just want to install
			    // using verdaccio registry
			    const yarnCommands = [`install`];
			    if (!externalRegistry) {
			      yarnCommands.push(`--registry=${registryUrl}`);
			    }
			    installCmd = [`pnpm`, yarnCommands];
			  } else {
			    const packageAndVersionsToInstall = packagesToInstall.map(packageName => {
			      const packageVersion = newlyPublishedPackageVersions[packageName];
			      return `${packageName}@${packageVersion}`;
			    });
			    if (packageManager === `pnpm`) {
			      const pnpmCommands = [`add`, ...packageAndVersionsToInstall, `--save-exact`];
			      if (!externalRegistry) {
			        pnpmCommands.push(`--registry=${registryUrl}`);
			      }
			      installCmd = [`pnpm`, pnpmCommands];
			    } else {
			      const yarnCommands = [`add`, ...packageAndVersionsToInstall, `--exact`];
			      if (!externalRegistry) {
			        yarnCommands.push(`--registry=${registryUrl}`);
			      }
			      installCmd = [`pnpm`, yarnCommands];
			    }
			  }
			  try {
			    await promisifiedSpawn(installCmd);
			    console.log(`Installation complete`);
			  } catch (error) {
			    console.error(`Installation failed`, error);
			    process.exit(1);
			  }
			}

			// eslint-disable-next-line @typescript-eslint/naming-convention

			let VerdaccioInitPromise = null;
			function startVerdaccio() {
			  if (VerdaccioInitPromise) {
			    return VerdaccioInitPromise;
			  }
			  console.log(`Starting local verdaccio server`);

			  // clear storage
			  fs.removeSync(verdaccioConfig.storage);
			  VerdaccioInitPromise = new Promise(resolve => {
			    start(verdaccioConfig, verdaccioConfig.port.toString(), verdaccioConfig.storage, `1.0.0`, `gatsby-dev`,
			    // eslint-disable-next-line @typescript-eslint/no-unused-vars
			    (webServer, addr, _pkgName, _pkgVersion) => {
			      // console.log(webServer)
			      webServer.listen(addr.port || addr.path, addr.host, () => {
			        console.log(`Started local verdaccio server`);
			        resolve(undefined);
			      });
			    });
			  });
			  return VerdaccioInitPromise;
			}
			async function publishPackagesLocallyAndInstall({
			  packagesToPublish,
			  localPackages,
			  packageNameToPath,
			  ignorePackageJSONChanges,
			  yarnWorkspaceRoot,
			  externalRegistry,
			  root,
			  packageManager
			}) {
			  await startVerdaccio();
			  const versionPostFix = Date.now();
			  const newlyPublishedPackageVersions = {};
			  for (const packageName of packagesToPublish) {
			    newlyPublishedPackageVersions[packageName] = await publishPackage({
			      packageName,
			      packagesToPublish,
			      packageNameToPath,
			      versionPostFix,
			      ignorePackageJSONChanges,
			      root
			    });
			  }
			  const packagesToInstall = _intersection(packagesToPublish, localPackages);
			  await installPackages({
			    packagesToInstall,
			    yarnWorkspaceRoot,
			    newlyPublishedPackageVersions,
			    externalRegistry,
			    packageManager
			  });
			}

			var baseIsEqual = _baseIsEqual;

			/**
			 * Performs a deep comparison between two values to determine if they are
			 * equivalent.
			 *
			 * **Note:** This method supports comparing arrays, array buffers, booleans,
			 * date objects, error objects, maps, numbers, `Object` objects, regexes,
			 * sets, strings, symbols, and typed arrays. `Object` objects are compared
			 * by their own, not inherited, enumerable properties. Functions and DOM
			 * nodes are compared by strict equality, i.e. `===`.
			 *
			 * @static
			 * @memberOf _
			 * @since 0.1.0
			 * @category Lang
			 * @param {*} value The value to compare.
			 * @param {*} other The other value to compare.
			 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
			 * @example
			 *
			 * var object = { 'a': 1 };
			 * var other = { 'a': 1 };
			 *
			 * _.isEqual(object, other);
			 * // => true
			 *
			 * object === other;
			 * // => false
			 */
			function isEqual(value, other) {
			  return baseIsEqual(value, other);
			}
			var isEqual_1 = isEqual;

			var _isEqual = /*@__PURE__*/getDefaultExportFromCjs(isEqual_1);

			/**
			 * A specialized version of `_.forEach` for arrays without support for
			 * iteratee shorthands.
			 *
			 * @private
			 * @param {Array} [array] The array to iterate over.
			 * @param {Function} iteratee The function invoked per iteration.
			 * @returns {Array} Returns `array`.
			 */

			function arrayEach$1(array, iteratee) {
			  var index = -1,
			    length = array == null ? 0 : array.length;
			  while (++index < length) {
			    if (iteratee(array[index], index, array) === false) {
			      break;
			    }
			  }
			  return array;
			}
			var _arrayEach = arrayEach$1;

			var arrayEach = _arrayEach,
			  baseCreate = _baseCreate,
			  baseForOwn = _baseForOwn,
			  baseIteratee = _baseIteratee,
			  getPrototype = _getPrototype,
			  isArray$1 = isArray_1,
			  isBuffer = isBufferExports,
			  isFunction = isFunction_1,
			  isObject = isObject_1,
			  isTypedArray = isTypedArray_1;

			/**
			 * An alternative to `_.reduce`; this method transforms `object` to a new
			 * `accumulator` object which is the result of running each of its own
			 * enumerable string keyed properties thru `iteratee`, with each invocation
			 * potentially mutating the `accumulator` object. If `accumulator` is not
			 * provided, a new object with the same `[[Prototype]]` will be used. The
			 * iteratee is invoked with four arguments: (accumulator, value, key, object).
			 * Iteratee functions may exit iteration early by explicitly returning `false`.
			 *
			 * @static
			 * @memberOf _
			 * @since 1.3.0
			 * @category Object
			 * @param {Object} object The object to iterate over.
			 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
			 * @param {*} [accumulator] The custom accumulator value.
			 * @returns {*} Returns the accumulated value.
			 * @example
			 *
			 * _.transform([2, 3, 4], function(result, n) {
			 *   result.push(n *= n);
			 *   return n % 2 == 0;
			 * }, []);
			 * // => [4, 9]
			 *
			 * _.transform({ 'a': 1, 'b': 2, 'c': 1 }, function(result, value, key) {
			 *   (result[value] || (result[value] = [])).push(key);
			 * }, {});
			 * // => { '1': ['a', 'c'], '2': ['b'] }
			 */
			function transform(object, iteratee, accumulator) {
			  var isArr = isArray$1(object),
			    isArrLike = isArr || isBuffer(object) || isTypedArray(object);
			  iteratee = baseIteratee(iteratee);
			  if (accumulator == null) {
			    var Ctor = object && object.constructor;
			    if (isArrLike) {
			      accumulator = isArr ? new Ctor() : [];
			    } else if (isObject(object)) {
			      accumulator = isFunction(Ctor) ? baseCreate(getPrototype(object)) : {};
			    } else {
			      accumulator = {};
			    }
			  }
			  (isArrLike ? arrayEach : baseForOwn)(object, function (value, index, object) {
			    return iteratee(accumulator, value, index, object);
			  });
			  return accumulator;
			}
			var transform_1 = transform;

			var _transform = /*@__PURE__*/getDefaultExportFromCjs(transform_1);

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			function difference$1(object, base) {
			  // eslint-disable-next-line @typescript-eslint/no-explicit-any
			  function changes(object, base) {
			    return _transform(object, function (result, value, key) {
			      if (!_isEqual(value, base[key])) {
			        result[key] = _isObject(value) && _isObject(base[key]) ? changes(value, base[key]) : value;
			      }
			    });
			  }
			  return changes(object, base);
			}

			/**
			 * Compare dependencies of installed packages and monorepo package.
			 * It will skip dependencies that are removed in monorepo package.
			 *
			 * If local package is not installed, it will check unpkg.com.
			 * This allow gatsby-dev to skip publishing unnecesairly and
			 * let install packages from public npm repository if nothing changed.
			 */
			async function checkDepsChanges({
			  newPath,
			  packageName,
			  monoRepoPackages,
			  isInitialScan,
			  ignoredPackageJSON,
			  packageNameToPath
			}) {
			  let localPKGjson;
			  let packageNotInstalled = false;
			  try {
			    localPKGjson = JSON.parse(fs.readFileSync(newPath, `utf-8`));
			  } catch {
			    packageNotInstalled = true;
			    // there is no local package - so we still need to install deps
			    // this is nice because devs won't need to do initial package installation - we can handle this.
			    if (!isInitialScan) {
			      console.log(`'${packageName}' doesn't seem to be installed. Restart gatsby-dev to publish it`);
			      return {
			        didDepsChanged: false,
			        packageNotInstalled
			      };
			    }

			    // if package is not installed, we will do http GET request to
			    // unkpg to check if dependency in package published in public
			    // npm repository are different

			    // this allow us to not publish to local repository
			    // and save some time/work
			    try {
			      const version = getPackageVersion(packageName);
			      const url = `https://unpkg.com/${packageName}@${version}/package.json`;
			      const response = await got(url);
			      if (response?.statusCode !== 200) {
			        throw new Error(`No response or non 200 code for ${url}`);
			      }
			      localPKGjson = JSON.parse(response.body);
			    } catch (e) {
			      console.log(`'${packageName}' doesn't seem to be installed and is not published on NPM. Error: ${e.message}`);
			      return {
			        didDepsChanged: true,
			        packageNotInstalled
			      };
			    }
			  }
			  const monoRepoPackageJsonPath = getMonorepoPackageJsonPath({
			    packageName,
			    packageNameToPath
			  });
			  const monorepoPKGjsonString = fs.readFileSync(monoRepoPackageJsonPath, `utf-8`);
			  const monorepoPKGjson = JSON.parse(monorepoPKGjsonString);
			  if (ignoredPackageJSON.has(packageName)) {
			    if (ignoredPackageJSON.get(packageName).includes(monorepoPKGjsonString)) {
			      // we are in middle of publishing and content of package.json is one set during publish process,
			      // so we need to not cause false positives
			      return {
			        didDepsChanged: false,
			        packageNotInstalled
			      };
			    }
			  }
			  if (!monorepoPKGjson.dependencies) monorepoPKGjson.dependencies = {};
			  if (!localPKGjson.dependencies) localPKGjson.dependencies = {};
			  const areDepsEqual = _isEqual(monorepoPKGjson.dependencies, localPKGjson.dependencies);
			  if (!areDepsEqual) {
			    const diff = difference$1(monorepoPKGjson.dependencies, localPKGjson.dependencies);
			    const diff2 = difference$1(localPKGjson.dependencies, monorepoPKGjson.dependencies);
			    let needPublishing = false;
			    let isPublishing = false;
			    const depChangeLog = _uniq(Object.keys({
			      ...diff,
			      ...diff2
			    })).reduce((acc, key) => {
			      if (monorepoPKGjson.dependencies?.[key] === `gatsby-dev`) {
			        // if we are in middle of publishing to local repository - ignore
			        isPublishing = true;
			        return acc;
			      }
			      if (localPKGjson.dependencies[key] === `gatsby-dev`) {
			        // monorepo packages will restore version, but after installation
			        // in local site - it will use `gatsby-dev` dist tag - we need
			        // to ignore changes that
			        return acc;
			      }
			      if (localPKGjson.dependencies[key] && monorepoPKGjson.dependencies?.[key]) {
			        // Check only for version changes in packages
			        // that are not from gatsby repo.
			        // Changes in gatsby packages will be copied over
			        // from monorepo - and if those contain other dependency
			        // changes - they will be covered
			        if (!monoRepoPackages.includes(key)) {
			          acc.push(` - '${key}' changed version from ${localPKGjson.dependencies[key]} to ${monorepoPKGjson.dependencies[key]}`);
			          needPublishing = true;
			        }
			      } else if (monorepoPKGjson.dependencies?.[key]) {
			        acc.push(` - '${key}@${monorepoPKGjson.dependencies[key]}' was added`);
			        needPublishing = true;
			      } else {
			        acc.push(` - '${key}@${localPKGjson.dependencies[key]}' was removed`);
			        // this doesn't need publishing really, so will skip this
			      }
			      return acc;
			    }, []).join(`\n`);
			    if (!isPublishing && depChangeLog.length > 0) {
			      console.log(`Dependencies of '${packageName}' changed:\n${depChangeLog}`);
			      if (isInitialScan) {
			        console.log(`Will ${!needPublishing ? `not ` : ``}publish to local npm registry.`);
			      } else {
			        console.warn(`Installation of dependencies after initial scan is not implemented`);
			      }
			      return {
			        didDepsChanged: needPublishing,
			        packageNotInstalled
			      };
			    }
			  }
			  return {
			    didDepsChanged: false,
			    packageNotInstalled
			  };
			}
			function getPackageVersion(packageName) {
			  const projectPackageJson = JSON.parse(fs.readFileSync(`./package.json`, `utf-8`));
			  const {
			    dependencies = {},
			    devDependencies = {}
			  } = projectPackageJson;
			  const version = dependencies[packageName] || devDependencies[packageName];
			  return version || `latest`;
			}

			/**
			 * Recursively get set of packages that depend on given package.
			 * Set also includes passed package.
			 */
			function getDependantPackages({
			  packageName,
			  depTree,
			  packagesToPublish = new Set()
			  // eslint-disable-next-line @typescript-eslint/no-explicit-any
			}) {
			  if (packagesToPublish.has(packageName)) {
			    // bail early if package was already handled
			    return packagesToPublish;
			  }
			  packagesToPublish.add(packageName);
			  const dependants = depTree[packageName];
			  if (dependants) {
			    dependants.forEach(dependant => {
			      return getDependantPackages({
			        packageName: dependant,
			        depTree,
			        packagesToPublish
			      });
			    });
			  }
			  return packagesToPublish;
			}

			var SetCache = _SetCache,
			  arrayIncludes = _arrayIncludes,
			  arrayIncludesWith = _arrayIncludesWith,
			  arrayMap = _arrayMap,
			  baseUnary = _baseUnary,
			  cacheHas = _cacheHas;

			/** Used as the size to enable large array optimizations. */
			var LARGE_ARRAY_SIZE = 200;

			/**
			 * The base implementation of methods like `_.difference` without support
			 * for excluding multiple arrays or iteratee shorthands.
			 *
			 * @private
			 * @param {Array} array The array to inspect.
			 * @param {Array} values The values to exclude.
			 * @param {Function} [iteratee] The iteratee invoked per element.
			 * @param {Function} [comparator] The comparator invoked per element.
			 * @returns {Array} Returns the new array of filtered values.
			 */
			function baseDifference$1(array, values, iteratee, comparator) {
			  var index = -1,
			    includes = arrayIncludes,
			    isCommon = true,
			    length = array.length,
			    result = [],
			    valuesLength = values.length;
			  if (!length) {
			    return result;
			  }
			  if (iteratee) {
			    values = arrayMap(values, baseUnary(iteratee));
			  }
			  if (comparator) {
			    includes = arrayIncludesWith;
			    isCommon = false;
			  } else if (values.length >= LARGE_ARRAY_SIZE) {
			    includes = cacheHas;
			    isCommon = false;
			    values = new SetCache(values);
			  }
			  outer: while (++index < length) {
			    var value = array[index],
			      computed = iteratee == null ? value : iteratee(value);
			    value = comparator || value !== 0 ? value : 0;
			    if (isCommon && computed === computed) {
			      var valuesIndex = valuesLength;
			      while (valuesIndex--) {
			        if (values[valuesIndex] === computed) {
			          continue outer;
			        }
			      }
			      result.push(value);
			    } else if (!includes(values, computed, comparator)) {
			      result.push(value);
			    }
			  }
			  return result;
			}
			var _baseDifference = baseDifference$1;

			var Symbol = _Symbol,
			  isArguments = isArguments_1,
			  isArray = isArray_1;

			/** Built-in value references. */
			var spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined;

			/**
			 * Checks if `value` is a flattenable `arguments` object or array.
			 *
			 * @private
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
			 */
			function isFlattenable$1(value) {
			  return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
			}
			var _isFlattenable = isFlattenable$1;

			var arrayPush = _arrayPush,
			  isFlattenable = _isFlattenable;

			/**
			 * The base implementation of `_.flatten` with support for restricting flattening.
			 *
			 * @private
			 * @param {Array} array The array to flatten.
			 * @param {number} depth The maximum recursion depth.
			 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
			 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
			 * @param {Array} [result=[]] The initial result value.
			 * @returns {Array} Returns the new flattened array.
			 */
			function baseFlatten$1(array, depth, predicate, isStrict, result) {
			  var index = -1,
			    length = array.length;
			  predicate || (predicate = isFlattenable);
			  result || (result = []);
			  while (++index < length) {
			    var value = array[index];
			    if (depth > 0 && predicate(value)) {
			      if (depth > 1) {
			        // Recursively flatten arrays (susceptible to call stack limits).
			        baseFlatten$1(value, depth - 1, predicate, isStrict, result);
			      } else {
			        arrayPush(result, value);
			      }
			    } else if (!isStrict) {
			      result[result.length] = value;
			    }
			  }
			  return result;
			}
			var _baseFlatten = baseFlatten$1;

			var baseDifference = _baseDifference,
			  baseFlatten = _baseFlatten,
			  baseRest = _baseRest,
			  isArrayLikeObject = isArrayLikeObject_1;

			/**
			 * Creates an array of `array` values not included in the other given arrays
			 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
			 * for equality comparisons. The order and references of result values are
			 * determined by the first array.
			 *
			 * **Note:** Unlike `_.pullAll`, this method returns a new array.
			 *
			 * @static
			 * @memberOf _
			 * @since 0.1.0
			 * @category Array
			 * @param {Array} array The array to inspect.
			 * @param {...Array} [values] The values to exclude.
			 * @returns {Array} Returns the new array of filtered values.
			 * @see _.without, _.xor
			 * @example
			 *
			 * _.difference([2, 1], [2, 3]);
			 * // => [1]
			 */
			var difference = baseRest(function (array, values) {
			  return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true)) : [];
			});
			var difference_1 = difference;

			var _difference = /*@__PURE__*/getDefaultExportFromCjs(difference_1);

			/**
			 * @typedef {Object} TraversePackagesDepsReturn
			 * @property {Object} depTree Lookup table to check dependants for given package.
			 * Used to determine which packages need to be published.
			 * @example
			 * ```
			 * {
			 *   "gatsby-cli": Set(["gatsby"]),
			 *   "gatsby-telemetry": Set(["gatsby", "gatsby-cli"]),
			 *   "gatsby-source-filesystem": Set(["gatsby-source-contentful", "gatsby-source-drupal", "gatsby-source-wordpress", etc])
			 *   // no package have remark plugin in dependencies - so dependent list is empty
			 *   "gatsby-transformer-remark": Set([])
			 * }
			 * ```
			 */

			/**
			 * Compile final list of packages to watch
			 * This will include packages explicitly defined packages and all their dependencies
			 * Also creates dependency graph that is used later to determine which packages
			 * would need to be published when their dependencies change
			 * @param {Object} $0
			 * @param {String} $0.root Path to root of Gatsby monorepo repository
			 * @param {String[]} $0.packages Initial array of packages to watch
			 * This can be extracted from project dependencies or explicitly set by `--packages` flag
			 * @param {String[]} $0.monoRepoPackages Array of packages in Gatsby monorepo
			 * @param {String[]} [$0.seenPackages] Array of packages that were already traversed.
			 * This makes sure dependencies are extracted one time for each package and avoid any
			 * infinite loops.
			 * @param {DepTree} [$0.depTree] Used internally to recursively construct dependency graph.
			 * @return {TraversePackagesDepsReturn}
			 */
			function traversePackagesDeps({
			  packages,
			  monoRepoPackages,
			  seenPackages = [...packages],
			  depTree = {},
			  packageNameToPath
			}) {
			  packages.forEach(p => {
			    let pkgJson;
			    try {
			      const packageRoot = packageNameToPath.get(p);
			      if (packageRoot) {
			        pkgJson = require(path.join(packageRoot, `package.json`));
			      } else {
			        console.error(`"${p}" package doesn't exist in monorepo.`);
			        // remove from seenPackages
			        seenPackages = seenPackages.filter(seenPkg => seenPkg !== p);
			        return;
			      }
			    } catch (e) {
			      console.error(`"${p}" package doesn't exist in monorepo.`, e);
			      // remove from seenPackages
			      seenPackages = seenPackages.filter(seenPkg => seenPkg !== p);
			      return;
			    }
			    const fromMonoRepo = _intersection(Object.keys({
			      ...pkgJson.dependencies
			    }), monoRepoPackages);
			    fromMonoRepo.forEach(pkgName => {
			      depTree[pkgName] = (depTree[pkgName] || new Set()).add(p);
			    });

			    // only traverse not yet seen packages to avoid infinite loops
			    const newPackages = _difference(fromMonoRepo, seenPackages);
			    if (newPackages.length) {
			      newPackages.forEach(depFromMonorepo => {
			        seenPackages.push(depFromMonorepo);
			      });
			      traversePackagesDeps({
			        packages: fromMonoRepo,
			        monoRepoPackages,
			        seenPackages,
			        depTree,
			        packageNameToPath
			      });
			    }
			  });
			  return {
			    seenPackages,
			    depTree
			  };
			}

			let numCopied = 0;
			function quit() {
			  console.log(`Copied ${numCopied} files`);
			  process.exit();
			}
			const MAX_COPY_RETRIES = 3;

			/*
			 * non-existent packages break on('ready')
			 * See: https://github.com/paulmillr/chokidar/issues/449
			 */
			async function watch(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			root, packages, {
			  scanOnce,
			  quiet,
			  forceInstall,
			  monoRepoPackages,
			  localPackages,
			  packageNameToPath,
			  externalRegistry,
			  packageManager
			  // eslint-disable-next-line @typescript-eslint/no-explicit-any
			}) {
			  setDefaultSpawnStdio(quiet ? `ignore` : `inherit`);
			  // determine if in yarn workspace - if in workspace, force using verdaccio
			  // as current logic of copying files will not work correctly.
			  const yarnWorkspaceRoot = findWorkspaceRoot();
			  if (yarnWorkspaceRoot && "production" !== `test`) {
			    console.log(`Yarn workspace found.`);
			    forceInstall = true;
			  }
			  let afterPackageInstallation = false;
			  // eslint-disable-next-line @typescript-eslint/no-explicit-any
			  let queuedCopies = [];

			  // eslint-disable-next-line @typescript-eslint/no-explicit-any
			  function realCopyPath(arg) {
			    const {
			      oldPath,
			      newPath,
			      quiet,
			      resolve,
			      reject,
			      retry = 0
			    } = arg;
			    // eslint-disable-next-line @typescript-eslint/no-explicit-any
			    fs.copy(oldPath, newPath, err => {
			      if (err) {
			        if (retry >= MAX_COPY_RETRIES) {
			          console.error(err);
			          reject(err);
			          return;
			        } else {
			          globalThis.setTimeout(() => {
			            return realCopyPath({
			              ...arg,
			              retry: retry + 1
			            });
			          }, 500 * Math.pow(2, retry));
			          return;
			        }
			      }

			      // When the gatsby binary is copied over, it is not setup with the executable
			      // permissions that it is given when installed via yarn.
			      // This fixes the issue where after running gatsby-dev, running `pnpm run gatsby develop`
			      // fails with a permission issue.
			      // @fixes https://github.com/gatsbyjs/gatsby/issues/18809
			      // Binary files we target:
			      // - gatsby/bin/gatsby.js
			      //  -gatsby/cli.js
			      //  -gatsby-cli/cli.js
			      if (/(bin\/gatsby.js|gatsby(-cli)?\/cli.js)$/.test(newPath)) {
			        fs.chmodSync(newPath, `0755`);
			      }
			      numCopied += 1;
			      if (!quiet) {
			        console.log(`Copied ${oldPath} to ${newPath}`);
			      }
			      resolve();
			    });
			  }
			  function copyPath(oldPath, newPath,
			  // eslint-disable-next-line @typescript-eslint/no-explicit-any
			  quiet, packageName) {
			    return new Promise((resolve, reject) => {
			      const argObj = {
			        oldPath,
			        newPath,
			        quiet,
			        packageName,
			        resolve,
			        reject
			      };
			      if (afterPackageInstallation) {
			        realCopyPath(argObj);
			      } else {
			        queuedCopies.push(argObj);
			      }
			    });
			  }
			  function runQueuedCopies() {
			    afterPackageInstallation = true;
			    queuedCopies.forEach(argObj => realCopyPath(argObj));
			    queuedCopies = [];
			  }
			  async function clearJSFilesFromNodeModules() {
			    const packagesToClear = queuedCopies.reduce((acc, {
			      packageName
			    }) => {
			      if (packageName) {
			        acc.add(packageName);
			      }
			      return acc;
			    }, new Set());
			    await Promise.all([...packagesToClear].map(async packageToClear => await del.deleteAsync([`node_modules/${packageToClear}/**/*.{js,js.map}`, `!node_modules/${packageToClear}/node_modules/**/*.{js,js.map}`, `!node_modules/${packageToClear}/src/**/*.{js,js.map}`])));
			  }
			  // check packages deps and if they depend on other packages from monorepo
			  // add them to packages list
			  const {
			    seenPackages,
			    depTree
			  } = traversePackagesDeps({
			    // root,
			    packages: _uniq(localPackages),
			    monoRepoPackages,
			    packageNameToPath
			  });
			  const allPackagesToWatch = packages ? _intersection(Array.from(packages), seenPackages) : seenPackages;
			  const ignoredPackageJSON = new Map();
			  function ignorePackageJSONChanges(
			  // eslint-disable-next-line @typescript-eslint/no-explicit-any
			  packageName,
			  // eslint-disable-next-line @typescript-eslint/no-explicit-any
			  contentArray) {
			    ignoredPackageJSON.set(packageName, contentArray);
			    return () => {
			      ignoredPackageJSON.delete(packageName);
			    };
			  }
			  if (forceInstall) {
			    try {
			      if (allPackagesToWatch.length > 0) {
			        await publishPackagesLocallyAndInstall({
			          packagesToPublish: allPackagesToWatch,
			          packageNameToPath,
			          localPackages,
			          ignorePackageJSONChanges,
			          yarnWorkspaceRoot,
			          externalRegistry,
			          root,
			          packageManager
			        });
			      } else {
			        // run `pnpm install`
			        const pnpmInstallCmd = [`pnpm install`];
			        console.log(`Installing packages from public NPM registry`);
			        await promisifiedSpawn(pnpmInstallCmd);
			        console.log(`Installation complete`);
			      }
			    } catch (e) {
			      console.log(e);
			    }
			    process.exit();
			  }
			  if (allPackagesToWatch.length === 0) {
			    console.error(`There are no packages to watch.`);
			    return;
			  }
			  const allPackagesIgnoringThemesToWatch = allPackagesToWatch.filter(pkgName => !pkgName.startsWith(`gatsby-theme`));
			  const ignored = [/[/\\]node_modules[/\\]/i, /\.git/i, /\.DS_Store/, /[/\\]__tests__[/\\]/i, /[/\\]__mocks__[/\\]/i, /\.npmrc/i].concat(allPackagesIgnoringThemesToWatch.map(
			  // eslint-disable-next-line @typescript-eslint/no-explicit-any
			  p => new RegExp(`${p}[\\/\\\\]src[\\/\\\\]`, `i`)));
			  const watchers = _uniq(allPackagesToWatch
			  // eslint-disable-next-line @typescript-eslint/no-explicit-any
			  .map(p => path$1.join(packageNameToPath.get(p))).filter(p => fs.existsSync(p)));
			  let allCopies = [];
			  const packagesToPublish = new Set();
			  let isInitialScan = true;
			  let isPublishing = false;
			  const waitFor = new Set();
			  let anyPackageNotInstalled = false;
			  const watchEvents = [`change`, `add`];
			  const packagePathMatchingEntries = Array.from(packageNameToPath.entries());
			  chokidar.watch(watchers, {
			    ignored: [filePath => {
			      return _some(ignored, reg => {
			        return reg.test(filePath);
			      });
			    }]
			  }).on(`all`, async (event, filePath) => {
			    if (!watchEvents.includes(event)) {
			      return;
			    }

			    // match against paths
			    // eslint-disable-next-line @typescript-eslint/no-explicit-any
			    let packageName;

			    // @ts-ignore
			    for (const [_packageName, packagePath] of packagePathMatchingEntries) {
			      const relativeToThisPackage = path$1.relative(packagePath, filePath);
			      if (!relativeToThisPackage.startsWith(`..`)) {
			        packageName = _packageName;
			        break;
			      }
			    }
			    if (!packageName) {
			      return;
			    }
			    const prefix = packageNameToPath.get(packageName);

			    // Copy it over local version.
			    // Don't copy over the Gatsby bin file as that breaks the NPM symlink.
			    if (_includes(filePath, `dist/gatsby-cli.js`)) {
			      return;
			    }
			    const relativePackageFile = path$1.relative(prefix, filePath);
			    const newPath = path$1.join(`./node_modules/${packageName}`, relativePackageFile);
			    if (relativePackageFile === `package.json`) {
			      // package.json files will change during publish to adjust version of package (and dependencies), so ignore
			      // changes during this process
			      if (isPublishing) {
			        return;
			      }

			      // Compare dependencies with local version

			      const didDepsChangedPromise = checkDepsChanges({
			        newPath,
			        packageName,
			        monoRepoPackages,
			        packageNameToPath,
			        isInitialScan,
			        ignoredPackageJSON
			      });
			      if (isInitialScan) {
			        // normally checkDepsChanges would be sync,
			        // but because it also can do async GET request
			        // to unpkg if local package is not installed
			        // keep track of it to make sure all of it
			        // finish before installing

			        waitFor.add(didDepsChangedPromise);
			      }
			      const {
			        didDepsChanged,
			        packageNotInstalled
			      } = await didDepsChangedPromise;
			      if (packageNotInstalled) {
			        anyPackageNotInstalled = true;
			      }
			      if (didDepsChanged) {
			        if (isInitialScan) {
			          waitFor.delete(didDepsChangedPromise);
			          // handle dependency change only in initial scan - this is for sure doable to
			          // handle this in watching mode correctly - but for the sake of shipping
			          // this I limit more work/time consuming edge cases.

			          // Dependency changed - now we need to figure out
			          // the packages that actually need to be published.
			          // If package with changed dependencies is dependency of other
			          // gatsby package - like for example `gatsby-plugin-page-creator`
			          // we need to publish both `gatsby-plugin-page-creator` and `gatsby`
			          // and install `gatsby` in example site project.
			          getDependantPackages({
			            packageName,
			            depTree,
			            packagesToPublish: packages
			          }).forEach(packageToPublish => {
			            // scheduling publish - we will publish when `ready` is emitted
			            // as we can do single publish then
			            packagesToPublish.add(packageToPublish);
			          });
			        }
			      }

			      // don't ever copy package.json as this will mess up any future dependency
			      // changes checks
			      return;
			    }
			    const localCopies = [copyPath(filePath, newPath, quiet, packageName)];

			    // If this is from "cache-dir" also copy it into the site's .cache
			    if (_includes(filePath, `cache-dir`)) {
			      const newCachePath = path$1.join(`.cache/`, path$1.relative(path$1.join(prefix, `cache-dir`), filePath));
			      localCopies.push(copyPath(filePath, newCachePath, quiet, packageName));
			    }
			    allCopies = allCopies.concat(localCopies);
			  }).on(`ready`, async () => {
			    // wait for all async work needed to be done
			    // before publishing / installing
			    await Promise.all(Array.from(waitFor));
			    if (isInitialScan) {
			      isInitialScan = false;
			      if (packagesToPublish.size > 0) {
			        isPublishing = true;
			        await publishPackagesLocallyAndInstall({
			          packagesToPublish: Array.from(packagesToPublish),
			          packageNameToPath,
			          localPackages,
			          ignorePackageJSONChanges,
			          externalRegistry,
			          root,
			          packageManager
			        });
			        packagesToPublish.clear();
			        isPublishing = false;
			      } else if (anyPackageNotInstalled) {
			        // run `pnpm install`
			        const pnpmInstallCmd = [`pnpm install`];
			        console.log(`Installing packages from public NPM registry`);
			        await promisifiedSpawn(pnpmInstallCmd);
			        console.log(`Installation complete`);
			      }
			      await clearJSFilesFromNodeModules();
			      runQueuedCopies();
			    }

			    // all files watched, quit once all files are copied if necessary
			    Promise.all(allCopies).then(() => {
			      if (scanOnce) {
			        quit();
			      }
			    });
			  });
			}

			function getVersionInfo() {
			  return `Gatsby Dev CLI version: ${version}`;
			}

			// eslint-disable-next-line @babel/no-unused-expressions
			argv.usage(`Usage: gatsby-dev [options]`).alias(`q`, `quiet`).nargs(`q`, 0).describe(`q`, `Do not output copy file information`).alias(`s`, `scan-once`).nargs(`s`, 0).describe(`s`, `Scan once. Do not start file watch`).alias(`p`, `set-path-to-repo`).nargs(`p`, 1).describe(`p`, `Set path to Gatsby repository.
You typically only need to configure this once.`).nargs(`force-install`, 0).describe(`force-install`, `Disables copying files into node_modules and forces usage of local npm repository.`).nargs(`external-registry`, 0).describe(`external-registry`, `Run 'pnpm add' commands without the --registry flag.`).alias(`C`, `copy-all`).nargs(`C`, 0).describe(`C`, `Copy all contents in packages/ instead of just gatsby packages`).array(`packages`).describe(`packages`, `Explicitly specify packages to copy`).help(`h`).alias(`h`, `help`).nargs(`v`, 0).alias(`v`, `version`).describe(`v`, `Print the currently installed version of Gatsby Dev CLI`).choices(`package-manager`, [`pnpm`, `npm`]).default(`package-manager`, `pnpm`).describe(`package-manager`, `Package manager to use for installing dependencies.`).argv;
			if (argv.version) {
			  console.log(getVersionInfo());
			  process.exit();
			}
			const conf = new Configstore(pkg.name);
			let pathToRepo = argv.setPathToRepo;
			if (pathToRepo) {
			  if (pathToRepo.includes(`~`)) {
			    pathToRepo = path$1.join(os$1.homedir(), pathToRepo.split(`~`).pop());
			  }
			  conf.set(`gatsby-location`, path$1.resolve(pathToRepo));
			  process.exit();
			}
			const havePackageJsonFile = fs.existsSync(`package.json`);
			if (!havePackageJsonFile) {
			  console.error(`Current folder must have a package.json file!`);
			  process.exit();
			}
			const gatsbyLocation = conf.get(`gatsby-location`);
			if (!gatsbyLocation) {
			  console.error(`
You haven't set the path yet to your cloned
version of Gatsby. Do so now by running:

gatsby-dev --set-path-to-repo /path/to/my/cloned/version/gatsby
`);
			  process.exit();
			}

			// get list of packages from monorepo
			const packageNameToPath = new Map();
			const monoRepoPackages = fs.readdirSync(path$1.join(gatsbyLocation, `packages`)).map(dirName => {
			  try {
			    const filePath = path$1.join(gatsbyLocation, `packages`, dirName, `package.json`);
			    const file = fs.readFileSync(filePath).toString();
			    const localPkg = JSON.parse(file);
			    if (localPkg?.name) {
			      packageNameToPath.set(localPkg.name, path$1.join(gatsbyLocation, `packages`, dirName));
			      return localPkg.name;
			    }
			  } catch (error) {
			    // fallback to generic one
			  }
			  packageNameToPath.set(dirName, path$1.join(gatsbyLocation, `packages`, dirName));
			  return dirName;
			});
			const file = fs.readFileSync(`package.json`).toString();
			const localPkg = JSON.parse(file);

			// intersect dependencies with monoRepoPackages to get list of packages that are used
			const localPackages = _intersection(monoRepoPackages, Object.keys(_merge({}, localPkg.dependencies, localPkg.devDependencies)));
			if (!argv.packages && _isEmpty(localPackages)) {
			  console.error(`
You haven't got any gatsby dependencies into your current package.json

You probably want to pass in a list of packages to start
developing on! For example:

gatsby-dev --packages gatsby gatsby-transformer-remark

If you prefer to place them in your package.json dependencies instead,
gatsby-dev will pick them up.
`);
			  if (!argv.forceInstall) {
			    process.exit();
			  } else {
			    console.log(`Continuing other dependencies installation due to "--forceInstall" flag`);
			  }
			}
			watch(gatsbyLocation, argv.packages, {
			  localPackages,
			  quiet: argv.quiet,
			  scanOnce: argv.scanOnce,
			  forceInstall: argv.forceInstall,
			  monoRepoPackages,
			  packageNameToPath,
			  externalRegistry: argv.externalRegistry,
			  packageManager: argv.packageManager
			});

		})
	};
}));
