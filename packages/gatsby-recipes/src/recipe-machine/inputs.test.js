const { interpret } = require(`xstate`)

const recipeMachine = require(`.`)

describe(`recipe-machine`, () => {
  it(`requests input when a resource is missing data`, done => {
    const initialContext = {
      src: `
# File!

---

<File path="" />
    `,
      currentStep: 0,
    }
    try {
      const service = interpret(
        recipeMachine.withContext(initialContext)
      ).onTransition(state => {
        console.log(
          JSON.stringify(
            {
              value: state.value,
              context: state.context,
            },
            null,
            2
          )
        )
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
    } catch (e) {
      console.log(e)
    }
  })
})
