import { parseArgs } from "../../utils/parse-args"
import { reporter } from "../../utils/reporter"

jest.mock(`../../utils/reporter`)

describe(`parseArgs`, () => {
  it(`should parse without flags and dir`, () => {
    const { flags, siteDirectory } = parseArgs([])
    expect(flags.yes).toBeFalsy()
    expect(flags.ts).toBeFalsy()
    expect(siteDirectory).toEqual(``)
  })
  it(`should parse with dir without flags`, () => {
    const { flags, siteDirectory } = parseArgs([`hello-world`])
    expect(flags.yes).toBeFalsy()
    expect(flags.ts).toBeFalsy()
    expect(siteDirectory).toEqual(`hello-world`)
  })
  it(`should parse with flags before dir`, () => {
    const { flags, siteDirectory } = parseArgs([`-y`, `-ts`, `hello-world`])
    expect(flags.yes).toBeTruthy()
    expect(flags.ts).toBeTruthy()
    expect(siteDirectory).toEqual(`hello-world`)
  })
  it(`should parse with flags after dir`, () => {
    const { flags, siteDirectory } = parseArgs([`hello-world`, `-y`, `-ts`])
    expect(flags.yes).toBeTruthy()
    expect(flags.ts).toBeTruthy()
    expect(siteDirectory).toEqual(`hello-world`)
  })
  it(`should parse with flags before and after dir`, () => {
    const { flags, siteDirectory } = parseArgs([`-y`, `hello-world`, `-ts`])
    expect(flags.yes).toBeTruthy()
    expect(flags.ts).toBeTruthy()
    expect(siteDirectory).toEqual(`hello-world`)
  })
  it(`should warn if unknown flags are used`, () => {
    const unknownFlag = `-unknown`
    const { flags, siteDirectory } = parseArgs([`hello-world`, unknownFlag])
    expect(reporter.warn).toBeCalledTimes(1)
    expect(reporter.warn).toBeCalledWith(
      expect.stringContaining(
        `Found unknown argument "-unknown", ignoring. Known arguments are: -y, -ts`
      )
    )
    expect(flags.yes).toBeFalsy()
    expect(flags.ts).toBeFalsy()
    expect(siteDirectory).toEqual(`hello-world`)
  })
})
