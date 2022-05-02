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

Generally useful for file upload support or raw bodies.

Each function can export an object named `config`. This object will allow you to control the `body-parser` middleware used by Gatsby Functions. The `limit` property will allow configuration of payload size up to **_32mb_**.

### Examples

```js
// raw body (string)
export const config = {
  bodyParser: {
    text: {
      type: "*/*",
    },
  },
}
```

```js
// raw body (buffer)
export const config = {
  bodyParser: {
    raw: {
      type: "*/*",
    },
  },
}
```

```js
// limit payload to 10kb
export const config = {
  bodyParser: {
    json: {
      limit: "10kb",
    },
  },
}
```
