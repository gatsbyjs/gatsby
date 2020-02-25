const { GoogleFunctions } = require(`..`)

test(`instantiate google pubsub`, async () => {
  const pubSub = await new GoogleFunctions({ noSubscription: true })
  expect(pubSub).toBeInstanceOf(GoogleFunctions)
})

test(`size check for google publish`, async () => {
  const pubSub = await new GoogleFunctions({ noSubscription: true })
  const msg = Buffer.from(`Hello, World!`)
  pubSub.maxPubSubSize = 10000
  pubSub.pubSubClient = {
    topic: () => {
      return {
        publish: async msg => {
          expect(msg).toBe(msg)
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
