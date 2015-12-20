program = require 'commander'
path = require 'path'

packageJson = require '../package.json'

# Use compiled version of code when installed globally, otherwise use
# babelscript version.
if !!process.env.npm_config_global
  build = require '../dist/utils/build'
else
  build = require '../lib/utils/build'

program
  .version(packageJson.version)
  .option('--prefix-links', 'Build site with links prefixed (set prefix in your config).')
  .parse(process.argv)

relativeDirectory = program.args[0]
unless relativeDirectory? then relativeDirectory = "."
directory = path.resolve(relativeDirectory)

program.directory = directory
program.relativeDirectory = relativeDirectory

build(program)

