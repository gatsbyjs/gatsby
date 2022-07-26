#!/usr/bin/env node

const program = require(`commander`)

program
  .version(`0.1.0`)
  .usage(`<command> [options]`)
  .command(`eject`, `install one or more packages`)
  .command(`new [query]`, `search with optional query`)
  .command(`debug`, `debug a project if you're having a themes issue`)
  .parse(process.argv)
