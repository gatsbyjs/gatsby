process.env.GATSBY_SHOULD_TRACK_IMAGE_CDN_URLS = "true"

// See https://github.com/inrupt/solid-client-authn-js/issues/1676
if (
  typeof globalThis.TextEncoder === "undefined" ||
  typeof globalThis.TextDecoder === "undefined"
) {
  const utils = require("util")
  globalThis.TextEncoder = utils.TextEncoder
  globalThis.TextDecoder = utils.TextDecoder
}

jest.mock(`gatsby-worker`, () => {
  const gatsbyWorker = jest.requireActual(`gatsby-worker`)

  const { WorkerPool: OriginalWorkerPool } = gatsbyWorker

  class WorkerPoolThatCanUseTS extends OriginalWorkerPool {
    constructor(workerPath, options) {
      options.env = {
        ...(options.env ?? {}),
        NODE_OPTIONS: `--require ${require.resolve(
          `./packages/gatsby/src/utils/worker/__tests__/test-helpers/ts-register.js`
        )}`,
      }
      super(workerPath, options)
    }
  }

  return {
    ...gatsbyWorker,
    WorkerPool: WorkerPoolThatCanUseTS,
  }
})
