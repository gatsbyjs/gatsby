var path = require('path');
var fs = require('fs');

module.exports = function(config, env) {
  var gatsbyConfig = path.resolve(process.cwd(), './gatsby.config.js');
  if(fs.existsSync(gatsbyConfig)) {
    return require(gatsbyConfig)(config, env);
  } else {
    return config;
  }
}