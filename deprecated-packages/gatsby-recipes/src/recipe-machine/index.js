import { Machine, assign, send } from "xstate"
import lodash from "lodash"

import debugCtor from "debug"
import validateSteps from "../validate-steps"
import createPlan from "../create-plan"
import applyPlan from "../apply-plan"
import { parse } from "../parser"
import resolveRecipe from "../resolve-recipe"
import findDependencyMatch from "../find-dependency-match"

const debug = debugCtor(`recipes-machine`)

const recipeMachine = Machine(
  {
    id: `recipe`,
    initial: `resolvingRecipe`,
    context: {
      recipePath: null,
      projectRoot: null,
      recipe: ``,
      recipeSrc: ``,
      stepsAsMdx: [],
      stepsAsJS: [],
      exports: [],
      plan: [],
      commands: [],
      stepResources: [],
      inputs: {},
    },
    states: {
      resolvingRecipe: {
        invoke: {
          id: `resolveRecipe`,
          src: async (context, _event) => {
            if (context.src) {
              return context.src
            } else if (context.recipePath && context.projectRoot) {
              const recipe = await resolveRecipe(
                context.recipePath,
                context.projectRoot
              )
              return recipe
            } else {
              throw new Error(`A recipe must be specified`)
            }
          },
          onError: {
            target: `doneError`,
            actions: assign({
              error: (context, _event) => {
                debug(`error resolving recipe`)
                return {
                  error: `Could not resolve recipe "${context.recipePath}"`,
                }
              },
            }),
          },
          onDone: {
            target: `parsingRecipe`,
            actions: assign({
              recipeSrc: (_context, event) => event.data,
            }),
          },
        },
      },
      parsingRecipe: {
        invoke: {
          id: `parseRecipe`,
          src: async (context, _event) => {
            debug(`parsingRecipe`)
            const parsed = await parse(context.recipeSrc)
            debug(`parsedRecipe`)
            return parsed
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
              stepsAsJS: (context, event) => event.data.stepsAsJS,
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
            let result = await createPlan(context, cb)
            // Validate dependencies are met in the resources plan
            result = result.map(r => {
              const matches = findDependencyMatch(result, r)
              // If there's any errors, replace the resource
              // with the error
              if (matches.some(m => m.error)) {
                r.error = matches[0].error
                delete r.diff
              }
              return r
            })

            return result
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
            cb(`RESET`)
            if (context.plan.length === 0) {
              return cb(`onDone`)
            }

            const interval = setInterval(() => {
              cb(`TICK`)
            }, 10000)

            const emitter = applyPlan(context, cb)
            emitter.on(`*`, (type, e) => {
              if (type === `update`) {
                cb({ type: `onUpdate`, data: e })
              }
              if (type === `done`) {
                debug(`applied plan`)
                cb({ type: `onDone`, data: e })
              }
              if (type === `error`) {
                debug(`error applying plan`)
                cb({ type: `onError`, data: e })
              }
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
          onUpdate: {
            actions: [`addResourcesToContext`],
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
        if (lodash.isArray(event.data) && event.data.length > 0) {
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
            p.isDone = changedResource.isDone
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

export default recipeMachine
