---
title: "Environment Variables"
---

## Environments and Environment Variables

You can provide environment variables to your site to customise its behavior in different environments.

First we need to distinguish between different types of Env variables.
There are env variables that are defined in special places intended to be used in different deployment environments. Let's call these “Project Env Vars”.
And there are true OS-level environment variables that might be used in command-line calls. Let's call these “OS Env Vars”.

In both cases we want to be able to access the relevant value of these variables for the environment we’re in.

By default gatsby supports only 2 environments:

- If you run `gatsby develop`, then you will be in the 'development' environment.
- If you run `gatsby build` or `gatsby serve`, then you will be in the 'production' environment.

If you want to define other environments then you'll need to do a little more work. See[ "Additional Environments" below](#additional-environments-staging-test-etc). You can also have a look at our [environment variables codesandbox](https://codesandbox.io/s/6w9jjrnnjn) while reading the examples below.

## Accessing Environment Variables in JavaScript

All of the Project and OS Env Vars are only directly available at build time, or
when Node.Js is running. They aren't immediately available at run time of the client code; they
need to be actively captured and embedded into our client-side JavaScript.
This is achieved during the build using Webpack's [DefinePlugin](https://webpack.js.org/plugins/define-plugin/).

Once the environment variables have been embedded into the client-side code, they are accessible from the
global variable `process.env`.
OS Env Vars are accessible in Node.js from the same `process.env` global variable.

Note that since these variables are embedded at build time, you will need to restart your dev server
or rebuild your site after changing them.

## Defining Environment Variables

### Client-side JavaScript

For Project Env Vars that you want to access in client-side browser JavaScript, you can define
an environment config file, `.env.development` and/or `.env.production`, in your root folder.
Depending on your active environment, the correct one will be found and its values embedded as environment variables in the
browser JavaScript.

In addition to these Project Environment Variables defined in `.env.*` files, you could also define
OS Env Vars. OS Env Vars which are prefixed with `GATSBY_` will become available in
browser JavaScript.

```text:title=.env.*
GATSBY_API_URL=https://dev.example.com/api
```

### Server-side Node.js

Gatsby runs several Node.js scripts at build time, notably `gatsby-config.js` and `gatsby-node.js`.
OS Env Vars will already be available when Node is running, so you can add environment variables the
normal ways e.g. by adding environment variables through your hosting/build tool, your OS, or when
calling Gatsby on the command line.

In Linux terminals this can be done with:

```shell
MY_ENV_VAR=foo npm run develop
```

In Windows it's a little more complex. [Check out this Stack Overflow article for some options](https://stackoverflow.com/questions/1420719/powershell-setting-an-environment-variable-for-a-single-command-only)

Project environment variables that you defined in the `.env.*` files will _NOT_ be immediately available
in your Node.js scripts. To use those variables, use NPM package [dotenv](https://www.npmjs.com/package/dotenv) to
examine the active `.env.*` file and attached those values,
It's already a dependency of Gatsby, so you can require it in your `gatsby-config.js` or `gatsby-node.js` like this:

```javascript:title=gatsby-config.js
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})
```

Now the variables are available on `process.env` as usual.

## Example

Please note that you shouldn't commit `.env.*` files to your source control and rather use options given by your CD provider (e.g. Netlify with its [build environment variables](https://www.netlify.com/docs/continuous-deployment/#build-environment-variables)).

```text:title=.env.development
GATSBY_API_URL=https://dev.example.com/api
API_KEY=927349872349798
```

```text:title=.env.production
GATSBY_API_URL=https://example.com/api
API_KEY=927349872349798
```

Note: since Gatsby uses the [Webpack DefinePlugin](https://webpack.js.org/plugins/define-plugin/) to make the environment variables available at runtime, they cannot be destructured from `process.env`; instead, they have to be fully referenced.
`GATSBY_API_URL` will be available to your site (Client-side and server-side) as `process.env.GATSBY_API_URL`.:

```jsx
// In any frontend code
render() {
  return (
    <div>
      <img src={`${process.env.GATSBY_API_URL}/logo.png`} alt="Logo" />
    </div>
  )
}
```

`API_KEY` will be available to your site (Server-side) as `process.env.API_KEY`. If you commit your `.env.*` file containing `API_KEY` to source control it would also be available on the client-side. However we **strongly** advise against that! You should prefix your variable with `GATSBY_` (as shown above) instead and Gatsby automatically makes it available in the browser context.

```js
// In any server-side code, e.g. gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-patronus`,
      options: {
        apiKey: process.env.API_KEY,
      },
    },
  ],
}
```

## Reserved Environment Variables:

> You can not override certain environment variables as some are used internally
> for optimizations during build

- `NODE_ENV`
- `PUBLIC_DIR`

Gatsby also allows you to specify another environment variable when running the local development server (e.g. `npm run develop`):

- `ENABLE_GATSBY_REFRESH_ENDPOINT`

If set to true, this will expose a `/__refresh` webhook that is able to receive `POST` requests to _refresh_ the sourced content. This exposed webhook can be triggered whenever remote data changes, which means you can update your data without re-launching the development server.

You can trigger this endpoint locally for example on Unix-based operating systems (like Ubuntu and MacOS) you can use `curl -X POST http://localhost:8000/__refresh`.

