/*
  Vendored from the cookie npm package (v0.6.0), used only by the generated
  function handler in ../lambda-v2.ts to parse the cookie request header.

  Vendoring avoids resolving cookie from node_modules at runtime, which
  previously required special-casing npm/yarn hoisting, monorepo workspaces,
  and pnpm's virtual store layout. Since this file ships as part of
  gatsby-adapter-netlify's own dist/, its location relative to the compiled
  lambda-v2.js is always known ahead of time.

  Copyright(c) 2012-2014 Roman Shtylman
  Copyright(c) 2015 Douglas Christopher Wilson
  MIT Licensed - https://github.com/jshttp/cookie/blob/v0.6.0/LICENSE
*/

/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */

// eslint-disable-next-line no-control-regex
const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/

/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 */

export function parse(
  str: string,
  options?: { decode?: (val: string) => string }
): Record<string, string> {
  if (typeof str !== `string`) {
    throw new TypeError(`argument str must be a string`)
  }

  const obj: Record<string, string> = {}
  const opt = options || {}
  const dec = opt.decode || decode

  let index = 0
  while (index < str.length) {
    const eqIdx = str.indexOf(`=`, index)

    // no more cookie pairs
    if (eqIdx === -1) {
      break
    }

    let endIdx = str.indexOf(`;`, index)

    if (endIdx === -1) {
      endIdx = str.length
    } else if (endIdx < eqIdx) {
      // backtrack on prior semicolon
      index = str.lastIndexOf(`;`, eqIdx - 1) + 1
      continue
    }

    const key = str.slice(index, eqIdx).trim()

    // only assign once
    if (undefined === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim()

      // quoted values
      if (val.charCodeAt(0) === 0x22) {
        val = val.slice(1, -1)
      }

      obj[key] = tryDecode(val, dec)
    }

    index = endIdx + 1
  }

  return obj
}

interface ISerializeOptions {
  encode?: (val: string) => string
  maxAge?: number
  domain?: string
  path?: string
  expires?: Date
  httpOnly?: boolean
  secure?: boolean
  partitioned?: boolean
  priority?: `low` | `medium` | `high`
  sameSite?: boolean | `lax` | `strict` | `none`
}

/**
 * Serialize data into a cookie header.
 *
 * Serialize the a name value pair into a cookie string suitable for
 * http headers. An optional options object specified cookie parameters.
 *
 * serialize('foo', 'bar', { httpOnly: true })
 *   => "foo=bar; httpOnly"
 */

export function serialize(
  name: string,
  val: string,
  options?: ISerializeOptions
): string {
  const opt = options || {}
  const enc = opt.encode || encode

  if (typeof enc !== `function`) {
    throw new TypeError(`option encode is invalid`)
  }

  if (!fieldContentRegExp.test(name)) {
    throw new TypeError(`argument name is invalid`)
  }

  const value = enc(val)

  if (value && !fieldContentRegExp.test(value)) {
    throw new TypeError(`argument val is invalid`)
  }

  let str = name + `=` + value

  if (null != opt.maxAge) {
    const maxAge = opt.maxAge - 0

    if (isNaN(maxAge) || !isFinite(maxAge)) {
      throw new TypeError(`option maxAge is invalid`)
    }

    str += `; Max-Age=` + Math.floor(maxAge)
  }

  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError(`option domain is invalid`)
    }

    str += `; Domain=` + opt.domain
  }

  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError(`option path is invalid`)
    }

    str += `; Path=` + opt.path
  }

  if (opt.expires) {
    const expires = opt.expires

    if (!isDate(expires) || isNaN(expires.valueOf())) {
      throw new TypeError(`option expires is invalid`)
    }

    str += `; Expires=` + expires.toUTCString()
  }

  if (opt.httpOnly) {
    str += `; HttpOnly`
  }

  if (opt.secure) {
    str += `; Secure`
  }

  if (opt.partitioned) {
    str += `; Partitioned`
  }

  if (opt.priority) {
    const priority =
      typeof opt.priority === `string`
        ? opt.priority.toLowerCase()
        : opt.priority

    switch (priority) {
      case `low`:
        str += `; Priority=Low`
        break
      case `medium`:
        str += `; Priority=Medium`
        break
      case `high`:
        str += `; Priority=High`
        break
      default:
        throw new TypeError(`option priority is invalid`)
    }
  }

  if (opt.sameSite) {
    const sameSite =
      typeof opt.sameSite === `string`
        ? opt.sameSite.toLowerCase()
        : opt.sameSite

    switch (sameSite) {
      case true:
        str += `; SameSite=Strict`
        break
      case `lax`:
        str += `; SameSite=Lax`
        break
      case `strict`:
        str += `; SameSite=Strict`
        break
      case `none`:
        str += `; SameSite=None`
        break
      default:
        throw new TypeError(`option sameSite is invalid`)
    }
  }

  return str
}

/**
 * URL-decode string value. Optimized to skip native call when no %.
 */

function decode(str: string): string {
  return str.indexOf(`%`) !== -1 ? decodeURIComponent(str) : str
}

/**
 * URL-encode value.
 */

function encode(val: string): string {
  return encodeURIComponent(val)
}

/**
 * Determine if value is a Date.
 */

function isDate(val: unknown): val is Date {
  return (
    Object.prototype.toString.call(val) === `[object Date]` ||
    val instanceof Date
  )
}

/**
 * Try decoding a string using a decoding function.
 */

function tryDecode(str: string, decode: (val: string) => string): string {
  try {
    return decode(str)
  } catch {
    return str
  }
}

export default { parse, serialize }
