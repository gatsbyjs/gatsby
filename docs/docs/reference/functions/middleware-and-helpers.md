---
title: Middleware and Helpers
---

Gatsby Functions provides an [Express-like](https://expressjs.com/) architecture that simplifies building
Node.js APIs. We include a number of middlewares to parse common request data as well as response helpers.

## Data formats

We parse commonly used data types. You can parse more by [adding custom middleware](#custom-middleware). Data available by default on the `req` object:

- Cookies at `req.cookies`
- URL Queries (e.g. `api/foo?query=foo`) at `req.query`
- Form parameters and data at `req.body`
- JSON POST bodies at `req.body`
- Files uploaded from forms at `req.files`

## Response helpers

- `res.send(body)` — returns the response. The `body` can be a `string`, `object`, or `buffer`
- `res.json(body)` — returns a JSON response. The `body` can be any value that can be serialized with `JSON.stringify()`
- `res.status(statusCode)` — set the [HTTP status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) for the response. Defaults to `200`.
- `res.redirect([statusCode], url)` — Returns a redirect to a URL. Optionally set the statusCode which defaults to `302`.

## Custom middleware

Custom Connect/Express middleware are supported.

An example of how to add CORS support to a Function:

```js:title=src/api/cors.js
import Cors from "cors"

const cors = Cors()

export default async function corsHandler(req, res) {
  // Run Cors middleware and handle errors.
  await new Promise((resolve, reject) => {
    cors(req, res, result => {
      if (result instanceof Error) {
        reject(result)
      }

      resolve(result)
    })
  })

  res.json(`Hi from Gatsby Functions`)
}
```

## Custom body parsing

> Support for overriding default config added in `gatsby@4.14.0`

By default, Gatsby is using following configuration defaults to parse request body and make it available as `req.body` field in appropriate format:

```js
 {
   bodyParser: {
     json: {
       type: "application/json",
       limit: "100kb"
     },
     raw: {
       type: "application/octet-stream",
       limit: "100kb"
     },
     text: {
       type: "text/plain",
       limit: "100kb"
     },
     urlencoded: {
       type: "application/x-www-form-urlencoded",
       limit: "100kb",
       extended: true
     }
   }
 }
```

Those settings work in most cases, but sometimes you might need to adjust them to cover your use case. Gatsby allows exporting an object named `config` from your function handler module. This object allows you to control the `body-parser` middleware used by Gatsby Functions. Gatsby currently supports the `limit`, `type`, and `extended` options for the `bodyParser` configuration, which are documented by [body-parser](https://expressjs.com/en/resources/middleware/body-parser.html). The `limit` property will allow configuration of payload size up to **32mb**.

### Examples

#### Accessing body as a `Buffer`

You can modify what `Content-type` particular `body-parser` middleware can act on. Following configuration will force every request to use `raw` parser and result in function handler receiving `req.body` as a `Buffer`. A setup like this is useful if you are looking to verify signature of webhooks (e.g. https://stripe.com/docs/webhooks/signatures).

```js:title=src/api/some-function.js
export const config = {
  bodyParser: {
    raw: {
      type: `*/*`,
    },
  },
}

export default function MyAPIFunction(req, res) {
  // req.body will be a Buffer, no matter what's the `Content-type` header on request
}
```

#### Increasing or decreasing the payload limit

By default, the limit is `100kb`. If the request body is larger than that it will result in automatic `413 Request Entity Too Large` response without executing function handler at all.

If your use case require a higher limit, you can bump it up in `config`.

```js:title=src/api/some-function.js
// limit payload to 10mb
export const config = {
  bodyParser: {
    json: {
      limit: `10mb`,
    },
  },
}
```

#### TypeScript (`config` object type)

You can import `GatsbyFunctionConfig` from `gatsby` to type your `config` export:

```ts:title=src/api/some-function.ts
import type { GatsbyFunctionConfig } from "gatsby"

export const config: GatsbyFunctionConfig = {
  bodyParser: {
    json: {
      limit: `10mb`,
    },
  },
}
```

### How `config` is applied

When using the `config` and changing the `type` on one of the body parser middlewares, it's important to realize that all body parser middlewares are still being applied with this specific order:

1. `raw`
1. `text`
1. `urlencoded`
1. `json`

Here's a concrete example:

If you want `json` to be used for all possible requests for a given function, it won't be enough to just set `type: "*/*"` for the `json` middleware. You also need to change the `type` for middlewares that are higher in priority, so they don't accidentally match and handle request before the `json` middleware can process it:

```js
export const config = {
  bodyParser: {
    raw: {
      type: `-`,
    },
    text: {
      type: `-`,
    },
    urlencoded: {
      type: `-`,
      extended: true,
    },
    json: {
      type: `*/*`,
    },
  },
}
```
