"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.verdaccioConfig = exports.registryUrl = void 0;
var _nodePath = _interopRequireDefault(require("node:path"));
var _nodeOs = _interopRequireDefault(require("node:os"));
const verdaccioConfig = exports.verdaccioConfig = {
  storage: _nodePath.default.join(_nodeOs.default.tmpdir(), `verdaccio`, `storage`),
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
const registryUrl = exports.registryUrl = `http://localhost:${verdaccioConfig.port}`;