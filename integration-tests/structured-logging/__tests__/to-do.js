// TO-DO: Not sure?
// Should errors that are not followed panic(onBuild)/process.exit be actually errors
// or warnings? If yes, then we should add assertions for SUCCESS status that no errors are
// emitted
const { spawn } = require(`child_process`)
const EventEmitter = require(`events`)
const fetch = require(`node-fetch`)
const fs = require(`fs-extra`)
const path = require(`path`)
const cpy = require(`cpy`)
const { first, last } = require(`lodash`)
// const { groupBy, filter } = require(`lodash`)
const joi = require(`joi`)
// const { inspect } = require(`util`)

// https://stackoverflow.com/questions/12756159/regex-and-iso8601-formatted-datetime
const ISO8601 =
  /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i

jest.setTimeout(100000)

const gatsbyBin = path.join(`node_modules`, `gatsby`, `cli.js`)

const defaultStdio = `ignore`

const collectEventsForDevelop = (events, env = {}) => {
  const gatsbyProcess = spawn(process.execPath, [gatsbyBin, `develop`], {
    stdio: [defaultStdio, defaultStdio, defaultStdio, `ipc`],
    env: {
      ...process.env,
      NODE_ENV: `development`,
      ENABLE_GATSBY_REFRESH_ENDPOINT: true,
      ...env,
    },
  })

  let startedPromiseResolve = () => {}
  const startedPromise = new Promise(resolve => {
    startedPromiseResolve = resolve
  })

  const finishedPromise = new Promise((resolve, reject) => {
    let listening = true

    gatsbyProcess.on(`message`, msg => {
      if (!listening) {
        return
      }
      startedPromiseResolve()

      events.push(msg)
      // we are ready for tests
      if (
        msg.action &&
        msg.action.type === `SET_STATUS` &&
        msg.action.payload !== `IN_PROGRESS`
      ) {
        setTimeout(() => {
          listening = false
          gatsbyProcess.kill()
          waitChildProcessExit(gatsbyProcess.pid, resolve, reject)
        }, 5000)
      }
    })
  })

  return {
    finishedPromise,
    startedPromise,
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
      message: () =>
        `${validationResult.error}\n\n${JSON.stringify(received, null, 2)}`,
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
          type: joi.string().required().valid(`SET_STATUS`),
          // TODO: We should change this to always be an Object I think pieh
          payload: joi
            .string()
            .required()
            .valid(`SUCCESS`, `IN_PROGRESS`, `FAILED`, `INTERRUPTED`),
          // Should this be here or one level up?
          timestamp: joi.string().required(),
        })
        .required(),

      joi
        .object({
          type: joi
            .string()
            .required()
            .valid(`ACTIVITY_START`, `ACTIVITY_UPDATE`, `ACTIVITY_END`, `LOG`),
          payload: joi.object(),
          // Should this be here or one level up?
          timestamp: joi.string().required(),
        })
        .required(),

      joi.object({
        type: joi.string().required().valid(`ENGINES_READY`),
        timestamp: joi.string().required(),
      }),

      joi.object({
        type: joi.string().required().valid(`GATSBY_CONFIG_KEYS`),
        payload: joi.object().required(),
        timestamp: joi.string().required(),
      }),

      joi.object({
        type: joi.string().required().valid(`RENDER_PAGE_TREE`),
        payload: joi.object(),
        timestamp: joi.string().required(),
      })
    )

    const eventSchema = joi.object({
      type: joi.string().required().valid(`LOG_ACTION`),
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

    // const groupedActivities = groupBy(
    //   events.filter(
    //     event =>
    //       event.action.type === `ACTIVITY_START` ||
    //       event.action.type === `ACTIVITY_END` ||
    //       event.action.type === `ACTIVITY_UPDATE` ||
    //       event.action.type === `ACTIVITY_PENDING` ||
    //       event.action.type === `ACTIVITY_CANCEL`
    //   ),
    //   event => event.action.payload.uuid
    // )

    // const unresolvedActivities = filter(
    //   groupedActivities,
    //   (events, activityUuid) =>
    //     !(
    //       events.filter(event => event.action.type === `ACTIVITY_START`)
    //         .length === 1 &&
    //       events.filter(event => event.action.type === `ACTIVITY_END`)
    //         .length === 1
    //     )
    // )

    // console.log(inspect(unresolvedActivities, true, null))

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
  // NOTE(@mxstbr): As part of splitting the develop process into two processes, we removed this guarantee
  // as the FAILED status will be emitted twice. This does not impact/break Gatsby Cloud (we tested). Ref PR: #22759
  it.skip(`it emits just 2 SET_STATUS`, () => {
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
  // NOTE(@mxstbr): As part of splitting the develop process into two processes, we removed this guarantee
  // as the FAILED status will be emitted twice. This does not impact/break Gatsby Cloud (we tested). Ref PR: #22759
  it.skip(`it emits just 2 SET_STATUS`, () => {
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
      it(`emit final SET_STATUS with FAILED - last message`, () => {
        const event = last(events)
        expect(event).toHaveProperty(`action.type`, `SET_STATUS`)
        expect(event).toHaveProperty(`action.payload`, `FAILED`)
      })
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
      it(`emit final SET_STATUS with FAILED - last message`, () => {
        const event = last(events)
        expect(event).toHaveProperty(`action.type`, `SET_STATUS`)
        expect(event).toHaveProperty(`action.payload`, `FAILED`)
      })
    })
    describe(`process.exit`, () => {
      let events = []

      beforeAll(async () => {
        await collectEventsForDevelop(events, {
          PROCESS_EXIT: true,
        }).finishedPromise
      })

      commonAssertionsForFailure(events)
      it(`emit final SET_STATUS with FAILED - last message`, () => {
        const event = last(events)
        expect(event).toHaveProperty(`action.type`, `SET_STATUS`)
        expect(event).toHaveProperty(`action.payload`, `FAILED`)
      })
    })

    // in cloud we kill gatsby process with SIGTERM
    describe(`process.kill`, () => {
      let events = []

      beforeAll(done => {
        const { startedPromise, gatsbyProcess } =
          collectEventsForDevelop(events)

        startedPromise.then(() => {
          gatsbyProcess.kill(`SIGTERM`)
          waitChildProcessExit(gatsbyProcess.pid, done, done.fail)
        })
      })

      commonAssertionsForFailure(events)

      // Note: this will fail on windows because it doesn't support POSIX signals (i.e. SIGTERM)
      it(`emit final SET_STATUS with INTERRUPTED - last message`, () => {
        const event = last(events)
        expect(event).toHaveProperty(`action.type`, `SET_STATUS`)
        expect(event).toHaveProperty(`action.payload`, `INTERRUPTED`)
      })
    })
  })

  // See https://github.com/gatsbyjs/gatsby/issues/18518
  describe.skip(`test preview workflows`, () => {
    let gatsbyProcess
    const eventEmitter = new EventEmitter()
    const events = []
    const clearEvents = () => {
      events.splice(0, events.length)
    }
    beforeAll(done => {
      gatsbyProcess = spawn(process.execPath, [gatsbyBin, `develop`], {
        stdio: [defaultStdio, defaultStdio, defaultStdio, `ipc`],
        env: {
          ...process.env,
          NODE_ENV: `development`,
          GATSBY_LOGGER: `json`,
          ENABLE_GATSBY_REFRESH_ENDPOINT: true,
        },
      })

      gatsbyProcess.on(`message`, msg => {
        events.push(msg)

        // we are ready for tests
        if (
          msg.action &&
          msg.action.type === `SET_STATUS` &&
          msg.action.payload !== `IN_PROGRESS`
        ) {
          setTimeout(() => {
            eventEmitter.emit(`done`)
            done()
          }, 5000)
        }
      })
    })

    afterAll(done => {
      gatsbyProcess.kill()
      waitChildProcessExit(gatsbyProcess.pid, done, done.fail)
    })

    describe(`code change`, () => {
      beforeAll(() => {
        return cpy(
          path.join(__dirname, "../src/pages/index.js"),
          path.join(__dirname, "../original/"),
          {
            overwrite: true,
          }
        )
      })

      describe(`invalid`, () => {
        beforeAll(done => {
          clearEvents()

          const codeWithError = `import React from "react"
    import { graphql } from "gatsby"

    import Something from "not-existing-package"

    const IndexPage = ({ data }) => (
      <div>
        Hello world!
        <br />
        {JSON.stringify(data, null, 2)}
      </div>
    )

    export default IndexPage

    export const pageQuery = graphql\`
      {
        allTest {
          nodes {
            field
          }
        }
      }
    \`
    `
          fs.writeFile(require.resolve(`../src/pages/index.js`), codeWithError)

          eventEmitter.once(`done`, () => {
            done()
          })
        })

        commonAssertionsForFailure(events)
      })
      describe(`valid`, () => {
        beforeAll(done => {
          clearEvents()

          cpy(
            path.join(__dirname, "../original/index.js"),
            path.join(__dirname, "../src/pages/"),
            {
              overwrite: true,
            }
          )

          eventEmitter.once(`done`, () => {
            done()
          })
        })

        commonAssertionsForSuccess(events)
      })
    })
    describe(`data change`, () => {
      describe(`via refresh webhook`, () => {
        beforeAll(done => {
          clearEvents()

          fetch(`http://localhost:8000/__refresh`, {
            method: `POST`,
            headers: {
              "Content-Type": `application/json`,
            },
            body: JSON.stringify({
              data: {
                field: `Dolor sit amet`,
              },
            }),
          })

          eventEmitter.once(`done`, () => {
            done()
          })
        })
        commonAssertionsForSuccess(events)
      })
      describe(`with stateful plugin (i.e. Sanity)`, () => {
        beforeAll(done => {
          clearEvents()

          fetch(`http://localhost:8000/___statefulUpdate/`, {
            method: `POST`,
            headers: {
              "Content-Type": `application/json`,
            },
            body: JSON.stringify({
              data: {
                field: `Consectetur adipiscing elit`,
              },
            }),
          })

          eventEmitter.once(`done`, () => {
            done()
          })
        })

        commonAssertionsForSuccess(events)
      })
    })
  })
})

