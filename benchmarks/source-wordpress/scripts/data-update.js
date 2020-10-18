#!/usr/bin/env node

const update = require(`./updater`)

require(`dotenv`).config({
  path: `.env.${process.env.NODE_ENV}`,
})

const username = process.env.BENCHMARK_WORDPRESS_USERNAME
const password = process.env.BENCHMARK_WORDPRESS_PASSWORD
const server = process.env.BENCHMARK_WPGRAPHQL_URL

update({ username, password, server })
