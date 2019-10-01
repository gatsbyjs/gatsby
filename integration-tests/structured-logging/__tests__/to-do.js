// TO-DO: Not sure?
// Should errors that are not followed panic(onBuild)/process.exit be actually errors
// or warnings? If yes, then we should add assertions for SUCCESS status that no errors are
// emitted
const { spawn } = require(`child_process`)
const path = require(`path`)
const { first, last } = require(`lodash`)
const joi = require(`joi`)

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
            .valid([`SUCCESS`, `IN_PROGRESS`]),
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
    console.log(events)
    events.forEach(event => {
      expect(event).toMatchSchema(eventSchema)
    })
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

  it(`asserts all activities that started actually finished successfully`, () => {
    const activityStartEventUuids = events
      .filter(event => event.action.type === `ACTIVITY_START`)
      .map(event => event.action.payload.uuid)
    const activityEndEventUuids = events
      .filter(event => event.action.type === `ACTIVITY_END`)
      .map(event => event.action.payload.uuid)
    // We use a Set here because order of some activities ending might be different
    expect(new Set(activityStartEventUuids)).toEqual(
      new Set(activityEndEventUuids)
    )
  })

  // TO-DO: Do we actually need these considering that activities are created
  // for these as well. Here are we asserting that those activities are correctly created
  // and are working!
  it.todo(`assert that there are no jobs in progress`)
  it.todo(`assert that there are no apis running`)
}

// const commonAssertionsForFailure = () => {
//   commonAssertions()
//   it.todo(`emit initial SET_STATUS with IN_PROGRESS - very first message`)
//   it.todo(`emit final SET_STATUS with FAILURE - last message`)
//   it.todo(`it emits just 2 SET_STATUS`)

//   it.todo(
//     `asserts all activities that started actually ended (with at least one failure)`
//   )
// }

// describe(`develop`, () => {
//   describe(`initial work finishes with SUCCESS`, () => {
//     commonAssertionsForSuccess()

//     // We need to check if Cloud depends on the emission of certain
//     // specific activities (like building schema, run queries, building HTML pages)
//     // If yes, we need to assert that they are emitted so that we can catch
//     // an instance if they are removed accidentally
//     it.todo(`asserts activities of bootstrap`)
//   })

//   describe(`work finishes with FAILURE`, () => {
//     describe(`called with reporter.panic(onBuild)`, () => {
//       commonAssertionsForFailure()
//     })
//     describe(`unhandledRejection`, () => {
//       commonAssertionsForFailure()
//     })
//     describe(`process.exit(1)`, () => {
//       commonAssertionsForFailure()
//     })

//     // in cloud we kill gatsby process with SIGTERM
//     describe(`process.kill(process.pid, "SIGTERM")`, () => {
//       commonAssertionsForFailure()
//     })
//   })

//   describe(`test preview workflows`, () => {
//     describe(`code change`, () => {
//       describe(`valid`, () => {
//         commonAssertionsForSuccess()
//       })
//       describe(`invalid`, () => {
//         commonAssertionsForFailure()
//       })
//     })
//     describe(`data change`, () => {
//       describe(`via refresh webhook`, () => {
//         commonAssertionsForSuccess()
//       })
//       describe(`with stateful plugin (i.e. Sanity)`, () => {
//         commonAssertionsForSuccess()
//         // TO-DO: do we need test for SET_STATUS thrashing due to rapid
//         // data changes
//       })
//     })
//   })
// })

describe(`build`, () => {
  describe(`initial work finishes with SUCCESS`, () => {
    let gatsbyProcess
    let events = []

    beforeAll(async () => {
      gatsbyProcess = spawn(gatsbyBin, [`build`], {
        // stdio: [`inherit`, `inherit`, `inherit`, `ipc`],
        stdio: [`ignore`, `ignore`, `ignore`, `ipc`],
        env: {
          ...process.env,
          NODE_ENV: `production`,
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
    })
    commonAssertionsForSuccess(events)

    // We need to check if Cloud depends on the emission of certain
    // specific activities (like building schema, run queries, building HTML pages)
    // If yes, we need to assert that they are emitted so that we can catch
    // an instance if they are removed accidentally
    it.todo(`asserts activities of bootstrap`)
  })

  // describe(`work finishes with FAILURE`, () => {
  //   describe(`called with reporter.panic(onBuild)`, () => {
  //     commonAssertionsForFailure()
  //   })
  //   describe(`unhandledRejection`, () => {
  //     commonAssertionsForFailure()
  //   })
  //   describe(`process.exit(1)`, () => {
  //     commonAssertionsForFailure()
  //   })

  //   // in cloud we kill gatsby process with SIGTERM
  //   describe(`process.kill(process.pid, "SIGTERM")`, () => {
  //     commonAssertionsForFailure()
  //   })
  // })
})

//TO-DO: add api running activity
