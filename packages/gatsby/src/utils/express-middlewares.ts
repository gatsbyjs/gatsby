import type { TrailingSlash } from "gatsby-page-utils"
import express from "express"
import type { IGatsbyState } from "../redux/types"
import { findPageByPath } from "./find-page-by-path"

export const configureTrailingSlash =
  (getState: () => IGatsbyState, option: TrailingSlash | undefined) =>
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

    if (req.path.length <= 1) {
      next()
      return
    }

    // check if it's Gatsby Page
    const page = findPageByPath(getState(), req.path)

    if (page) {
      if (option === `never`) {
        if (req.path.slice(-1) === `/` && page.path !== req.path) {
          // Remove trailing slash
          const query = req.url.slice(req.path.length)
          res.redirect(301, req.path.slice(0, -1) + query)
          return
        } else {
          // express.static really doesn't like paths without trailing slashes
          // so we "rewrite" request to look like request with trailing slash
          // otherwise we'll have an infinite redirect loop. We did this because
          // express.static automatically adds the redirect trailing slash then
          const BASE = `http://localhost`
          const urlToMessWith = new URL(req.url, BASE)
          urlToMessWith.pathname += `/`

          // The incoming req.url is relative, so we remove the base again
          // we use new URL so that queries/hashes are handled automatically
          req.url = urlToMessWith.toString().replace(BASE, ``)
        }
      } else if (option === `always`) {
        if (req.path.slice(-1) !== `/` && page.path !== req.path) {
          // Add trailing slash
          const query = req.url.slice(req.path.length)
          res.redirect(301, `${req.path}/${query}`)
          return
        }
      }
    }

    next()
  }
