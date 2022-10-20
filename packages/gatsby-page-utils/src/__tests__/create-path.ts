import { createPath } from "../create-path"

describe(`create-path`, () => {
  it(`should create unix paths`, () => {
    const paths = [`b/c/de`, `bee`, `b/d/c/`]

    expect(paths.map(p => createPath(p))).toMatchInlineSnapshot(`
      Array [
        "/b/c/de",
        "/bee",
        "/b/d/c",
      ]
    `)
  })
  it(`should convert windows seperator to unix seperator`, () => {
    expect(createPath(`lorem\\foo\\bar`)).toEqual(`/lorem/foo/bar`)
  })
  it(`should parse index`, () => {
    expect(createPath(`foo/bar/index`)).toEqual(`/foo/bar`)
  })
  it(`should have working trailingSlash option`, () => {
    expect(createPath(`foo/bar/`, false)).toEqual(`/foo/bar`)
    expect(createPath(`foo/bar/index`, false)).toEqual(`/foo/bar`)
    expect(createPath(`foo/bar/`, true)).toEqual(`/foo/bar/`)
    expect(createPath(`foo/bar/index`, true)).toEqual(`/foo/bar/`)
  })
  it(`should support client-only routes`, () => {
    expect(createPath(`foo/[name]`, false, true)).toEqual(`/foo/[name]`)
  })
  it(`should support client-only splat routes`, () => {
    expect(createPath(`foo/[...name]`, false, true)).toEqual(`/foo/[...name]`)
    expect(createPath(`foo/[...]`, false, true)).toEqual(`/foo/[...]`)
  })
})
