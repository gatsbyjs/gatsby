const fs = require(`fs`)
const { spawn } = require(`child_process`)
const path = require(`path`)

jest.setTimeout(100000)

const gatsbyBin = path.join(`node_modules`, `gatsby`, `cli.js`)

describe(`Successful Build`, () => {
  let gatsbyProcess
  let events = []

  beforeAll(done => {
    gatsbyProcess = spawn(process.execPath, [gatsbyBin, `build`], {
      // inherit lets us see logs in console
      stdio: [`ignore`, `ignore`, `ignore`, `ipc`],
      // stdio: [`inherit`, `inherit`, `inherit`, `ipc`],
      env: {
        ...process.env,
        NODE_ENV: `production`,
        ENABLE_GATSBY_REFRESH_ENDPOINT: true,
      },
    })

    gatsbyProcess.on(`message`, msg => {
      events.push(msg)
    })

    gatsbyProcess.on(`exit`, exitCode => {
      // console.log(events[events.length - 1])
      // console.log(events)
      done()
    })
  })

  // afterEach(async () => {})

  it(`emits SUCCESS`, async () => {
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: `LOG_ACTION`,
          action: expect.objectContaining({
            type: `SET_STATUS`,
            payload: `SUCCESS`,
          }),
        }),
      ])
    )
  })
  it(`emits IN_PROGRESS`, async () => {
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: `LOG_ACTION`,
          action: expect.objectContaining({
            type: `SET_STATUS`,
            payload: `IN_PROGRESS`,
          }),
        }),
      ])
    )
  })
  // test(`emits SUCCESS on success`, async () => {
  //   expect(events).toEqual(
  //     expect.arrayContaining([
  //       expect.objectContaining({
  //         type: "VERSION",
  //         gatsby: expect.any(String),
  //       }),
  //     ])
  //   )
  // })
})

describe(`Failing Build`, () => {
  let gatsbyProcess
  let events = []

  beforeAll(done => {
    fs.writeFileSync(
      path.join(`src`, `pages`, `index.js`),
      `import React from "react"

const IndexPage = () => <div>Hello world!</div>

// export default IndexPage

    `
    )
    gatsbyProcess = spawn(process.execPath, [gatsbyBin, `build`], {
      // inherit lets us see logs in console
      stdio: [`ignore`, `ignore`, `ignore`, `ipc`],
      // stdio: [`inherit`, `inherit`, `inherit`, `ipc`],
      env: {
        ...process.env,
        NODE_ENV: `production`,
        ENABLE_GATSBY_REFRESH_ENDPOINT: true,
        FAILING_ACTIVITY: true,
      },
    })

    gatsbyProcess.on(`message`, msg => {
      events.push(msg)
    })

    gatsbyProcess.on(`exit`, exitCode => {
      // console.log(events[events.length - 2])
      // console.log(events)
      done()
    })
  })

  afterAll(async () => {
    fs.writeFileSync(
      path.join(`src`, `pages`, `index.js`),
      `import React from "react"

const IndexPage = () => <div>Hello world!</div>

export default IndexPage
`
    )
  })

  it(`emits IN_PROGRESS`, async () => {
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: `LOG_ACTION`,
          action: expect.objectContaining({
            type: `SET_STATUS`,
            payload: `IN_PROGRESS`,
          }),
        }),
      ])
    )
  })
  it(`emits FAILURE`, async () => {
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
})
