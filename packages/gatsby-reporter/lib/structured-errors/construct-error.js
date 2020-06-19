"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _stackTrace = _interopRequireDefault(require("stack-trace"));

var _errorSchema = require("./error-schema");

var _errorMap = require("./error-map");

var _sanitizeStructuredStackTrace = require("./sanitize-structured-stack-trace");

// Merge partial error details with information from the errorMap
// Validate the constructed object against an error schema
const constructError = ({
  details: {
    id,
    ...otherDetails
  }
}) => {
  const result = id && _errorMap.errorMap[id] || _errorMap.defaultError; // merge

  const structuredError = {
    context: {},
    ...otherDetails,
    ...result,
    text: result.text(otherDetails.context),
    stack: otherDetails.error ? (0, _sanitizeStructuredStackTrace.sanitizeStructuredStackTrace)(_stackTrace.default.parse(otherDetails.error)) : [],
    docsUrl: result.docsUrl || `https://gatsby.dev/issue-how-to`
  };

  if (id) {
    structuredError.code = id;
  } // validate


  const {
    error
  } = _errorSchema.errorSchema.validate(structuredError);

  if (error !== null) {
    console.log(`Failed to validate error`, error);
    process.exit(1);
  }

  return structuredError;
};

var _default = constructError;
exports.default = _default;