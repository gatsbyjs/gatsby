---
title: Getting Started
examples:
  - label: Authenticate with Google Auth
    href: "https://github.com/gatsbyjs/gatsby/tree/master/examples/functions-google-auth"
  - label: Authenticate with Auth0
    href: "https://github.com/gatsbyjs/gatsby/tree/master/examples/functions-auth0"
  - label: Submit form to Airtable
    href: "https://github.com/gatsbyjs/gatsby/tree/master/examples/functions-airtable-form"
  - label: Send email with SendGrid
    href: "https://github.com/gatsbyjs/gatsby/tree/master/examples/functions-sendgrid-email"
  - label: Basic form that submits to a Function
    href: "https://github.com/gatsbyjs/gatsby/tree/master/examples/functions-basic-form"
---

Gatsby Functions help you build [Express-like](https://expressjs.com/) backends without running servers.

Functions are generally available in sites running Gatsby 3.7 and above.

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

## Headers

Only HTTP headers prefixed with `x-gatsby-` are passed into your functions.

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

## Forms

Forms and Functions are often used together. For a working example you can play with locally, see the [form example](https://github.com/gatsbyjs/gatsby/tree/master/examples/functions-basic-form). The [Forms doc page](/docs/how-to/adding-common-features/adding-forms/) is a gentle introduction for building forms in React. Below is sample code for a very simple form that submits to a function that you can use as a basis for building out forms in Gatsby.

```js:title=src/api/form.js
export default function formHandler(req, res) {
  // req.body has the form values
  console.log(req.body)

  // Here is where you would validate the form values and
  // do any other actions with it you need (e.g. save it somewhere or
  // trigger an action for the user).
  //
  // e.g.

  if (!req.body.name) {
    return res.status(422).json("Name field is required")
  }

  return res.json(`OK`)
}
```

```js:title=src/pages/form.js
import * as React from "react"

export default function FormPage() {
  const [value, setValue] = React.useState({})
  const [serverResponse, setServerResponse] = React.useState(``)

  // Listen to form changes and save them.
  function handleChange(e) {
    value[e.target.id] = e.target.value
    setServerResponse(``)
    setValue({ ...value })
  }

  // When the form is submitted, send the form values
  // to our function for processing.
  async function onSubmit(e) {
    e.preventDefault()
    const response = await window
      .fetch(`/api/form`, {
        method: `POST`,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(value),
      })
      .then(res => res.json())

    setServerResponse(response)
  }

  return (
    <div>
      <div>Server response: {serverResponse}</div>
      <form onSubmit={onSubmit} method="POST" action="/api/form">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          value={value[`name`] || ``}
          onChange={handleChange}
        />
        <input type="submit" />
      </form>
    </div>
  )
}
```

## Limitations

- Gatsby Functions do not support dynamic routes in Gatsby Cloud at the moment
- Bundling in native dependencies is not supported at the moment
