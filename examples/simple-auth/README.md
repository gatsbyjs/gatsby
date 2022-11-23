# Gatsby Authentication Demo

This is a simplified demo to show how an authentication workflow is implemented in Gatsby.

The short version is:

- Gatsby statically renders all unauthenticated routes as usual
- Authenticated routes are allowed as client-only
- Logged out users are redirected to the login page if they attempt to visit private routes
- Logged in users will see their private content

## A Note About Security

This example is less about creating an example of secure, production-ready authentication, and more about showing Gatsby's ability to support dynamic content in client-only routes.

For production-ready authentication solutions, take a look at open-source solutions like [Passport.js](http://www.passportjs.org/) and [accounts-js](https://www.accountsjs.com/), or 3rd party identity providers like [Auth0](https://auth0.com), [Firebase Authentication](https://firebase.google.com/docs/auth), or [okta](https://developer.okta.com/blog/2020/02/18/gatsby-react-netlify), which may already have Gatsby themes or plugins. Rolling a custom auth system is [hard](https://hackernoon.com/your-node-js-authentication-tutorial-is-wrong-f1a3bf831a46) and likely to have security holes.
