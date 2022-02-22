import Batcher from "../batcher"

const funcObj = {
  singleCall(str: string, num: number): string {
    return `${str}, ${num}`
  },

  bulkCall(calls: Array<Parameters<typeof funcObj.singleCall>>): number {
    return calls.length
  },
}

describe(`Batcher`, () => {
  let batcher: Batcher<typeof funcObj.singleCall>
  let singleCall: jest.SpiedFunction<typeof funcObj.singleCall>
  let bulkCall: jest.SpiedFunction<typeof funcObj.bulkCall>
  const defaultThreshold = 10

  function createBatcherWithSpies(threshold: number): void {
    if (singleCall) singleCall.mockRestore()
    if (bulkCall) bulkCall.mockRestore()

    singleCall = jest.spyOn(funcObj, `singleCall`)
    bulkCall = jest.spyOn(funcObj, `bulkCall`)

    batcher = new Batcher<typeof funcObj.singleCall>(threshold)
    batcher.call(funcObj.singleCall)
    batcher.bulkCall(funcObj.bulkCall)
  }

  beforeEach(() => {
    createBatcherWithSpies(defaultThreshold)
  })

  afterEach(() => {
    singleCall.mockRestore()
    bulkCall.mockRestore()
  })

  // eslint-disable-next-line @typescript-eslint/no-array-constructor
  Array(1, 2, 10).forEach(threshold => {
    it(`flushes single calls after threshold of ${threshold} is hit`, () => {
      createBatcherWithSpies(threshold)

      for (let i = 0; i < threshold; i++) {
        expect(singleCall).not.toHaveBeenCalled()
        batcher.add(`string`, i)
      }

      expect(singleCall).toHaveBeenCalledTimes(threshold)
      for (let i = 0; i < threshold; i++) {
        expect(singleCall).toBeCalledWith(`string`, i)
      }
    })

    it(`flushes bulk calls after threshold of ${threshold} is hit`, () => {
      createBatcherWithSpies(threshold)
      const expectedCall = Array.from(Array(threshold).keys()).map(i => [
        `string`,
        i,
      ])

      for (let i = 0; i < threshold; i++) {
        expect(bulkCall).not.toHaveBeenCalled()
        batcher.add(`string`, i)
      }

      expect(bulkCall).toHaveBeenCalledTimes(1)
      expect(bulkCall).toBeCalledWith(expectedCall)
    })
  })

  it(`doesn't flush immediately after previous`, () => {
    for (let i = 0; i < defaultThreshold; i++) {
      batcher.add(`string`, i)
    }

    expect(bulkCall).toHaveBeenCalledTimes(1)
    expect(singleCall).toHaveBeenCalledTimes(defaultThreshold)
    batcher.add(`string`, 100)
    expect(bulkCall).toHaveBeenCalledTimes(1)
    expect(singleCall).toHaveBeenCalledTimes(defaultThreshold)
  })

  it(`flushes again after threshold is hit twice`, () => {
    for (let i = 0; i < defaultThreshold; i++) {
      batcher.add(`string`, i)
    }

    for (let i = defaultThreshold; i < defaultThreshold * 2; i++) {
      expect(bulkCall).toHaveBeenCalledTimes(1)
      expect(singleCall).toHaveBeenCalledTimes(defaultThreshold)
      batcher.add(`string`, i)
    }

    expect(bulkCall).toHaveBeenCalledTimes(2)
    expect(singleCall).toHaveBeenCalledTimes(defaultThreshold * 2)
  })

  it(`calls all callbacks`, () => {
    // these are already set up in our beforeEach, but add them again
    // to make sure we see double calls
    batcher.call(funcObj.singleCall)
    batcher.bulkCall(funcObj.bulkCall)

    for (let i = 0; i < defaultThreshold; i++) {
      batcher.add(`string`, i)
    }

    expect(bulkCall).toHaveBeenCalledTimes(2)
    expect(singleCall).toHaveBeenCalledTimes(defaultThreshold * 2)
  })
})
