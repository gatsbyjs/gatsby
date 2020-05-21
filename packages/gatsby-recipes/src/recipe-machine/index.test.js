const { interpret } = require(`xstate`)
const fs = require(`fs-extra`)
const path = require(`path`)

const recipeMachine = require(`.`)

describe(`recipe-machine`, () => {
  it(`creates empty plan when the step has no resources`, done => {
    const initialContext = {
      src: `
# Hello, world!
    `,
      currentStep: 0,
    }
    const service = interpret(
      recipeMachine.withContext(initialContext)
    ).onTransition(state => {
      if (state.value === `presentPlan`) {
        expect(state.context.plan).toEqual([])
        service.stop()
        done()
      }
    })

    service.start()
  })

  it(`creates plan for File resources`, done => {
    const initialContext = {
      src: `
# File!

---

<File path="./hi.md" content="#yo" />
    `,
      currentStep: 0,
    }
    const service = interpret(
      recipeMachine.withContext(initialContext)
    ).onTransition(state => {
      if (state.value === `presentPlan`) {
        if (state.context.currentStep === 0) {
          service.send(`CONTINUE`)
        } else {
          expect(state.context.plan).toBeTruthy()
          service.stop()
          done()
        }
      }
    })

    service.start()
  })

  it(`switches to done after the final apply step`, done => {
    const filePath = `./hi.md`
    const initialContext = {
      src: `
# File!

---

<File path="${filePath}" content="#yo" />
    `,
      currentStep: 0,
    }
    const service = interpret(
      recipeMachine.withContext(initialContext)
    ).onTransition(state => {
      // Keep simulating moving onto the next step
      if (state.value === `presentPlan`) {
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

  it(`stores created/changed/deleted resources on the context after applying plan`, done => {
    const filePath = `./hi.md`
    const filePath2 = `./hi2.md`
    const filePath3 = `./hi3.md`
    const initialContext = {
      src: `
# File!

---

<File path="${filePath}" content="#yo" />
<File path="${filePath2}" content="#yo" />

---

<File path="${filePath3}" content="#yo" />
    `,
      currentStep: 0,
    }
    const service = interpret(
      recipeMachine.withContext(initialContext)
    ).onTransition(state => {
      // Keep simulating moving onto the next step
      if (state.value === `presentPlan`) {
        service.send(`CONTINUE`)
      }
      if (state.value === `done`) {
        // Clean up files
        fs.unlinkSync(path.join(process.cwd(), filePath))
        fs.unlinkSync(path.join(process.cwd(), filePath2))
        fs.unlinkSync(path.join(process.cwd(), filePath3))

        expect(state.context.stepResources).toHaveLength(3)
        expect(state.context.stepResources).toMatchSnapshot()
        expect(state.context.stepResources[0]._message).toBeTruthy()
        expect(state.context.stepResources[0]._currentStep).toBeTruthy()
        done()
      }
    })

    service.start()
  })
})
