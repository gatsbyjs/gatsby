import execa from "execa"
import on from "wait-on"
import kill from "tree-kill"

import { incrementalIt } from "../test-utils/incremental-it"

jest.setTimeout(100000)

require(`dotenv`).config({
  path: `./test-runtime/.env.production`,
})

describe(`[gatsby-source-wordpress-experimental] build`, () => {
  incrementalIt(`builds successfully`, async done => {
    const gatsbyProcess = execa(`yarn`, [`build-test-runtime`])
    gatsbyProcess.stdout.pipe(process.stdout)
    await gatsbyProcess

    const gatsbyServeProcess = execa(`yarn`, [`serve-test-runtime`])
    gatsbyServeProcess.stdout.pipe(process.stdout)

    const couldntStart = setTimeout(() => {
      done.fail(`couldn't start gatsby serve`)
    }, 5000)

    await on({ resources: [`http://localhost:9000`] })

    // @todo use cypress to verify that the site is served
    // on incremented build check that the changed data shows up

    clearTimeout(couldntStart)

    kill(gatsbyProcess.pid)
    kill(gatsbyServeProcess.pid)

    done()
  })
})
