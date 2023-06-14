import type { IGatsbyFunction, IGatsbyPage } from "../../../redux/types"
import {
  getRoutePathFromPage,
  getRoutePathFromFunction,
} from "../get-route-path"

describe(`getRoutePathFromPage`, () => {
  it(`returns the page path if no matchPath is defined`, () => {
    const page = {
      path: `/`,
    } as IGatsbyPage

    expect(getRoutePathFromPage(page)).toEqual(`/`)
  })
  it(`replaces the named part of a wildcard matchPath with a wildcard`, () => {
    const page = {
      matchPath: `/foo/*bar`,
    } as IGatsbyPage

    expect(getRoutePathFromPage(page)).toEqual(`/foo/*`)
  })
})

describe(`getRoutePathFromFunction`, () => {
  it(`returns the functionRoute if no matchPath is defined`, () => {
    const functionInfo = {
      functionRoute: `/`,
    } as IGatsbyFunction

    expect(getRoutePathFromFunction(functionInfo)).toEqual(`/`)
  })
  it(`replaces the named part of a wildcard matchPath with a wildcard`, () => {
    const functionInfo = {
      matchPath: `/foo/*bar`,
    } as IGatsbyFunction

    expect(getRoutePathFromFunction(functionInfo)).toEqual(`/foo/*`)
  })
})
