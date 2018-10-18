---
title: "Environment Variables"
---

## Environments and Environment Variables

You can provide environment variables to your site to customise it's behaviour in different environments. 

Note that we need to distinguish in this discussion between variables which have been defined in
special places in order to be used in different deployment environments, and true OS-level 
environment variables that could be used in, for example, command-line calls.
We'll call the former "Project Environment Variables" and the latter "OS Environment Variables".
In both cases we want to be able to access the relavant value of these variable for the environment
we're in.

By default gatsby supports only 2 environments:

 * If you run `gatsby develop`, then you will be in the 'development' environment.
 * If you run `gatsby build` + `gatsby serve`, then you will be in the 'production' environment.
 
If you want to define other environments then you'll need to do a little more work. See 'Additional Environments' below.

## Accessing Environment Variables in JavaScript

All of the Project and OS Environment Variables are only directly available at build time, or
when Node.Js is running. They aren't immediately available at run time of the client code; they
need to be actively captured and embedded into our client-side JavaScript.
This is achieved during the build using Webpack's [DefinePlugin](https://webpack.js.org/plugins/define-plugin/).

Once the Environment Variables have been embedded into the client-side, they are accessible from the
global variable `process.env`.
OS Environment Variables are accessible in Node.js from the same `process.env` global variable.

Note that since these variables are embedded at build time, you will need to restart your dev server
or rebuild your site after changing them.

## Defining Environment Variables

#### Client-side JavaScript

For Project Enviroment Variables that you want to access in client-side browser JavaScript, you can define
an environment config file, `.env.development` and/or `.env.production`, in your root folder.
Depending on your active environment, the correct one will be found and its values embedded as EnvVars in the
browser JavaScript.

In addition to these Project Environment Variables defined in `.env.*` files, you could also define
OS Environment Variables. And such OS Env.Vars which are prefixed with `GATSBY_` will become available in
browser JavaScript.

#### Server-side Node.js

Gatsby runs several Node.js scripts at build time, notably `gatsby-config.js` and `gatsby-node.js`.
OS Env.Vars will already be available when Node is running, so you can add environment variables the
normal ways e.g. by adding environment variables through your hosting/build tool, your OS, or when
calling gatsby on the command line.

In Linux terminals, that is as simple as
```
MY_ENV_VAR=foo gatsby develop
```
In Windows, it's a little harder. https://stackoverflow.com/questions/1420719/powershell-setting-an-environment-variable-for-a-single-command-only documents some options.

However, the Project Env. Vars that you defined in the `.env.*` files will *NOT* be immediately available
in your Node.js scripts. To use those variables, use NPM package [dotenv](https://www.npmjs.com/package/dotenv) to
examine the active `.env.*` file and attached those values,
It's already a dependency of gatsby, so simply require it in your `gatsby-config.js` or `gatsby-node.js` like this:

```javascript:title=gatsby-config.js
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})
```

Now the variables are available on `process.env` as usual.

## Example

```shell
# Example .env.development file

API_URL=https://dev.example.com/api
```

```shell
# Example .env.production file

API_URL=https://example.com/api
```

These variables will be available to your site as `process.env.API_URL`:

```jsx
// usage
render() {
  return (
    <div>
      <img src={`${process.env.API_URL}/logo.png`} alt="Logo" />
    </div>
  )
}
```


## Reserved environment variables:
> You can not override certain environment variables as some are used internally
> for optimizations during build

- `NODE_ENV`
- `PUBLIC_DIR`

## Additional Environments (Staging, Test, etc)

As just noted `NODE_ENV` is a reserved environment variable in Gatsby as it is needed by the build system to make key optimizations when compiling React and other modules. For this reason it is necessary to make use of a secondary environment variable for additional environment support, and manually make the Env.Vars available to the client-side code.

You can define your own OS Environment Variable, to track the active environment, and then to locate the relevant Project Env.Vars to load. The Gatsby itself will not do anything with that OS Env.Var, but you can use it in `gatsby-config.js`.
Specifically, you can use `dotenv` and your individual OS Env.Var to locate the `.env.myCustomEnvironment` file, and then use module.exports to store those Project Environment Variables somewhere that the client-side Javascript can access the values (via `graphql` calls.

For instance. If you would like to add a `staging` environment with a custom Google Analytics Tracking ID, and a dedicated `apiUrl`. You can add `.env.staging` at the root of your project with the following modification to your `gatsby-config.js`

### Example

```shell
# .env.staging
GA_TRACKING_ID="UA-1234567890"
API_URL="http://foo.bar"
```

```javascript:title=gatsby-config.js
let activeEnv = process.env.ACTIVE_ENV || process.env.NODE_ENV || 'development'

console.log(`Using environment config: '${activeEnv}'`);

require("dotenv").config({
  path: `.env.${activeEnv}`,
})

module.exports = {
  siteMetadata: {
    title: "Gatsby Default Starter",
    apiUrl: process.env.GA_TRACKING_ID
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

This will then load the values from the relevant environment's `.env.*` file and use them in the graphql database and the analytics plugin respectively.

Note that `ACTIVE_ENV` could be called anything - it's not used or known about by anything else in Gatsby (as opposed to `NODE_ENV` which is, as previously discussed.

Local testing of the `staging` environment is as simple as:

```
ACTIVE_ENV=staging gatsby develop
```
