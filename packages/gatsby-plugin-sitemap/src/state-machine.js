import { Machine } from "xstate"

const customFilterExists = (context, event) => context.custom_config.filter

const stateMachine = Machine(
  {
    initial: `initializing`,
    context: {
      custom_config: {
        filter: true,
      },
    },
    states: {
      initializing: {
        COMPLETE: `querying`,
        ERROR: `panic`,
      },
      querying: {
        on: {
          COMPLETE: `resolving_pages`,
          ERROR: `panic`,
        },
      },
      resolving_pages: {
        on: {
          COMPLETE: `filtering_default`,
          ERROR: `panic`,
        },
      },
      filtering_default: {
        on: {
          COMPLETE: [
            { target: `filtering_custom`, cond: customFilterExists },
            { target: `resolving_site_url` },
          ],
          ERROR: `panic`,
        },
      },
      filtering_custom: {
        on: {
          COMPLETE: `resolving_site_url`,
          ERROR: `panic`,
        },
      },
      resolving_site_url: {
        on: {
          COMPLETE: `serializing`,
          ERROR: `panic`,
        },
      },

      serializing: {
        on: {
          COMPLETE: `writing_sitemaps`,
          ERROR: `panic`,
        },
      },
      writing_sitemaps: {
        on: {
          COMPLETE: `done`,
          ERROR: `panic`,
        },
      },
      panic: {},
      done: {
        type: `final`,
      },
    },
  },
  {
    guards: {
      customFilterExists,
    },
  }
)
