import { createPath } from "../create-path"

const withoutSlash = `/nested/path`
const withSlash = `/nested/path/`

describe(`create-path`, () => {
  it(`should create unix paths`, () => {
    const paths = [`b/c/de`, `bee`, `b/d/c/`]

    expect(paths.map(p => createPath(p))).toMatchSnapshot()
  })
  it(`should handle index page`, () => {
    expect(createPath(`/index/`)).toEqual(`/`)
    expect(createPath(`/index`)).toEqual(`/`)
  })
  it(`should output with trailing slash in legacy mode`, () => {
    expect(createPath(withoutSlash)).toEqual(withSlash)
    expect(createPath(`/index/`)).toEqual(`/`)
    expect(createPath(`/index`)).toEqual(`/`)
  })
  it(`should add trailing slash with always mode`, () => {
    expect(createPath(withoutSlash, `always`)).toEqual(withSlash)
    expect(createPath(withSlash, `always`)).toEqual(withSlash)
    expect(createPath(`/index/`, `always`)).toEqual(`/`)
    expect(createPath(`/index`, `always`)).toEqual(`/`)
  })
  it(`should not add trailing slash with never mode`, () => {
    expect(createPath(withSlash, `never`)).toEqual(withoutSlash)
    expect(createPath(withoutSlash, `never`)).toEqual(withoutSlash)
    expect(createPath(`/index/`, `never`)).toEqual(`/`)
    expect(createPath(`/index`, `never`)).toEqual(`/`)
  })
  it(`should not change anything in ignore mode`, () => {
    expect(createPath(withSlash, `ignore`)).toEqual(withSlash)
    expect(createPath(withoutSlash, `ignore`)).toEqual(withoutSlash)
    expect(createPath(`/index/`, `ignore`)).toEqual(`/`)
    expect(createPath(`/index`, `ignore`)).toEqual(`/`)
  })
})
