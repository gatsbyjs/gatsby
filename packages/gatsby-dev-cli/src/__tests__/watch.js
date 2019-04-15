jest.mock(`chokidar`, () => {
  return {
    watch: jest.fn(),
  }
})
jest.mock(`fs-extra`, () => {
  return {
    copy: jest.fn(),
    existsSync: jest.fn(),
    removeSync: jest.fn(),
  }
})

jest.mock(`verdaccio`, () => {
  return {
    default: (_, _2, _3, _4, _5, callback) => {
      callback(
        {
          listen: (_, _2, cb2) => {
            cb2()
          },
        },
        {
          port: `aa`,
          path: `bb`,
          host: `cc,`,
        }
      )
    },
  }
})

const chokidar = require(`chokidar`)
const fs = require(`fs-extra`)
const path = require(`path`)
const watch = require(`../watch`)

let on
beforeEach(() => {
  fs.copy.mockReset()
  fs.existsSync.mockImplementation(() => true)
  chokidar.watch.mockImplementation(() => {
    const mock = {
      on: jest.fn().mockImplementation(() => mock),
    }
    on = mock.on
    return mock
  })
})

const args = [
  process.cwd(),
  [`gatsby`],
  {
    localPackages: [`gatsby`],
  },
]

const callEventCallback = (...args) => on.mock.calls[0].slice(-1).pop()(...args)
const callReadyCallback = (...args) => on.mock.calls[1].slice(-1).pop()(...args)

// describe(`watching`, () => {
//   it(`watches files`, () => {
//     watch(...args)
//     expect(chokidar.watch).toHaveBeenCalledTimes(1)
//     expect(chokidar.watch).toHaveBeenCalledWith(expect.any(Array), {
//       ignored: [expect.any(Function)],
//     })
//   })

//   it(`registers on handlers`, () => {
//     watch(...args)

//     expect(on).toHaveBeenCalledTimes(2)
//     expect(on).toHaveBeenLastCalledWith(`ready`, expect.any(Function))
//   })

//   describe(`copying files`, () => {
//     it(`does not copy files on non-watch event`, () => {
//       watch(...args)

//       callEventCallback(`test`)

//       expect(fs.copy).not.toHaveBeenCalled()
//     })

//     it(`it doesn't copy files before ready event`, async () => {
//       const filePath = path.join(process.cwd(), `packages/gatsby/dist/index.js`)
//       watch(...args)
//       await callEventCallback(`add`, filePath)

//       expect(fs.copy).toHaveBeenCalledTimes(0)
//     })

//     it(`copies files after ready event`, async () => {
//       const filePath = path.join(process.cwd(), `packages/gatsby/dist/index.js`)
//       watch(...args)
//       await callEventCallback(`add`, filePath)
//       await callReadyCallback()

//       // console.log(`checking`)

//       expect(fs.copy).toHaveBeenCalledTimes(1)
//       expect(fs.copy).toHaveBeenCalledWith(
//         filePath,
//         path.join(`node_modules`, `gatsby`, `dist`, `index.js`),
//         expect.any(Function)
//       )
//     })

//     it(`copies cache-dir files`, async () => {
//       watch(...args)

//       const filePath = path.join(
//         process.cwd(),
//         `packages/gatsby/cache-dir/register-service-worker.js`
//       )
//       await callEventCallback(`add`, filePath)
//       await callReadyCallback()

//       expect(fs.copy).toHaveBeenCalledTimes(2)
//       expect(fs.copy).toHaveBeenLastCalledWith(
//         filePath,
//         path.join(`.cache`, `register-service-worker.js`),
//         expect.any(Function)
//       )
//     })

//     it(`filters non-existant files/directories`, () => {
//       fs.existsSync.mockReset().mockImplementation(file => false)

//       watch(...args)

//       expect(chokidar.watch).toHaveBeenCalledWith([], expect.any(Object))
//     })

//     it(`filters duplicate directories`, () => {
//       watch(process.cwd(), [`gatsby`, `gatsby`], {
//         localPackages: [`gatsby`],
//       })

