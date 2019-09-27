---
title: "Turning the Static Dynamic: Gatsby + Netlify Functions + Netlify Identity"
date: 2018-12-26
author: swyx
tags: ["gatsby-for-apps"]
excerpt: Gatsby is great for not only static sites but also traditional web applications. You can add authentication and serverless functionality and get up and running incredibly quickly with Netlify - here's how.
---

[In a recent Reactiflux interview](https://www.reactiflux.com/transcripts/gatsby-team/), the Gatsby team was asked this question:

> Q: What is one thing that Gatsby is capable of doing that might surprise some people? — ctlee

> A: Gatsby can be used to build fully dynamic sites, which surprises some people because of it’s label as a “static site generator”. It’s fully equipped to be a powerful alternative to create-react-app and other similar solutions with the addition of easy pre-rendering and perf baked in. — biscarch

Even though Dustin [recently wrote about Gatsby for Apps](/blog/2018-11-07-gatsby-for-apps/) and open sourced his [Gatsby Mail](https://gatsby-mail.netlify.com/) demo, I do still find people constantly having to explain that Gatsby is "not just for sites".

Today I'd like to show you how you can incrementally add functionality to a Gatsby static site with Netlify Functions, and then add authentication with Netlify Identity to begin a proper Gatsby app.

## Static-Dynamic is a spectrum

Why would you use something like Gatsby over Jekyll or Hugo or one of the [hundreds of Static Site Generators](https://www.staticgen.com/) out there? [There are many reasons](/blog/2018-2-27-why-i-upgraded-my-website-to-gatsbyjs-from-jekyll/), but one of the unique selling points is how Gatsby helps you build ["Static Progressive Web Apps"](/docs/progressive-web-app/#progressive-web-app) with React.

[Gatsby's ability to rehydrate](/docs/production-app/#dom-hydration) (what a delicious word!) the DOM means you can do incredibly dynamic things with JavaScript and React that would be much harder with legacy SSG's.

Let's say you have a typical static Gatsby site, like [gatsby-starter-default](/starters/gatsby-starter-default). You can `npm run build` it, and it spits out a bunch of HTML files. Great! I can host that for free!

Now your client comes to you and asks you to add some custom logic that needs to be executed on the server:

- Maybe you have third party API secrets you don't want to expose to your user.
- Maybe you need [a serverside proxy to get around CORS issues](https://developer.yahoo.com/javascript/howto-proxy.html?guccounter=1).
- Maybe you need to ping a database to check your inventory.

**Oh no! Now you have to rewrite everything and move to a Digital Ocean droplet!**

I'm kidding. No, you don't have to rewrite everything.

The beauty of serverless functions is that it is incrementally adoptable - **your site grows with your needs** - and with Gatsby you can rerender entire sections of your site based on live API data. Of course, the more you do this, the more resource intensive (in terms of bandwidth and computation) it can be, so there is a performance tradeoff. **Your site should be as dynamic as you need it to be, but no more.** Gatsby is perfect for this.

## 5 Steps to add Netlify Functions to Gatsby

Netlify Functions are a great low configuration solution for adding serverless functionality to your Gatsby site. You get 125,000 free calls a month - that's a function call every 20 seconds every day of the week, month, and year - and you can emulate them in local development with [`netlify-lambda`](https://github.com/netlify/netlify-lambda).

Let's walk through the steps:

1. **Install dependencies**: `npm install -D http-proxy-middleware netlify-lambda npm-run-all`
2. **Run function emulation alongside Gatsby**: replace your `scripts` in `package.json`:

```js
  "scripts": {
    "develop": "gatsby develop",
    "start": "run-p start:**",
    "start:app": "npm run develop",
    "start:lambda": "netlify-lambda serve src/lambda",
    "build": "gatsby build && netlify-lambda build src/lambda",
    "build:app": "gatsby build",
    "build:lambda": "netlify-lambda build src/lambda",
  },
```

When deploying to Netlify, `gatsby build` must be run before `netlify-lambda build src/lambda` or else your Netlify function builds will fail. To avoid this, do not set your build script command to `"build": "run-p build:**"` when you replace `scripts` in `package.json`. Doing so will run all build scripts in parallel. This will make it possible for `netlify-lambda build src/lambda` to run before `gatsby build`.

3. **Configure your Netlify build**: When serving your site on Netlify, `netlify-lambda` will now build each JavaScript/TypeScript file in your `src/lambda` folder as a standalone Netlify function (with a path corresponding to the filename). Make sure you have a Functions path in a `netlify.toml` file at root of your repository:

```toml
[build]
  Command = "npm run build"
  Functions = "lambda"
  Publish = "public"
```

For more info or configuration options (e.g. in different branches and build environments), check [the Netlify.toml reference](https://www.netlify.com/docs/netlify-toml-reference/).

**NOTE:** the `Command` specified in `netlify.toml` overrides the build command specified in your site's Netlify UI Build settings.

4. **Proxy the emulated functions for local development**: Head to `gatsby-config.js` and add this to your `module.exports`:

```jsx:title=gatsby-config.js
var proxy = require("http-proxy-middleware")

module.exports = {
  // for avoiding CORS while developing Netlify Functions locally
  // read more: https://www.gatsbyjs.org/docs/api-proxy/#advanced-proxying
  developMiddleware: app => {
    app.use(
      "/.netlify/functions/",
      proxy({
        target: "http://localhost:9000",
        pathRewrite: {
          "/.netlify/functions/": "",
        },
      })
    )
  },
  // ...
}
```

5. **Write your functions**: Make a `src/lambda` folder and write as many functions as you need. The only requirement is that each function must export a `handler`, although `netlify-lambda` helps you use webpack to bundle modules or you can [zip the functions yourself](https://www.netlify.com/blog/2018/09/14/forms-and-functions/#optional-zip-the-function-to-manage-dependencies). For example you can write `src/lambda/hello.js`:

```js
// For more info, check https://www.netlify.com/docs/functions/#javascript-lambda-functions
export function handler(event, context, callback) {
  console.log("queryStringParameters", event.queryStringParameters)
  callback(null, {
    // return null to show no errors
    statusCode: 200, // http status code
    body: JSON.stringify({
      msg: "Hello, World! " + Math.round(Math.random() * 10),
    }),
  })
}
```

Now you are ready to access this API from anywhere in your Gatsby app! For example, in any event handler or lifecycle method, insert:

```js
fetch("/.netlify/functions/hello")
  .then(response => response.json())
  .then(console.log)
```

and watch "Hello World!" pop up in your console. (I added a random number as well to show the endpoint is dynamic) If you are new to React, I highly recommend [reading through the React docs](https://reactjs.org/docs/handling-events.html) to understand where and how to insert event handlers so you can, for example, [respond to a button click](https://reactjs.org/docs/handling-events.html).

The local proxying we are doing is only for local emulation, eg it is actually running from `http://localhost:9000/hello` despite you hitting `/.netlify/functions/hello` in your Gatsby app. When you deploy your site to Netlify (either by [hooking your site up through Git through our Web UI](http://app.netlify.com/), or our l33t new [CLI](https://www.netlify.com/docs/cli/)), that falls away, and your functions -are- hosted on the same URL and "just works". Pretty neat!

## That's cool, but its not an app

So, yes, your site can now be more dynamic than any static site. It can hit any database or API. It runs rings around CORS (by the way, you can also use [Netlify Redirects](https://www.netlify.com/docs/redirects/) for that). But its not an _app_ app. Yet!

The key thing about web apps (and, let's face it, the key thing users really pay for) is they all have some concept of `user`, and that brings with it all manner of complication from security to state management to [role-based access control](https://www.netlify.com/docs/visitor-access-control/#role-based-access-controls-with-jwt-tokens). Entire routes need to be guarded by authentication, and sensitive content shielded from Gatsby's static generation. Sometimes there are things you -don't- want Google's spiders to see!

It's a different tier of concern, which makes it hard to write about in the same article as a typical Gatsby tutorial. But we're here to make apps, so let's bring it on!

## 5 Steps to add Netlify Identity and Authenticated Pages to Gatsby

1. **Enable Netlify Identity**: Netlify Identity doesn't come enabled by default. You'll have to head to your site admin (eg `https://app.netlify.com/sites/YOUR_AWESOME_SITE/identity`) to turn it on. [Read the docs](https://www.netlify.com/docs/identity/) for further info on what you can do, for example add Facebook or Google social sign-on!
2. **Install dependencies**: `npm install netlify-identity-widget gatsby-plugin-create-client-paths`
3. **Configure Gatsby**: for dynamic-ness!

```jsx:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-create-client-paths`,
      options: { prefixes: [`/app/*`] },
    },
    // ...
  ],
  // ... (including what you also wrote earlier)
}
```

4. **Write an authentication service**: `netlify-identity-widget` is a framework-agnostic overlay that ships with a nice signup/login UI. This gets you up and running the fastest, however if you need a smaller solution you may want to use the underlying [gotrue-js](https://github.com/netlify/gotrue-js), or [react-netlify-identity](https://github.com/sw-yx/react-netlify-identity) for a React Hooks solution.

Here's a usable example that stores your user in local storage:

```jsx:title=service/auth.js
import netlifyIdentity from "netlify-identity-widget"

export const isBrowser = () => typeof window !== "undefined"
export const initAuth = () => {
  if (isBrowser()) {
    window.netlifyIdentity = netlifyIdentity
    // You must run this once before trying to interact with the widget
    netlifyIdentity.init()
  }
}
export const getUser = () =>
  isBrowser() && window.localStorage.getItem("netlifyUser")
    ? JSON.parse(window.localStorage.getItem("netlifyUser"))
    : {}

const setUser = user =>
  window.localStorage.setItem("netlifyUser", JSON.stringify(user))

export const handleLogin = callback => {
  if (isLoggedIn()) {
    callback(getUser())
  } else {
    netlifyIdentity.open()
    netlifyIdentity.on("login", user => {
      setUser(user)
      callback(user)
    })
  }
}

export const isLoggedIn = () => {
  if (!isBrowser()) return false
  const user = netlifyIdentity.currentUser()
  return !!user
}

export const logout = callback => {
  netlifyIdentity.logout()
  netlifyIdentity.on("logout", () => {
    setUser({})
    callback()
  })
}
```

5. **Write your app**: Now, any sub paths in `src/pages/app` will be exempt from Gatsby static generation. To keep the dividing line between app and site crystal clear, I like to have all my dynamic Gatsby code in a dedicated `app` folder. This means you can use `@reach/router` with `netlify-identity-widget` to write a standard dynamic React app. Here's some sample code to give you an idea of how to hook them up:

```jsx:title=app.js
import React from "react"
import { Router } from "@reach/router" // comes with gatsby v2
import Layout from "../components/layout"
import NavBar from "./components/NavBar"
import Profile from "./profile"
import Main from "./main" // NOT SHOWN
import PrivateRoute from "./components/PrivateRoute"
import Login from "./login"

// remember everything in /app/* is dynamic now!
const App = () => {
  return (
    <Layout>
      <NavBar />
      <Router>
        <PrivateRoute path="/app/profile" component={Profile} />
        <PublicRoute path="/app">
          <PrivateRoute path="/" component={Main} />
          <Login path="/login" />
        </PublicRoute>
      </Router>
    </Layout>
  )
}
function PublicRoute(props) {
  return <div>{props.children}</div>
}

export default App
```

```jsx:title=components/NavBar.js
import React from "react"
import { Link, navigate } from "gatsby"
import { getUser, isLoggedIn, logout } from "../services/auth"

export default () => {
  const content = { message: "", login: true }
  const user = getUser()
  if (isLoggedIn()) {
    content.message = `Hello, ${user.user_metadata &&
      user.user_metadata.full_name}`
  } else {
    content.message = "You are not logged in"
  }
  return (
    <div
      style={{
        display: "flex",
        flex: "1",
        justifyContent: "space-between",
        borderBottom: "1px solid #d1c1e0",
        backgroundColor: "aliceblue",
      }}
    >
      <span>{content.message}</span>

      <nav>
        <span>Navigate the app: </span>
        <Link to="/app/">Main</Link>
        {` `}
        <Link to="/app/profile">Profile</Link>
        {` `}
        {isLoggedIn() ? (
          <a
            href="/"
            onClick={event => {
              event.preventDefault()
              logout(() => navigate(`/app/login`))
            }}
          >
            Logout
          </a>
        ) : (
          <Link to="/app/login">Login</Link>
        )}
      </nav>
    </div>
  )
}
```

```jsx:title=components/PrivateRoute.js
import React from "react"
import { isLoggedIn } from "../services/auth"
import { navigate } from "gatsby"

class PrivateRoute extends React.Component {
  componentDidMount = () => {
    const { location } = this.props
    if (!isLoggedIn() && location.pathname !== `/app/login`) {
      // If the user is not logged in, redirect to the login page.
      navigate(`/app/login`)
      return null
    }
  }

  render() {
    const { component: Component, location, ...rest } = this.props
    return isLoggedIn() ? <Component {...rest} /> : null
  }
}

export default PrivateRoute
```

```jsx:title=login.js
import React from "react"
import { navigate } from "gatsby"
import { handleLogin, isLoggedIn } from "./services/auth"

class Login extends React.Component {
  handleSubmit = () => handleLogin(user => navigate(`/app/profile`))
  render() {
    return (
      <>
        <h1>Log in</h1>
        <button onClick={this.handleSubmit}>log in</button>
      </>
    )
  }
}

export default Login
```

Phew that was a lot! but you should have a solid starting point for your app :)

## Bonus points: Authenticated Lambda Functions for your Gatsby App

Just like [every magic act has a pledge, a turn, and a prestige](<https://en.wikipedia.org/wiki/The_Prestige_(film)>), I have one last tidbit for you. [Nothing on the client-side is safe](https://stackoverflow.com/questions/50277192/react-security-concerns-restricted-pages-in-app), and although you can send along Netlify Identity user id's to your Netlify Function endpoints for authenticated access from your Gatsby App (for example in the body of a POST request), you'll never be truly sure if that flow is secure either from malicious users or snooping.

The best way to do authenticated actions inside serverless functions is to do it from inside the context of the function itself. Fortunately, [Netlify Identity and Functions work seamlessly together](https://www.netlify.com/docs/functions/#identity-and-functions). All you have to do is to send along the user's [JWT](https://jwt.io/) when hitting your endpoint:

```js
// in your gatsby app
const user = getUser()
fetch("/.netlify/functions/auth-hello", {
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: "Bearer " + user.token.access_token, // like this
  },
}).then(/* etc */)
```

And then inside a Lambda function, you can now access the `user` object:

```js
// more info: https://www.netlify.com/docs/functions/#identity-and-functions

// Note that `netlify-lambda` only locally emulates Netlify Functions, while `netlify-identity-widget` interacts with a real Netlify Identity instance. This means that `netlify-lambda` doesn't support Netlify Functions + Netlify Identity integration.

export function handler(event, context, callback) {
  if (context.clientContext) {
    const {
      user, // actual user info you can use for your serverless functions
    } = context.clientContext
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        msg: "auth-hello: " + Math.round(Math.random() * 10),
        user,
      }),
    })
  } else {
    console.log(`
    Note that netlify-lambda only locally emulates Netlify Functions,
    while netlify-identity-widget interacts with a real Netlify Identity instance.
    This means that netlify-lambda doesn't support Netlify Functions + Netlify Identity integration.
    `)
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        msg:
          "auth-hello - no authentication detected. Note that netlify-lambda doesn't locally emulate Netlify Identity.",
      }),
    })
  }
}
```

## Gatsby - Perfect for your next Hackathon

It's 5 steps each to turn your static Gatsby sites into dynamic, authenticated, fully serverless apps with Netlify's free tools. This makes Gatsby a perfect tool for your next app. If you're at a hackathon, short on time, or just like to see a full working demo, check any of the following links.

- **Code:** https://github.com/sw-yx/jamstack-hackathon-starter
- **Starter:** https://www.gatsbyjs.org/starters/jamstack-hackathon-starter
- **Live Demo:** https://jamstack-hackathon-starter.netlify.com/
