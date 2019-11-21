const apiRunner = require(`../api-runner-node`)
const { emitter } = require(`../../redux`)

describe(`API_RUNNING_QUEUE_EMPTY`, () => {
  const apiRunningQueueEmpty = jest.fn()

  beforeAll(() => {
    emitter.on(`API_RUNNING_QUEUE_EMPTY`, apiRunningQueueEmpty)
  })

  afterAll(() => {
    emitter.off(`API_RUNNING_QUEUE_EMPTY`, apiRunningQueueEmpty)
  })

  beforeEach(() => {
    apiRunningQueueEmpty.mockClear()
  })

  it(`individual api (not cascading) runs emit one API_RUNNING_QUEUE_EMPTY per API run`, async () => {
    expect(apiRunningQueueEmpty).toBeCalledTimes(0)

    await apiRunner(`test-1`)
    await apiRunner(`test-2`)

    expect(apiRunningQueueEmpty).toBeCalledTimes(2)
  })

  describe(`transaction`, () => {
    it(`transaction emits just one API_RUNNING_QUEUE_EMPTY event`, async () => {
      expect(apiRunningQueueEmpty).toBeCalledTimes(0)
      let done = false
      await apiRunner.transaction(async () => {
        await apiRunner(`test-1`)
        await apiRunner(`test-2`)
        done = true
      })

      // sanity check to ensure we are asserting after transaction is completed
      expect(done).toBeTruthy()
      // transaction should force single event emission
      expect(apiRunningQueueEmpty).toBeCalledTimes(1)
    })
  })
})
