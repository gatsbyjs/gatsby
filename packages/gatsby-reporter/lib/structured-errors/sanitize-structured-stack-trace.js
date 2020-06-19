"use strict";

exports.__esModule = true;
exports.sanitizeStructuredStackTrace = void 0;

var _gatsbyCoreUtils = require("gatsby-core-utils");

const packagesToSkip = [`core-js`, `bluebird`, `regenerator-runtime`, `graphql`];
const packagesToSkipTest = new RegExp(`node_modules[\\/](${packagesToSkip.join(`|`)})`); // TO-DO: move this this out of this file (and probably delete this file completely)
// it's here because it re-implements similar thing as `pretty-error` already does

const sanitizeStructuredStackTrace = stack => {
  // first filter out not useful call sites
  stack = stack.filter(callSite => {
    if (!callSite.getFileName()) {
      return false;
    }

    if (packagesToSkipTest.test(callSite.getFileName())) {
      return false;
    }

    if (callSite.getFileName().includes(`asyncToGenerator.js`)) {
      return false;
    }

    if ((0, _gatsbyCoreUtils.isNodeInternalModulePath)(callSite.getFileName())) {
      return false;
    }

    return true;
  }); // then sanitize individual call site objects to make sure we don't
  // emit objects with extra fields that won't be handled by consumers

  return stack.map(callSite => {
    return {
      fileName: callSite.getFileName(),
      functionName: callSite.getFunctionName(),
      columnNumber: callSite.getColumnNumber(),
      lineNumber: callSite.getLineNumber()
    };
  });
};

exports.sanitizeStructuredStackTrace = sanitizeStructuredStackTrace;