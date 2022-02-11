import { parseArgs } from "../../utils/parse-args"
import { reporter } from "../../utils/reporter"

const dirNameArg = `hello-world`

jest.mock(`../../utils/reporter`)

describe(`parseArgs`, () => {
  it(`should parse without flags and dir name`, () => {
    const { flags, dirName } = parseArgs([])
    expect(flags.yes).toBeFalsy()
    expect(flags.ts).toBeFalsy()
    expect(dirName).toEqual(``)
  })
  it(`should parse with dir name without flags`, () => {
    const { flags, dirName } = parseArgs([dirNameArg])
    expect(flags.yes).toBeFalsy()
    expect(flags.ts).toBeFalsy()
    expect(dirName).toEqual(dirNameArg)
  })
  it(`should parse with flags before dir name`, () => {
    const { flags, dirName } = parseArgs([`-y`, `-ts`, dirNameArg])
    expect(flags.yes).toBeTruthy()
    expect(flags.ts).toBeTruthy()
    expect(dirName).toEqual(dirNameArg)
  })
  it(`should parse with flags after dir name`, () => {
    const { flags, dirName } = parseArgs([dirNameArg, `-y`, `-ts`])
    expect(flags.yes).toBeTruthy()
    expect(flags.ts).toBeTruthy()
    expect(dirName).toEqual(dirNameArg)
  })
  it(`should parse with flags before and after dir name`, () => {
    const { flags, dirName } = parseArgs([`-y`, dirNameArg, `-ts`])
    expect(flags.yes).toBeTruthy()
    expect(flags.ts).toBeTruthy()
    expect(dirName).toEqual(dirNameArg)
  })
  it(`should warn if unknown flags are used`, () => {
    const unknownFlag = `-unknown`
    const { flags, dirName } = parseArgs([dirNameArg, unknownFlag])
    expect(reporter.warn).toBeCalledTimes(1)
    expect(reporter.warn).toBeCalledWith(
      expect.stringContaining(
        `Found unknown argument "${unknownFlag}", ignoring. Known arguments are: -y, -ts`
      )
    )
    expect(flags.yes).toBeFalsy()
    expect(flags.ts).toBeFalsy()
    expect(dirName).toEqual(dirNameArg)
  })
})
