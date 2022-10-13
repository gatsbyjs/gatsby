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
  it(`should return an error object if no component path is passed`, () => {
    const error = validateComponent({
      input: {} as IMockInput,
      directory: `/a`,
      pluginName,
      errorIdMap,
    })

    expect(error).toMatchInlineSnapshot(`
      Object {
        "error": Object {
          "context": Object {
            "input": Object {},
            "pluginName": "${pluginName}",
          },
          "id": "${errorIdMap.noPath}",
        },
      }
    `)
  })

  it(`should return an error object if component path is not absolute`, () => {
    const componentPath = `a.js`

    const error = validateComponent({
      input: { component: componentPath } as IMockInput,
      directory: `/a`,
      pluginName,
      errorIdMap,
    })

    expect(error).toMatchInlineSnapshot(`
      Object {
        "error": Object {
          "context": Object {
            "componentPath": "${componentPath}",
            "input": Object {
              "component": "${componentPath}",
            },
            "pluginName": "${pluginName}",
          },
          "id": "${errorIdMap.notAbsolute}",
        },
      }
    `)
  })

  it(`should return an error object if component path does not exist`, () => {
    const componentPath = `/a/b.js`

    const error = validateComponent({
      input: { component: componentPath } as IMockInput,
      directory: `/a`,
      pluginName,
      errorIdMap,
    })

    expect(error).toMatchInlineSnapshot(`
      Object {
        "error": Object {
          "context": Object {
            "componentPath": "${componentPath}",
            "input": Object {
              "component": "${componentPath}",
            },
            "pluginName": "${pluginName}",
          },
          "id": "${errorIdMap.doesNotExist}",
        },
      }
    `)
  })

  it(`should return an error object if component is empty`, () => {
    const emptyComponentPath = path.resolve(__dirname, `fixtures/empty.js`)
    const emptyComponentPathDir = path.dirname(emptyComponentPath)

    const error = validateComponent({
      input: {
        component: emptyComponentPath,
      } as IMockInput,
      directory: emptyComponentPathDir,
      pluginName,
      errorIdMap,
    })

    const jestEmptyComponentPath = `<PROJECT_ROOT>/packages/gatsby/src/utils/__tests__/fixtures/empty.js`

    expect(error).toMatchInlineSnapshot(`
      Object {
        "error": Object {
          "context": Object {
            "componentPath": "${jestEmptyComponentPath}",
            "input": Object {
              "component": "${jestEmptyComponentPath}",
            },
            "pluginName": "${pluginName}",
          },
          "id": "${errorIdMap.empty}",
        },
        "panicOnBuild": true,
      }
    `)
  })

  it(`should return an error object if component does not have a default export`, () => {
    const noDefaultComponentPath = path.resolve(
      __dirname,
      `fixtures/no-default-export.js`
    )
    const noDefaultComponentPathDir = path.dirname(noDefaultComponentPath)

    const error = validateComponent({
      input: {
        component: noDefaultComponentPath,
      } as IMockInput,
      directory: noDefaultComponentPathDir,
      pluginName,
      errorIdMap,
    })

    const jestNoDefaultComponentPath = `<PROJECT_ROOT>/packages/gatsby/src/utils/__tests__/fixtures/no-default-export.js`

    expect(error).toMatchInlineSnapshot(`
      Object {
        "error": Object {
          "context": Object {
            "componentPath": "${jestNoDefaultComponentPath}",
            "input": Object {
              "component": "${jestNoDefaultComponentPath}",
            },
            "pluginName": "${pluginName}",
          },
          "id": "${errorIdMap.noDefaultExport}",
        },
        "panicOnBuild": true,
      }
    `)
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
