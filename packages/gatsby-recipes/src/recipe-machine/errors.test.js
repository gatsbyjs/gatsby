const { interpret } = require(`xstate`)

const recipeMachine = require(`.`)

describe(`recipe-machine errors`, () => {
  it(`errors if part of the recipe fails schema validation`, done => {
    const initialContext = {
      src: `
# Hello, world

---

<File path="./hi.md" contentz="#yo" />
    `,
      currentStep: 0,
    }
    const service = interpret(
      recipeMachine.withContext(initialContext)
    ).onTransition(state => {
      if (state.value === `doneError`) {
        expect(state.context.error).toBeTruthy()
        service.stop()
        done()
      } else if (state.value === `presentPlan`) {
        if (state.context.currentStep === 0) {
          service.send(`CONTINUE`)
        }
      }
    })

    service.start()
  })

  it(`errors if the introduction step has a command`, done => {
    const initialContext = {
      src: `
# Hello, world

<File path="./hi.md" content="#yo" />
    `,
      currentStep: 0,
    }
    const service = interpret(
      recipeMachine.withContext(initialContext)
    ).onTransition(state => {
      if (state.value === `doneError`) {
        expect(state.context.error).toBeTruthy()
        service.stop()
        done()
      }
    })

    service.start()
  })

  it(`errors if no src or recipePath has been given`, done => {
    const initialContext = {
      currentStep: 0,
    }
    const service = interpret(
      recipeMachine.withContext(initialContext)
    ).onTransition(state => {
      if (state.value === `doneError`) {
        expect(state.context.error).toBeTruthy()
        //expect(state.context.error).toMatchSnapshot()
        service.stop()
        done()
      }
    })

    service.start()
  })

  it(`errors if invalid jsx is passed`, done => {
    const initialContext = {
      src: `
# Hello, world

<File path="./hi.md" contentz="#yo" /
    `,
      currentStep: 0,
    }
    const service = interpret(
      recipeMachine.withContext(initialContext)
    ).onTransition(state => {
      if (state.value === `doneError`) {
        expect(state.context.error).toBeTruthy()
        //expect(state.context.error).toMatchSnapshot()
        service.stop()
        done()
      }
    })

    service.start()
  })
})
