const program = require('commander')

const packageJson = require('../package.json')

program
  .version(packageJson.version)
  .command('develop [directory]', 'Start hot-reloading development server')
  .command('build [directory]', 'Do a production build of site')
  .command('new [rootPath] [starter]', 'Create new Gatsby project in path [.].')
  .parse(process.argv)
