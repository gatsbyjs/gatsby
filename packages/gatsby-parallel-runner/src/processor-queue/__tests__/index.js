"use strict"

const path = require(`path`)
const { ProcessorQueue } = require(`../index`)
const { Job } = require(`../queue`)

process.env.TOPIC = `test`

test(`Job size calculation for string`, async () => {
  const job = await new Job({
    id: `1234`,
    args: [],
    file: Buffer.from(`Hello, World`),
  })
  expect(job.fileSize).toBe(12)
})

test(`Job size calculation for file`, async () => {
  const job = await new Job({
    id: `1234`,
    args: [],
    file: path.join(__dirname, `hello.txt`),
  })
  expect(job.fileSize).toBe(14)
})

test(`Job size calculation for missing file`, async () => {
  const file = path.join(__dirname, `nopes.txt`)
  expect.assertions(1)
  await expect(new Job({ id: `1234`, args: [], file })).rejects.toThrow()
})

test(`job message for string`, async () => {
  const job = await new Job({
    id: `1234`,
    args: [],
    file: Buffer.from(`Hello, World`),
  })
  const msg = await job.msg()
  expect(msg).toBeInstanceOf(Buffer)
  expect(JSON.parse(msg.toString())).toEqual({
    id: `1234`,
    action: [],
    file: Buffer.from(`Hello, World`).toString(`base64`),
    topic: `test`,
  })
})

test(`job message for file`, async () => {
  const file = path.join(__dirname, `hello.txt`)
  const job = await new Job({ id: `1234`, args: [], file })
  const msg = await job.msg()
  expect(msg).toBeInstanceOf(Buffer)
  expect(JSON.parse(msg.toString())).toEqual({
    id: `1234`,
    action: [],
    file: Buffer.from(`Hello, World!\n`).toString(`base64`),
    topic: `test`,
  })
})

test(`process should push a job unto the queue`, async () => {
  expect.assertions(2)
  const pubSubImplementation = {
    publish: msg => {
      expect(msg).toBeDefined()
    },
    subscribe: handler => {
      setTimeout(() =>
        handler({
          id: `2345`,
          type: `JOB_COMPLETED`,
          payload: { id: `1234`, output: `done` },
        })
      )
    },
  }
  const processor = new ProcessorQueue({ pubSubImplementation })
  const result = await processor.process({
    id: `1234`,
    args: [],
    file: Buffer.from(`Hello`),
  })
  expect(result).toEqual({ id: `1234`, output: `done` })
})

test(`failure message should cancel processing`, async () => {
  expect.assertions(2)
  const pubSubImplementation = {
    publish: msg => {
      expect(msg).toBeDefined()
    },
    subscribe: handler => {
      setTimeout(() =>
        handler({
          id: `2345`,
          type: `JOB_FAILED`,
          payload: { id: `1234`, error: `Error` },
        })
      )
    },
  }
  const processor = new ProcessorQueue({ pubSubImplementation })
  try {
    await processor.process({
      id: `1234`,
      args: [],
      file: Buffer.from(`Hello`),
    })
  } catch (err) {
    expect(err).toBeDefined()
  }
})
