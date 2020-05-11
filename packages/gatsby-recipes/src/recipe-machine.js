const { Machine, assign } = require(`xstate`)

const createPlan = require(`./create-plan`)
const applyPlan = require(`./apply-plan`)
const validateSteps = require(`./validate-steps`)
const validateRecipe = require(`./validate-recipe`)
const parser = require(`./parser`)

const recipeMachine = Machine(
  {
    id: `recipe`,
    initial: `parsingRecipe`,
    context: {
      recipePath: null,
      projectRoot: null,
      currentStep: 0,
      steps: [],
      plan: [],
      commands: [],
      stepResources: [],
      stepsAsMdx: [],
    },
    states: {
      parsingRecipe: {
        invoke: {
          id: `parseRecipe`,
          src: async (context, event) => {
            let parsed

            if (context.src) {
              parsed = await parser.parse(context.src)
            } else if (context.recipePath && context.projectRoot) {
              parsed = await parser(context.recipePath, context.projectRoot)
            } else {
              throw new Error(
                JSON.stringify({
                  validationError: `A recipe must be specified`,
                })
              )
            }

            return parsed
          },
          onError: {
            target: `doneError`,
            actions: assign({
              error: (context, event) => {
                let msg
                try {
                  msg = JSON.parse(event.data.message)
                  return msg
                } catch (e) {
                  return {
                    error: `Could not parse recipe ${context.recipePath}`,
                    e,
                  }
                }
              },
            }),
          },
          onDone: {
            target: `validateSteps`,
            actions: assign({
              steps: (context, event) => event.data.commands,
              stepsAsMdx: (context, event) => event.data.stepsAsMdx,
            }),
          },
        },
      },
      validateSteps: {
        invoke: {
          id: `validateSteps`,
          src: async (context, event) => {
            const result = await validateSteps(context.steps)
            if (result.length > 0) {
              throw new Error(JSON.stringify(result))
            }

            return undefined
          },
          onDone: `validatePlan`,
          onError: {
            target: `doneError`,
            actions: assign({
              error: (context, event) => JSON.parse(event.data.message),
            }),
          },
        },
      },
      validatePlan: {
        invoke: {
          id: `validatePlan`,
          src: async (context, event) => {
            const result = await validateRecipe(context.steps)
            if (result.length > 0) {
              // is stringifying the only way to pass data around in errors 🤔
              throw new Error(JSON.stringify(result))
            }

            return result
          },
          onDone: `creatingPlan`,
          onError: {
            target: `doneError`,
            actions: assign({
              error: (context, event) => JSON.parse(event.data.message),
            }),
          },
        },
      },
      creatingPlan: {
        entry: [`deleteOldPlan`],
        invoke: {
          id: `createPlan`,
          src: async (context, event) => {
            const result = await createPlan(context)
            return result
          },
          onDone: {
            target: `present plan`,
            actions: assign({
              plan: (context, event) => event.data,
            }),
          },
          onError: {
            target: `doneError`,
            actions: assign({ error: (context, event) => event.data }),
          },
        },
      },
      "present plan": {
        on: {
          CONTINUE: `applyingPlan`,
        },
      },
      applyingPlan: {
        invoke: {
          id: `applyPlan`,
          src: (context, event) => cb => {
            cb(`RESET`)
            if (context.plan.length == 0) {
              return cb(`onDone`)
            }

            const interval = setInterval(() => {
              cb(`TICK`)
            }, 10000)

            applyPlan(context.plan)
              .then(result => {
                cb({ type: `onDone`, data: result })
              })
              .catch(error => cb({ type: `onError`, data: error }))

            return () => clearInterval(interval)
          },
        },
        on: {
          RESET: {
            actions: assign({
              elapsed: 0,
            }),
          },
          TICK: {
            actions: assign({
              elapsed: context => (context.elapsed += 10000),
            }),
          },
          onDone: {
            target: `hasAnotherStep`,
            actions: [`addResourcesToContext`],
          },
          onError: {
            target: `doneError`,
            actions: assign({ error: (context, event) => event.data }),
          },
        },
      },
      hasAnotherStep: {
        entry: [`incrementStep`],
        on: {
          "": [
            {
              target: `creatingPlan`,
              // The 'searchValid' guard implementation details are
              // specified in the machine config
              cond: `hasNextStep`,
            },
            {
              target: `done`,
              // The 'searchValid' guard implementation details are
              // specified in the machine config
              cond: `atLastStep`,
            },
          ],
        },
      },
      done: {
        type: `final`,
      },
      doneError: {
        type: `final`,
      },
    },
  },
  {
    actions: {
      incrementStep: assign((context, event) => {
        return {
          currentStep: context.currentStep + 1,
        }
      }),
      deleteOldPlan: assign((context, event) => {
        return {
          plan: [],
        }
      }),
      addResourcesToContext: assign((context, event) => {
        if (event.data) {
          const stepResources = context.stepResources || []
          const messages = event.data.map(e => {
            return {
              _message: e._message,
              _currentStep: context.currentStep,
            }
          })
          return {
            stepResources: stepResources.concat(messages),
          }
        }
        return undefined
      }),
    },
    guards: {
      hasNextStep: (context, event) =>
        context.currentStep < context.steps.length,
      atLastStep: (context, event) =>
        context.currentStep === context.steps.length,
    },
  }
)

module.exports = recipeMachine
