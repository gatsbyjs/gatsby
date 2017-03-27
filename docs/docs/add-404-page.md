---
title: "Add 404 Page"
---

Adding a 404 page is easy. Simply create a page that matches `/404*`. Most
often you'll just want to create a React component page at `pages/404.js`.

Gatsby ensures that your 404 page is outputted as `404.html` as many static
hosting platforms default to using this as your 404 error page. If you're
hosting your site another way, you'll need to setup a custom rule to serve
this file for 404 errors.
