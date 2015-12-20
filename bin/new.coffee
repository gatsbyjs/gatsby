program = require 'commander'
loggy = require 'loggy'

packageJson = require '../package.json'

# Use compiled version of code when installed globally, otherwise use
# babelscript version.
if "dist" of packageJson
  initStarter = require '../dist/utils/init-starter'
else
  initStarter = require '../lib/utils/init-starter'

program
  .version(packageJson.version)
  .parse(process.argv)

if program.args.length is 1
  rootPath = program.args[0]
  starter = "gh:gatsbyjs/gatsby-starter-default"
else
  rootPath = program.args[0]
  starter = program.args[1]

initStarter starter, {
  rootPath: rootPath
  logger: loggy
}, (error) ->
  if error
    loggy.error error
