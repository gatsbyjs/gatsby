import program from 'commander';
import path from 'path';

let packageJson = require('../package.json');

// Use compiled version of code when installed globally, otherwise use babel script version.
if ('./published') {
  let build = require('../dist/utils/build');
} else {
	let build = require('../lib/utils/build');
}

program
  .version(packageJson.version)
	.option('--prefix-links', 'Build site with links prefixed (set prefix in your config).')
	.parse(process.argv);

let relativeDirectory = program.args[0];
if (!(typeof relativeDirectory !== "undefined" && relativeDirectory !== null)) { relativeDirectory = "."; }
let directory = path.resolve(relativeDirectory);

program.directory = directory;
program.relativeDirectory = relativeDirectory;

build(program, function(err) {
	if ((typeof err !== "undefined" && err !== null)) {
		throw err;
	} else {
		return console.log('Done');
	}
});
