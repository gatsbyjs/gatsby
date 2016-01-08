import program from 'commander'
import path from 'path'

const packageJson = require('../package.json')

// Use compiled version of code when installed globally, otherwise use babel script version.
const build = require(('./published.js') ? ('../dist/utils/build') : ('../lib/utils/build'))

program
  .version(packageJson.version)
	.option('--prefix-links', 'Build site with links prefixed (set prefix in your config).')
	.parse(process.argv)

let relativeDirectory = program.args[0]
if (!(typeof relativeDirectory !== 'undefined' && relativeDirectory !== null)) { relativeDirectory = '.' }
const directory = path.resolve(relativeDirectory)

program.directory = directory
program.relativeDirectory = relativeDirectory

build(program, function (err) {
  if ((typeof err !== 'undefined' && err !== null)) {
    throw err
  } else {
    return console.log('Done')
  }
})
