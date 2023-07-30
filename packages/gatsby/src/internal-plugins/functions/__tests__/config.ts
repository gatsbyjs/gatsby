import { createConfig } from "../config"
import { printConfigWarnings } from "../middleware"
import reporter from "gatsby-cli/lib/reporter"
import type { IGatsbyFunction } from "../../../redux/types"
const reporterWarnSpy = jest.spyOn(reporter, `warn`)

beforeEach(() => {
  reporterWarnSpy.mockReset()
})

function createConfigAndPrintWarnings(
  userConfig: any,
  functionObj: IGatsbyFunction
): any {
  const { config, warnings } = createConfig(userConfig)
  printConfigWarnings(warnings, functionObj)
  return config
}

const testFunction: IGatsbyFunction = {
  functionRoute: `a-directory/function`,
  matchPath: undefined,
  pluginName: `default-site-plugin`,
  originalAbsoluteFilePath: `/Users/misiek/dev/functions-test/src/api/a-directory/function.js`,
  originalRelativeFilePath: `a-directory/function.js`,
  relativeCompiledFilePath: `a-directory/function.js`,
  absoluteCompiledFilePath: `/Users/misiek/dev/functions-test/.cache/functions/a-directory/function.js`,
  functionId: `a-directory/function`,
}

describe(`createConfigAndPrintWarnings`, () => {
  it(`defaults`, () => {
    expect(createConfigAndPrintWarnings(undefined, testFunction))
      .toMatchInlineSnapshot(`
      Object {
        "bodyParser": Object {
          "json": Object {
            "limit": "100kb",
          },
          "raw": Object {
            "limit": "100kb",
          },
          "text": Object {
            "limit": "100kb",
          },
          "urlencoded": Object {
            "extended": true,
            "limit": "100kb",
          },
        },
      }
    `)
    expect(reporterWarnSpy).toBeCalledTimes(0)
  })

  describe(`input not matching schema (fallback to default and warnings)`, () => {
    it(`{ bodyParser: false }`, () => {
      expect(createConfigAndPrintWarnings({ bodyParser: false }, testFunction))
        .toMatchInlineSnapshot(`
                  Object {
                    "bodyParser": Object {
                      "json": Object {
                        "limit": "100kb",
                      },
                      "raw": Object {
                        "limit": "100kb",
                      },
                      "text": Object {
                        "limit": "100kb",
                      },
                      "urlencoded": Object {
                        "extended": true,
                        "limit": "100kb",
                      },
                    },
                  }
              `)

      expect(reporterWarnSpy).toBeCalledTimes(1)
      expect(reporterWarnSpy.mock.calls[0][0]).toMatchInlineSnapshot(`
        "\`bodyParser\` property of exported config in \`a-directory/function.js\` is misconfigured.
        Expected object:

        {
          text?: GatsbyFunctionBodyParserCommonMiddlewareConfig
          json?: GatsbyFunctionBodyParserCommonMiddlewareConfig
          raw?: GatsbyFunctionBodyParserCommonMiddlewareConfig
          urlencoded?: GatsbyFunctionBodyParserUrlencodedConfig
        }

        Got:

        false

        Using default:

        {
          \\"text\\": {
            \\"limit\\": \\"100kb\\"
          },
          \\"raw\\": {
            \\"limit\\": \\"100kb\\"
          },
          \\"json\\": {
            \\"limit\\": \\"100kb\\"
          },
          \\"urlencoded\\": {
            \\"limit\\": \\"100kb\\",
            \\"extended\\": true
          }
        }"
      `)
    })

    it(`{ bodyParser: "foo" }`, () => {
      expect(createConfigAndPrintWarnings({ bodyParser: `foo` }, testFunction))
        .toMatchInlineSnapshot(`
                  Object {
                    "bodyParser": Object {
                      "json": Object {
                        "limit": "100kb",
                      },
                      "raw": Object {
                        "limit": "100kb",
                      },
                      "text": Object {
                        "limit": "100kb",
                      },
                      "urlencoded": Object {
                        "extended": true,
                        "limit": "100kb",
                      },
                    },
                  }
              `)

      expect(reporterWarnSpy).toBeCalledTimes(1)
      expect(reporterWarnSpy.mock.calls[0][0]).toMatchInlineSnapshot(`
        "\`bodyParser\` property of exported config in \`a-directory/function.js\` is misconfigured.
        Expected object:

        {
          text?: GatsbyFunctionBodyParserCommonMiddlewareConfig
          json?: GatsbyFunctionBodyParserCommonMiddlewareConfig
          raw?: GatsbyFunctionBodyParserCommonMiddlewareConfig
          urlencoded?: GatsbyFunctionBodyParserUrlencodedConfig
        }

        Got:

        \\"foo\\"

        Using default:

        {
          \\"text\\": {
            \\"limit\\": \\"100kb\\"
          },
          \\"raw\\": {
            \\"limit\\": \\"100kb\\"
          },
          \\"json\\": {
            \\"limit\\": \\"100kb\\"
          },
          \\"urlencoded\\": {
            \\"limit\\": \\"100kb\\",
            \\"extended\\": true
          }
        }"
      `)
    })

    it(`{ unrelated: true }`, () => {
      expect(createConfigAndPrintWarnings({ unrelated: true }, testFunction))
        .toMatchInlineSnapshot(`
                  Object {
                    "bodyParser": Object {
                      "json": Object {
                        "limit": "100kb",
                      },
                      "raw": Object {
                        "limit": "100kb",
                      },
                      "text": Object {
                        "limit": "100kb",
                      },
                      "urlencoded": Object {
                        "extended": true,
                        "limit": "100kb",
                      },
                    },
                  }
              `)

      expect(reporterWarnSpy).toBeCalledTimes(1)
      expect(reporterWarnSpy.mock.calls[0][0]).toMatchInlineSnapshot(`
        "Exported config in \`a-directory/function.js\` is misconfigured.
        Expected object:

        {
          bodyParser?: GatsbyFunctionBodyParserConfig
        }

        Got:

        {\\"unrelated\\":true}

        Using default:

        {
          \\"bodyParser\\": {
            \\"text\\": {
              \\"limit\\": \\"100kb\\"
            },
            \\"raw\\": {
              \\"limit\\": \\"100kb\\"
            },
            \\"json\\": {
              \\"limit\\": \\"100kb\\"
            },
            \\"urlencoded\\": {
              \\"limit\\": \\"100kb\\",
              \\"extended\\": true
            }
          }
        }"
      `)
    })

    it(`{ bodyParser: { unrelated: true } }`, () => {
      expect(
        createConfigAndPrintWarnings(
          { bodyParser: { unrelated: true } },
          testFunction
        )
      ).toMatchInlineSnapshot(`
                  Object {
                    "bodyParser": Object {
                      "json": Object {
                        "limit": "100kb",
                      },
                      "raw": Object {
                        "limit": "100kb",
                      },
                      "text": Object {
                        "limit": "100kb",
                      },
                      "urlencoded": Object {
                        "extended": true,
                        "limit": "100kb",
                      },
                    },
                  }
              `)

      expect(reporterWarnSpy).toBeCalledTimes(1)
      expect(reporterWarnSpy.mock.calls[0][0]).toMatchInlineSnapshot(`
        "\`bodyParser\` property of exported config in \`a-directory/function.js\` is misconfigured.
        Expected object:

        {
          text?: GatsbyFunctionBodyParserCommonMiddlewareConfig
          json?: GatsbyFunctionBodyParserCommonMiddlewareConfig
          raw?: GatsbyFunctionBodyParserCommonMiddlewareConfig
          urlencoded?: GatsbyFunctionBodyParserUrlencodedConfig
        }

        Got:

        {\\"unrelated\\":true}

        Using default:

        {
          \\"text\\": {
            \\"limit\\": \\"100kb\\"
          },
          \\"raw\\": {
            \\"limit\\": \\"100kb\\"
          },
          \\"json\\": {
            \\"limit\\": \\"100kb\\"
          },
          \\"urlencoded\\": {
            \\"limit\\": \\"100kb\\",
            \\"extended\\": true
          }
        }"
      `)
    })
  })

  describe(`bodyParser`, () => {
    describe(`text`, () => {
      it(`limit`, () => {
        const customTextConfig = {
          limit: `1mb`,
        }
        const generatedConfig = createConfigAndPrintWarnings(
          {
            bodyParser: {
              text: customTextConfig,
            },
          },
          testFunction
        )
        expect(generatedConfig.bodyParser.text).toMatchInlineSnapshot(`
                  Object {
                    "limit": "1mb",
                  }
              `)
        expect(reporterWarnSpy).toBeCalledTimes(0)
      })

      it(`type`, () => {
        const customTextConfig = {
          type: `lorem/*`,
        }
        const generatedConfig = createConfigAndPrintWarnings(
          {
            bodyParser: {
              text: customTextConfig,
            },
          },
          testFunction
        )
        expect(generatedConfig.bodyParser.text).toMatchInlineSnapshot(`
                  Object {
                    "type": "lorem/*",
                  }
              `)
        expect(reporterWarnSpy).toBeCalledTimes(0)
      })

      it(`input not matching schema (fallback to default) - not an config object`, () => {
        const customTextConfig = `foo`
        const generatedConfig = createConfigAndPrintWarnings(
          {
            bodyParser: {
              text: customTextConfig,
            },
          },
          testFunction
        )
        expect(generatedConfig.bodyParser.text).toMatchInlineSnapshot(`
                  Object {
                    "limit": "100kb",
                  }
              `)
        expect(reporterWarnSpy).toBeCalledTimes(1)
        expect(reporterWarnSpy.mock.calls[0][0]).toMatchInlineSnapshot(`
          "\`bodyParser.text\` property of exported config in \`a-directory/function.js\` is misconfigured.
          Expected object:

          {
            type?: string
            limit?: string | number
          }

          Got:

          \\"foo\\"

          Using default:

          {
            \\"limit\\": \\"100kb\\"
          }"
        `)
      })

      it(`input not matching schema (fallback to default) - config object not matching schema`, () => {
        const customTextConfig = { wat: true }
        const generatedConfig = createConfigAndPrintWarnings(
          {
            bodyParser: {
              text: customTextConfig,
            },
          },
          testFunction
        )
        expect(generatedConfig.bodyParser.text).toMatchInlineSnapshot(`
                  Object {
                    "limit": "100kb",
                  }
              `)
        expect(reporterWarnSpy).toBeCalledTimes(1)
        expect(reporterWarnSpy.mock.calls[0][0]).toMatchInlineSnapshot(`
          "\`bodyParser.text\` property of exported config in \`a-directory/function.js\` is misconfigured.
          Expected object:

          {
            type?: string
            limit?: string | number
          }

          Got:

          {\\"wat\\":true}

          Using default:

          {
            \\"limit\\": \\"100kb\\"
          }"
        `)
      })
    })

    describe(`json`, () => {
      it(`limit`, () => {
        const customTextConfig = {
          limit: `1mb`,
        }
        const generatedConfig = createConfigAndPrintWarnings(
          {
            bodyParser: {
              json: customTextConfig,
            },
          },
          testFunction
        )
        expect(generatedConfig.bodyParser.json).toMatchInlineSnapshot(`
                  Object {
                    "limit": "1mb",
                  }
              `)

        expect(reporterWarnSpy).toBeCalledTimes(0)
      })

      it(`type`, () => {
        const customTextConfig = {
          type: `lorem/*`,
        }
        const generatedConfig = createConfigAndPrintWarnings(
          {
            bodyParser: {
              json: customTextConfig,
            },
          },
          testFunction
        )
        expect(generatedConfig.bodyParser.json).toMatchInlineSnapshot(`
                  Object {
                    "type": "lorem/*",
                  }
              `)
        expect(reporterWarnSpy).toBeCalledTimes(0)
      })

      it(`input not matching schema (fallback to default) - not an config object`, () => {
        const customTextConfig = `foo`
        const generatedConfig = createConfigAndPrintWarnings(
          {
            bodyParser: {
              json: customTextConfig,
            },
          },
          testFunction
        )
        expect(generatedConfig.bodyParser.json).toMatchInlineSnapshot(`
                  Object {
                    "limit": "100kb",
                  }
              `)

        expect(reporterWarnSpy).toBeCalledTimes(1)
        expect(reporterWarnSpy.mock.calls[0][0]).toMatchInlineSnapshot(`
          "\`bodyParser.json\` property of exported config in \`a-directory/function.js\` is misconfigured.
          Expected object:

          {
            type?: string
            limit?: string | number
          }

          Got:

          \\"foo\\"

          Using default:

          {
            \\"limit\\": \\"100kb\\"
          }"
        `)
      })

      it(`input not matching schema (fallback to default) - config object not matching schema`, () => {
        const customTextConfig = { wat: true }
        const generatedConfig = createConfigAndPrintWarnings(
          {
            bodyParser: {
              json: customTextConfig,
            },
          },
          testFunction
        )
        expect(generatedConfig.bodyParser.json).toMatchInlineSnapshot(`
                  Object {
                    "limit": "100kb",
                  }
              `)

        expect(reporterWarnSpy).toBeCalledTimes(1)
        expect(reporterWarnSpy.mock.calls[0][0]).toMatchInlineSnapshot(`
          "\`bodyParser.json\` property of exported config in \`a-directory/function.js\` is misconfigured.
          Expected object:

          {
            type?: string
            limit?: string | number
          }

          Got:

          {\\"wat\\":true}

          Using default:

          {
            \\"limit\\": \\"100kb\\"
          }"
        `)
      })
    })

    describe(`raw`, () => {
      it(`limit`, () => {
        const customTextConfig = {
          limit: `1mb`,
        }
        const generatedConfig = createConfigAndPrintWarnings(
          {
            bodyParser: {
              raw: customTextConfig,
            },
          },
          testFunction
        )
        expect(generatedConfig.bodyParser.raw).toMatchInlineSnapshot(`
                  Object {
                    "limit": "1mb",
                  }
              `)
        expect(reporterWarnSpy).toBeCalledTimes(0)
      })

      it(`type`, () => {
        const customTextConfig = {
          type: `lorem/*`,
        }
        const generatedConfig = createConfigAndPrintWarnings(
          {
            bodyParser: {
              raw: customTextConfig,
            },
          },
          testFunction
        )
        expect(generatedConfig.bodyParser.raw).toMatchInlineSnapshot(`
                  Object {
                    "type": "lorem/*",
                  }
              `)
        expect(reporterWarnSpy).toBeCalledTimes(0)
      })

      it(`input not matching schema (fallback to default) - not an config object`, () => {
        const customTextConfig = `foo`
        const generatedConfig = createConfigAndPrintWarnings(
          {
            bodyParser: {
              raw: customTextConfig,
            },
          },
          testFunction
        )
        expect(generatedConfig.bodyParser.raw).toMatchInlineSnapshot(`
                  Object {
                    "limit": "100kb",
                  }
              `)

        expect(reporterWarnSpy).toBeCalledTimes(1)
        expect(reporterWarnSpy.mock.calls[0][0]).toMatchInlineSnapshot(`
          "\`bodyParser.raw\` property of exported config in \`a-directory/function.js\` is misconfigured.
          Expected object:

          {
            type?: string
            limit?: string | number
          }

          Got:

          \\"foo\\"

          Using default:

          {
            \\"limit\\": \\"100kb\\"
          }"
        `)
      })

      it(`input not matching schema (fallback to default) - config object not matching schema`, () => {
        const customTextConfig = { wat: true }
        const generatedConfig = createConfigAndPrintWarnings(
          {
            bodyParser: {
              raw: customTextConfig,
            },
          },
          testFunction
        )
        expect(generatedConfig.bodyParser.raw).toMatchInlineSnapshot(`
                  Object {
                    "limit": "100kb",
                  }
              `)

        expect(reporterWarnSpy).toBeCalledTimes(1)
        expect(reporterWarnSpy.mock.calls[0][0]).toMatchInlineSnapshot(`
          "\`bodyParser.raw\` property of exported config in \`a-directory/function.js\` is misconfigured.
          Expected object:

          {
            type?: string
            limit?: string | number
          }

          Got:

          {\\"wat\\":true}

          Using default:

          {
            \\"limit\\": \\"100kb\\"
          }"
        `)
      })
    })

    describe(`urlencoded`, () => {
      it(`limit`, () => {
        const customTextConfig = {
          limit: `1mb`,
          extended: true,
        }
        const generatedConfig = createConfigAndPrintWarnings(
          {
            bodyParser: {
              urlencoded: customTextConfig,
            },
          },
          testFunction
        )
        expect(generatedConfig.bodyParser.urlencoded).toMatchInlineSnapshot(`
          Object {
            "extended": true,
            "limit": "1mb",
          }
        `)
        expect(reporterWarnSpy).toBeCalledTimes(0)
      })

      it(`type`, () => {
        const customTextConfig = {
          type: `lorem/*`,
          extended: true,
        }
        const generatedConfig = createConfigAndPrintWarnings(
          {
            bodyParser: {
              urlencoded: customTextConfig,
            },
          },
          testFunction
        )
        expect(generatedConfig.bodyParser.urlencoded).toMatchInlineSnapshot(`
          Object {
            "extended": true,
            "type": "lorem/*",
          }
        `)
        expect(reporterWarnSpy).toBeCalledTimes(0)
      })

      it(`input not matching schema (fallback to default) - not an config object`, () => {
        const customTextConfig = `foo`
        const generatedConfig = createConfigAndPrintWarnings(
          {
            bodyParser: {
              urlencoded: customTextConfig,
            },
          },
          testFunction
        )
        expect(generatedConfig.bodyParser.urlencoded).toMatchInlineSnapshot(`
                  Object {
                    "extended": true,
                    "limit": "100kb",
                  }
              `)

        expect(reporterWarnSpy).toBeCalledTimes(1)
        expect(reporterWarnSpy.mock.calls[0][0]).toMatchInlineSnapshot(`
          "\`bodyParser.urlencoded\` property of exported config in \`a-directory/function.js\` is misconfigured.
          Expected object:

          {
            type?: string
            limit: string | number
            extended: boolean
          }

          Got:

          \\"foo\\"

          Using default:

          {
            \\"limit\\": \\"100kb\\",
            \\"extended\\": true
          }"
        `)
      })

      it(`input not matching schema (fallback to default) - config object not matching schema`, () => {
        const customTextConfig = { wat: true }
        const generatedConfig = createConfigAndPrintWarnings(
          {
            bodyParser: {
              urlencoded: customTextConfig,
            },
          },
          testFunction
        )
        expect(generatedConfig.bodyParser.urlencoded).toMatchInlineSnapshot(`
                  Object {
                    "extended": true,
                    "limit": "100kb",
                  }
              `)

        expect(reporterWarnSpy).toBeCalledTimes(1)
        expect(reporterWarnSpy.mock.calls[0][0]).toMatchInlineSnapshot(`
          "\`bodyParser.urlencoded\` property of exported config in \`a-directory/function.js\` is misconfigured.
          Expected object:

          {
            type?: string
            limit: string | number
            extended: boolean
          }

          Got:

          {\\"wat\\":true}

          Using default:

          {
            \\"limit\\": \\"100kb\\",
            \\"extended\\": true
          }"
        `)
      })

      it(`input not matching schema (fallback to default) - "extended" is required"`, () => {
        const customTextConfig = { limit: `200kb` }
        const generatedConfig = createConfigAndPrintWarnings(
          {
            bodyParser: {
              urlencoded: customTextConfig,
            },
          },
          testFunction
        )
        expect(generatedConfig.bodyParser.urlencoded).toMatchInlineSnapshot(`
                  Object {
                    "extended": true,
                    "limit": "100kb",
                  }
              `)

        expect(reporterWarnSpy).toBeCalledTimes(1)
        expect(reporterWarnSpy.mock.calls[0][0]).toMatchInlineSnapshot(`
          "\`bodyParser.urlencoded\` property of exported config in \`a-directory/function.js\` is misconfigured.
          Expected object:

          {
            type?: string
            limit: string | number
            extended: boolean
          }

          Got:

          {\\"limit\\":\\"200kb\\"}

          Using default:

          {
            \\"limit\\": \\"100kb\\",
            \\"extended\\": true
          }"
        `)
      })
    })
  })
})
