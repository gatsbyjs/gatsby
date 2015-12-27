import program from 'commander';
import path from 'path';

import packageJson from '../package.json';

// Use compiled version of code when installed globally, otherwise use babel script version.
if ('./published') {
	var develop = require('../dist/utils/develop');
} else {
	var develop = require('../lib/utils/develop');
}

program
	.version(packageJson.version)
	.option('-h, --host <url>', 'Set host. Defaults to 0.0.0.0', "0.0.0.0")
	.option('-p, --port <port>', 'Set port. Defaults to 8000', "8000")
	.parse(process.argv);

var relativeDirectory = program.args[0];
if (!(typeof relativeDirectory !== "undefined" && relativeDirectory !== null)) { relativeDirectory = "."; }
var directory = path.resolve(relativeDirectory);

program.directory = directory;
program.relativeDirectory = relativeDirectory;

develop(program);
