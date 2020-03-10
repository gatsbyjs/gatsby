jest.mock(`child_process`)
jest.mock(`os`)
let os
function mockPlatform(platform: string): void {
  os.platform.mockImplementation(() => platform)
}

describe(`physical-cpu-count`, () => {
  beforeEach(() => {
    jest.resetModules()
    os = require(`os`)
    os.cpus.mockImplementation(() => [{ model: `Test` }])
  })

  it.each([`linux`, `darwin`])(
    `should return correct CPU count on %s`,
    (platform: string): void => {
      const cProc = require(`child_process`)
      cProc.execSync.mockImplementation((): string => `4`)
      mockPlatform(platform)
      const { getPhysicalCpuCount } = require(`../physical-cpu-count`)
      expect(getPhysicalCpuCount()).toBe(4)
    }
  )

  it.each([`linux`, `darwin`])(
    `should return fallback CPU count on %s when childProcess fails`,
    (platform: string): void => {
      const cProc = require(`child_process`)
      cProc.execSync.mockImplementation(() => `4`)
      mockPlatform(platform)
      const { getPhysicalCpuCount } = require(`../physical-cpu-count`)
      expect(getPhysicalCpuCount()).toBe(4)
    }
  )

  it(`should return correct CPU count on Windows`, () => {
    const cProc = require(`child_process`)
    os.cpus.mockImplementation(() => [{ model: `Test` }])
    cProc.execSync.mockImplementation(
      () => `NumberOfCores
    4
    `
    )
    mockPlatform(`win32`)
    const { getPhysicalCpuCount } = require(`../physical-cpu-count`)
    expect(getPhysicalCpuCount()).toBe(4)
  })

  it(`should return fallback CPU count on Windows when childProcess fails`, () => {
    const cProc = require(`child_process`)
    cProc.execSync.mockImplementation(() => {
      throw new Error(`Fail!`)
    })
    mockPlatform(`win32`)
    const { getPhysicalCpuCount } = require(`../physical-cpu-count`)
    expect(getPhysicalCpuCount()).toBe(1)
  })

  it(`should check for hyperthreading when intel is the processor`, () => {
    const cProc = require(`child_process`)
    cProc.execSync.mockImplementation(() => {
      throw new Error(`Fail!`)
    })

    os.cpus.mockImplementation(() => [{ model: `Intel` }, { model: `Intel` }])
    mockPlatform(`linux`)
    const { getPhysicalCpuCount } = require(`../physical-cpu-count`)
    expect(getPhysicalCpuCount()).toBe(1)
  })
})
