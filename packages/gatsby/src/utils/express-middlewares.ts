import type { TrailingSlash } from "gatsby-page-utils"
import express from "express"

export const configureTrailingSlash =
  (option: TrailingSlash | undefined) =>
  (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void => {
    const method = req.method.toLocaleLowerCase()
    if (![`get`, `head`].includes(method)) {
      next()
      return
    }

    if (req?.path.split(`/`)?.pop()?.includes(`.`)) {
      // Path has an extension. Do not add slash.
      next()
      return
    }

    // Remove trailing slash
    if (
      req.path.length > 1 &&
      req.path.slice(-1) === `/` &&
      option === `never`
    ) {
      const query = req.url.slice(req.path.length)
      res.redirect(301, req.path.slice(0, -1) + query)
      return
    }

    // Add trailing slash
    if (
      req.path.length > 1 &&
      req.path.slice(-1) !== `/` &&
      option === `always`
    ) {
      const query = req.url.slice(req.path.length)
      res.redirect(301, `${req.path}/${query}`)
      return
    }

    next()
  }
