import { match as reachMatch } from "@gatsbyjs/reach-router"
import cookie from "cookie"
import { urlencoded, text, json, raw } from "express"
import type { RequestHandler, Request, Response, NextFunction } from "express"
import reporter from "gatsby-cli/lib/reporter"
import multer from "multer"

import {
  createConfig,
  IGatsbyFunctionConfigProcessed,
  IGatsbyBodyParserConfigProcessed,
  IAPIFunctionWarning,
} from "./config"
import type { IGatsbyFunction } from "../../redux/types"

const expressBuiltinMiddleware = {
  urlencoded,
  text,
  json,
  raw,
}

interface IGatsbyRequestContext {
  functionObj: IGatsbyFunction
  fnToExecute: (req: Request, res: Response) => void | Promise<void>
  // we massage params early in setContext middleware, but apparently other middlewares
  // reset it, so we will store those on our context and restore later
  params: Request["params"]
  config: IGatsbyFunctionConfigProcessed
  showDebugMessageInResponse: boolean
}

interface IGatsbyInternalRequest extends Request {
  context?: IGatsbyRequestContext
}

type IGatsbyMiddleware = (
  req: IGatsbyInternalRequest,
  res: Response,
  next: NextFunction
) => Promise<void> | void

interface ICreateMiddlewareConfig {
  getFunctions: () => Array<IGatsbyFunction>
  prepareFn?: (functionObj: IGatsbyFunction) => Promise<void> | void
  showDebugMessageInResponse?: boolean
}

export function printConfigWarnings(
  warnings: Array<IAPIFunctionWarning>,
  functionObj: IGatsbyFunction
): void {
  if (warnings.length) {
    for (const warning of warnings) {
      reporter.warn(
        `${
          warning.property
            ? `\`${warning.property}\` property of exported config`
            : `Exported config`
        } in \`${
          functionObj.originalRelativeFilePath
        }\` is misconfigured.\nExpected object:\n\n${
          warning.expectedType
        }\n\nGot:\n\n${JSON.stringify(
          warning.original
        )}\n\nUsing default:\n\n${JSON.stringify(
          warning.replacedWith,
          null,
          2
        )}`
      )
    }
  }
}

function createSetContextFunctionMiddleware({
  getFunctions,
  prepareFn,
  showDebugMessageInResponse,
}: ICreateMiddlewareConfig): IGatsbyMiddleware {
  return async function executeFunction(
    req: IGatsbyInternalRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const functions = getFunctions()
    const { "0": pathFragment } = req.params

    // Check first for exact matches.
    let functionObj = functions.find(
      ({ functionRoute }) => functionRoute === pathFragment
    )

    if (!functionObj) {
      // Check if there's any matchPaths that match.
      // We loop until we find the first match.
      functions.some(f => {
        if (f.matchPath) {
          const matchResult = reachMatch(f.matchPath, pathFragment)
          if (matchResult) {
            req.params = matchResult.params
            if (req.params[`*`]) {
              // Backwards compatability for v3
              // TODO remove in v5
              req.params[`0`] = req.params[`*`]
            }
            functionObj = f

            return true
          }
        }

        return false
      })
    }

    if (functionObj) {
      let userConfig
      if (prepareFn) {
        await prepareFn(functionObj)
      }

      const pathToFunction = functionObj.absoluteCompiledFilePath
      let fnToExecute
      try {
        delete require.cache[require.resolve(pathToFunction)]
        const fn = require(pathToFunction)
        userConfig = fn?.config

        fnToExecute = (fn && fn.default) || fn
      } catch (e) {
        if (e?.message?.includes(`fnToExecute is not a function`)) {
          e.message = `${functionObj.originalAbsoluteFilePath} does not export a function.`
        }

        fnToExecute = undefined
        reporter.error(e)
        if (!res.headersSent) {
          if (showDebugMessageInResponse) {
            res
              .status(500)
              .send(
                `Error when executing function "${functionObj.originalAbsoluteFilePath}":<br /><br />${e.message}`
              )
          } else {
            res.sendStatus(500)
          }
        }
        return
      }

      if (fnToExecute) {
        const { config, warnings } = createConfig(userConfig)

        printConfigWarnings(warnings, functionObj)

        req.context = {
          functionObj,
          fnToExecute,
          params: req.params,
          config,
          showDebugMessageInResponse: showDebugMessageInResponse ?? false,
        }
      }
    }

    next()
  }
}

function setCookies(
  req: IGatsbyInternalRequest,
  _res: Response,
  next: NextFunction
): void {
  const cookies = req.headers.cookie

  if (!cookies) {
    return next()
  }

  req.cookies = cookie.parse(cookies)

  return next()
}

function bodyParserMiddlewareWithConfig(
  type: keyof IGatsbyBodyParserConfigProcessed
): IGatsbyMiddleware {
  return function (
    req: IGatsbyInternalRequest,
    res: Response,
    next: NextFunction
  ): void {
    if (req.context && req.context.config.bodyParser) {
      const bodyParserConfig = req.context.config.bodyParser[type]
      expressBuiltinMiddleware[type](bodyParserConfig)(req, res, next)
    } else {
      next()
    }
  }
}

async function executeFunction(
  req: IGatsbyInternalRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (req.context) {
    reporter.verbose(`Running ${req.context.functionObj.functionRoute}`)
    req.params = req.context.params
    const start = Date.now()
    const context = req.context
    // we don't want to leak internal context to actual request handler
    delete req.context
    try {
      await Promise.resolve(context.fnToExecute(req, res))
    } catch (e) {
      if (e?.message?.includes(`fnToExecute is not a function`)) {
        e.message = `${context.functionObj.originalAbsoluteFilePath} does not export a function.`
      }

      reporter.error(e)
      // Don't send the error if that would cause another error.
      if (!res.headersSent) {
        if (context.showDebugMessageInResponse) {
          res
            .status(500)
            .send(
              `Error when executing function "${context.functionObj.originalAbsoluteFilePath}":<br /><br />${e.message}`
            )
        } else {
          res.sendStatus(500)
        }
      }
    }

    const end = Date.now()
    reporter.log(
      `Executed function "/api/${context.functionObj.functionRoute}" in ${
        end - start
      }ms`
    )
  } else {
    next()
  }
}

export function functionMiddlewares(
  middlewareConfig: ICreateMiddlewareConfig
): Array<RequestHandler> {
  const setContext = createSetContextFunctionMiddleware(middlewareConfig)

  return [
    setCookies,
    setContext,
    multer().any(),
    bodyParserMiddlewareWithConfig(`raw`),
    bodyParserMiddlewareWithConfig(`text`),
    bodyParserMiddlewareWithConfig(`urlencoded`),
    bodyParserMiddlewareWithConfig(`json`),
    executeFunction,
  ]
}
