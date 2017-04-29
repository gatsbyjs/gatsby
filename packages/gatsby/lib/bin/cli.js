const program = require(`commander`)
const packageJson = require(`../../package.json`)
const path = require(`path`)
const _ = require(`lodash`)
const Promise = require(`bluebird`)
console.log(`bin/cli: time since started:`, process.uptime())

// Improve Promise error handling. Maybe... what's the best
// practice for this these days?
Promise.onPossiblyUnhandledRejection(error => {
  throw error
})
process.on(`unhandledRejection`, error => {
  console.error(`UNHANDLED REJECTION`, error.stack)
})

const defaultHost = process.platform === `win32` ? `localhost` : `0.0.0.0`

const directory = path.resolve(`.`)

program.version(packageJson.version).usage(`[command] [options]`)

console.time(`time to load develop`)
program
  .command(`develop`)
  .description(
    `Start development server. Watches files and rebuilds and hot reloads if something changes`
  ) // eslint-disable-line max-len
  .option(
    `-H, --host <url>`,
    `Set host. Defaults to ${defaultHost}`,
    defaultHost
  )
  .option(`-p, --port <port>`, `Set port. Defaults to 8000`, `8000`)
  .option(`-o, --open`, `Open the site in your browser for you.`)
  .action(command => {
    const develop = require(`../utils/develop`)
    console.timeEnd(`time to load develop`)
    const p = {
      ...command,
      directory,
    }
    develop(p)
  })

program
  .command(`build`)
  .description(`Build a Gatsby project.`)
  .option(
    `--prefix-links`,
    `Build site with links prefixed (set prefix in your config).`
  )
  .action(command => {
    // Set NODE_ENV to 'production'
    process.env.NODE_ENV = `production`

    const build = require(`../utils/build`)
    const p = {
      ...command,
      directory,
    }
    build(p).then(() => {
      console.log(`Done`)
      process.exit()
    })
  })

program
  .command(`serve-build`)
  .description(`Serve built site.`)
  .option(
    `-H, --host <url>`,
    `Set host. Defaults to ${defaultHost}`,
    defaultHost
  )
  .option(`-p, --port <port>`, `Set port. Defaults to 8000`, `8000`)
  .option(`-o, --open`, `Open the site in your browser for you.`)
  .action(command => {
    const serve = require(`../utils/serve-build`)
    const p = {
      ...command,
      directory,
    }
    serve(p)
  })

program
  .command(`new [rootPath] [starter]`)
  .description(`Create new Gatsby project.`)
  .action((rootPath, starter) => {
    const newCommand = require(`../utils/new`)
    newCommand(rootPath, starter)
  })

program.on(`--help`, () => {
  console.log(
    `To show subcommand help:

    gatsby [command] -h
`
  )
})

// If the user types an unknown sub-command, just display the help.
const subCmd = process.argv.slice(2, 3)[0]
let cmds = _.map(program.commands, `_name`)
cmds = cmds.concat([`--version`, `-V`])

if (!_.includes(cmds, subCmd)) {
  program.help()
} else {
  program.parse(process.argv)
}