## Build Variables

Gatsby uses additional environment variables in the build step to fine-tune the outcome of a build. You may find these helpful for more advanced configurations, such as using [CI/CD](https://en.wikipedia.org/wiki/CI/CD) to deploy a Gatsby site.

For example, you can set `CI=true` as an environment variable to allow Gatsby's build script to tailor the terminal output to an automated deployment environment. Some CI/CD tooling may already set this environment variable. This is useful for limiting the verbosity of the build output for [dumb terminals](https://en.wikipedia.org/wiki/Computer_terminal#Dumb_terminals), such as terminal in progress animations.

Gatsby detects an optimal level of parallelism for the render phase of `gatsby build` based on the reported number of physical CPUs. For builds that are run in virtual environments, you may need to adjust the number of worker parallelism with the `GATSBY_CPU_COUNT` environment variable. See [Multi-core builds](https://www.gatsbyjs.org/docs/multi-core-builds/).

## Additional Environments (Staging, Test, etc)

As noted above `NODE_ENV` is a reserved environment variable in Gatsby as it is needed by the build system to make key optimizations when compiling React and other modules. For this reason it is necessary to make use of a secondary environment variable for additional environment support, and manually make the environment variables available to the client-side code.

You can define your own OS Env Var to track the active environment, and then to locate the relevant Project Env Vars to load. Gatsby itself will not do anything with that OS Env Var, but you can use it in `gatsby-config.js`.
Specifically, you can use `dotenv` and your individual OS Env Var to locate the `.env.myCustomEnvironment` file, and then use module.exports to store those Project Env Vars somewhere that the client-side JavaScript can access the values (via GraphQL queries).

For instance: if you would like to add a `staging` environment with a custom Google Analytics Tracking ID, and a dedicated `apiUrl`. You can add `.env.staging` at the root of your project with the following modification to your `gatsby-config.js`

### Example

```text:title=.env.staging
GA_TRACKING_ID="UA-1234567890"
API_URL="http://foo.bar"
```

```javascript:title=gatsby-config.js
let activeEnv =
  process.env.GATSBY_ACTIVE_ENV || process.env.NODE_ENV || "development"

console.log(`Using environment config: '${activeEnv}'`)

require("dotenv").config({
  path: `.env.${activeEnv}`,
})

module.exports = {
  siteMetadata: {
    title: "Gatsby Default Starter",
    apiUrl: process.env.API_URL,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: process.env.GA_TRACKING_ID,
        // Puts tracking script in the head instead of the body
        head: false,
        // Setting this parameter is optional
        anonymize: true,
        // Setting this parameter is also optional
        respectDNT: true,
      },
    },
  ],
}
```

This will then load the values from the relevant environment's `.env.*` file and make them available via GraphQL queries and the analytics plugin respectively.

Local testing of the `staging` environment can be done with:

```shell
GATSBY_ACTIVE_ENV=staging npm run develop
```
