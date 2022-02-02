import { rewriteLinkPath } from "../rewrite-link-path"

beforeEach(() => {
  global.__TRAILING_SLASH__ = ``
})

const getRewriteLinkPath = (option = `legacy`) => {
  global.__TRAILING_SLASH__ = option
  return rewriteLinkPath
}

describe(`rewriteLinkPath`, () => {
  it(`handles legacy option`, () => {
    expect(getRewriteLinkPath()(`/path`, `/`)).toBe(`/path`)
    expect(getRewriteLinkPath()(`/path/`, `/`)).toBe(`/path/`)
    expect(getRewriteLinkPath()(`/path#hash`, `/`)).toBe(`/path#hash`)
    expect(getRewriteLinkPath()(`/path?query_param=hello`, `/`)).toBe(
      `/path?query_param=hello`
    )
    expect(getRewriteLinkPath()(`/path?query_param=hello#anchor`, `/`)).toBe(
      `/path?query_param=hello#anchor`
    )
  })
  it(`handles always option`, () => {
    expect(getRewriteLinkPath(`always`)(`/path`, `/`)).toBe(`/path/`)
    expect(getRewriteLinkPath(`always`)(`/path/`, `/`)).toBe(`/path/`)
    expect(getRewriteLinkPath(`always`)(`/path#hash`, `/`)).toBe(`/path/#hash`)
    expect(getRewriteLinkPath(`always`)(`/path?query_param=hello`, `/`)).toBe(
      `/path/?query_param=hello`
    )
    expect(
      getRewriteLinkPath(`always`)(`/path?query_param=hello#anchor`, `/`)
    ).toBe(`/path/?query_param=hello#anchor`)
  })
  it(`handles never option`, () => {
    expect(getRewriteLinkPath(`never`)(`/path`, `/`)).toBe(`/path`)
    expect(getRewriteLinkPath(`never`)(`/path/`, `/`)).toBe(`/path`)
    expect(getRewriteLinkPath(`never`)(`/path/#hash`, `/`)).toBe(`/path#hash`)
    expect(getRewriteLinkPath(`never`)(`/path/?query_param=hello`, `/`)).toBe(
      `/path?query_param=hello`
    )
    expect(
      getRewriteLinkPath(`never`)(`/path/?query_param=hello#anchor`, `/`)
    ).toBe(`/path?query_param=hello#anchor`)
  })
  it(`handles ignore option`, () => {
    expect(getRewriteLinkPath(`ignore`)(`/path`, `/`)).toBe(`/path`)
    expect(getRewriteLinkPath(`ignore`)(`/path/`, `/`)).toBe(`/path/`)
    expect(getRewriteLinkPath(`ignore`)(`/path#hash`, `/`)).toBe(`/path#hash`)
    expect(getRewriteLinkPath(`ignore`)(`/path?query_param=hello`, `/`)).toBe(
      `/path?query_param=hello`
    )
    expect(
      getRewriteLinkPath(`ignore`)(`/path?query_param=hello#anchor`, `/`)
    ).toBe(`/path?query_param=hello#anchor`)
  })
})
