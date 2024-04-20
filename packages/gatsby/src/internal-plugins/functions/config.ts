// eslint-disable-next-line @typescript-eslint/naming-convention
import Joi from "joi"

import type {
  GatsbyFunctionBodyParserCommonMiddlewareConfig,
  GatsbyFunctionBodyParserUrlencodedConfig,
  // @ts-ignore
} from "gatsby"

const DEFAULT_LIMIT = `100kb`

// similar to `GatsbyFunctionBodyParserConfig` and `IGatsbyFunctionConfigProcessed`
// from index.d.ts, just with fields required (not optional).
// `createConfig()` will fill in defaults
export type IGatsbyBodyParserConfigProcessed = {
  json: GatsbyFunctionBodyParserCommonMiddlewareConfig
  raw: GatsbyFunctionBodyParserCommonMiddlewareConfig
  text: GatsbyFunctionBodyParserCommonMiddlewareConfig
  urlencoded: GatsbyFunctionBodyParserUrlencodedConfig
}
export type IGatsbyFunctionConfigProcessed = {
  bodyParser: IGatsbyBodyParserConfigProcessed
}

const defaultBodyParserOptions: GatsbyFunctionBodyParserCommonMiddlewareConfig =
  {
    limit: DEFAULT_LIMIT,
  }
const defaultUrlEncoded = { extended: true }
const defaultConfig = {
  bodyParser: {
    text: defaultBodyParserOptions,
    raw: defaultBodyParserOptions,
    json: defaultBodyParserOptions,
    urlencoded: { ...defaultBodyParserOptions, ...defaultUrlEncoded },
  },
}

export type IAPIFunctionWarning = {
  property: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  original: any
  expectedType: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  replacedWith: any
}

let warnings: Array<IAPIFunctionWarning> = []

function bodyParserConfigFailover(
  property: keyof IGatsbyBodyParserConfigProcessed,
  expectedType: string,
): (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _: any,
  {
    original,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    original: any
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function actualFailover(_, { original }): any {
    warnings.push({
      property: `bodyParser.${property}`,
      original,
      expectedType,
      replacedWith: defaultConfig.bodyParser[property],
    })

    return defaultConfig.bodyParser[property]
  }
}

const functionConfigSchema: Joi.ObjectSchema<IGatsbyFunctionConfigProcessed> =
  Joi.object()
    .keys({
      bodyParser: Joi.object()
        .keys({
          json: Joi.object()
            .keys({
              type: Joi.string(),
              limit: Joi.alternatives(Joi.string(), Joi.number()),
            })
            .default(defaultConfig.bodyParser.json)
            .failover(
              bodyParserConfigFailover(
                `json`,
                `{\n  type?: string\n  limit?: string | number\n}`,
              ),
            )
            .unknown(false),
          text: Joi.object()
            .keys({
              type: Joi.string(),
              limit: Joi.alternatives(Joi.string(), Joi.number()),
            })
            .unknown(false)
            .default(defaultConfig.bodyParser.text)
            .failover(
              bodyParserConfigFailover(
                `text`,
                `{\n  type?: string\n  limit?: string | number\n}`,
              ),
            ),
          raw: Joi.object()
            .keys({
              type: Joi.string(),
              limit: Joi.alternatives(Joi.string(), Joi.number()),
            })
            .unknown(false)
            .default(defaultConfig.bodyParser.raw)
            .failover(
              bodyParserConfigFailover(
                `raw`,
                `{\n  type?: string\n  limit?: string | number\n}`,
              ),
            ),
          urlencoded: Joi.object()
            .keys({
              type: Joi.string(),
              limit: Joi.alternatives(Joi.string(), Joi.number()),
              extended: Joi.boolean().required(),
            })
            .unknown(false)
            .default(defaultConfig.bodyParser.urlencoded)
            .failover(
              bodyParserConfigFailover(
                `urlencoded`,
                `{\n  type?: string\n  limit: string | number\n  extended: boolean\n}`,
              ),
            ),
        })
        .unknown(false)
        .default(defaultConfig.bodyParser)
        .failover((_, { original }) => {
          warnings.push({
            property: `bodyParser`,
            original,
            expectedType: `{\n  text?: GatsbyFunctionBodyParserCommonMiddlewareConfig\n  json?: GatsbyFunctionBodyParserCommonMiddlewareConfig\n  raw?: GatsbyFunctionBodyParserCommonMiddlewareConfig\n  urlencoded?: GatsbyFunctionBodyParserUrlencodedConfig\n}`,
            replacedWith: defaultConfig.bodyParser,
          })
          return defaultConfig.bodyParser
        }),
    })
    .unknown(false)
    .default(defaultConfig)
    .failover((_, { original }) => {
      warnings.push({
        property: null,
        original,
        expectedType: `{\n  bodyParser?: GatsbyFunctionBodyParserConfig\n}`,
        replacedWith: defaultConfig,
      })
      return defaultConfig
    })

export function createConfig(userConfig: unknown): {
  config: IGatsbyFunctionConfigProcessed
  warnings: Array<IAPIFunctionWarning>
} {
  warnings = []
  const { value } = functionConfigSchema.validate(userConfig)
  const config = value as IGatsbyFunctionConfigProcessed
  return { config, warnings }
}
