jest.mock(`../physical-cpu-count`, () => {
  return { getPhysicalCpuCount: (): number => 1 }
})
import { cpuCoreCount } from "../cpu-core-count"

beforeEach(() => {
  delete process.env.GATSBY_CPU_COUNT
})

test(`it defaults to physical CPU count, if override not detected`, () => {
  expect(cpuCoreCount(false)).toBe(1)
})

test(`it does not use env far override, if ignoreEnvVar is true`, () => {
  process.env.GATSBY_CPU_COUNT = `9001`

  expect(cpuCoreCount(true)).not.toBe(Number(process.env.GATSBY_CPU_COUNT))
})

test(`uses env var override, if exists`, () => {
  process.env.GATSBY_CPU_COUNT = `9001`

  expect(cpuCoreCount(false)).toBe(Number(process.env.GATSBY_CPU_COUNT))
})
