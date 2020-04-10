const { interpret } = require(`xstate`)
const fs = require(`fs-extra`)
const path = require(`path`)

const recipeMachine = require(`./recipe-machine`)

it(`should create empty plan when the step has no resources`, done => {
  const initialContext = {
    steps: [{}, {}, {}],
    currentStep: 0,
  }
  const service = interpret(
    recipeMachine.withContext(initialContext)
  ).onTransition(state => {
    if (state.value === `present plan`) {
      expect(state.context.plan).toEqual([])
      service.stop()
      done()
    }
  })

  service.start()
})

it(`should create plan for File resources`, done => {
  const initialContext = {
    steps: [{ File: [{ path: `./hi.md`, content: `#yo` }] }],
    currentStep: 0,
  }
  const service = interpret(
    recipeMachine.withContext(initialContext)
  ).onTransition(state => {
    if (state.value === `present plan`) {
      expect(state.context.plan).toMatchSnapshot()
      service.stop()
      done()
    }
  })

  service.start()
})

it(`it should error if part of the recipe fails validation`, done => {
  const filePath = `./hi.md`
  const initialContext = {
    steps: [{ File: [{ path: filePath, contentz: `#yo` }] }, {}, {}],
    currentStep: 0,
  }
  const service = interpret(
    recipeMachine.withContext(initialContext)
  ).onTransition(state => {
    if (state.value === `doneError`) {
      expect(state.context.error).toBeTruthy()
      expect(state.context.error).toMatchSnapshot()
      service.stop()
      done()
    }
  })

  service.start()
})

it(`it should switch to done after the final apply step`, done => {
  const filePath = `./hi.md`
  const initialContext = {
    steps: [{ File: [{ path: filePath, content: `#yo` }] }, {}, {}],
    currentStep: 0,
  }
  const service = interpret(
    recipeMachine.withContext(initialContext)
  ).onTransition(state => {
    // Keep simulating moving onto the next step
    if (state.value === `present plan`) {
      service.send(`CONTINUE`)
    }
    if (state.value === `done`) {
      const fullPath = path.join(process.cwd(), filePath)
      const fileExists = fs.pathExistsSync(fullPath)
      expect(fileExists).toBeTruthy()
      // Clean up file
      fs.unlinkSync(fullPath)
      done()
    }
  })

  service.start()
})

it(`should store created/changed/deleted resources on the context after applying plan`, done => {
  const filePath = `./hi.md`
  const filePath2 = `./hi2.md`
  const filePath3 = `./hi3.md`
  const initialContext = {
    steps: [
      {
        File: [
          { path: filePath, content: `#yo` },
          { path: filePath3, content: `#yo` },
        ],
      },
      { File: [{ path: filePath2, content: `#yo` }] },
      {},
    ],
    currentStep: 0,
  }
  const service = interpret(
    recipeMachine.withContext(initialContext)
  ).onTransition(state => {
    // Keep simulating moving onto the next step
    if (state.value === `present plan`) {
      service.send(`CONTINUE`)
    }
    if (state.value === `done`) {
      // Clean up files
      fs.unlinkSync(path.join(process.cwd(), filePath))
      fs.unlinkSync(path.join(process.cwd(), filePath2))
      fs.unlinkSync(path.join(process.cwd(), filePath3))

      expect(state.context.stepResources[0]).toHaveLength(2)
      expect(state.context.stepResources).toMatchSnapshot()
      expect(state.context.stepResources[1][0]._message).toBeTruthy()
      done()
    }
  })

  service.start()
})
