---
title: Running a Gatsby Preview Server
---

When editing content in a CMS, it's great to see a preview of changes before they go live.

This can be accomplished by setting up a preview server with Gatsby, for which there are two options:

## Rolling your own Preview

Roughly, you can follow these steps to enable your own preview server:

- Run `gatsby develop` on a Node.js host like [Heroku](/docs/how-to/previews-deploys-hosting/deploying-to-heroku/) with the [ENABLE_GATSBY_REFRESH_ENDPOINT environment variable](/docs/how-to/local-development/environment-variables/#reserved-environment-variables) enabled. This will configure the develop server to re-source data when it receives a `POST` request to `/__refresh`.
- Then setup your CMS to ping this URL on the preview server whenever content is changed.

## Using Gatsby Cloud Preview

For a managed Preview server without having to create infrastructure yourself, try out [Gatsby Cloud](https://www.gatsbyjs.com/cloud). It's free for personal projects and single-purpose sites, with paid packages for a range of project and company needs.
