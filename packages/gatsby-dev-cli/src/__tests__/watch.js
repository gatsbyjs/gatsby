jest.mock(`chokidar`, () => {
  return {
    watch: jest.fn(),
  }
})
jest.mock(`fs-extra`, () => {
  return {
    copy: jest.fn(),
    existsSync: jest.fn(),
  }
})
const chokidar = require(`chokidar`)
const fs = require(`fs-extra`)
const path = require(`path`)
const watch = require(`../watch`)

let on
beforeEach(() => {
  fs.copy.mockReset()
  fs.existsSync.mockImplementation(() => true)
  chokidar.watch.mockImplementation(() => {
    const mock = {
      on: jest.fn().mockImplementation(() => mock),
    }
    on = mock.on
    return mock
  })
})

describe(`watching`, () => {
  const callEventCallback = (...args) =>
    on.mock.calls[0].slice(-1).pop()(...args)
  const callReadyCallback = (...args) =>
    on.mock.calls[1].slice(-1).pop()(...args)

  const args = [process.cwd(), [`gatsby`], {}]

  it(`watches files`, () => {
    watch(...args)
    expect(chokidar.watch).toHaveBeenCalledTimes(1)
    expect(chokidar.watch).toHaveBeenCalledWith(expect.any(Array), {
      ignored: [expect.any(Function)],
    })
  })

  it(`registers on handlers`, () => {
    watch(...args)

    expect(on).toHaveBeenCalledTimes(2)
    expect(on).toHaveBeenLastCalledWith(`ready`, expect.any(Function))
  })

  describe(`copying files`, () => {
    it(`does not copy files on non-watch event`, () => {
      watch(...args)

      callEventCallback(`test`)

      expect(fs.copy).not.toHaveBeenCalled()
    })

    it(`copies files on watch event`, () => {
      const filePath = path.join(process.cwd(), `packages/gatsby/dist/index.js`)
      watch(...args)
      callEventCallback(`add`, filePath)

      expect(fs.copy).toHaveBeenCalledTimes(1)
      expect(fs.copy).toHaveBeenCalledWith(
        filePath,
        path.join(`node_modules`, `gatsby`, `dist`, `index.js`),
        expect.any(Function)
      )
    })

    it(`copies cache-dir files`, () => {
      watch(...args)

      const filePath = path.join(
        process.cwd(),
        `packages/gatsby/cache-dir/register-service-worker.js`
      )
      callEventCallback(`add`, filePath)

      expect(fs.copy).toHaveBeenCalledTimes(2)
      expect(fs.copy).toHaveBeenLastCalledWith(
        filePath,
        path.join(`.cache`, `register-service-worker.js`),
        expect.any(Function)
      )
    })

    it(`filters non-existant files/directories`, () => {
      fs.existsSync.mockReset().mockImplementation(file => false)

      watch(...args)

      expect(chokidar.watch).toHaveBeenCalledWith([], expect.any(Object))
    })

    it(`filters duplicate directories`, () => {
      watch(process.cwd(), [`gatsby`, `gatsby`], {})

      expect(chokidar.watch).toHaveBeenCalledWith(
        [expect.stringContaining(`gatsby`)],
        expect.any(Object)
      )
    })
  })

  describe(`exiting`, () => {
    let realProcess
    beforeAll(() => {
      realProcess = global.process

      global.process = {
        ...realProcess,
        exit: jest.fn(),
      }
    })

    afterAll(() => {
      global.process = realProcess
    })

    it(`does not exit if scanOnce is not defined`, () => {
      watch(...args)
      callReadyCallback()

      expect(process.exit).not.toHaveBeenCalled()
    })

    it(`exits if scanOnce is defined`, async () => {
      watch(process.cwd(), [`gatsby`], { scanOnce: true })

      await callReadyCallback()

      expect(process.exit).toHaveBeenCalledTimes(1)
    })
  })
})
