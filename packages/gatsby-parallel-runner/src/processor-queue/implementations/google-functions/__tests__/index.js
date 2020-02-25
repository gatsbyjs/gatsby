const { GoogleFunctions } = require(`..`)

const googleConfig = { project_id: `test-project` }
const processorSettings = { name: `image-processor`, key: `IMAGE_PROCESSOR` }

test(`instantiate google pubsub`, async () => {
  const pubSub = await new GoogleFunctions({
    noSubscription: true,
    processorSettings,
    googleConfig,
  })
  expect(pubSub).toBeInstanceOf(GoogleFunctions)
})

test(`size check for google publish`, async () => {
  const pubSub = await new GoogleFunctions({
    noSubscription: true,
    processorSettings,
    googleConfig,
  })
  const msg = Buffer.from(`Hello, World!`)
  pubSub.maxPubSubSize = 10000
  pubSub.pubSubClient = {
    topic: () => {
      return {
        publish: async pubSubMsg => {
          expect(pubSubMsg).toBe(msg)
        },
      }
    },
  }
  pubSub.storageClient = {
    bucket: () => {
      return {
        file: path => {
          expect(path).toEqual(`event-2345`)
          return {
            save: async (data, options) => {
              expect(Buffer.from(data, `base64`).toString()).toEqual(
                `Hello, World!`
              )
              expect(options).toEqual({ resumable: false })
            },
          }
        },
      }
    },
  }
  pubSub.publish(`1234`, msg)

  pubSub.maxPubSubSize = 2
  pubSub.publish(`2345`, msg)
})
