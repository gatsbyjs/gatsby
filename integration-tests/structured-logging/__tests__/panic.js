const { spawn } = require(`child_process`)
const path = require(`path`)

jest.setTimeout(100000)

const gatsbyBin = path.join(`node_modules`, `gatsby`, `cli.js`)

describe(`Panic`, () => {
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
        PANIC_ON_BUILD: true,
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

  it(`emits SET_STATUS FAILURE`, async () => {
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: `LOG_ACTION`,
          action: expect.objectContaining({
            type: `SET_STATUS`,
            payload: `FAILED`,
          }),
        }),
      ])
    )
  })
  it(`emits LOG`, async () => {
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: `LOG_ACTION`,
          action: expect.objectContaining({
            type: `LOG`,
            payload: expect.objectContaining({
              level: `ERROR`,
              text: `Your house is on fire`,
            }),
          }),
        }),
      ])
    )
  })
})
