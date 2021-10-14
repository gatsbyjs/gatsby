---
title: Adding a 500 Page
---

To add a 500 page create a page whose path matches the regex `^\/?500\/?$` (`/500/`, `/500`, `500/` or `500`), most often you'll want to create a React component page at `src/pages/500.js`.

Users will see the 500 error page when runtime errors happen in the [`getServerData` function](/docs/reference/rendering-options/server-side-rendering/) of your page.

Gatsby ensures that your 500 page is built as `500.html`. [Gatsby Cloud](/products/cloud/) supports displaying this custom 500 page. If you're hosting your site another way you'll need to set up a custom rule to serve this file for 500 errors.

When developing using `gatsby develop`, you can still preview your 500 page by going to `localhost:8000/500`.
