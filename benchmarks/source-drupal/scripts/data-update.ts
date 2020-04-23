#!/usr/bin/env node

import { update } from "./updater"

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

const username = process.env.BENCHMARK_DRUPAL_USERNAME
const password = process.env.BENCHMARK_DRUPAL_PASSWORD
const server = process.env.BENCHMARK_DRUPAL_BASE_URL

update(username, password, server)
