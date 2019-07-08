jest.mock(`../physical-cpu-count`, () => 1)
const getCPUCoreCount = require(`../cpu-core-count`)

beforeEach(() => {
  delete process.env.GATSBY_CPU_COUNT
})

test(`it defaults to physical CPU count, if override not detected`, () => {
  expect(getCPUCoreCount()).toBe(1)
})

test(`it does not use env far override, if ignoreEnvVar is true`, () => {
  process.env.GATSBY_CPU_COUNT = 9001

  expect(getCPUCoreCount(true)).not.toBe(Number(process.env.GATSBY_CPU_COUNT))
})

test(`uses env var override, if exists`, () => {
  process.env.GATSBY_CPU_COUNT = 9001

  expect(getCPUCoreCount()).toBe(Number(process.env.GATSBY_CPU_COUNT))
})
