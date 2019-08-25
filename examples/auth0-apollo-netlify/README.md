# Auth0 Apollo Netlify Example

Authenticate your GraphQL server with Apollo and Netlify functions, backed with Auth0 for authentication.

Client side authentication is done with [Swizec's](https://github.com/Swizec) brilliant [useAuth](https://github.com/Swizec/useAuth) hook! Please read through the documentation there to understand the app flow!

All requests to the Apollo server are authed "server" side using `jsonwebtoken` and `jwks-rsa` modules. This means that all requests require prior authentication on the client, you can change to use directives if you prefer.

## Stack

- Gatsby
- Apollo
- Auth0

## Requirements

### An Auth0 Account

You'll need to set up an [Auth0](https://auth0.com) account with an active application (they're free!) and grab the domain and client id as listed below.

### Environment Variables

You'll need

`AUTH0_DOMAIN` - Auth0 authentication endpoint, available from Auth0 settings panel.
`AUTH0_CLIENT_ID` - Client ID for the Auth0 app, available from the Auth0 app.

### A Netlify Account

Also free! Create an account [here](https://netlify.com)

## To Run

**Using this Netlify cli tool requires you to set env variables within your netlify account, they are then pulled down on to your local development environment when running `netlify dev`**

This example uses the [netlify-cli](https://github.com/netlify/cli) tool for development, it enables you to have client and lambda functions running within a proxy that mimics the production environment when deplpoyed to netlify.

This enables you to not have to manually proxy requests to the Apollo hander!

Install netlify-cli globally:

```
yarn global add netlify-cli
```

then start the netlify dev environment

```
netlify dev
```

This will create a server on `localhost:8888`, all GraphQL requests are proxied via the host to a lambda server run in the background.

## Playground

There are two playgrounds available in this project:

- Gatsby at `http://localhost:8888/__playground`, this is exclusively for gatsby data
- ApolloServer at `http://localhost:8888/.netlify/functions/graphql-server/__playground` - this is for your Apollo data, currently you need a valid jwt to access.
