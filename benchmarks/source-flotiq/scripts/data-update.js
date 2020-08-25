#!/usr/bin/env node

require(`dotenv`).config();

const apiKey = process.env.BENCHMARK_FLOTIQ_API_TOKEN
const update = require(`./updater`)

update({ apiKey })
