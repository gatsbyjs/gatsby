#!/usr/bin/env node
import { run } from "."

run().catch(e => {
  console.warn(e)
})
