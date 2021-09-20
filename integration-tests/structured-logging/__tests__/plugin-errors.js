const { spawn } = require(`child_process`)
const path = require(`path`)

jest.setTimeout(100000)

const gatsbyBin = path.join(`node_modules`, `gatsby`, `cli.js`)

describe(`Plugin Errors`, () => {
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
        PANIC_IN_PLUGIN: true,
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

  it(`Sets up errorMap inPreInit and panic with structured error`, () => {
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

    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: `LOG_ACTION`,
          action: expect.objectContaining({
            type: `LOG`,
            payload: expect.objectContaining({
              level: `ERROR`,
              category: `SYSTEM`,
              text: `Error text is MORE ERROR!`,
              code: `structured-plugin-errors_12345`,
            }),
          }),
        }),
      ])
    )

    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: `LOG_ACTION`,
          action: expect.objectContaining({
            type: `LOG`,
            payload: expect.objectContaining({
              level: `ERROR`,
              category: `SYSTEM`,
              text: `Error text is PANIC!`,
              code: `structured-plugin-errors_1337`,
            }),
          }),
        }),
      ])
    )
  })
})
