---
title: Examples
---

Like files becomes pages in `src/pages/*`, JavaScript and Typescript files in `src/api/*` become API functions.

For example, the following API function is accessible at `/api/hello-world`

```js:title=src/api/hello-world.js
export default function handler(req, res) {
  res.status(200).json({ hello: `world` })
}
```

## Typescript

API functions can be written in JavaScript or Typescript.

```ts:title=src/api/typescript.ts
import { GatsbyAPIFunctionResponse, GatsbyAPIFunctionRequest } from "gatsby"

export default function handler(
  req: GatsbyAPIFunctionRequest,
  res: GatsbyAPIFunctionResponse
) {
  res.send(`I am TYPESCRIPT`)
}
```

## Common data formats are automatically parsed

Query strings and common body content types are automatically parsed and available at `req.query` and `req.body`

Read more about [included middlewares](/docs/how-to/api-functions/middleware-and-helpers).

```ts:title=src/api/contact-form.ts
import { GatsbyAPIFunctionResponse, GatsbyAPIFunctionRequest } from "gatsby"

export default function contactFormHandler(
  req: GatsbyAPIFunctionRequest,
  res: GatsbyAPIFunctionResponse
) {
  // Fields subject, body, fromEmail from a contact form
  // are available on req.body
}
```

## Create REST-ful APIs with dynamic routes

- `/api/users` => `src/api/users/index.js`
- `/api/users/23` => `src/api/users/[id].js`

[Learn more about dynamic routes](/docs/how-to/api-functions/routing#dynamic-routes)

## Respond to HTTP Methods

```ts:title=src/api/method-example.ts
import { GatsbyAPIFunctionResponse, GatsbyAPIFunctionRequest } from "gatsby"

export default function contactFormHandler(
  req: GatsbyAPIFunctionRequest,
  res: GatsbyAPIFunctionResponse
) {
  if (req.method === `POST`) {
    res.send(`I am POST`)
  } else {
    // Handle other methods or return error
  }
}
```

## Environment variables

Site [environment variables](/docs/how-to/local-development/environment-variables) are securely available in your API functions.

```ts:title=src/api/users/[id].ts
import fetch from "node-fetch"
import { GatsbyAPIFunctionResponse, GatsbyAPIFunctionRequest } from "gatsby"

export default async function contactFormHandler(
  req: GatsbyAPIFunctionRequest,
  res: GatsbyAPIFunctionResponse
) {
  // POST data from an authenticated API
  const url = "https://example.com"

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.CLIENT_TOKEN}`,
  }

  const data = {
    name: req.body.name,
    occupation: req.body.occupation,
    age: req.body.age,
  }

  try {
    const result = await fetch(url, {
      method: "POST",
      headers: headers,
      body: data,
    }).then(res => {
      return res.json()
    })

    res.json(result)
  } catch (e) {
    res.status(500).send(result)
  }
}
```
