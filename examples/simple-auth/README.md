# Gatsby Authentication Demo

This is a simplified demo to show how an authentication workflow is implemented in Gatsby.

The short version is:

* Gatsby statically renders all unauthenticated routes as usual
* Authenticated routes are whitelisted as client-only
* Logged out users are redirected to the login page if they attempt to visit private routes
* Logged in users will see their private content

## A Note About Security

This example is less about creating an example of secure, production-ready authentication, and more about showing Gatsby's ability to support dynamic content in client-only routes.

For production-ready authentication solutions, take a look at [Auth0](https://auth0.com) or [Passport.js](http://www.passportjs.org/). Rolling a custom auth system is hard and likely to have security holes. Auth0 and Passport.js are both battle tested and widely used.
