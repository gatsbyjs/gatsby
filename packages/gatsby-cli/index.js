#!/usr/bin/env node
"use strict";

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

require("core-js/modules/es6.typed.array-buffer");

require("core-js/modules/es6.typed.int8-array");

require("core-js/modules/es6.typed.uint8-array");

require("core-js/modules/es6.typed.uint8-clamped-array");

require("core-js/modules/es6.typed.int16-array");

require("core-js/modules/es6.typed.uint16-array");

require("core-js/modules/es6.typed.int32-array");

require("core-js/modules/es6.typed.uint32-array");

require("core-js/modules/es6.typed.float32-array");

require("core-js/modules/es6.typed.float64-array");

require("core-js/modules/es6.map");

require("core-js/modules/es6.set");

require("core-js/modules/es6.weak-map");

require("core-js/modules/es6.weak-set");

require("core-js/modules/es6.reflect.apply");

require("core-js/modules/es6.reflect.construct");

require("core-js/modules/es6.reflect.define-property");

require("core-js/modules/es6.reflect.delete-property");

require("core-js/modules/es6.reflect.get");

require("core-js/modules/es6.reflect.get-own-property-descriptor");

require("core-js/modules/es6.reflect.get-prototype-of");

require("core-js/modules/es6.reflect.has");

require("core-js/modules/es6.reflect.is-extensible");

require("core-js/modules/es6.reflect.own-keys");

require("core-js/modules/es6.reflect.prevent-extensions");

require("core-js/modules/es6.reflect.set");

require("core-js/modules/es6.reflect.set-prototype-of");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.function.name");

require("core-js/modules/es6.regexp.flags");

require("core-js/modules/es6.regexp.match");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.regexp.search");

require("core-js/modules/es6.array.from");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es7.object.values");

require("core-js/modules/es7.object.entries");

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es7.string.pad-start");

require("core-js/modules/es7.string.pad-end");

require("regenerator-runtime/runtime");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var program = require(`commander`);

// babel-preset-env doesn't find this import if you
// use require() with backtick strings so use the es6 syntax

var packageJson = require(`./package.json`);
var path = require(`path`);
var _ = require(`lodash`);
var resolveCwd = require(`resolve-cwd`);

program.version(packageJson.version).usage(`[command] [options]`);

var inGatsbySite = false;
var localPackageJSON = void 0;
try {
  localPackageJSON = require(path.resolve(`./package.json`));
  if (localPackageJSON.dependencies && localPackageJSON.dependencies.gatsby || localPackageJSON.devDependencies && localPackageJSON.devDependencies.gatsby) {
    inGatsbySite = true;
  } else if (localPackageJSON.devDependencies && localPackageJSON.devDependencies.gatsby) {
    inGatsbySite = true;
  }
} catch (err) {
  // ignore
}

var defaultHost = `localhost`;

var directory = path.resolve(`.`);
var getSiteInfo = function getSiteInfo() {
  var sitePackageJson = require(path.join(directory, `package.json`));
  var browserslist = sitePackageJson.browserslist || [`> 1%`, `last 2 versions`, `IE >= 9`];
  return { sitePackageJson, browserslist };
};

// If there's a package.json in the current directory w/ a gatsby dependency
// include the develop/build/serve commands. Otherwise, just the new.
if (inGatsbySite) {
  program.command(`develop`).description(`Start development server. Watches files and rebuilds and hot reloads ` + `if something changes`) // eslint-disable-line max-len
  .option(`-H, --host <url>`, `Set host. Defaults to ${defaultHost}`, defaultHost).option(`-p, --port <port>`, `Set port. Defaults to 8000`, `8000`).option(`-o, --open`, `Open the site in your browser for you.`).action(function (command) {
    var developPath = resolveCwd(`gatsby/dist/utils/develop`);
    var develop = require(developPath);

    var _getSiteInfo = getSiteInfo(),
        sitePackageJson = _getSiteInfo.sitePackageJson,
        browserslist = _getSiteInfo.browserslist;

    var p = (0, _extends3.default)({}, command, {
      directory,
      sitePackageJson,
      browserslist
    });
    develop(p);
  });

  program.command(`build`).description(`Build a Gatsby project.`).option(`--prefix-paths`, `Build site with link paths prefixed (set prefix in your config).`).action(function (command) {
    // Set NODE_ENV to 'production'
    process.env.NODE_ENV = `production`;

    var buildPath = resolveCwd(`gatsby/dist/utils/build`);
    var build = require(buildPath);

    var _getSiteInfo2 = getSiteInfo(),
        sitePackageJson = _getSiteInfo2.sitePackageJson,
        browserslist = _getSiteInfo2.browserslist;

    var p = (0, _extends3.default)({}, command, {
      directory,
      sitePackageJson,
      browserslist
    });
    build(p).then(function () {
      console.log(`Done building in`, process.uptime(), `seconds`);
      process.exit();
    });
  });

  program.command(`serve`).description(`Serve built site.`).option(`-H, --host <url>`, `Set host. Defaults to ${defaultHost}`, defaultHost).option(`-p, --port <port>`, `Set port. Defaults to 9000`, `9000`).option(`-o, --open`, `Open the site in your browser for you.`).action(function (command) {
    var servePath = resolveCwd(`gatsby/dist/utils/serve`);
    var serve = require(servePath);

    var _getSiteInfo3 = getSiteInfo(),
        sitePackageJson = _getSiteInfo3.sitePackageJson,
        browserslist = _getSiteInfo3.browserslist;

    var p = (0, _extends3.default)({}, command, {
      directory,
      sitePackageJson,
      browserslist
    });
    serve(p);
  });
}

program.command(`new [rootPath] [starter]`).description(`Create new Gatsby project.`).action(function (rootPath, starter) {
  var newCommand = require(`./new`);
  newCommand(rootPath, starter);
});

program.on(`--help`, function () {
  console.log(`To show subcommand help:

    gatsby [command] -h
`);
});

// If the user types an unknown sub-command, just display the help.
var subCmd = process.argv.slice(2, 3)[0];
var cmds = _.map(program.commands, `_name`);
cmds = cmds.concat([`--version`, `-V`]);

if (!_.includes(cmds, subCmd)) {
  program.help();
} else {
  program.parse(process.argv);
}