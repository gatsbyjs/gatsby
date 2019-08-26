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

describe(`Activity`, () => {
  let gatsbyProcess
  let events = []

  beforeAll(async done => {
    gatsbyProcess = spawn(gatsbyBin, [`develop`], {
      //   stdio: [`ignore`, `ignore`, `ignore`, `ipc`],
      stdio: [`inherit`, `inherit`, `inherit`, `ipc`],
      env: {
        ...process.env,
        NODE_ENV: `development`,
        ENABLE_GATSBY_REFRESH_ENDPOINT: `true`,
      },
    })

    gatsbyProcess.on(`message`, msg => {
      //   console.log(msg)
      events.push(msg)
      // we are ready for tests
      if (
        msg.action &&
        msg.action.type === `SET_STATUS` &&
        msg.action.payload !== `IN_PROGRESS`
      ) {
        done()
      }
    })
  })

  afterAll(async () => {
    gatsbyProcess.kill()
  })

  it(`emits start, update and end for a successful activity`, async () => {
    const activityEvents = events.filter(
      event =>
        event.type === `LOG_ACTION` &&
        event.action.payload.id === `Successful activity`
    )

    // console.log(util.inspect(activityEvents, { depth: null }))

    const activityUuid = activityEvents[0].action.payload.uuid

    expect(activityEvents).toEqual([
      expect.objectContaining({
        type: `LOG_ACTION`,
        action: expect.objectContaining({
          type: `ACTIVITY_START`,
          payload: expect.objectContaining({
            id: `Successful activity`,
            uuid: activityUuid,
            total: 100,
          }),
        }),
      }),
      expect.objectContaining({
        type: `LOG_ACTION`,
        action: expect.objectContaining({
          type: `ACTIVITY_UPDATE`,
          payload: expect.objectContaining({
            id: `Successful activity`,
            uuid: activityUuid,
            current: 50,
          }),
        }),
      }),
      expect.objectContaining({
        type: `LOG_ACTION`,
        action: expect.objectContaining({
          type: `ACTIVITY_END`,
          payload: expect.objectContaining({
            id: `Successful activity`,
            uuid: activityUuid,
            status: `SUCCESS`,
          }),
        }),
      }),
    ])
  })

  it(`emits start, update and end for a failed activity`, async () => {
    const activityEvents = events.filter(
      event =>
        event.type === `LOG_ACTION` &&
        event.action.payload.id === `Failing activity`
    )

    // console.log(util.inspect(activityEvents, { depth: null }))

    const activityUuid = activityEvents[0].action.payload.uuid

    expect(activityEvents).toEqual([
      expect.objectContaining({
        type: `LOG_ACTION`,
        action: expect.objectContaining({
          type: `ACTIVITY_START`,
          payload: expect.objectContaining({
            id: `Failing activity`,
            uuid: activityUuid,
            total: 100,
          }),
        }),
      }),
      expect.objectContaining({
        type: `LOG_ACTION`,
        action: expect.objectContaining({
          type: `ACTIVITY_UPDATE`,
          payload: expect.objectContaining({
            id: `Failing activity`,
            uuid: activityUuid,
            current: 75,
          }),
        }),
      }),
      expect.objectContaining({
        type: `LOG_ACTION`,
        action: expect.objectContaining({
          type: `ACTIVITY_END`,
          payload: expect.objectContaining({
            id: `Failing activity`,
            uuid: activityUuid,
            status: `FAILED`,
          }),
        }),
      }),
    ])
  })
  ;[`success`, `info`, `warn`, `log`, `error`].forEach(level => {
    const mapActionToLevel = {
      success: `SUCCESS`,
      info: `INFO`,
      warn: `WARNING`,
      log: `LOG`,
      error: `ERROR`,
    }

    it(`emits LOG_ACTION for ${level}`, async () => {
      const event = events.find(
        e =>
          e.type === `LOG_ACTION` &&
          e.action.type === `LOG` &&
          mapActionToLevel[level] === e.action.payload.level &&
          level === e.action.payload.text
      )
      expect(event).toBeDefined()
    })
  })
})
