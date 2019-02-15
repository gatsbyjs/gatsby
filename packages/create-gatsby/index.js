#!/usr/bin/env node
const createCli = require(`gatsby-cli/lib/create-cli`)
const { stripIndent } = require(`common-tags`)

const argv = process.argv

/*
 * Restrict usage to solely the `new` command
 */
if (!argv.some(arg => arg === `new`)) {
  throw new Error(
    stripIndent`
      create-gatsby can only be used with the new command, e.g. \`npm init gatsby new your-gatsby-app\`
      See gatsby.app/cli for more info.
    `
  )
}

createCli(argv)
