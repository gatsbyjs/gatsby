import Joi from "joi"
import {
  ILocationPosition,
  IStructuredError,
  Type,
  ErrorCategory,
  Level,
} from "./types"

export const Position: Joi.ObjectSchema<ILocationPosition> = Joi.object()
  .keys({
    line: Joi.number(),
    column: Joi.number(),
  })
  .unknown()

export const errorSchema: Joi.ObjectSchema<IStructuredError> =
  Joi.object().keys({
    code: Joi.string(),
    text: Joi.string(),
    stack: Joi.array()
      .items(
        Joi.object().keys({
          fileName: Joi.string(),
          functionName: Joi.string().allow(null),
          lineNumber: Joi.number().allow(null),
          columnNumber: Joi.number().allow(null),
        })
      )
      .allow(null),
    category: Joi.string().valid(...Object.values(ErrorCategory)),
    level: Joi.string().valid(...Object.values(Level)),
    type: Joi.string().valid(...Object.values(Type)),
    filePath: Joi.string(),
    location: Joi.object({
      start: Position.required(),
      end: Position,
    }).unknown(),
    docsUrl: Joi.string().uri({
      allowRelative: false,
      relativeOnly: false,
    }),
    error: Joi.object({}).unknown(),
    context: Joi.object({}).unknown(),
    group: Joi.string(),
    panicOnBuild: Joi.boolean(),
    pluginName: Joi.string(),
  })
