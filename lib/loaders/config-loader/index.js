import toml from 'toml';
import loaderUtils from 'loader-utils';
import Router from 'react-router';
import path from 'path';

import globPages from '../../utils/glob-pages';

module.exports = function(source) {
  this.cacheable();
  var callback = this.async();

  var value = {};

  var directory = loaderUtils.parseQuery(this.query).directory;

  // TODO support YAML + JSON + CSON as well here.
  var config = toml.parse(source);
  value.config = config;
  value.relativePath = path.relative('.', directory);

  // Load pages.
  return globPages(directory, (err, pagesData) => {
    value.pages = pagesData;
    this.value = [value];
    return callback(null, 'module.exports = ' + JSON.stringify(value, undefined, "\t"));
  });
};
