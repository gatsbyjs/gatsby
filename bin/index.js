/*eslint-disable */
var program = require('commander')
var packageJson = require('../package.json')
var _ = require('lodash')
var subCmd
var cmds
var fs = require('fs-extra')
var path = require('path')

// Copy our load-context function to root of site in a dot file.
var gatsbyFile = __dirname + '/../dist/utils/load-context.js'
var siteDirectory = path.resolve('.')
var fileName = siteDirectory + '/.gatsby-context.js'
/*eslint-enable */

fs.copy(gatsbyFile, fileName)


program
  .version(packageJson.version)
  .command('develop [directory]', 'Start hot-reloading development server')
  .command('build [directory]', 'Do a production build of site')
  .command('new [rootPath] [starter]', 'Create new Gatsby project in path [.].')
  .parse(process.argv)

// If the user types an unknown sub-command, just display the help.
subCmd = _.head(program.args)
cmds = _.map(program.commands, '_name')

if (!_.includes(cmds, subCmd)) {
  program.help()
}
