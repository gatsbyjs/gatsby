// TO-DO: Not sure?
// Should errors that are not followed panic(onBuild)/process.exit be actually errors
// or warnings? If yes, then we should add assertions for SUCCESS status that no errors are
// emitted
const { spawn } = require(`child_process`)
const path = require(`path`)
const { first, last, groupBy, filter } = require(`lodash`)
const joi = require(`joi`)
const { inspect } = require(`util`)

// https://stackoverflow.com/questions/12756159/regex-and-iso8601-formatted-datetime
const ISO8601 = /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i

jest.setTimeout(100000)

const gatsbyBin = path.join(
  `node_modules`,
  `gatsby`,
  `dist`,
  `bin`,
  `gatsby.js`
)

const defaultStdio = `ignore`

const collectEventsForDevelop = (events, env = {}) => {
  const gatsbyProcess = spawn(gatsbyBin, [`develop`], {
    stdio: [defaultStdio, defaultStdio, defaultStdio, `ipc`],
    env: {
      ...process.env,
      NODE_ENV: `development`,
      ENABLE_GATSBY_REFRESH_ENDPOINT: true,
      ...env,
    },
  })

  const finishedPromise = new Promise(resolve => {
    let listening = true
    gatsbyProcess.on(`message`, msg => {
      if (!listening) {
        return
      }

      events.push(msg)
      // we are ready for tests
      if (
        msg.action &&
        msg.action.type === `SET_STATUS` &&
        msg.action.payload !== `IN_PROGRESS`
      ) {
        listening = false
        gatsbyProcess.kill()
        resolve()
      }
    })
  })

  return {
    finishedPromise,
    gatsbyProcess,
  }
}

// Inlined from https://github.com/tamas-pap/jest-joi-schema/blob/master/index.js
const toMatchSchema = (received, schema) => {
  const validationResult = schema.validate(received, { allowUnknown: false })
  const pass = !validationResult.error

  if (pass) {
    return {
      message: () => `expected not to match schema`,
      pass: true,
    }
  } else {
    return {
      message: () => validationResult.error,
      pass: false,
    }
  }
}

expect.extend({
  toMatchSchema,
})

const commonAssertions = events => {
  it(`emits actions with a timestamp`, () => {
    events.forEach(event => {
      expect(event).toHaveProperty(
        `action.timestamp`,
        expect.stringMatching(ISO8601)
      )
    })
  })
  // TODO: This might have better error DX with a custom snapshot matcher
  it(`validate shape of all messages types - joi?`, () => {
    const actionSchema = joi.alternatives().try(
      joi
        .object({
          type: joi
            .string()
            .required()
            .valid([`SET_STATUS`]),
          // TODO: We should change this to always be an Object I think pieh
          payload: joi
            .string()
            .required()
            .valid([`SUCCESS`, `IN_PROGRESS`, `FAILED`]),
          // Should this be here or one level up?
          timestamp: joi.string().required(),
        })
        .required(),

      joi
        .object({
          type: joi
            .string()
            .required()
            .valid([
              `ACTIVITY_START`,
              `ACTIVITY_UPDATE`,
              `ACTIVITY_END`,
              `LOG`,
            ]),
          payload: joi.object(),
          // Should this be here or one level up?
          timestamp: joi.string().required(),
        })
        .required()
    )

    const eventSchema = joi.object({
      type: joi
        .string()
        .required()
        .valid([`LOG_ACTION`]),
      action: actionSchema,
    })
    events.forEach(event => {
      expect(event).toMatchSchema(eventSchema)
    })
  })
  it(`asserts all activities that started actually ended`, () => {
    const activityStartEventUuids = events
      .filter(event => event.action.type === `ACTIVITY_START`)
      .map(event => event.action.payload.uuid)
    const activityEndEventUuids = events
      .filter(event => event.action.type === `ACTIVITY_END`)
      .map(event => event.action.payload.uuid)

    const groupedActivities = groupBy(
      events.filter(
        event =>
          event.action.type === `ACTIVITY_START` ||
          event.action.type === `ACTIVITY_END` ||
          event.action.type === `ACTIVITY_UPDATE` ||
          event.action.type === `ACTIVITY_PENDING` ||
          event.action.type === `ACTIVITY_CANCEL`
      ),
      event => event.action.payload.uuid
    )

    const unresolvedActivities = filter(
      groupedActivities,
      (events, activityUuid) =>
        !(
          events.filter(event => event.action.type === `ACTIVITY_START`)
            .length === 1 &&
          events.filter(event => event.action.type === `ACTIVITY_END`)
            .length === 1
        )
    )

    console.log(inspect(unresolvedActivities, true, null))

    // We use a Set here because order of some activities ending might be different
    expect(new Set(activityStartEventUuids)).toEqual(
      new Set(activityEndEventUuids)
    )
  })
}

