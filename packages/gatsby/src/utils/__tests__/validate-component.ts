import path from "path"
import type { IPageInput as IMockCreatePageInput } from "../../redux/actions/public"
import type { ICreateSliceInput as IMockCreateSliceInput } from "../../redux/actions/restricted"

type IMockInput = IMockCreatePageInput | IMockCreateSliceInput

let validateComponent

const errorIdMap = {
  noPath: `1`,
  notAbsolute: `2`,
  doesNotExist: `3`,
  empty: `4`,
  noDefaultExport: `5`,
}

const pluginName = `some-plugin`

beforeEach(() => {
  jest.resetModules()
  process.env.NODE_ENV = `production`
  validateComponent = require(`../validate-component`).validateComponent
})

afterEach(() => {
  process.env.NODE_ENV = `test`
})

describe(`validateComponent`, () => {
  it(`should throw if no component path is passed`, () => {
    expect(() => {
      validateComponent({
        input: {} as IMockInput,
        directory: `/a`,
        pluginName,
        errorIdMap,
      })
    }).toThrowError(errorIdMap.noPath)
  })

  it(`should throw if component path is not absolute`, () => {
    const thrown = validateComponent({
      input: { component: `a.js` } as IMockInput,
      directory: `/a`,
      pluginName,
      errorIdMap,
    })

    expect(thrown?.error?.id).toEqual(errorIdMap.notAbsolute)
  })

  it(`should throw if component path does not exist`, () => {
    const thrown = validateComponent({
      input: { component: `/a/b.js` } as IMockInput,
      directory: `/a`,
      pluginName,
      errorIdMap,
    })

    expect(thrown?.error?.id).toEqual(errorIdMap.doesNotExist)
  })

  it(`should throw if component is empty`, () => {
    const emptyComponentPath = path.resolve(__dirname, `fixtures/empty.js`)
    const emptyComponentPathDir = path.dirname(emptyComponentPath)

    const thrown = validateComponent({
      input: {
        component: emptyComponentPath,
      } as IMockInput,
      directory: emptyComponentPathDir,
      pluginName,
      errorIdMap,
    })

    expect(thrown?.error?.id).toEqual(errorIdMap.empty)
  })

  it(`should throw if component does not have a default export`, () => {
    const noDefaultComponentPath = path.resolve(
      __dirname,
      `fixtures/no-default-export.js`
    )
    const noDefaultComponentPathDir = path.dirname(noDefaultComponentPath)

    const thrown = validateComponent({
      input: {
        component: noDefaultComponentPath,
      } as IMockInput,
      directory: noDefaultComponentPathDir,
      pluginName,
      errorIdMap,
    })

    expect(thrown?.error?.id).toEqual(errorIdMap.noDefaultExport)
  })

  it(`should pass if component is valid`, () => {
    const hasDefaultComponentPath = path.resolve(
      __dirname,
      `fixtures/has-default-export.js`
    )
    const hasDefaultComponentPathDir = path.dirname(hasDefaultComponentPath)

    const pass = validateComponent({
      input: {
        component: hasDefaultComponentPath,
      } as IMockInput,
      directory: hasDefaultComponentPathDir,
      pluginName,
      errorIdMap,
    })

    expect(pass).toEqual({})
  })

  it(`should pass if component has already been validated in a previous pass`, () => {
    const hasDefaultComponentPath = path.resolve(
      __dirname,
      `fixtures/has-default-export-2.js`
    )
    const hasDefaultComponentPathDir = path.dirname(hasDefaultComponentPath)

    const firstPass = validateComponent({
      input: {
        component: hasDefaultComponentPath,
      } as IMockInput,
      directory: hasDefaultComponentPathDir,
      pluginName,
      errorIdMap,
    })

    const secondPass = validateComponent({
      input: {
        component: hasDefaultComponentPath,
      } as IMockInput,
      directory: hasDefaultComponentPathDir,
      pluginName,
      errorIdMap,
    })

    expect(firstPass).toEqual({})
    expect(secondPass).toEqual({})
  })
})
