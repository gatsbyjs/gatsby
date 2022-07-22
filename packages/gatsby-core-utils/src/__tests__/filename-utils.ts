import * as path from "path"
import { createFilePath, createFileHash } from "../filename-utils"

describe(`createFilePath`, () => {
  it(`handles one instance of incorrect char`, () => {
    const filename = `some:invalid`
    const assert = path.join(
      `dir`,
      `some-invalid-${createFileHash(filename)}.png`
    )
    expect(createFilePath(`dir`, filename, `.png`)).toBe(assert)
  })
  it(`handles filename without forbibben chars correctly`, () => {
    const filename = `some-valid`
    const assert = path.join(`dir`, `${filename}.png`)
    expect(createFilePath(`dir`, filename, `.png`)).toBe(assert)
  })
  it(`handles all instances of incorrect chars`, () => {
    const filename = `a:b*c?d"e<f>`
    const assert = path.join(
      `dir`,
      `a-b-c-d-e-f--${createFileHash(filename)}.png`
    )
    expect(createFilePath(`dir`, filename, `.png`)).toBe(assert)
  })
  it(`creates different files for possible duplicates`, () => {
    const filename1 = `some:file`
    const filename2 = `some*file`
    const assert1 = path.join(
      `dir`,
      `some-file-${createFileHash(filename1)}.png`
    )
    const assert2 = path.join(
      `dir`,
      `some-file-${createFileHash(filename2)}.png`
    )
    expect(createFilePath(`dir`, filename1, `.png`)).toBe(assert1)
    expect(createFilePath(`dir`, filename2, `.png`)).toBe(assert2)
  })
})