describe(`build`, () => {
  describe(`initial work finishes with SUCCESS`, () => {
    let gatsbyProcess
    let events = []

    beforeAll(async () => {
      gatsbyProcess = spawn(process.execPath, [gatsbyBin, `build`], {
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
        gatsbyProcess = spawn(process.execPath, [gatsbyBin, `build`], {
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
      it(`emit final SET_STATUS with FAILED - last message`, () => {
        const event = last(events)
        expect(event).toHaveProperty(`action.type`, `SET_STATUS`)
        expect(event).toHaveProperty(`action.payload`, `FAILED`)
      })
    })
    describe(`unhandledRejection`, () => {
      let gatsbyProcess
      let events = []

      beforeAll(async () => {
        gatsbyProcess = spawn(process.execPath, [gatsbyBin, `build`], {
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
      it(`emit final SET_STATUS with FAILED - last message`, () => {
        const event = last(events)
        expect(event).toHaveProperty(`action.type`, `SET_STATUS`)
        expect(event).toHaveProperty(`action.payload`, `FAILED`)
      })
    })
    describe(`process.exit`, () => {
      let gatsbyProcess
      let events = []

      beforeAll(async () => {
        gatsbyProcess = spawn(process.execPath, [gatsbyBin, `build`], {
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
      it(`emit final SET_STATUS with FAILED - last message`, () => {
        const event = last(events)
        expect(event).toHaveProperty(`action.type`, `SET_STATUS`)
        expect(event).toHaveProperty(`action.payload`, `FAILED`)
      })
    })

    // in cloud we kill gatsby process with SIGTERM
    describe(`process.kill`, () => {
      let gatsbyProcess
      let events = []

      beforeAll(async () => {
        gatsbyProcess = spawn(process.execPath, [gatsbyBin, `build`], {
          stdio: [defaultStdio, defaultStdio, defaultStdio, `ipc`],
          env: {
            ...process.env,
            NODE_ENV: `production`,
            ENABLE_GATSBY_REFRESH_ENDPOINT: true,
          },
        })

        await new Promise((resolve, reject) => {
          let killing = false
          gatsbyProcess.on(`message`, msg => {
            events.push(msg)

            if (!killing) {
              killing = true
              setTimeout(() => {
                gatsbyProcess.kill(`SIGTERM`)
                waitChildProcessExit(gatsbyProcess.pid, resolve, reject)
              }, 2000)
            }
          })
        })
      })
      commonAssertionsForFailure(events)
      it(`emit final SET_STATUS with INTERRUPTED - last message`, () => {
        const event = last(events)
        expect(event).toHaveProperty(`action.type`, `SET_STATUS`)
        expect(event).toHaveProperty(`action.payload`, `INTERRUPTED`)
      })
    })
  })
})

function waitChildProcessExit(pid, resolve, reject, attempt = 0) {
  try {
    process.kill(pid, 0) // check if process is still running
    if (attempt > 15) {
      reject(new Error("Gatsby process hasn't exited in 15 seconds"))
      return
    }
    setTimeout(() => {
      waitChildProcessExit(pid, resolve, reject, attempt + 1)
    }, 1000)
  } catch (e) {
    resolve()
  }
}

//TO-DO: add api running activity
