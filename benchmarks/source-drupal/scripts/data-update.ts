#!/usr/bin/env node

import { update } from "./updater"

// @ts-ignore
import dotenv from "dotenv"

dotenv.config({
  // @ts-ignore
  path: `.env.${process.env.NODE_ENV}`,
})

// @ts-ignore
const username = process.env.BENCHMARK_DRUPAL_USERNAME
// @ts-ignore
const password = process.env.BENCHMARK_DRUPAL_PASSWORD
// @ts-ignore
const server = process.env.BENCHMARK_DRUPAL_BASE_URL

update(username, password, server)