const commonAssertionsForSuccess = events => {
  commonAssertions(events)
  it(`emit initial SET_STATUS with IN_PROGRESS - very first message`, () => {
    const event = first(events)
    expect(event).toHaveProperty(`action.type`, `SET_STATUS`)
    expect(event).toHaveProperty(`action.payload`, `IN_PROGRESS`)
  })
  it(`emit final SET_STATUS with SUCCESS - last message`, () => {
    const event = last(events)
    expect(event).toHaveProperty(`action.type`, `SET_STATUS`)
    expect(event).toHaveProperty(`action.payload`, `SUCCESS`)
  })
  it(`it emits just 2 SET_STATUS`, () => {
    const filteredEvents = events.filter(
      event => event.action.type === `SET_STATUS`
    )
    expect(filteredEvents.length).toEqual(2)
  })

  // TO-DO: Do we actually need these considering that activities are created
  // for these as well. Here are we asserting that those activities are correctly created
  // and are working?
  it.todo(`assert that there are no jobs in progress`)
  it.todo(`assert that there are no apis running`)
}

const commonAssertionsForFailure = events => {
  commonAssertions(events)
  it(`emit initial SET_STATUS with IN_PROGRESS - very first message`, () => {
    const event = first(events)
    expect(event).toHaveProperty(`action.type`, `SET_STATUS`)
    expect(event).toHaveProperty(`action.payload`, `IN_PROGRESS`)
  })
  it(`emit final SET_STATUS with FAILED - last message`, () => {
    const filteredEvents = events.filter(
      event => event.action.type === `SET_STATUS`
    )
    const event = last(filteredEvents)
    expect(event).toHaveProperty(`action.type`, `SET_STATUS`)
    expect(event).toHaveProperty(`action.payload`, `FAILED`)
  })
  it(`it emits just 2 SET_STATUS`, () => {
    const filteredEvents = events.filter(
      event => event.action.type === `SET_STATUS`
    )
    expect(filteredEvents.length).toEqual(2)
  })
}

describe(`develop`, () => {
  describe(`initial work finishes with SUCCESS`, () => {
    let events = []

    beforeAll(async () => {
      await collectEventsForDevelop(events).finishedPromise
    })

    commonAssertionsForSuccess(events)

    // We need to check if Cloud depends on the emission of certain
    // specific activities (like building schema, run queries, building HTML pages)
    // If yes, we need to assert that they are emitted so that we can catch
    // an instance if they are removed accidentally
    it.todo(`asserts activities of bootstrap`)
  })

  describe(`work finishes with FAILED`, () => {
    describe(`called with reporter.panic`, () => {
      let events = []

      beforeAll(async () => {
        await collectEventsForDevelop(events, {
          PANIC_ON_BUILD: true,
        }).finishedPromise
      })

      commonAssertionsForFailure(events)
    })

    // Skipping for now because we don't handle these correctly
    // Documented in https://github.com/gatsbyjs/gatsby/issues/18383
    describe.skip(`unhandledRejection`, () => {
      let events = []

      beforeAll(async () => {
        await collectEventsForDevelop(events, {
          UNHANDLED_REJECTION: true,
        }).finishedPromise
      })

      commonAssertionsForFailure(events)
    })
    describe(`process.exit`, () => {
      let events = []

      beforeAll(async () => {
        await collectEventsForDevelop(events, {
          PROCESS_EXIT: true,
        }).finishedPromise
      })

      commonAssertionsForFailure(events)
    })

    // in cloud we kill gatsby process with SIGTERM
    describe(`process.kill`, () => {
      let events = []

      beforeAll(async () => {
        await collectEventsForDevelop(events, {
          PROCESS_KILL: true,
        }).finishedPromise
      })

      commonAssertionsForFailure(events)

      // let gatsbyProcess
      // let events = []

      // beforeAll(async done => {
      //   gatsbyProcess = spawn(gatsbyBin, [`develop`], {
      //     // stdio: [`ignore`, `ignore`, `ignore`, `ipc`],
      //     stdio: [`ignore`, `ignore`, `ignore`, `ipc`],
      //     env: {
      //       ...process.env,
      //       NODE_ENV: `development`,
      //       ENABLE_GATSBY_REFRESH_ENDPOINT: true,
      //     },
      //   })

      //   gatsbyProcess.on(`message`, msg => {
      //     //   console.log(msg)
      //     events.push(msg)
      //     // we are ready for tests
      //     if (
      //       msg.action &&
      //       msg.action.type === `SET_STATUS` &&
      //       msg.action.payload !== `IN_PROGRESS`
      //     ) {
      //       done()
      //     }
      //   })

      //   setTimeout(() => {
      //     gatsbyProcess.kill()
      //   }, 1000)
      // })

      // commonAssertionsForFailure(events)
    })
  })

  describe.skip(`test preview workflows`, () => {
    describe(`code change`, () => {
      describe(`valid`, () => {
        commonAssertionsForSuccess()
      })
      describe(`invalid`, () => {
        commonAssertionsForFailure()
      })
    })
    describe(`data change`, () => {
      describe(`via refresh webhook`, () => {
        commonAssertionsForSuccess()
      })
      describe(`with stateful plugin (i.e. Sanity)`, () => {
        commonAssertionsForSuccess()
        // TO-DO: do we need test for SET_STATUS thrashing due to rapid
        // data changes
      })
    })
  })
})

