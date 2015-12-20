program = require 'commander'
path = require 'path'

packageJson = require '../package.json'

# Use compiled version of code when installed globally, otherwise use
# babelscript version.
if "dist" of packageJson
  develop = require '../dist/utils/develop'
else
  develop = require '../lib/utils/develop'

program
  .version(packageJson.version)
  .option('-h, --host <url>', 'Set host. Defaults to 0.0.0.0', "0.0.0.0")
  .option('-p, --port <port>', 'Set port. Defaults to 8000', "8000")
  .parse(process.argv)

relativeDirectory = program.args[0]
unless relativeDirectory? then relativeDirectory = "."
directory = path.resolve(relativeDirectory)

program.directory = directory
program.relativeDirectory = relativeDirectory

develop(program)
