import { createPath } from "../create-path"

describe(`create-path`, () => {
  it(`should create unix paths`, () => {
    const paths = [`b/c/de`, `bee`, `b/d/c/`]

    expect(paths.map(p => createPath(p))).toMatchSnapshot()
  })
})
