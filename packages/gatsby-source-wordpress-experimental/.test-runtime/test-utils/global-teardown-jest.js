// global-teardown.js
import kill from "tree-kill"
import { resetSchema } from "./increment-remote-data"

module.exports = async function globalTeardown() {
  if (!process.env.START_SERVER) {
    return
  }

  const gatsbyProcess = global.__GATSBY_PROCESS

  kill(gatsbyProcess.pid)
  console.log(`\nkilled Gatsby`)

  if (process.env.WPGQL_INCREMENT) {
    await resetSchema()
    console.log(`reset remote api mutations`)
  }
}
