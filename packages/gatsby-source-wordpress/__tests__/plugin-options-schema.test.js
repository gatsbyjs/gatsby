import { testPluginOptionsSchema } from "gatsby-plugin-utils/dist/test-plugin-options-schema"
import { pluginOptionsSchema } from "gatsby-source-wordpress/dist/steps/declare-plugin-options-schema"

describe(`pluginOptionsSchema`, () => {
  it(`should validate a minimal, valid config`, async () => {
    const { isValid } = await testPluginOptionsSchema(pluginOptionsSchema, {
      url: `http://localhost:8000/graphql`,
    })

    expect(isValid).toEqual(true)
  })

  it(`should invalidate a config missing required vars`, async () => {
    const { isValid, errors } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      {}
    )

    expect(isValid).toEqual(false)
    expect(errors).toMatchInlineSnapshot(`
    Array [
      "\\"url\\" is required",
    ]
  `)
  })

  it(`should validate a fully custom config`, async () => {
    const { isValid, errors } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      {
        url: `https://fakeurl.com/graphql`,
        verbose: false,
        debug: {
          throwRefetchErrors: true,
          graphql: {
            showQueryOnError: false,
            showQueryVarsOnError: false,
            copyQueryOnError: false,
            panicOnError: false,
            onlyReportCriticalErrors: true,
            copyNodeSourcingQueryAndExit: false,
            writeQueriesToDisk: false,
          },
          timeBuildSteps: false,
          disableCompatibilityCheck: false,
        },
        develop: {
          nodeUpdateInterval: 300,
          hardCacheMediaFiles: false,
          hardCacheData: false,
        },
        production: {
          hardCacheMediaFiles: false,
        },
        auth: {
          htaccess: {
            username: `test`,
            password: `test`,
          },
        },
        schema: {
          queryDepth: 15,
          circularQueryLimit: 5,
          typePrefix: `Wp`,
          timeout: 30 * 1000, // 30 seconds
          perPage: 100,
        },
        excludeFieldNames: [],
        html: {
          useGatsbyImage: true,
          imageMaxWidth: null,
          fallbackImageMaxWidth: 100,
          imageQuality: 90,
          createStaticFiles: true,
        },
        type: {
          __all: {
            excludeFieldNames: [`viewer`],
          },
          RootQuery: {
            excludeFieldNames: [`schemaMd5`],
          },
          MediaItem: {
            lazyNodes: true,
            localFile: {
              excludeByMimeTypes: [`video/mp4`],
              maxFileSizeBytes: 1400000,
            },
          },
          ContentNode: {
            nodeInterface: true,
          },
          Menu: {
            beforeChangeNode: () => {},
          },
          MenuItem: {
            beforeChangeNode: null,
          },
          Page: {
            beforeChangeNode: `./docs-generation.test.js`,
          },
          Post: {
            beforeChangeNode: () => {
              console.log(`Hi from an inline fn!`)
            },
          },
          EnqueuedScript: {
            exclude: true,
          },
          EnqueuedThing: {
            exclude: null,
          },
        },
      }
    )

    expect(errors).toEqual([])
    expect(isValid).toEqual(true)
  })
})
