#!/usr/bin/env node

require(`dotenv`).config({
  path: `.env.${process.env.NODE_ENV}`,
})

const apiKey = process.env.BENCHMARK_FLOTIQ_API_TOKEN
const update = require(`./updater`)

update({ apiKey })
