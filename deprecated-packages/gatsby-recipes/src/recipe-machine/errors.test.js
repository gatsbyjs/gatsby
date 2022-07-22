import { interpret } from "xstate"

import recipeMachine from "."

describe(`recipe-machine errors`, () => {
  it(`errors if part of the recipe fails schema validation`, done => {
    const initialContext = {
      src: `
# Hello, world

---

<File path="./hi.md" contentz="#yo" />
    `,
    }
    const service = interpret(
      recipeMachine.withContext(initialContext)
    ).onTransition(state => {
      if (state.value === `doneError`) {
        expect(
          state.context.plan
            .filter(p => p.error)
            .map(p => p.error)
            .join(``)
        ).toBeTruthy()
        service.stop()
        done()
      } else if (state.value === `presentPlan`) {
        service.send(`CONTINUE`)
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
    const initialContext = {}
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

  it(`errors if invalid jsx is passed`, done => {
    const initialContext = {
      src: `
# Hello, world

<File path="./hi.md" contentz="#yo" /
    `,
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
})
