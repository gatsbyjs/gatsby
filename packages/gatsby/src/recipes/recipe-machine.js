const { Machine, assign } = require(`xstate`)

const createPlan = require(`./create-plan`)
const applyPlan = require(`./apply-plan`)

const recipeMachine = Machine(
  {
    id: `recipe`,
    initial: `init`,
    context: {
      currentStep: 0,
      steps: [],
      plan: [],
    },
    states: {
      init: {
        on: {
          CONTINUE: `creatingPlan`,
        },
      },
      creatingPlan: {
        invoke: {
          id: `createPlan`,
          src: (context, event) => {
            console.log(`invoking createPlan promise`, { context, event })
            return createPlan(context)
          },
          onDone: {
            target: `present plan`,
            actions: assign({ plan: (context, event) => event.data }),
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
        entry: [`incrementStep`],
        on: {
          CONTINUE: `applyingPlan`,
        },
      },
      applyPlan: {
        // invoke apply plan machine which sends back state updates for resources
      },
      applyingPlan: {
        invoke: {
          id: `applyPlan`,
          src: async (context, event) => {
            console.log(`invoking applyingPlan`, { context })

            if (context.plan.length == 0) {
              return
            }

            await Promise.all(
              context.plan.map(resourcePlan => applyPlan(resourcePlan))
            )
          },
          onDone: `hasAnotherStep`,
          onError: {
            target: `failure`,
            actions: assign({ error: (context, event) => event.data }),
          },
        },
      },
      hasAnotherStep: {
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
    },
    guards: {
      hasNextStep: (context, event) => {
        console.log(`GUARDS:::::hasNextStep`, context, event)
        return context.currentStep + 1 < context.steps.length
      },
      atLastStep: (context, event) => {
        console.log(`GUARDS:::::atLastStep`)
        return context.currentStep + 1 === context.steps.length
      },
    },
  }
)

module.exports = recipeMachine
