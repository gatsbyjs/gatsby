// TO-DO: Not sure?
// Should errors that are not followed panic(onBuild)/process.exit be actually errors
// or warnings? If yes, then we should add assertions for SUCCESS status that no errors are
// emitted

const commonAssertions = () => {
  it.todo(`emits actions with a timestamp`)
  it.todo(`validate shape of all messages types - joi?`)
}

const commonAssertionsForSuccess = () => {
  commonAssertions()
  it.todo(`emit initial SET_STATUS with IN_PROGRESS - very first message`)
  it.todo(`emit final SET_STATUS with SUCCESS - last message`)
  it.todo(`it emits just 2 SET_STATUS`)

  it.todo(`asserts all activities that started actually finished successfully`)

  // TO-DO: Do we actually need these considering that activities are created
  // for these as well. Here are we asserting that those activities are correctly created
  // and are working!
  it.todo(`assert that there are no jobs in progress`)
  it.todo(`assert that there are no apis running`)
}

const commonAssertionsForFailure = () => {
  commonAssertions()
  it.todo(`emit initial SET_STATUS with IN_PROGRESS - very first message`)
  it.todo(`emit final SET_STATUS with FAILURE - last message`)
  it.todo(`it emits just 2 SET_STATUS`)

  it.todo(
    `asserts all activities that started actually ended (with at least one failure)`
  )
}

describe(`develop`, () => {
  describe(`initial work finishes with SUCCESS`, () => {
    commonAssertionsForSuccess()

    // We need to check if Cloud depends on the emission of certain
    // specific activities (like building schema, run queries, building HTML pages)
    // If yes, we need to assert that they are emitted so that we can catch
    // an instance if they are removed accidentally
    it.todo(`asserts activities of bootstrap`)
  })

  describe(`work finishes with FAILURE`, () => {
    describe(`called with reporter.panic(onBuild)`, () => {
      commonAssertionsForFailure()
    })
    describe(`unhandledRejection`, () => {
      commonAssertionsForFailure()
    })
    describe(`process.exit(1)`, () => {
      commonAssertionsForFailure()
    })

    // in cloud we kill gatsby process with SIGTERM
    describe(`process.kill(process.pid, "SIGTERM")`, () => {
      commonAssertionsForFailure()
    })
  })

  describe(`test preview workflows`, () => {
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
    commonAssertionsForSuccess()

    // We need to check if Cloud depends on the emission of certain
    // specific activities (like building schema, run queries, building HTML pages)
    // If yes, we need to assert that they are emitted so that we can catch
    // an instance if they are removed accidentally
    it.todo(`asserts activities of bootstrap`)
  })

  describe(`work finishes with FAILURE`, () => {
    describe(`called with reporter.panic(onBuild)`, () => {
      commonAssertionsForFailure()
    })
    describe(`unhandledRejection`, () => {
      commonAssertionsForFailure()
    })
    describe(`process.exit(1)`, () => {
      commonAssertionsForFailure()
    })

    // in cloud we kill gatsby process with SIGTERM
    describe(`process.kill(process.pid, "SIGTERM")`, () => {
      commonAssertionsForFailure()
    })
  })
})

//TO-DO: add api running activity
