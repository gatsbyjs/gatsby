---
title: Getting Started
examples:
  - label: Authenticate with Google Auth
    href: "https://example.com"
  - label: Authenticate with Auth0
    href: "https://example.com"
  - label: Submit form to Airtable
    href: "https://example.com"
  - label: Send email with SendGrid
    href: "https://example.com"
---

Gatsby Functions help you build [Express-like](https://expressjs.com/) backends without running servers.

Functions are currently in beta and can be enabled by adding the `FUNCTIONS` flag to your `gatsby-config.js` to sites running Gatsby 3.4 and above. [Learn more and join the discussion](https://github.com/gatsbyjs/gatsby/discussions/30735).

## Hello World

JavaScript and Typescript files in `src/api/*` are mapped to function routes like files in `src/pages/*` become pages.

For example, the following Function is run when you visit the URL `/api/hello-world`

```js:title=src/api/hello-world.js
export default function handler(req, res) {
  res.status(200).json({ hello: `world` })
}
```

A Function file must export a single function that takes two parameters:

- `req`: Node's [http request object](https://nodejs.org/api/http.html#http_class_http_incomingmessage) with some [automatically parsed data](/docs/how-to/functions/getting-started/#common-data-formats-are-automatically-parsed)
- `res`: Node's [http response object](https://nodejs.org/api/http.html#http_class_http_serverresponse) with some [extra helper functions](/docs/how-to/functions/middleware-and-helpers/#res-helpers)

Dynamic routing is supported for creating REST-ful APIs and other uses cases

- `/api/users` => `src/api/users/index.js`
- `/api/users/23` => `src/api/users/[id].js`

[Learn more about dynamic routes](/docs/how-to/functions/routing#dynamic-routing)

## Typescript

Functions can be written in JavaScript or Typescript.

```ts:title=src/api/typescript.ts
import { GatsbyFunctionRequest, GatsbyFunctionResponse } from "gatsby"

export default function handler(
  req: GatsbyFunctionRequest,
  res: GatsbyFunctionResponse
) {
  res.send(`I am TYPESCRIPT`)
}
```

## Common data formats are automatically parsed

Query strings and common body content types are automatically parsed and available at `req.query` and `req.body`

Read more about [supported data formats](/docs/how-to/functions/middleware-and-helpers).

```js:title=src/api/contact-form.js
export default function contactFormHandler(req, res) {
  // "req.body" contains the data from a contact form
}
```

## Respond to HTTP Methods

Sometimes you want to respond differently to GETs vs. POSTs or only respond
to one method.

```js:title=src/api/method-example.js
export default function handler(req, res) {
  if (req.method === `POST`) {
    res.send(`I am POST`)
  } else {
    // Handle other methods or return error
  }
}
```

## Environment variables

Site [environment variables](/docs/how-to/local-development/environment-variables) are used to pass secrets and environment-specific configuration to Functions.

```js:title=src/api/users/[id].js
import fetch from "node-fetch"

export default async function postNewPersonHandler(req, res) {
  // POST data to an authenticated API
  const url = "https://example.com/people"

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
  } catch (error) {
    res.status(500).send(error)
  }
}
```
