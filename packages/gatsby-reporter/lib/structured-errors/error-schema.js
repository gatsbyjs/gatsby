"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.errorSchema = exports.Position = void 0;

var _joi = _interopRequireDefault(require("@hapi/joi"));

const Position = _joi.default.object().keys({
  line: _joi.default.number(),
  column: _joi.default.number()
});

exports.Position = Position;

const errorSchema = _joi.default.object().keys({
  code: _joi.default.string(),
  text: _joi.default.string(),
  stack: _joi.default.array().items(_joi.default.object().keys({
    fileName: _joi.default.string(),
    functionName: _joi.default.string().allow(null),
    lineNumber: _joi.default.number().allow(null),
    columnNumber: _joi.default.number().allow(null)
  })).allow(null),
  level: _joi.default.string().valid([`ERROR`, `WARNING`, `INFO`, `DEBUG`]),
  type: _joi.default.string().valid([`GRAPHQL`, `CONFIG`, `WEBPACK`, `PLUGIN`]),
  filePath: _joi.default.string(),
  location: _joi.default.object({
    start: Position.required(),
    end: Position
  }),
  docsUrl: _joi.default.string().uri({
    allowRelative: false,
    relativeOnly: false
  }),
  error: _joi.default.object({}).unknown(),
  context: _joi.default.object({}).unknown(),
  group: _joi.default.string(),
  panicOnBuild: _joi.default.boolean()
});

exports.errorSchema = errorSchema;