//       expect(chokidar.watch).toHaveBeenCalledWith(
//         [expect.stringContaining(`gatsby`)],
//         expect.any(Object)
//       )
//     })
//   })

//   describe(`exiting`, () => {
//     let realProcess
//     beforeAll(() => {
//       realProcess = global.process

//       global.process = {
//         ...realProcess,
//         exit: jest.fn(),
//       }
//     })

//     afterAll(() => {
//       global.process = realProcess
//     })

//     it(`does not exit if scanOnce is not defined`, async () => {
//       watch(...args)
//       await callReadyCallback()

//       expect(process.exit).not.toHaveBeenCalled()
//     })

//     it(`exits if scanOnce is defined`, async () => {
//       watch(process.cwd(), [`gatsby`], {
//         scanOnce: true,
//         localPackages: [`gatsby`],
//       })

//       await callReadyCallback()

//       expect(process.exit).toHaveBeenCalledTimes(1)
//     })
//   })
// })

jest.mock(`../utils/traverse-package-deps`, () => {
  return {
    traversePackagesDeps: () => {
      return {
        seenPackages: [`gatsby`, `gatsby-cli`],
        depTree: {
          "gatsby-cli": new Set([`gatsby`]),
        },
      }
    },
  }
})
jest.mock(`../utils/check-deps-changes`, () => {
  console.log(`mocking`)
  return {
    checkDepsChanges: ({ packageName }) => {
      if (packageName === `gatsby-cli`) {
        return Promise.resolve({
          didDepsChanged: true,
        })
      }
      return Promise.resolve({
        didDepsChanged: false,
      })
    },
  }
})

jest.mock(`../local-npm-registry/publish-package`, () => {
  return {
    publishPackage: jest.fn(),
  }
})

jest.mock(`../local-npm-registry/install-packages`, () => {
  return {
    installPackages: jest.fn(),
  }
})

describe(`dependency changs`, () => {
  const { publishPackage } = require(`../local-npm-registry/publish-package`)
  const { installPackages } = require(`../local-npm-registry/install-packages`)

  let realProcess
  beforeAll(() => {
    realProcess = global.process

    global.process = {
      ...realProcess,
      exit: jest.fn(),
    }
  })

  afterAll(() => {
    global.process = realProcess
  })

  it(`test`, async () => {
    watch(process.cwd(), [`gatsby-cli`], {
      scanOnce: true,
      quiet: true,
      // monoRepoPackages,
      localPackages: [`gatsby`, `gatsby-plugin-sharp`],
    })

    const filePath = path.join(
      process.cwd(),
      `packages/gatsby-cli/package.json`
    )
    await callEventCallback(`add`, filePath)
    await callReadyCallback()

    expect(publishPackage).toMatchInlineSnapshot(`
[MockFunction] {
  "calls": Array [
    Array [
      Object {
        "ignorePackageJSONChanges": [Function],
        "packageName": "gatsby-cli",
        "packagesToPublish": Array [
          "gatsby-cli",
          "gatsby",
        ],
        "root": "<PROJECT_ROOT>",
        "versionPostFix": 1555336693230,
      },
    ],
    Array [
      Object {
        "ignorePackageJSONChanges": [Function],
        "packageName": "gatsby",
        "packagesToPublish": Array [
          "gatsby-cli",
          "gatsby",
        ],
        "root": "<PROJECT_ROOT>",
        "versionPostFix": 1555336693230,
      },
    ],
  ],
  "results": Array [
    Object {
      "type": "return",
      "value": undefined,
    },
    Object {
      "type": "return",
      "value": undefined,
    },
  ],
}
`)
    expect(installPackages).toMatchInlineSnapshot(`
[MockFunction] {
  "calls": Array [
    Array [
      Object {
        "packagesToInstall": Array [
          "gatsby@gatsby-dev",
        ],
      },
    ],
  ],
  "results": Array [
    Object {
      "type": "return",
      "value": undefined,
    },
  ],
}
`)
  })
})
