import { GatsbyCLI } from "../test-helpers"

const MAX_TIMEOUT = 2147483647
jest.setTimeout(MAX_TIMEOUT)

describe(`gatsby recipes`, () => {
  const cwd = `gatsby-sites/gatsby-develop`

  beforeAll(() => GatsbyCLI.from(cwd).invoke(`clean`))
  afterAll(() => GatsbyCLI.from(cwd).invoke(`clean`))

  xit(`begins running the jest recipe`, async () => {
    // 1. Start the `gatsby recipes` command
    const [childProcess, getLogs] = GatsbyCLI.from(cwd).invokeAsync(
      [`recipes`, `jest`],
      log => log.includes("Add recipe")
    )

    // 2. Wait for the process to finish
    await childProcess

    const logs = getLogs()

    // This checks that the recipe command is being properly required
    // and is attempting to fetch the jest recipe
    logs.should.contain(`Loading recipe`)
  })
})
