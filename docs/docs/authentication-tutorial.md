---
title: Making a site with user authentication
---

Sometimes, you need to create a site with gated content, available only to authenticated users. Using Gatsby, you may achieve this using the concept of [client-only routes](https://www.gatsbyjs.org/docs/building-apps-with-gatsby/#client-only-routes),to define which pages an user can view only after logging in.

# Prerequisites

You should have already configured your environment to be able to use the gatsby-cli. A good starting point is the [main tutorial](https://www.gatsbyjs.org/tutorial/)

# Security notice

In production, you should use a tested and robust solution to handle the authentication. [Auth0](https://www.auth0.com), [Firebase](https://firebase.google.com), and [Passport.js](passportjs.org) are good examples. This tutorial will only cover the authentication workflow, but you should take the security of your app as seriously as possible.

# Building your Gatsby app

Start by creating a new Gatsby project:

```shell
gatsby new gatsby-auth
cd gatsby-auth
```

WIP

# Further reading

If you want to learn more about using production-ready auth solutions, these links may help:

- [Building a blog with Gatsby, React and Webtask.io!](https://auth0.com/blog/building-a-blog-with-gatsby-react-and-webtask/)
- [JAMstack PWA — Let’s Build a Polling App. with Gatsby.js, Firebase, and Styled-components Pt. 2](https://medium.com/@UnicornAgency/jamstack-pwa-lets-build-a-polling-app-with-gatsby-js-firebase-and-styled-components-pt-2-9044534ea6bc)
