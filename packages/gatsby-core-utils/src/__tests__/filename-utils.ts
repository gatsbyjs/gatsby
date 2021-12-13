import { createFilePath, createFileHash } from "../filename-utils"

describe(`createFilePath`, () => {
  it(`handles one instance of incorrect char`, () => {
    const filename = `some:invalid`
    expect(createFilePath(`dir`, filename, `.png`)).toBe(
      `dir/some-invalid-${createFileHash(filename)}.png`
    )
  })
  it(`handles filename without forbibben chars correctly`, () => {
    const filename = `some-valid`
    expect(createFilePath(`dir`, filename, `.png`)).toBe(`dir/${filename}.png`)
  })
  it(`handles all instances of incorrect chars`, () => {
    const filename = `a:b*c?d"e<f>`
    expect(createFilePath(`dir`, filename, `.png`)).toBe(
      `dir/a-b-c-d-e-f--${createFileHash(filename)}.png`
    )
  })
  it(`creates different files for possible duplicates`, () => {
    const filename1 = `some:file`
    const filename2 = `some*file`
    expect(createFilePath(`dir`, filename1, `.png`)).toBe(
      `dir/some-file-${createFileHash(filename1)}.png`
    )
    expect(createFilePath(`dir`, filename2, `.png`)).toBe(
      `dir/some-file-${createFileHash(filename2)}.png`
    )
  })
})
