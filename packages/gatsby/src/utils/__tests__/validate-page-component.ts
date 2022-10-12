import path from "path"
import type { IGatsbyPage as IMockGatsbyPage } from "../../redux/types"

let validatePageComponent

beforeEach(() => {
  jest.resetModules()
  process.env.NODE_ENV = `production`
  validatePageComponent =
    require(`../validate-page-component`).validatePageComponent
})

afterEach(() => {
  process.env.NODE_ENV = `test`
})

describe(`validatePageComponent`, () => {
  it(`should throw if no component is passed`, () => {
    expect(() => {
      validatePageComponent({} as IMockGatsbyPage, `/a`, `some-plugin`)
    }).toThrowError(`11322`)
  })

  it(`should throw if component path is not absolute`, () => {
    const thrown = validatePageComponent(
      { component: `a.js` } as IMockGatsbyPage,
      `/a`,
      `some-plugin`
    )

    expect(thrown?.error?.id).toEqual(`11326`)
  })

  it(`should throw if component path does not exist`, () => {
    const thrown = validatePageComponent(
      { component: `/a/b.js` } as IMockGatsbyPage,
      `/a`,
      `some-plugin`
    )

    expect(thrown?.error?.id).toEqual(`11325`)
  })

  it(`should throw if component is empty`, () => {
    const emptyComponentPath = path.resolve(__dirname, `fixtures/empty.js`)
    const emptyComponentPathDir = path.dirname(emptyComponentPath)

    const thrown = validatePageComponent(
      {
        component: emptyComponentPath,
      } as IMockGatsbyPage,
      emptyComponentPathDir,
      `some-plugin`
    )

    expect(thrown?.error?.id).toEqual(`11327`)
  })

  it(`should throw if component does not have a default export`, () => {
    const noDefaultComponentPath = path.resolve(
      __dirname,
      `fixtures/no-default-export.js`
    )
    const noDefaultComponentPathDir = path.dirname(noDefaultComponentPath)

    const thrown = validatePageComponent(
      {
        component: noDefaultComponentPath,
      } as IMockGatsbyPage,
      noDefaultComponentPathDir,
      `some-plugin`
    )

    expect(thrown?.error?.id).toEqual(`11328`)
  })

  it(`should pass if component is valid`, () => {
    const hasDefaultComponentPath = path.resolve(
      __dirname,
      `fixtures/has-default-export.js`
    )
    const hasDefaultComponentPathDir = path.dirname(hasDefaultComponentPath)

    const pass = validatePageComponent(
      {
        component: hasDefaultComponentPath,
      } as IMockGatsbyPage,
      hasDefaultComponentPathDir,
      `some-plugin`
    )

    expect(pass).toEqual({})
  })

  it(`should pass if component has already been validated in a previous pass`, () => {
    const hasDefaultComponentPath = path.resolve(
      __dirname,
      `fixtures/has-default-export-2.js`
    )
    const hasDefaultComponentPathDir = path.dirname(hasDefaultComponentPath)

    const firstPass = validatePageComponent(
      {
        component: hasDefaultComponentPath,
      } as IMockGatsbyPage,
      hasDefaultComponentPathDir,
      `some-plugin`
    )

    const secondPass = validatePageComponent(
      {
        component: hasDefaultComponentPath,
      } as IMockGatsbyPage,
      hasDefaultComponentPathDir,
      `some-plugin`
    )

    expect(firstPass).toEqual({})
    expect(secondPass).toEqual({})
  })
})
