var program = require('commander');
var loggy = require('loggy');

var packageJson = require('../package.json');

// Use compiled version of code when installed globally, otherwise use babelscript version.
if (require('./published')) {
var initStarter = require('../dist/utils/init-starter');
} else {
	initStarter = require('../lib/utils/init-starter');
}

program
	.version(packageJson.version)
	.parse(process.argv);

if (program.args.length === 1) {
	var rootPath = program.args[0];
	var starter = "gh:gatsbyjs/gatsby-starter-default";
} else {
	rootPath = program.args[0];
	starter = program.args[1];
}

initStarter( starter, {
		rootPath: rootPath,
		logger: loggy
	}, function(error) {
		if (error) {
			return loggy.error(error);
		}
	}
);
