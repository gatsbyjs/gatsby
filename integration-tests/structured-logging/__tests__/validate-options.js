const { spawn } = require(`child_process`)
const path = require(`path`)

jest.setTimeout(100000)

const gatsbyBin = path.join(
  `node_modules`,
  `gatsby`,
  `dist`,
  `bin`,
  `gatsby.js`
)

describe(`Plugin Validation Options`, () => {
  let gatsbyProcess
  let events = []

  beforeEach(async () => {
    gatsbyProcess = spawn(process.execPath, [gatsbyBin, `build`], {
      // inherit lets us see logs in console
      //   stdio: [`inherit`, `inherit`, `inherit`, `ipc`],
      stdio: [`ignore`, `ignore`, `ignore`, `ipc`],
      env: {
        ...process.env,
        NODE_ENV: `production`,
        ENABLE_GATSBY_REFRESH_ENDPOINT: true,
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
  })

  it(`test`, () => {
    console.log({ events })
  })
})
