import { GatsbyCLI } from "../test-helpers"


const MAX_TIMEOUT = 2147483647
jest.setTimeout(MAX_TIMEOUT)

describe(`gatsby plugin`, () => {
  const cwd = `gatsby-sites/gatsby-plugin`

  beforeAll(() => GatsbyCLI.from(cwd).invoke(`clean`))
  afterAll(() => GatsbyCLI.from(cwd).invoke(`clean`))

  it(`lists plugins`, async () => {
    const [code, logs] = GatsbyCLI.from(cwd).invoke([`plugin`, `ls`])

    logs.should.contain(`gatsby-source-filesystem`)
    logs.should.contain(`gatsby-plugin-offline`)
    expect(logs).toEqual(expect.not.stringContaining(`ignore comments`))
    expect(code).toBe(0)

  })
})
                      