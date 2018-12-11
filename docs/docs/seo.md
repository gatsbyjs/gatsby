---
title: SEO with Gatsby
---

Gatsby helps your site place better in search engines. Some advantages come out of the box and some require configuration.

### Server rendering

Because Gatsby pages are server-rendered, all the page content is available to Google and other search engines or crawlers.

(You can see this by viewing the source for this page).

### Speed boost

Gatsby's many built-in performance optimizations, such as rendering to static files, progressive image loading, and the [PRPL pattern](/docs/prpl-pattern/)—all help your site be lightning-fast by default.

Starting in January 2018, Google [rewards faster sites with a bump in search rankings](https://searchengineland.com/google-speed-update-page-speed-will-become-ranking-factor-mobile-search-289904).

### Page metadata

Add metadata to pages, such as page title and description, helps search engines understand your content and when to show your pages in search results.

A common way to add metadata to pages is to add [react-helmet](https://github.com/nfl/react-helmet) components (together with the [Gatsby React Helmet plugin](/packages/gatsby-plugin-react-helmet) for SSR support) to your page components.

Some examples using react-helmet:

- [Official GatsbyJS.org site](https://github.com/gatsbyjs/gatsby/blob/master/www/src/components/layout.js)
- [Jason Lengstorf's personal website](https://github.com/jlengstorf/lengstorf.com/blob/master/src/components/SEO/SEO.js)
- [Gatsby Mail](https://github.com/DSchau/gatsby-mail/blob/master/src/components/meta.js)
