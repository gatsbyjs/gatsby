/*!
 * serve-static
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2014-2016 Douglas Christopher Wilson
 * MIT Licensed
 */

"use strict"

/**
 * Module dependencies.
 * @private
 */

var parseUrl = require(`parseurl`)
var sysPath = require(`path`)
var resolve = require(`path`).resolve
var send = require(`send`)

/**
 * Module exports.
 * @public
 */

module.exports = serveStatic
module.exports.mime = send.mime

/**
 * @param {string} root
 * @param {object} [options]
 * @return {function}
 * @public
 */

function serveStatic(root, options) {
  if (!root) {
    throw new TypeError(`root path required`)
  }

  if (typeof root !== `string`) {
    throw new TypeError(`root path must be a string`)
  }

  // copy options object
  var opts = Object.create(options || null)

  // fall-though
  var fallthrough = opts.fallthrough !== false

  // headers listener
  var setHeaders = opts.setHeaders

  if (setHeaders && typeof setHeaders !== `function`) {
    throw new TypeError(`option setHeaders must be function`)
  }

  // setup options for send
  opts.maxage = opts.maxage || opts.maxAge || 0
  opts.root = resolve(root)

  return function serveStatic(req, res, next) {
    if (req.method !== `GET` && req.method !== `HEAD`) {
      if (fallthrough) {
        return next()
      }

      // method not allowed
      res.statusCode = 405
      res.setHeader(`Allow`, `GET, HEAD`)
      res.setHeader(`Content-Length`, `0`)
      res.end()
      return null
    }

    var forwardError = !fallthrough
    var originalUrl = parseUrl.original(req)
    var path = parseUrl(req).pathname
    const parsedPath = sysPath.parse(path)
    console.log({ parsedPath })

    // Ignore html files.
    if (parsedPath.ext === `.htm` || parsedPath.ext === `.html`) {
      console.log(`ignoring html`)
      return next()
    }

    // make sure redirect occurs at mount
    if (path === `/` && originalUrl.pathname.substr(-1) !== `/`) {
      path = ``
    }

    // create send stream
    var stream = send(req, path, opts)

    // add file listener for fallthrough
    if (fallthrough) {
      stream.on(`file`, function onFile() {
        // once file is determined, always forward error
        forwardError = true
      })
    }

    // forward errors
    stream.on(`error`, function error(err) {
      if (forwardError || !(err.statusCode < 500)) {
        next(err)
        return
      }

      next()
    })

    // pipe
    stream.pipe(res)

    return null
  }
}