describe(`build`, () => {
  describe(`initial work finishes with SUCCESS`, () => {
    let gatsbyProcess
    let events = []

    beforeAll(async () => {
      gatsbyProcess = spawn(gatsbyBin, [`build`], {
        stdio: [defaultStdio, defaultStdio, defaultStdio, `ipc`],
        env: {
          ...process.env,
          NODE_ENV: `production`,
          // GATSBY_LOGGER: `json`,
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
    commonAssertionsForSuccess(events)

    // We need to check if Cloud depends on the emission of certain
    // specific activities (like building schema, run queries, building HTML pages)
    // If yes, we need to assert that they are emitted so that we can catch
    // an instance if they are removed accidentally
    it.todo(`asserts activities of bootstrap`)
  })

  describe(`work finishes with FAILED`, () => {
    describe(`called with reporter.panic`, () => {
      let gatsbyProcess
      let events = []

      beforeAll(async () => {
        gatsbyProcess = spawn(gatsbyBin, [`build`], {
          stdio: [defaultStdio, defaultStdio, defaultStdio, `ipc`],
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
      commonAssertionsForFailure(events)
    })
    describe(`unhandledRejection`, () => {
      let gatsbyProcess
      let events = []

      beforeAll(async () => {
        gatsbyProcess = spawn(gatsbyBin, [`build`], {
          stdio: [defaultStdio, defaultStdio, defaultStdio, `ipc`],
          env: {
            ...process.env,
            NODE_ENV: `production`,
            ENABLE_GATSBY_REFRESH_ENDPOINT: true,
            UNHANDLED_REJECTION: true,
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
      commonAssertionsForFailure(events)
    })
    describe(`process.exit`, () => {
      let gatsbyProcess
      let events = []

      beforeAll(async () => {
        gatsbyProcess = spawn(gatsbyBin, [`build`], {
          stdio: [defaultStdio, defaultStdio, defaultStdio, `ipc`],
          env: {
            ...process.env,
            NODE_ENV: `production`,
            ENABLE_GATSBY_REFRESH_ENDPOINT: true,
            PROCESS_EXIT: true,
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
      commonAssertionsForFailure(events)
    })

    // in cloud we kill gatsby process with SIGTERM
    describe(`process.kill`, () => {
      let gatsbyProcess
      let events = []

      beforeAll(async () => {
        gatsbyProcess = spawn(gatsbyBin, [`build`], {
          stdio: [defaultStdio, defaultStdio, defaultStdio, `ipc`],
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

          setTimeout(() => {
            gatsbyProcess.kill(`SIGTERM`)
          }, 1000)
        })
      })
      commonAssertionsForFailure(events)
    })
  })
})

//TO-DO: add api running activity
