const { Machine, assign, send } = require(`xstate`)

const debug = require(`debug`)(`recipes-machine`)

const createPlan = require(`../create-plan`)
const applyPlan = require(`../apply-plan`)
const validateSteps = require(`../validate-steps`)
const parser = require(`../parser`)

const recipeMachine = Machine(
  {
    id: `recipe`,
    initial: `parsingRecipe`,
    context: {
      recipePath: null,
      projectRoot: null,
      recipe: ``,
      stepsAsMdx: [],
      exports: [],
      plan: [],
      commands: [],
      stepResources: [],
      inputs: {},
    },
    states: {
      parsingRecipe: {
        invoke: {
          id: `parseRecipe`,
          src: async (context, _event) => {
            let parsed

            debug(`parsingRecipe`)

            let result
            if (context.src) {
              result = await parser.parse(context.src)
            } else if (context.recipePath && context.projectRoot) {
              result = await parser(context.recipePath, context.projectRoot)
            } else {
              throw new Error(
                JSON.stringify({
                  validationError: `A recipe must be specified`,
                })
              )
            }

            debug(`parsedRecipe`)

            return result
          },
          onError: {
            target: `doneError`,
            actions: assign({
              error: (context, event) => {
                debug(`error parsing recipes`)

                let msg
                try {
                  msg = JSON.parse(event.data.message)
                  return msg
                } catch (e) {
                  // console.log(e)
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
              recipe: (context, event) => event.data.recipe,
              stepsAsMdx: (context, event) => event.data.stepsAsMdx,
              exports: (context, event) => event.data.exports,
            }),
          },
        },
      },
      validateSteps: {
        invoke: {
          id: `validateSteps`,
          src: async (context, event) => {
            debug(`validatingSteps`)
            const result = await validateSteps(context.stepsAsMdx)
            if (result.length > 0) {
              debug(`errors found in validation`)
              throw new Error(JSON.stringify(result))
            }

            return undefined
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
          src: (context, event) => async (cb, onReceive) => {
            try {
              const result = await createPlan(context, cb)
              return result
            } catch (e) {
              console.log(e)
              throw e
            }
          },
          onDone: {
            target: `presentPlan`,
            actions: assign({
              plan: (context, event) => event.data,
            }),
          },
          onError: {
            target: `doneError`,
            actions: assign({
              error: (context, event) => event.data?.errors || event.data,
            }),
          },
        },
        on: {
          INVALID_PROPS: {
            target: `doneError`,
            actions: assign({
              error: (context, event) => event.data,
            }),
          },
        },
      },
      presentPlan: {
        invoke: {
          id: `presentingPlan`,
          src: (context, event) => (cb, onReceive) => {
            onReceive(async e => {
              context.inputs = context.inputs || {}
              context.inputs[e.data.key] = e.data
              const result = await createPlan(context, cb)
              cb({ type: `onUpdatePlan`, data: result })
            })
          },
        },
        on: {
          CONTINUE: [
            {
              target: `doneError`,
              cond: `hasErrors`,
            },
            {
              target: `applyingPlan`,
            },
          ],
          INPUT_ADDED: {
            actions: send((context, event) => event, { to: `presentingPlan` }),
          },
          onUpdatePlan: {
            actions: assign({
              plan: (context, event) => event.data,
            }),
          },
        },
      },
      applyingPlan: {
        // cb mechanism can be used to emit events/actions between UI and the server/renderer
        // https://xstate.js.org/docs/guides/communication.html#invoking-callbacks
        invoke: {
          id: `applyPlan`,
          src: (context, event) => cb => {
            debug(`applying plan`)
            cb(`RESET`)
            if (context.plan.length === 0) {
              return cb(`onDone`)
            }

            const interval = setInterval(() => {
              cb(`TICK`)
            }, 10000)

            applyPlan(context, cb)
              .then(result => {
                debug(`applied plan`)
                cb({ type: `onDone`, data: result })
              })
              .catch(error => {
                debug(`error applying plan`)
                debug(error)
                cb({ type: `onError`, data: error })
              })

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
            target: `done`,
            actions: [`addResourcesToContext`],
          },
          onError: {
            target: `doneError`,
            actions: assign({ error: (context, event) => event.data }),
          },
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
      deleteOldPlan: assign((context, event) => {
        return {
          plan: [],
        }
      }),
      addResourcesToContext: assign((context, event) => {
        if (event.data) {
          let plan = context.plan || []
          plan = plan.map(p => {
            const changedResource = event.data.find(c => {
              if (c._uuid) {
                return c._uuid === p._uuid
              } else {
                return c.resourceDefinitions._key === p.resourceDefinitions._key
              }
            })
            if (!changedResource) return p
            p._message = changedResource._message
            p.isDone = true
            return p
          })
          return {
            plan,
          }
        }
        return undefined
      }),
    },
    guards: {
      hasErrors: context => context.plan.some(p => p.error),
    },
  }
)

module.exports = recipeMachine
