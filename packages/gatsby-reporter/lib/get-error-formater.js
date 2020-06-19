"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.getErrorFormatter = getErrorFormatter;

var _prettyError = _interopRequireDefault(require("pretty-error"));

function getErrorFormatter() {
  const prettyError = new _prettyError.default();
  const baseRender = prettyError.render;
  prettyError.skipNodeFiles();
  prettyError.skipPackage(`regenerator-runtime`, `graphql`, `core-js` // `static-site-generator-webpack-plugin`,
  // `tapable`, // webpack
  ); // @ts-ignore the type defs in prettyError are wrong

  prettyError.skip(traceLine => {
    if (traceLine && traceLine.file === `asyncToGenerator.js`) return true;
    return false;
  });
  prettyError.appendStyle({
    "pretty-error": {
      marginTop: 1
    },
    "pretty-error > header": {
      background: `red`
    },
    "pretty-error > header > colon": {
      color: `white`
    }
  });

  if (process.env.FORCE_COLOR === `0`) {
    prettyError.withoutColors();
  }

  prettyError.render = err => {
    if (Array.isArray(err)) {
      return err.map(e => prettyError.render(e)).join(`\n`);
    }

    let rendered = baseRender.call(prettyError, err);
    if (`codeFrame` in err) rendered = `\n${err.codeFrame}\n${rendered}`;
    return rendered;
  };

  return prettyError;
}