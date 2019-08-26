const { spawn } = require(`child_process`)
const path = require(`path`)

const gatsbyBin = path.join(
  `node_modules`,
  `gatsby`,
  `dist`,
  `bin`,
  `gatsby.js`
)

describe(`VERSION`, () => {
  let gatsbyProcess
  let events = []

  beforeEach(async () => {
    gatsbyProcess = spawn(gatsbyBin, [`build`], {
      // inherit lets us see logs in console
      stdio: [`ignore`, `ignore`, `ignore`, `ipc`],
      env: {
        ...process.env,
        ENABLE_GATSBY_REFRESH_ENDPOINT: `true`,
      },
    })

    await new Promise(resolve => {
      gatsbyProcess.on(`message`, msg => {
        events.push(msg)
      })

      gatsbyProcess.on(`exit`, exitCode => {
        resolve()
      })
    })
  }, 10000)

  // afterEach(async () => {})

  it(`is emitted on build`, async () => {
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: `VERSION`,
          gatsby: expect.any(String),
        }),
      ])
    )
  })
})
