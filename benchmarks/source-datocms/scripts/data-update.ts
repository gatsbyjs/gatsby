#!/usr/bin/env node

import { update } from "./updater"

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

update(process.env.BENCHMARK_DATOCMS_API_TOKEN)
