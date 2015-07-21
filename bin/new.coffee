program = require 'commander'
initStarter = require '../lib/utils/init-starter'
loggy = require 'loggy'

packageJson = require '../package.json'

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
  commandName: 'gatsby new'
  logger: loggy
}, (error) ->
  if error
    loggy.error error
