import program from 'commander'
import path from 'path'

import packageJson from '../package.json'

// Use compiled version of code when installed globally, otherwise use babel script version.
const develop = require(('./published.js') ? ('../dist/utils/develop') : ('../lib/utils/develop'))

program
  .version(packageJson.version)
  .option('-h, --host <url>', 'Set host. Defaults to 0.0.0.0', '0.0.0.0')
  .option('-p, --port <port>', 'Set port. Defaults to 8000', '8000')
  .parse(process.argv)

let relativeDirectory = program.args[0]
if (!(typeof relativeDirectory !== 'undefined' && relativeDirectory !== null)) { relativeDirectory = '.' }
const directory = path.resolve(relativeDirectory)

program.directory = directory
program.relativeDirectory = relativeDirectory

develop(program)
