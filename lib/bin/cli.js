const program = require('commander')
const packageJson = require('../../package.json')
const _ = require('lodash')
const fs = require('fs-extra')
const path = require('path')

// Copy our load-context function to root of site in a dot file.
const gatsbyFile = `${__dirname}/../utils/load-context.js`
const siteDirectory = path.resolve('.')
const fileName = `${siteDirectory}/.gatsby-context.js`
fs.copy(gatsbyFile, fileName)

const defaultHost = process.platform === 'win32'
  ? 'localhost'
  : '0.0.0.0'

const directory = path.resolve('.')

program
  .version(packageJson.version)
  .usage('[command] [options]')

program.command('develop')
  .description('Start development server. Watches files and rebuilds and hot reloads if something changes') // eslint-disable-line max-len
  .option('-h, --host <url>',
          `Set host. Defaults to ${defaultHost}`,
          defaultHost
         )
  .option('-p, --port <port>', 'Set port. Defaults to 8000', '8000')
  .option('-o, --open', 'Open the site in your browser for you.')
  .action((command) => {
    const develop = require('../utils/develop')
    const p = {
      ...command,
      directory,
    }
    develop(p)
  })

program.command('build')
  .description('Build a Gatsby project.')
  .option('--prefix-links', 'Build site with links prefixed (set prefix in your config).')
  .action((command) => {
    const build = require('../utils/build')
    const p = {
      ...command,
      directory,
    }
    build(p, (err) => {
      if (err) {
        throw err
      } else {
        console.log('Done')
      }
    })
  })

program.command('serve-build')
  .description('Serve built site.')
  .option('-h, --host <url>',
          `Set host. Defaults to ${defaultHost}`,
          defaultHost
         )
  .option('-p, --port <port>', 'Set port. Defaults to 8000', '8000')
  .option('-o, --open', 'Open the site in your browser for you.')
  .action((command) => {
    const serve = require('../utils/serve-build')
    const p = {
      ...command,
      directory,
    }
    serve(p)
  })

program
  .command('new [rootPath] [starter]')
  .description('Create new Gatsby project.')
  .action((rootPath, starter) => {
    const newCommand = require('../utils/new')
    newCommand(rootPath, starter)
  })


// If the user types an unknown sub-command, just display the help.
const subCmd = process.argv.slice(2, 3)[0]
const cmds = _.map(program.commands, '_name')

if (!_.includes(cmds, subCmd)) {
  program.help()
} else {
  program.parse(process.argv)
}
