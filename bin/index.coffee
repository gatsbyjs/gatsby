program = require 'commander'
path = require 'path'

packageJson = require '../package.json'

program
  .version(packageJson.version)
  .command('watch [directory]', 'Watch and hot-reload site')
  .command('build [directory]', 'Do a production build of site')
  .command('new [rootPath] [starter]', 'Create new Gatsby project in path [.].')
  .parse(process.argv)
