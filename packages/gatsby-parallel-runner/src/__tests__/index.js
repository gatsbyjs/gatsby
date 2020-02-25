const path = require(`path`)
const { messageHandler } = require(`../build`)
const { resolveProcessors } = require(`../utils`)

test(`test message handler with image processor`, async () => {
  expect.assertions(2)
  const fakeGatsby = {
    send: jest.fn(msg => {
      expect(msg).toEqual({
        type: `JOB_COMPLETED`,
        payload: {
          id: `1234`,
          result: { outputs: [] },
        },
      })
    }),
  }

  const processors = {
    IMAGE_PROCESSING: {
      process: jest.fn(async msg => {
        expect(msg).toEqual({
          id: `1234`,
          name: `IMAGE_PROCESSING`,
          args: [],
          inputPaths: [
            { path: path.join(__dirname, `images`, `gatsby-astronaut.png`) },
          ],
        })
        return { outputs: [] }
      }),
    },
  }

  const handler = messageHandler(fakeGatsby, processors)
  await handler({
    type: `JOB_CREATED`,
    payload: {
      id: `1234`,
      name: `IMAGE_PROCESSING`,
      args: [],
      inputPaths: [
        { path: path.join(__dirname, `images`, `gatsby-astronaut.png`) },
      ],
    },
  })
})

test(`test message handler with failing image processor`, async () => {
  expect.assertions(2)
  const fakeGatsby = {
    send: jest.fn(msg => {
      expect(msg).toEqual({
        type: `JOB_FAILED`,
        payload: {
          id: `1234`,
          error: `Error during processing...`,
        },
      })
    }),
  }

  const processors = {
    IMAGE_PROCESSING: {
      process: jest.fn(async msg => {
        expect(msg).toEqual({
          id: `1234`,
          name: `IMAGE_PROCESSING`,
          args: [],
          inputPaths: [
            { path: path.join(__dirname, `images`, `gatsby-astronaut.png`) },
          ],
        })
        return Promise.reject(`Error during processing...`)
      }),
    },
  }

  const handler = messageHandler(fakeGatsby, processors)
  await handler({
    type: `JOB_CREATED`,
    payload: {
      id: `1234`,
      name: `IMAGE_PROCESSING`,
      args: [],
      inputPaths: [
        { path: path.join(__dirname, `images`, `gatsby-astronaut.png`) },
      ],
    },
  })
})

test(`test message handler with unkown processor`, async () => {
  expect.assertions(1)
  const fakeGatsby = {
    send: jest.fn(msg => {
      expect(msg).toEqual({
        type: `JOB_NOT_WHITELISTED`,
        payload: { id: `1234` },
      })
    }),
  }

  const handler = messageHandler(fakeGatsby, {})
  await handler({
    type: `JOB_CREATED`,
    payload: {
      id: `1234`,
      name: `UNKOWN_PROCESSOR`,
      args: [],
      inputPaths: [
        { path: path.join(__dirname, `images`, `gatsby-astronaut.png`) },
      ],
    },
  })
})

test(`resolve processors`, async () => {
  const processors = await resolveProcessors()
  expect(processors).toEqual([
    {
      name: `image-processing`,
      key: `IMAGE_PROCESSING`,
      path: path.join(__dirname, `../processors/image-processing`),
    },
  ])
})
