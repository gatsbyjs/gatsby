jest.spyOn(process, `cwd`).mockImplementationOnce(() => `/project/root`)
const mockExit = jest.spyOn(process, `exit`).mockImplementation(() => {})

const { readFileSync, writeFileSync } = require(`fs-extra`)
const { load, save } = require(`../prepare/cache`)
const { join } = require(`path`)

jest.mock(`fs-extra`, () => {
  return {
    accessSync: jest.fn(),
    readFileSync: jest.fn(),
    writeFileSync: jest.fn(),
    constants: { W_OK: 1 },
  }
})
jest.mock(`find-cache-dir`, () => () => ``)

const resetCache = () => save(undefined)

describe(`cache`, () => {
  const defaultCache = {
    timestamp: expect.any(Number),
    hash: `initial-run`,
    assets: {},
  }

  afterEach(() => {
    resetCache()
  })

  it(`returns default cache on first run`, () => {
    expect(load()).toMatchObject(defaultCache)
  })

  it(`loads cache from memory if its already been read from disk`, () => {
    save({ from: `memory` })

    expect(load()).toMatchObject({ from: `memory` })
  })

  it(`returns default cache if reading from disk fails`, () => {
    readFileSync
      .mockImplementationOnce(() => {
        throw new Error(`file doesn't exist`)
      })
      .mockImplementationOnce(() => `malformed json`)

    expect(load()).toMatchObject(defaultCache)
    expect(load()).toMatchObject(defaultCache)
  })

  it(`persists cache to disk`, () => {
    save({ some: `cache` })

    expect(writeFileSync).toHaveBeenCalledWith(
      join(`/project/root`, `font-preload-cache.json`),
      `{"some":"cache"}`,
      `utf-8`
    )
  })

  it(`exits if writing to disk fails`, () => {
    writeFileSync.mockImplementationOnce(() => {
      throw new Error(`file not writable`)
    })

    save({ some: `cache` })

    expect(mockExit).toHaveBeenCalledWith(1)
  })
})
