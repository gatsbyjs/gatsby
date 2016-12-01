'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _camelCase2 = require('lodash/camelCase');

var _camelCase3 = _interopRequireDefault(_camelCase2);

var _filter2 = require('lodash/filter');

var _filter3 = _interopRequireDefault(_filter2);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _nodeExiftool = require('node-exiftool');

var _nodeExiftool2 = _interopRequireDefault(_nodeExiftool);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _purdy = require('purdy');

var _purdy2 = _interopRequireDefault(_purdy);

var _graphql = require('graphql');

var _graphqlRelay = require('graphql-relay');

var _mapSeries = require('async/mapSeries');

var _mapSeries2 = _interopRequireDefault(_mapSeries);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = require('path');

var parseFilepath = require('parse-filepath');
var u = require('unist-builder');
var exiftoolBin = require('dist-exiftool');
var slash = require('slash');

var ep = new _nodeExiftool2.default.ExiftoolProcess(exiftoolBin);
var isOpen = ep.open();

exports.sourceNodes = function (_ref) {
  var args = _ref.args,
      pluginOptions = _ref.pluginOptions;

  return new _bluebird2.default(function (resolve, reject) {
    isOpen.catch(function (err) {
      return reject(err);
    }).then(function () {
      console.time('glob');
      (0, _glob2.default)(pluginOptions.path + '/**/**', { nodir: true }, function (err, files) {
        console.timeEnd('glob');
        console.log('parsed files count from ' + pluginOptions.path + ':', files.length);

        var readMetadata = function readMetadata(file, cb) {
          ep.readMetadata(file).then(function (result) {
            return cb(null, result);
          }).catch(function (error) {
            return console.log(error);
          });
        };

        console.time('readMetadata');
        (0, _mapSeries2.default)(files, readMetadata, function (err, results) {
          console.timeEnd('readMetadata');
          console.log('read metadata');
          console.log(results.length);
          var cleanedResults = (0, _filter3.default)(results, function (result) {
            if (result.error === null) {
              return true;
            } else {
              console.log('errored result', result);
              return false;
            }
          });
          var mappedResults = cleanedResults.map(function (result) {
            var intermediate = (0, _extends3.default)({}, result.data[0], parseFilepath(result.data[0].SourceFile));
            var newObj = {};
            (0, _keys2.default)(intermediate).forEach(function (key) {
              newObj[(0, _camelCase3.default)(key)] = intermediate[key];
            });

            return newObj;
          });
          console.log('total files', mappedResults.length);
          console.time('create filesystem ast');
          // Create Unist nodes
          var ast = u('rootDirectory', {}, pluginOptions.path);
          ast.children = [];
          mappedResults.forEach(function (file) {
            file.sourceFile = slash(file.sourceFile);
            ast.children.push({
              type: 'File',
              id: (0, _graphqlRelay.toGlobalId)('File', file.sourceFile),
              children: [],
              sourceFile: file.sourceFile,
              relativePath: path.posix.relative(pluginOptions.path, file.sourceFile),
              extension: file.ext.slice(1),
              name: file.name,
              extname: file.extname,
              filename: file.basename,
              dirname: file.dirname,
              modifyDate: file.fileModifyDate,
              accessDate: file.fileAccessDate,
              inodeChangeDate: file.fileInodeChangeDate,
              permissions: file.filePermissions
            });
          });
          console.timeEnd('create filesystem ast');
          return resolve(ast);
        });
      });
    });
  });
};

//exports.compileASTToGraphQLTypes = ({ args }) => {
//new GraphQLObjectType({
//allFiles: {
//type: fileConnection,
//description: 'all files',
//args: {
//...connectionArgs,
//},
//resolve (object, args) {
//const result = connectionFromArray(
//mappedResults,
//args,
//)
//result.totalCount = mappedResults.length
//return result
//},
//},
//})
//}