const { interpret } = require(`xstate`)

const recipeMachine = require(`.`)

describe(`recipe-machine`, () => {
  it(`enters waitingForInput state when a resource is missing data`, done => {
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
        if (process.env.DEBUG) {
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
        }

        if (state.value === `waitingForInput`) {
          expect(state.context.input.resourceUuid).toBeTruthy()
          expect(state.context.input.props).toEqual({ path: `` })
          service.stop()
          return done()
        }

        if (state.value === `presentPlan`) {
          service.send(`CONTINUE`)
        }
      })

      service.start()
    } catch (e) {
      console.log(e)
    }
  })
})
