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
