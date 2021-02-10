const _ = require(`lodash`)

const copyRuntimeCaching = arr => arr.map(c => _.cloneDeep(c))

describe(`mergeWorkboxConfig`, () => {
  const { defaultRuntimeCachingHandlers } = require(`../gatsby-node`)
  const mergeWorkboxConfig = require(`../merge-workbox-config`)

  test(`runtimeCachingMergeStrategy: Default option(merge) - Don't specify anything in config`, () => {
    // call by value
    const options = {
      runtimeCaching: copyRuntimeCaching(defaultRuntimeCachingHandlers),
    }

    const expectedOptions = {
      runtimeCaching: copyRuntimeCaching(defaultRuntimeCachingHandlers),
    }

    const mergedOption = mergeWorkboxConfig(options, {})
    expect(mergedOption).toEqual(expectedOptions)
  })

  test(`runtimeCachingMergeStrategy: When the merge option is specified - Don't specify anything in config`, () => {
    // call by value
    const options = {
      runtimeCaching: copyRuntimeCaching(defaultRuntimeCachingHandlers),
    }

    const expectedOptions = {
      runtimeCaching: copyRuntimeCaching(defaultRuntimeCachingHandlers),
    }

    const mergedOption = mergeWorkboxConfig(options, {}, `merge`)
    expect(mergedOption).toEqual(expectedOptions)
  })

  test(`runtimeCachingMergeStrategy: Default option(merge)`, () => {
    const specifiedRuntimeCaching = [
      {
        urlPattern: /(\.js$|\.css$|static\/)/,
        handler: `CacheFirst`,
      },
      {
        urlPattern: /^https?:.*\/page-data\/.*\.json/,
        handler: `NetwoekFirst`,
      },
      {
        urlPattern: /^https?:.*\.(png|jpg|jpeg|webp|svg|gif|tiff|js|woff|woff2|json|css)$/,
        handler: `StaleWhileRevalidate`,
      },
      {
        urlPattern: /^https?:\/\/fonts\.googleapis\.com\/css/,
        handler: `StaleWhileRevalidate`,
      },
    ]

    // call by value
    const options = {
      runtimeCaching: copyRuntimeCaching(defaultRuntimeCachingHandlers),
    }

    const expectedOptions = {
      runtimeCaching: copyRuntimeCaching(specifiedRuntimeCaching),
    }

    const mergedOption = mergeWorkboxConfig(options, {
      runtimeCaching: specifiedRuntimeCaching,
    })
    expect(mergedOption).toEqual(expectedOptions)
  })

  test(`runtimeCachingMergeStrategy: When the merge option is specified`, () => {
    const specifiedRuntimeCaching = [
      {
        urlPattern: /(\.js$|\.css$|static\/)/,
        handler: `CacheFirst`,
      },
      {
        urlPattern: /^https?:.*\/page-data\/.*\.json/,
        handler: `NetwoekFirst`,
      },
      {
        urlPattern: /^https?:.*\.(png|jpg|jpeg|webp|svg|gif|tiff|js|woff|woff2|json|css)$/,
        handler: `StaleWhileRevalidate`,
      },
      {
        urlPattern: /^https?:\/\/fonts\.googleapis\.com\/css/,
        handler: `StaleWhileRevalidate`,
      },
    ]

    // call by value
    const options = {
      runtimeCaching: copyRuntimeCaching(defaultRuntimeCachingHandlers),
    }

    const expectedOptions = {
      runtimeCaching: copyRuntimeCaching(specifiedRuntimeCaching),
    }

    const mergedOption = mergeWorkboxConfig(
      options,
      { runtimeCaching: specifiedRuntimeCaching },
      `merge`
    )
    expect(mergedOption).toEqual(expectedOptions)
  })

  test(`runtimeCachingMergeStrategy: append`, () => {
    // call by value
    const options = {
      runtimeCaching: copyRuntimeCaching(defaultRuntimeCachingHandlers),
    }

    const workboxConfig = {
      runtimeCaching: [
        {
          urlPattern: /some\/path\/that\/needs\/to\/always\/get\/fetched\/from\/the\/network/,
          handler: `NetworkFirst`,
        },
      ],
    }

    const expectedOptions = {
      runtimeCaching: copyRuntimeCaching(defaultRuntimeCachingHandlers).concat(
        workboxConfig.runtimeCaching
      ),
    }

    const mergedOption = mergeWorkboxConfig(options, workboxConfig, `append`)
    expect(mergedOption).toEqual(expectedOptions)
  })

  test(`runtimeCachingMergeStrategy: replace`, () => {
    // call by value
    const options = {
      runtimeCaching: copyRuntimeCaching(defaultRuntimeCachingHandlers),
    }

    const workboxConfig = {
      runtimeCaching: [
        {
          urlPattern: /only-this-path-should-be-cached/,
          handler: `CacheFirst`,
        },
      ],
    }

    const expectedOptions = {
      runtimeCaching: copyRuntimeCaching(workboxConfig.runtimeCaching),
    }

    const mergedOption = mergeWorkboxConfig(options, workboxConfig, `replace`)
    expect(mergedOption).toEqual(expectedOptions)
  })

  test(`runtimeCachingMergeStrategy: replace(Pattern of have some logic to detect the  handler we want to modify/replace)`, () => {
    // call by value
    const options = {
      runtimeCaching: copyRuntimeCaching(defaultRuntimeCachingHandlers),
    }

    const workboxConfig = {
      runtimeCaching: [
        ...defaultRuntimeCachingHandlers.map(handler => {
          // some logic to detect the  handler we want to modify/replace
          if (!handler.urlPattern.test(`https://www.example.org/some.png`)) {
            return handler
          }

          // for example, modifing the 3rd default handler to also cache .wasm files + add some options
          return {
            ...handler,
            urlPattern: /^https?:.*\.(png|jpg|jpeg|webp|svg|gif|tiff|js|woff|woff2|json|css|wasm)$/,
            options: {
              networkTimeoutSeconds: 1.5,
            },
          }
        }),
      ],
    }

    const expectedOptions = {
      runtimeCaching: [
        {
          // Use cacheFirst since these don't need to be revalidated (same RegExp
          // and same reason as above)
          urlPattern: /(\.js$|\.css$|static\/)/,
          handler: `CacheFirst`,
        },
        {
          // page-data.json files, static query results and app-data.json
          // are not content hashed
          urlPattern: /^https?:.*\/page-data\/.*\.json/,
          handler: `StaleWhileRevalidate`,
        },
        {
          // **** MODIFIED HANDLER ****
          // Add runtime caching of various other page resources
          urlPattern: /^https?:.*\.(png|jpg|jpeg|webp|svg|gif|tiff|js|woff|woff2|json|css|wasm)$/,
          handler: `StaleWhileRevalidate`,
          options: {
            networkTimeoutSeconds: 1.5,
          },
        },
        {
          // Google Fonts CSS (doesn't end in .css so we need to specify it)
          urlPattern: /^https?:\/\/fonts\.googleapis\.com\/css/,
          handler: `StaleWhileRevalidate`,
        },
      ],
    }

    const mergedOption = mergeWorkboxConfig(options, workboxConfig, `replace`)
    expect(mergedOption).toEqual(expectedOptions)
  })

  test(`runtimeCachingMergeStrategy: Invalid runtimeCachingMergeStrategy(Empty string)`, () => {
    // call by value
    const options = {
      runtimeCaching: copyRuntimeCaching(defaultRuntimeCachingHandlers),
    }

    const workboxConfig = {
      runtimeCaching: [
        {
          urlPattern: /some\/path\/that\/needs\/to\/always\/get\/fetched\/from\/the\/network/,
          handler: `NetworkFirst`,
        },
      ],
    }

    expect(() => mergeWorkboxConfig(options, workboxConfig, ``)).toThrow()
  })

  test(`runtimeCachingMergeStrategy: Invalid runtimeCachingMergeStrategy(Non-existent options)`, () => {
    // call by value
    const options = {
      runtimeCaching: copyRuntimeCaching(defaultRuntimeCachingHandlers),
    }

    const workboxConfig = {
      runtimeCaching: [
        {
          urlPattern: /some\/path\/that\/needs\/to\/always\/get\/fetched\/from\/the\/network/,
          handler: `NetworkFirst`,
        },
      ],
    }

    expect(() =>
      mergeWorkboxConfig(options, workboxConfig, `appendd`)
    ).toThrow()
  })

  test(`runtimeCachingMergeStrategy: Invalid runtimeCachingMergeStrategy(When an array is passed as a parameter)`, () => {
    // call by value
    const options = {
      runtimeCaching: copyRuntimeCaching(defaultRuntimeCachingHandlers),
    }

    const workboxConfig = {
      runtimeCaching: [
        {
          urlPattern: /some\/path\/that\/needs\/to\/always\/get\/fetched\/from\/the\/network/,
          handler: `NetworkFirst`,
        },
      ],
    }

    expect(() => mergeWorkboxConfig(options, workboxConfig, [])).toThrow()
  })

  test(`runtimeCachingMergeStrategy: Invalid runtimeCachingMergeStrategy(When an object is passed as a parameter)`, () => {
    // call by value
    const options = {
      runtimeCaching: copyRuntimeCaching(defaultRuntimeCachingHandlers),
    }

    const workboxConfig = {
      runtimeCaching: [
        {
          urlPattern: /some\/path\/that\/needs\/to\/always\/get\/fetched\/from\/the\/network/,
          handler: `NetworkFirst`,
        },
      ],
    }

    expect(() => mergeWorkboxConfig(options, workboxConfig, {})).toThrow()
  })
})
