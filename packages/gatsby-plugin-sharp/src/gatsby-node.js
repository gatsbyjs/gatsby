import { queue } from "./index"
import Promise from "bluebird"

async function generateSideEffects() {
  return new Promise(resolve => {
    queue.start(() => resolve())
  })
}

exports.generateSideEffects = generateSideEffects
