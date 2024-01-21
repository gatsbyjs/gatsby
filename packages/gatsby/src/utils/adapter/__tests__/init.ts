import semverMaxSatisfying from "semver/ranges/max-satisfying"

import { getAdapterInit, getAdaptersCacheDir } from "../init"
import { AdapterInit, IAdapter, IAdapterManifestEntry } from "../types"
import execa from "execa"

let mockAdaptersManifest: Array<IAdapterManifestEntry> = []

let mockLogs: Array<{
  level: string
  args: Array<any>
  spinnerArgs?: Array<any>
}> = []

function getLogsForSnapshot(): string {
  return mockLogs
    .map(
      log =>
        `${log.level.padEnd(13)} ${[...log.args, ...(log.spinnerArgs ?? [])]
          .map(arg => JSON.stringify(arg))
          .join(` `)}`
    )
    .join(`\n`)
}

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    panic: jest.fn((...args) => {
      mockLogs.push({ level: `panic`, args })
    }),
    verbose: jest.fn((...args) => {
      mockLogs.push({ level: `verbose`, args })
    }),
    warn: jest.fn((...args) => {
      mockLogs.push({ level: `warn`, args })
    }),
    info: jest.fn((...args) => {
      mockLogs.push({ level: `info`, args })
    }),
    activityTimer: jest.fn((...spinnerArgs) => {
      return {
        start: jest.fn((...args) =>
          mockLogs.push({ level: `spinner-start`, args, spinnerArgs })
        ),
        end: jest.fn((...args) => {
          mockLogs.push({ level: `spinner-end`, args, spinnerArgs })
        }),
        panic: jest.fn((...args) => {
          mockLogs.push({ level: `spinner-panic`, args, spinnerArgs })
        }),
      }
    }),
  }
})

jest.mock(`../../get-latest-gatsby-files`, () => {
  return {
    getLatestAdapters: jest.fn(() => mockAdaptersManifest),
  }
})

interface IMockedAdapterPackage {
  version: string
  init: AdapterInit
}

let mockInstalledInSiteAdapter: IMockedAdapterPackage | undefined = undefined
let mockInstalledInCacheAdapter: IMockedAdapterPackage | undefined = undefined

const mockAdaptersCacheDir = getAdaptersCacheDir()
jest.mock(`gatsby-core-utils/create-require-from-path`, () => {
  return {
    createRequireFromPath: jest.fn((path: string) => {
      let mockPackage: IMockedAdapterPackage | undefined
      let prefix: string | undefined

      if (path === `${process.cwd()}/:internal:`) {
        mockPackage = mockInstalledInSiteAdapter
        prefix = `site`
      } else if (path === `${mockAdaptersCacheDir}/:internal:`) {
        mockPackage = mockInstalledInCacheAdapter
        prefix = `cache`
      }

      // checking if installed in site
      const siteRequire = (mod: string): any => {
        if (mockPackage) {
          if (mod === `gatsby-adapter-test/package.json`) {
            return {
              version: mockPackage.version,
            }
          }
          if (mod === `gatsby-adapter-test`) {
            return mockPackage.init
          }
        }
        throw new Error(`Module not found`)
      }

      siteRequire.resolve = (mod: string): string => `${prefix}/${mod}`

      return siteRequire
    }),
  }
})

const getMockedPackageByVersion = (version: string): IMockedAdapterPackage => {
  return {
    version,
    init: (): IAdapter => {
      return {
        name: `gatsby-adapter-test@${version}`,
        adapt: (): void => {},
      }
    },
  }
}

const getMockedPackage = (
  versionRange: string
): IMockedAdapterPackage | undefined => {
  const version = semverMaxSatisfying(
    [`1.0.0`, `1.0.1`, `1.0.2`, `1.0.3`, `1.0.4`],
    versionRange
  )
  if (version) {
    return getMockedPackageByVersion(version)
  } else {
    return undefined
  }
}

