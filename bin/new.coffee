program = require 'commander'
initStarter = require '../lib/utils/init-starter'
loggy = require 'loggy'

packageJson = require '../package.json'

program
  .version(packageJson.version)
  .parse(process.argv)

initStarter program.args[0], {
  rootPath: program.args[1]
  commandName: 'gatsby new'
  logger: loggy
}, (error) ->
  if error
    loggy.error error
