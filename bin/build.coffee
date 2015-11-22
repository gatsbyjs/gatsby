program = require 'commander'
path = require 'path'

packageJson = require '../package.json'
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

