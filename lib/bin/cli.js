const program = require('commander')
const packageJson = require('../../package.json')
const fs = require('fs-extra')
const path = require('path')
import _ from 'lodash'

const defaultHost = process.platform === 'win32'
  ? 'localhost'
  : '0.0.0.0'

const directory = path.resolve('.')

const HOST_OPTION_ARGS = [
  '-H, --host <hostname>',
  `Hostname at which to start the server. Defaults to ${defaultHost}.`,
  defaultHost,
]
const PAGES_PATH_OPTION_ARGS = [
  '-P, --pagesPath <pagesPath>',
  'Path to a collection of page source files. ' +
    'Defaults to `./pages`.',
  './pages',
]
const PORT_OPTION_ARGS = [
  '-p, --port <port>',
  'Port to start the server on. Defaults to 8000.',
  8000,
]
const OPEN_OPTION_ARGS = [
  '-o, --open',
  'Open a browser window once the server has started.',
  false,
]

function writeGatsbyContextFile (pagesPath) {
  // Copy our load-context function to root of site in a dot file.
  const getLoadContext = require(
    path.resolve(__dirname, '..', 'utils', 'get-load-context.js'),
  )
  fs.writeFile(
    path.resolve('.', '.gatsby-context.js'),
    getLoadContext(path.relative(directory, pagesPath)),
  )
}

function prepareOptions (command) {
  const options = {
    ...command,
    directory,
  }
  if (command.pagesPath) {
    options.pagesPath = path.resolve(directory, command.pagesPath)
  }
  return options
}

function getCommandHandler (fn) {
  return function (command) {
    const options = prepareOptions(command)
    writeGatsbyContextFile(options.pagesPath)
    fn(options)
  }
}

program
  .version(packageJson.version)
  .usage('[command] [options]')

program.command('develop')
  .description('Start development server. Watches files and rebuilds and hot reloads if something changes') // eslint-disable-line max-len
  .option(...HOST_OPTION_ARGS)
  .option(...OPEN_OPTION_ARGS)
  .option(...PORT_OPTION_ARGS)
  .option(...PAGES_PATH_OPTION_ARGS)
  .action(getCommandHandler(options => {
    const develop = require('../utils/develop')
    develop(options)
  }))

program.command('build')
  .description('Build a Gatsby project.')
  .option(...PAGES_PATH_OPTION_ARGS)
  .option('--prefix-links', 'Build site with links prefixed (set prefix in your config).')
  .action(getCommandHandler(options => {
    // Set NODE_ENV to 'production'
    process.env.NODE_ENV = 'production'

    const build = require('../utils/build')
    build(options, (err) => {
      if (err) {
        throw err
      } else {
        console.log('Done')
      }
    })
  }))

program.command('serve-build')
  .description('Serve built site.')
  .option(...HOST_OPTION_ARGS)
  .option(...OPEN_OPTION_ARGS)
  .option(...PAGES_PATH_OPTION_ARGS)
  .option(...PORT_OPTION_ARGS)
  .action(getCommandHandler(options => {
    const serve = require('../utils/serve-build')
    serve(options)
  }))

program
  .command('new [rootPath] [starter]')
  .description('Create new Gatsby project.')
  .action((rootPath, starter) => {
    const newCommand = require('../utils/new')
    newCommand(rootPath, starter)
  })

program.on('--help', () => {
  console.log(`To show subcommand help:

    gatsby [command] -h
`)
})

// If the user types an unknown sub-command, just display the help.
const subCmd = process.argv.slice(2, 3)[0]
let cmds = _.map(program.commands, '_name')
cmds = cmds.concat(['--version', '-V'])

if (!_.includes(cmds, subCmd)) {
  program.help()
} else {
  program.parse(process.argv)
}