jest.mock(`execa`, () =>
  jest.fn((command, args) => {
    if (command === `npm`) {
      const [, range] = args
        .find(arg => arg.includes(`gatsby-adapter-test`))
        .split(`@`)

      // set mock adapter as installed in cache
      mockInstalledInCacheAdapter = getMockedPackage(range)
      return
    }
    throw new Error(`not expected execa command: "${command}`)
  })
)

const mockSiteAdapterModule = jest.fn(() => {
  if (mockInstalledInSiteAdapter) {
    return mockInstalledInSiteAdapter.init
  }

  throw new Error(`Module not found`)
})

jest.mock(`site/gatsby-adapter-test`, () => mockSiteAdapterModule(), {
  virtual: true,
})

const mockCacheAdapterModule = jest.fn(() => {
  if (mockInstalledInCacheAdapter) {
    return mockInstalledInCacheAdapter.init
  }

  throw new Error(`Module not found`)
})

jest.mock(`cache/gatsby-adapter-test`, () => mockCacheAdapterModule(), {
  virtual: true,
})

// note this is used only if used didn't explicitly set adapter in gatsby-config - zero-conf mode
describe(`getAdapterInit`, () => {
  beforeEach(() => {
    jest.resetModules()
    mockLogs = []
  })

  it(`no matching adapter modules for current environment skips providing any adapter`, async () => {
    mockAdaptersManifest = [
      {
        name: `Test`,
        // this entry is not eligible for current environment
        test: (): boolean => false,
        module: `gatsby-adapter-test`,
        versions: [
          {
            gatsbyVersion: `^5.12.10`,
            moduleVersion: `^1.0.4`,
          },
          {
            gatsbyVersion: `>=5.0.0 <5.12.10`,
            moduleVersion: `>=1.0.0 <=1.0.3`,
          },
        ],
      },
    ]
    expect(await getAdapterInit(`5.11.0`)).toBeUndefined()
    expect(getLogsForSnapshot()).toMatchInlineSnapshot(
      `"verbose       \\"No adapter was found for the current environment. Skipping adapter initialization.\\""`
    )
  })

  describe(`matching adapter module for current environment`, () => {
    beforeEach(() => {
      execa.mockClear()
      mockInstalledInSiteAdapter = undefined
      mockInstalledInCacheAdapter = undefined
      delete process.env.GATSBY_CONTINUE_BUILD_ON_ADAPTER_MISMATCH
    })

    it(`panics if no matching adapter version for used gatsby version by default`, async () => {
      mockAdaptersManifest = [
        {
          name: `Test`,
          test: (): boolean => true,
          module: `gatsby-adapter-test`,
          versions: [
            {
              gatsbyVersion: `^5.12.10`,
              moduleVersion: `^1.0.4`,
            },
            {
              gatsbyVersion: `>=5.0.0 <5.12.10`,
              moduleVersion: `>=1.0.0 <=1.0.3`,
            },
          ],
        },
      ]

      await getAdapterInit(`6.0.0`)
      // panic fails the build
      expect(mockLogs.find(log => log.level === `panic`)).toBeTruthy()
      expect(getLogsForSnapshot()).toMatchInlineSnapshot(
        `"panic         \\"No version of Test adapter is compatible with your current Gatsby version 6.0.0./n/nZero-configuration deployment failed to avoid potentially broken deployment./nIf you want build to continue despite above problem/n - configure adapter manually in gatsby-config which will skip zero-configuration deployment attempt/n - or set GATSBY_CONTINUE_BUILD_ON_MISSING_ADAPTER=true environment variable to continue build without an adapter.\\""`
      )
    })

    it(`continue the build without adapter if no matching adapter version for used gatsby version and GATSBY_CONTINUE_BUILD_ON_ADAPTER_MISMATCH is used`, async () => {
      process.env.GATSBY_CONTINUE_BUILD_ON_ADAPTER_MISMATCH = `true`
      mockAdaptersManifest = [
        {
          name: `Test`,
          test: (): boolean => true,
          module: `gatsby-adapter-test`,
          versions: [
            {
              gatsbyVersion: `^5.12.0`,
              moduleVersion: `^1.0.0`,
            },
          ],
        },
      ]

      expect(await getAdapterInit(`6.0.0`)).toBeUndefined()
      expect(getLogsForSnapshot()).toMatchInlineSnapshot(
        `"warn          \\"No version of Test adapter is compatible with your current Gatsby version 6.0.0./n/nContinuing build using without using any adapter due to GATSBY_CONTINUE_BUILD_ON_MISSING_ADAPTER environment variable being set\\""`
      )
    })

    it(`automatically installs correct version of adapter `, async () => {
      mockAdaptersManifest = [
        {
          name: `Test`,
          test: (): boolean => true,
          module: `gatsby-adapter-test`,
          versions: [
            {
              gatsbyVersion: `^5.12.10`,
              moduleVersion: `^1.0.4`,
            },
            {
              gatsbyVersion: `>=5.0.0 <5.12.10`,
              moduleVersion: `>=1.0.0 <=1.0.3`,
            },
          ],
        },
      ]

      const adapterInit = await getAdapterInit(`5.12.0`)
      expect(adapterInit).not.toBeUndefined()
      expect(adapterInit?.().name).toMatchInlineSnapshot(
        `"gatsby-adapter-test@1.0.3"`
      )
      expect(execa).toMatchInlineSnapshot(`
        [MockFunction] {
          "calls": Array [
            Array [
              "npm",
              Array [
                "install",
                "--no-progress",
                "--no-audit",
                "--no-fund",
                "--loglevel",
                "error",
                "--color",
                "always",
                "--legacy-peer-deps",
                "--save-exact",
                "gatsby-adapter-test@>=1.0.0 <=1.0.3",
              ],
              Object {
                "cwd": "<PROJECT_ROOT>/.cache/adapters",
                "stderr": "inherit",
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
      expect(getLogsForSnapshot()).toMatchInlineSnapshot(`
        "spinner-start \\"Installing Test adapter (gatsby-adapter-test@>=1.0.0 <=1.0.3)\\"
        spinner-end   \\"Installing Test adapter (gatsby-adapter-test@>=1.0.0 <=1.0.3)\\"
        info          \\"If you plan on staying on this deployment platform, consider installing /\\"gatsby-adapter-test@>=1.0.0 <=1.0.3/\\" as a dependency in your project. This will give you faster and more robust installs.\\""
      `)
    })

    it(`panics if automatic installation of correct version of adapter fails`, async () => {
      execa.mockImplementationOnce(() => {
        throw new Error(`npm install failed`)
      })
      mockAdaptersManifest = [
        {
          name: `Test`,
          test: (): boolean => true,
          module: `gatsby-adapter-test`,
          versions: [
            {
              gatsbyVersion: `^5.12.10`,
              moduleVersion: `^1.0.4`,
            },
            {
              gatsbyVersion: `>=5.0.0 <5.12.10`,
              moduleVersion: `>=1.0.0 <=1.0.3`,
            },
          ],
        },
      ]

      const adapterInit = await getAdapterInit(`5.12.0`)
      expect(adapterInit).toBeUndefined()
      expect(mockLogs.find(log => log.level === `spinner-panic`)).toBeTruthy()
      expect(execa).toMatchInlineSnapshot(`
        [MockFunction] {
          "calls": Array [
            Array [
              "npm",
              Array [
                "install",
                "--no-progress",
                "--no-audit",
                "--no-fund",
                "--loglevel",
                "error",
                "--color",
                "always",
                "--legacy-peer-deps",
                "--save-exact",
                "gatsby-adapter-test@>=1.0.0 <=1.0.3",
              ],
              Object {
                "cwd": "<PROJECT_ROOT>/.cache/adapters",
                "stderr": "inherit",
              },
            ],
          ],
          "results": Array [
            Object {
              "type": "throw",
              "value": [Error: npm install failed],
            },
          ],
        }
      `)
      expect(getLogsForSnapshot()).toMatchInlineSnapshot(`
        "spinner-start \\"Installing Test adapter (gatsby-adapter-test@>=1.0.0 <=1.0.3)\\"
        spinner-panic \\"Could not install adapter /\\"gatsby-adapter-test@>=1.0.0 <=1.0.3/\\". Please install it yourself by adding it to your package.json's dependencies and try building your project again./n/nZero-configuration deployment failed to avoid potentially broken deployment./nIf you want build to continue despite above problem/n - configure adapter manually in gatsby-config which will skip zero-configuration deployment attempt/n - or set GATSBY_CONTINUE_BUILD_ON_MISSING_ADAPTER=true environment variable to continue build without an adapter.\\" \\"Installing Test adapter (gatsby-adapter-test@>=1.0.0 <=1.0.3)\\""
      `)
    })

    it(`reuses previously auto-installed adapter if compatible`, async () => {
      mockInstalledInCacheAdapter = getMockedPackage(`^1.0.4`)
      mockAdaptersManifest = [
        {
          name: `Test`,
          test: (): boolean => true,
          module: `gatsby-adapter-test`,
          versions: [
            {
              gatsbyVersion: `^5.12.10`,
              moduleVersion: `^1.0.4`,
            },
            {
              gatsbyVersion: `>=5.0.0 <5.12.10`,
              moduleVersion: `>=1.0.0 <=1.0.3`,
            },
          ],
        },
      ]

      const adapterInit = await getAdapterInit(`5.12.10`)
      expect(adapterInit).not.toBeUndefined()
      expect(adapterInit?.().name).toMatchInlineSnapshot(
        `"gatsby-adapter-test@1.0.4"`
      )
      expect(execa).not.toHaveBeenCalled()
      expect(getLogsForSnapshot()).toMatchInlineSnapshot(
        `"verbose       \\"Using previously adapter previously installed by gatsby /\\"gatsby-adapter-test@1.0.4/\\"\\""`
      )
    })

    it(`ignores previously auto-installed adapter if not compatible and installs compatible one`, async () => {
      mockInstalledInCacheAdapter = getMockedPackage(`>=1.0.0 <=1.0.3`)
      mockAdaptersManifest = [
        {
          name: `Test`,
          test: (): boolean => true,
          module: `gatsby-adapter-test`,
          versions: [
            {
              gatsbyVersion: `^5.12.10`,
              moduleVersion: `^1.0.4`,
            },
            {
              gatsbyVersion: `>=5.0.0 <5.12.10`,
              moduleVersion: `>=1.0.0 <=1.0.3`,
            },
          ],
        },
      ]

      const adapterInit = await getAdapterInit(`5.12.10`)
      expect(adapterInit).not.toBeUndefined()
      expect(adapterInit?.().name).toMatchInlineSnapshot(
        `"gatsby-adapter-test@1.0.4"`
      )
      expect(execa).toMatchInlineSnapshot(`
        [MockFunction] {
          "calls": Array [
            Array [
              "npm",
              Array [
                "install",
                "--no-progress",
                "--no-audit",
                "--no-fund",
                "--loglevel",
                "error",
                "--color",
                "always",
                "--legacy-peer-deps",
                "--save-exact",
                "gatsby-adapter-test@^1.0.4",
              ],
              Object {
                "cwd": "<PROJECT_ROOT>/.cache/adapters",
                "stderr": "inherit",
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
      expect(getLogsForSnapshot()).toMatchInlineSnapshot(`
        "verbose       \\"Ignoring incompatible gatsby-adapter-test installed by gatsby in /\\".cache/adapters/\\" before. Used gatsby version /\\"5.12.10/\\" requires /\\"gatsby-adapter-test@^1.0.4/\\". Installed /\\"gatsby-adapter-test/\\" version: /\\"1.0.3/\\".\\"
        spinner-start \\"Installing Test adapter (gatsby-adapter-test@^1.0.4)\\"
        spinner-end   \\"Installing Test adapter (gatsby-adapter-test@^1.0.4)\\"
        info          \\"If you plan on staying on this deployment platform, consider installing /\\"gatsby-adapter-test@^1.0.4/\\" as a dependency in your project. This will give you faster and more robust installs.\\""
      `)
    })

    it(`uses site's adapter dependency if it's compatible with current gatsby version`, async () => {
      mockInstalledInSiteAdapter = getMockedPackage(`>=1.0.0 <=1.0.3`)
      mockAdaptersManifest = [
        {
          name: `Test`,
          test: (): boolean => true,
          module: `gatsby-adapter-test`,
          versions: [
            {
              gatsbyVersion: `^5.12.10`,
              moduleVersion: `^1.0.4`,
            },
            {
              gatsbyVersion: `>=5.0.0 <5.12.10`,
              moduleVersion: `>=1.0.0 <=1.0.3`,
            },
          ],
        },
      ]

      const adapterInit = await getAdapterInit(`5.12.0`)
      expect(adapterInit).not.toBeUndefined()
      expect(adapterInit?.().name).toMatchInlineSnapshot(
        `"gatsby-adapter-test@1.0.3"`
      )
      expect(getLogsForSnapshot()).toMatchInlineSnapshot(
        `"verbose       \\"Using site's adapter dependency /\\"gatsby-adapter-test@1.0.3/\\"\\""`
      )
    })

    it(`skips using site's adapter dependency if it's not compatible with current gatsby versions and auto-installs compatible one`, async () => {
      mockInstalledInSiteAdapter = getMockedPackage(`>=1.0.0 <=1.0.3`)
      mockAdaptersManifest = [
        {
          name: `Test`,
          test: (): boolean => true,
          module: `gatsby-adapter-test`,
          versions: [
            {
              gatsbyVersion: `^5.12.10`,
              moduleVersion: `^1.0.4`,
            },
            {
              gatsbyVersion: `>=5.0.0 <5.12.10`,
              moduleVersion: `>=1.0.0 <=1.0.3`,
            },
          ],
        },
      ]

      const adapterInit = await getAdapterInit(`5.12.10`)
      expect(adapterInit).not.toBeUndefined()
      expect(adapterInit?.().name).toMatchInlineSnapshot(
        `"gatsby-adapter-test@1.0.4"`
      )
      expect(getLogsForSnapshot()).toMatchInlineSnapshot(`
        "warn          \\"Ignoring incompatible gatsby-adapter-test@1.0.3 installed by site. Used gatsby version /\\"5.12.10/\\" requires /\\"gatsby-adapter-test@^1.0.4/\\". Installed /\\"gatsby-adapter-test/\\" version: /\\"1.0.3/\\".\\"
        spinner-start \\"Installing Test adapter (gatsby-adapter-test@^1.0.4)\\"
        spinner-end   \\"Installing Test adapter (gatsby-adapter-test@^1.0.4)\\"
        info          \\"If you plan on staying on this deployment platform, consider installing /\\"gatsby-adapter-test@^1.0.4/\\" as a dependency in your project. This will give you faster and more robust installs.\\""
      `)
    })

    it(`gatsby-dev`, async () => {
      // gatsby-dev is a special case as it's not published to npm
      // it sets package versions to ${current}-dev-${timestamp} and sometimes it's tricky with semver
      // as for example 1.0.4-dev-1702672314858 does NOT satisfy ^1.0.4 and normally gatsby would install
      // 1.0.4 from npm instead of using version installed in e2e-adapters site via gatsby-dev
      // we force specific manifest in e2e-tests/adapters to always allow currently installed adapter version
      // via GATSBY_ADAPTERS_MANIFEST env var
      mockInstalledInSiteAdapter = getMockedPackageByVersion(
        `1.0.4-dev-1702672314858`
      )
      mockAdaptersManifest = [
        {
          name: `Test`,
          test: (): boolean => true,
          module: `gatsby-adapter-test`,
          versions: [
            {
              gatsbyVersion: `*`,
              moduleVersion: `*`,
            },
          ].filter(Boolean),
        },
      ]

      const adapterInit = await getAdapterInit(`5.12.10-dev-1702672314858`)
      expect(adapterInit).not.toBeUndefined()
      expect(adapterInit?.().name).toMatchInlineSnapshot(
        `"gatsby-adapter-test@1.0.4-dev-1702672314858"`
      )
      expect(getLogsForSnapshot()).toMatchInlineSnapshot(
        `"verbose       \\"Using site's adapter dependency /\\"gatsby-adapter-test@1.0.4-dev-1702672314858/\\"\\""`
      )
    })
  })
})
