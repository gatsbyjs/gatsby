import { memoryStoreWithPriorityBuckets } from "../better-queue-custom-store"
import pify from "pify"

// those are tests copied from https://github.com/diamondio/better-queue-store-test/blob/master/tester.js
// and converted from mocha to jest + used pify to make it nicer to read than callback chain
describe(`Custom better-queue memory store`, () => {
  let store

  const functions = [
    `connect`,
    `getTask`,
    `putTask`,
    `deleteTask`,
    `takeFirstN`,
    `takeLastN`,
    `getLock`,
    `getRunningTasks`,
    `releaseLock`,
  ]
  beforeEach(() => {
    store = memoryStoreWithPriorityBuckets()
    functions.forEach(fnName => {
      if (store[fnName]) {
        store[fnName] = pify(store[fnName])
      }
    })
  })

  it(`all required functions exist`, () => {
    functions.forEach(fnName => {
      expect(typeof store[fnName]).toBe(`function`)
    })
  })

  it(`connect starts empty`, async () => {
    const len = await store.connect()
    expect(len).toBe(0)
  })

  it(`put and get`, async () => {
    await store.connect()
    await store.putTask(`test`, { value: `secret` }, 1)

    const task = await store.getTask(`test`)
    expect(task.value).toBe(`secret`)
  })

  it(`put 3, take last 2, take last 2`, async () => {
    await store.connect()
    await store.putTask(`task1`, { value: `secret 1` }, 1)
    await store.putTask(`task2`, { value: `secret 2` }, 1)
    await store.putTask(`task3`, { value: `secret 3` }, 1)

    let lockId: string = await store.takeLastN(2)
    let tasks: any = await store.getLock(lockId)

    // should get the third task
    expect(tasks.task3.value).toBe(`secret 3`)
    // should get the second task
    expect(tasks.task2.value).toBe(`secret 2`)
    // should not get the first task
    expect(tasks.task1).toBeUndefined()

    lockId = await store.takeLastN(2)
    tasks = await store.getLock(lockId)

    // should not get the third task
    expect(tasks.task3).toBeUndefined()
    // should not get the second task
    expect(tasks.task2).toBeUndefined()
    // should get the first task
    expect(tasks.task1.value).toBe(`secret 1`)
  })

  it(`put 3, take first 2, take first 2`, async () => {
    await store.connect()
    await store.putTask(`task1`, { value: `secret 1` }, 1)
    await store.putTask(`task2`, { value: `secret 2` }, 1)
    await store.putTask(`task3`, { value: `secret 3` }, 1)

    let lockId = await store.takeFirstN(2)
    let tasks = await store.getLock(lockId)

    // should get the first task
    expect(tasks.task1.value).toBe(`secret 1`)
    // should get the second task
    expect(tasks.task2.value).toBe(`secret 2`)
    // should not get the third task
    expect(tasks.task3).toBeUndefined()

    lockId = await store.takeFirstN(2)
    tasks = await store.getLock(lockId)

    // should not get the first task
    expect(tasks.task1).toBeUndefined()
    // should not get the second task
    expect(tasks.task2).toBeUndefined()
    // should get the third task
    expect(tasks.task3.value).toBe(`secret 3`)
  })

  it(`get and release workers`, async () => {
    await store.connect()
    await store.putTask(`task1`, { value: `secret 1` }, 1)
    await store.putTask(`task2`, { value: `secret 2` }, 1)
    await store.putTask(`task3`, { value: `secret 3` }, 1)

    const lock1: string = await store.takeFirstN(1)
    const lock2: string = await store.takeLastN(1)

    let workers = await store.getRunningTasks()

    // should have first lock
    expect(workers[lock1]).toBeDefined()
    // should have second lock
    expect(workers[lock2]).toBeDefined()
    // should have two workers
    expect(Object.keys(workers).length).toBe(2)
    // should have task1
    expect(workers[lock1].task1.value).toBe(`secret 1`)
    // should have task3
    expect(workers[lock2].task3.value).toBe(`secret 3`)

    await store.releaseLock(lock1)
    await store.releaseLock(lock2)

    workers = await store.getRunningTasks()

    // should not have lock 1
    expect(workers[lock1]).toBeUndefined()
    // should not have lock 2
    expect(workers[lock2]).toBeUndefined()
    // should have no workers
    expect(Object.keys(workers).length).toBe(0)
  })

  it(`put 4, delete 1, take first 2`, async () => {
    await store.connect()
    await store.putTask(`task1`, { value: `secret 1` }, 1)
    await store.putTask(`task2`, { value: `secret 2` }, 1)
    await store.putTask(`task3`, { value: `secret 3` }, 1)
    await store.putTask(`task4`, { value: `secret 4` }, 1)

    // Remove the second
    await store.deleteTask(`task2`)

    // take 2
    const lockId: string = await store.takeFirstN(2)
    const tasks = await store.getLock(lockId)

    // should get the first task
    expect(tasks.task1.value).toBe(`secret 1`)
    // should not get the second task
    expect(tasks.task2).toBeUndefined()
    // should get the third task
    expect(tasks.task3.value).toBe(`secret 3`)
    // should not get the fourth task
    expect(tasks.task4).toBeUndefined()
  })

  // extra tests to cover priority
  it(`handles priority`, async () => {
    await store.connect()
    await store.putTask(`task1`, { value: `secret 1` }, 1)
    await store.putTask(`task2`, { value: `secret 2` }, 3)
    await store.putTask(`task3`, { value: `secret 3` }, 4)
    await store.putTask(`task4`, { value: `secret 4` }, 2)

    // take first 2
    let lockId: string = await store.takeFirstN(2)
    let tasks = await store.getLock(lockId)

    // should get the third task
    expect(tasks.task3.value).toBe(`secret 3`)
    // should get the second task
    expect(tasks.task2.value).toBe(`secret 2`)
    // should not get first task
    expect(tasks.task1).toBeUndefined()
    // should not get the fourth task
    expect(tasks.task4).toBeUndefined()

    // take last 1
    lockId = await store.takeLastN(1)
    tasks = await store.getLock(lockId)

    // should get the first task
    expect(tasks.task1.value).toBe(`secret 1`)
    // should not get second task
    expect(tasks.task2).toBeUndefined()
    // should not get third task
    expect(tasks.task3).toBeUndefined()
    // should not get the fourth task
    expect(tasks.task4).toBeUndefined()
  })
})
