program = require 'commander'
path = require 'path'

packageJson = require '../package.json'
watch = require '../lib/utils/watch'
build = require '../lib/utils/build'

program
  .version(packageJson.version)
  .command('watch [directory]', 'Watch and hot-reload site')
  .command('build [directory]', 'Do a production build of site')
  .parse(process.argv)
