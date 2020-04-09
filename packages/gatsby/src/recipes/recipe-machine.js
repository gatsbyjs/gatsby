const { Machine, assign } = require(`xstate`)

const createPlan = require(`./create-plan`)
const applyPlan = require(`./apply-plan`)

const recipeMachine = Machine(
  {
    id: `recipe`,
    initial: `creatingPlan`,
    context: {
      currentStep: 0,
      steps: [],
      plan: [],
      stepResources: [],
    },
    states: {
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
            target: `failure`,
            actions: assign({ error: (context, event) => event.data }),
          },
        },
      },
      failure: {
        "": `done`,
      },
      "present plan": {
        on: {
          CONTINUE: `applyingPlan`,
        },
      },
      applyingPlan: {
        invoke: {
          id: `applyPlan`,
          src: async (context, event) => {
            if (context.plan.length == 0) {
              return undefined
            }

            return await applyPlan(context.plan)
          },
          onDone: {
            target: `hasAnotherStep`,
            actions: [`addResourcesToContext`],
          },
          onError: {
            target: `failure`,
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
          return {
            stepResources: stepResources.concat([event.data]),
          }
        }
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
