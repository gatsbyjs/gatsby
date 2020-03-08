import sysPath from "path"

import express from "express"
import parseUrl from "parseurl"

export const developStatic = (
  root: Parameters<typeof express.static>[0],
  options?: Parameters<typeof express.static>[1]
): ReturnType<typeof express.static> => (
  req,
  res,
  next
): ReturnType<ReturnType<typeof express.static>> => {
  if ([`GET`, `HEAD`].includes(req.method)) {
    const path = parseUrl(req).pathname
    const parsedPath = sysPath.parse(path)

    if ([`.htm`, `.html`].includes(parsedPath.ext)) {
      return next()
    }
  }

  return express.static(root, options)(req, res, next)
}
