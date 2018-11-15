import { parsePath } from "../parse-path"

it(`defaults to root if undefined`, () => {
  expect(parsePath()).toEqual({
    pathname: `/`,
    search: ``,
    hash: ``,
  })
})

it(`uses passed path, if defined`, () => {
  const path = `/admin`
  expect(parsePath(path)).toEqual({
    pathname: path,
    search: ``,
    hash: ``,
  })
})

it(`returns query string`, () => {
  const search = `?some-thing=true&other-thing=false`
  const pathname = `/admin`
  const path = `${pathname}${search}`

  expect(parsePath(path)).toEqual({
    pathname,
    search,
    hash: ``,
  })
})

it(`returns hash`, () => {
  const hash = `#some-id`
  const pathname = `/admin`
  const path = `${pathname}${hash}`

  expect(parsePath(path)).toEqual({
    pathname,
    hash,
    search: ``,
  })
})

it(`returns hash, search, and pathname if all defined`, () => {
  const hash = `#some-id`
  const pathname = `/admin`
  const search = `?this-thing=true&other-thing=false`
  const path = `${pathname}${search}${hash}`

  expect(parsePath(path)).toEqual({
    pathname,
    search,
    hash,
  })
})
