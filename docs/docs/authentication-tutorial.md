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

Then, add a more apt title to your newly created site, changing the content of `gatsby-config.js`:

```javascript:title=gatsby-config.js
module.exports = {
  siteMetadata: {
    title: "Gatsby Authentication Tutorial",
  },
  plugins: ["gatsby-plugin-react-helmet", "gatsby-plugin-offline"],
}
```

## Authentication service

For this tutorial you will use a hardcode user/password. Create the folder `src/services` and add the follwing content to the file `auth.js`:

```javascript:title=src/services/auth.js
export const getUser = () =>
  window.localStorage.gatsbyUser
    ? JSON.parse(window.localStorage.gatsbyUser)
    : {}

const setUser = user => (window.localStorage.gatsbyUser = JSON.stringify(user))

export const handleLogin = ({ username, password }) => {
  if (username === `john` && password === `pass`) {
    return setUser({
      username: `john`,
      name: `Johnny`,
      email: `johnny@example.org`,
    })
  }

  return false
}

export const isLoggedIn = () => {
  const user = getUser()

  return !!user.username
}

export const logout = callback => {
  setUser({})
  callback()
}
```

## Creating client-only routes

Up until now, you created a common Gatsby site. But, using the [@reach/router](https://reach.tech/router/) library, you can create routes available only to logged-in users. This library is used by Gatsby under the hood, so you don't even have to install it.

First, edit `gatsby-node.js`. You will define that any route that starts with `/app/` is part of your restricted content and the page will be created on demand:

```javascript:title=gatsby-config.js
// Implement the Gatsby API “onCreatePage”. This is
// called after every page is created.
exports.onCreatePage = async ({ page, actions }) => {
  const { createPage } = actions

  // page.matchPath is a special key that's used for matching pages
  // only on the client.
  if (page.path.match(/^\/app/)) {
    page.matchPath = "/app/*"

    // Update the page.
    createPage(page)
  }
}
```

WIP

# Further reading

If you want to learn more about using production-ready auth solutions, these links may help:

- [Building a blog with Gatsby, React and Webtask.io!](https://auth0.com/blog/building-a-blog-with-gatsby-react-and-webtask/)
- [JAMstack PWA — Let’s Build a Polling App. with Gatsby.js, Firebase, and Styled-components Pt. 2](https://medium.com/@UnicornAgency/jamstack-pwa-lets-build-a-polling-app-with-gatsby-js-firebase-and-styled-components-pt-2-9044534ea6bc)
