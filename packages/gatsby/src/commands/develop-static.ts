import sysPath from "path"
import express from "express"
import { ServeStaticOptions } from "serve-static"
import parseUrl from "parseurl"

export function developStatic(
  root: string,
  options: ServeStaticOptions
): express.Handler {
  const expressStatic = express.static(root, options)

  return function(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): typeof expressStatic | void {
    if ([`GET`, `HEAD`].includes(req.method)) {
      const path = parseUrl(req).pathname
      const parsedPath = sysPath.parse(path)
      if ([`.htm`, `.html`].includes(parsedPath.ext)) {
        return next()
      }
    }

    return expressStatic(req, res, next)
  }
}
