var program = require('commander') // eslint-disable-line no-var
var path = require('path') // eslint-disable-line no-var

var packageJson = require('../package.json') // eslint-disable-line no-var
var build = require('../dist/utils/build') // eslint-disable-line no-var

program
  .version(packageJson.version)
  .option('--prefix-links', 'Build site with links prefixed (set prefix in your config).')
  .parse(process.argv)

const directory = path.resolve('.')

program.directory = directory

build(program, (err) => {
  if (err) {
    throw err
  } else {
    console.log('Done')
  }
})
