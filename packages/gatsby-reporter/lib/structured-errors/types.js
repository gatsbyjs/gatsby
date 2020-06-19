"use strict";

exports.__esModule = true;
exports.ErrorType = exports.ErrorLevel = void 0;
let ErrorLevel;
exports.ErrorLevel = ErrorLevel;

(function (ErrorLevel) {
  ErrorLevel["ERROR"] = "ERROR";
  ErrorLevel["WARNING"] = "WARNING";
  ErrorLevel["INFO"] = "INFO";
  ErrorLevel["DEBUG"] = "DEBUG";
})(ErrorLevel || (exports.ErrorLevel = ErrorLevel = {}));

let ErrorType;
exports.ErrorType = ErrorType;

(function (ErrorType) {
  ErrorType["GRAPHQL"] = "GRAPHQL";
  ErrorType["CONFIG"] = "CONFIG";
  ErrorType["WEBPACK"] = "WEBPACK";
  ErrorType["PLUGIN"] = "PLUGIN";
})(ErrorType || (exports.ErrorType = ErrorType = {}));