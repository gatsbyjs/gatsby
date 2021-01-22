// global-teardown.js
import kill from "tree-kill"
import { resetSchema } from "./increment-remote-data"

module.exports = async function globalTeardown() {
  if (!process.env.START_SERVER) {
    return
  }

  const p = global.__GATSBY_PROCESS
  kill(p.pid, `SIGTERM`, (err) => {
    if (err) {
      throw err
    } else {
      console.log(
        `\nSuccessfuly terminated the the gatsby process tree for pid ${p.pid}`
      )
    }
  })

  if (process.env.WPGQL_INCREMENT) {
    await resetSchema()
    console.log(`reset remote api mutations`)
  }
}
