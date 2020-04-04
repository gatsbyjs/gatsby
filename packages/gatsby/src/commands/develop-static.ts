import * as path from "path"
import * as express from "express"
import { ServeStaticOptions } from "serve-static"
import parseUrl from "parseurl"

export function developStatic(
  root: string,
  options: ServeStaticOptions
): express.Handler {
  const expressStatic = express.static(root, options)

  return function (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): typeof expressStatic | void {
    if ([`GET`, `HEAD`].includes(req.method)) {
      const p = parseUrl(req).pathname
      const searchElement = path.parse(p).ext

      if ([`.htm`, `.html`].includes(searchElement)) {
        return next()
      }
    }

    return expressStatic(req, res, next)
  }
}
