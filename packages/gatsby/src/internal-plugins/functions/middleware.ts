import { match as reachMatch } from "@gatsbyjs/reach-router/lib/utils"
import cookie from "cookie"
import { urlencoded, text, json, raw } from "express"
import type { RequestHandler, Request, Response, NextFunction } from "express"
import reporter from "gatsby-cli/lib/reporter"
import multer from "multer"

import type { IGatsbyFunction } from "../../redux/types"

type IGatsbyRequest = Request

type IGatsbyMiddleware = (
  req: IGatsbyRequest,
  res: Response,
  next: NextFunction
) => Promise<void> | void

interface ICreateMiddlewareConfig {
  getFunctions: () => Array<IGatsbyFunction>
  prepareFn?: (functionObj: IGatsbyFunction) => Promise<void> | void
}

function setCookies(
  req: IGatsbyRequest,
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

function createExecuteFunctionMiddleware({
  getFunctions,
  prepareFn,
}: ICreateMiddlewareConfig): IGatsbyMiddleware {
  return async function executeFunction(
    req: IGatsbyRequest,
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
      if (prepareFn) {
        await prepareFn(functionObj)
      }

      reporter.verbose(`Running ${functionObj.functionRoute}`)
      const start = Date.now()
      const pathToFunction = functionObj.absoluteCompiledFilePath

      try {
        delete require.cache[require.resolve(pathToFunction)]
        const fn = require(pathToFunction)

        const fnToExecute = (fn && fn.default) || fn

        await Promise.resolve(fnToExecute(req, res))
      } catch (e) {
        {
          // TODO: this was only in develop - is it fine to have this in prod?
          // Override the default error with something more specific.
          if (e.message.includes(`fnToExecute is not a function`)) {
            e.message = `${functionObj.originalAbsoluteFilePath} does not export a function.`
          }
        }
        reporter.error(e)
        // Don't send the error if that would cause another error.
        if (!res.headersSent) {
          res
            .status(500)
            // TODO: custom body text only in develop - is it fine to have this in prod?
            .send(
              `Error when executing function "${functionObj.originalAbsoluteFilePath}":<br /><br />${e.message}`
            )
        }
      }

      const end = Date.now()
      reporter.log(
        `Executed function "/api/${functionObj.functionRoute}" in ${
          end - start
        }ms`
      )
    } else {
      next()
    }
  }
}

export function functionMiddlewares(
  middlewareConfig: ICreateMiddlewareConfig
): Array<RequestHandler> {
  const executeFunction = createExecuteFunctionMiddleware(middlewareConfig)

  return [
    multer().any(),
    urlencoded({ extended: true }),
    setCookies,
    text(),
    json(),
    raw(),
    executeFunction,
  ]
}
