const { spawn } = require(`child_process`)
const path = require(`path`)

jest.setTimeout(100000)

const gatsbyBin = path.join(`node_modules`, `gatsby`, `cli.js`)

describe(`Validate Plugin Options`, () => {
  let gatsbyProcess
  let events = []

  beforeEach(async () => {
    gatsbyProcess = spawn(process.execPath, [gatsbyBin, `build`], {
      // inherit lets us see logs in console
      // stdio: [`inherit`, `inherit`, `inherit`, `ipc`],
      stdio: [`ignore`, `ignore`, `ignore`, `ipc`],
      env: {
        ...process.env,
        NODE_ENV: `production`,
        ENABLE_GATSBY_REFRESH_ENDPOINT: true,
        VALIDATE_PLUGIN_OPTIONS: true,
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

  it(`Errors on local plugins`, () => {
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
        // Local plugin with require.resolve
        expect.objectContaining({
          type: `LOG_ACTION`,
          action: expect.objectContaining({
            type: `LOG`,
            payload: expect.objectContaining({
              level: `ERROR`,
              category: `USER`,
              context: expect.objectContaining({
                pluginName: expect.stringContaining(
                  "integration-tests/structured-logging/local-plugin-with-path/index.js"
                ),
                validationErrors: expect.arrayContaining([
                  {
                    context: {
                      key: "required",
                      label: "required",
                    },
                    message: '"required" is required',
                    path: ["required"],
                    type: "any.required",
                  },
                  {
                    context: {
                      key: "optionalString",
                      label: "optionalString",
                      value: 1234,
                    },
                    message: '"optionalString" must be a string',
                    path: ["optionalString"],
                    type: "string.base",
                  },
                ]),
              }),
              code: `11331`,
              type: `API.NODE.VALIDATION`,
            }),
          }),
        }),
        // Local plugin with name in gatsby-config
        expect.objectContaining({
          type: `LOG_ACTION`,
          action: expect.objectContaining({
            type: `LOG`,
            payload: expect.objectContaining({
              level: `ERROR`,
              category: `USER`,
              context: expect.objectContaining({
                pluginName: "local-plugin",
                validationErrors: expect.arrayContaining([
                  {
                    context: {
                      key: "required",
                      label: "required",
                    },
                    message: '"required" is required',
                    path: ["required"],
                    type: "any.required",
                  },
                  {
                    context: {
                      key: "optionalString",
                      label: "optionalString",
                      value: 1234,
                    },
                    message: '"optionalString" must be a string',
                    path: ["optionalString"],
                    type: "string.base",
                  },
                ]),
              }),
              code: `11331`,
              type: `API.NODE.VALIDATION`,
            }),
          }),
        }),
      ])
    )
  })
})
