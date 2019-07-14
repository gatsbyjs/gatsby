---
title: SEO with Gatsby
---

Gatsby helps your site place better in search engines. Some advantages come out of the box and some require configuration.

### Server rendering

Because Gatsby pages are server-rendered, all the page content is available to Google and other search engines or crawlers.

You can see this by viewing the source for this page with `curl` (in your terminal):

```shell
curl https://www.gatsbyjs.org/docs/seo
```

`Right-Click => View source` won't show you the actual HTML (but the pages are still server-rendered!) as this site is using service workers. [Read these notes](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-offline#notes) to learn more.

### Speed boost

Gatsby's many built-in performance optimizations, such as rendering to static files, progressive image loading, and the [PRPL pattern](/docs/prpl-pattern/)—all help your site be lightning-fast by default.

Starting in January 2018, Google [rewards faster sites with a bump in search rankings](https://searchengineland.com/google-speed-update-page-speed-will-become-ranking-factor-mobile-search-289904).

### Page metadata

Adding metadata to pages, such as page title and description, helps search engines understand your content and when to show your pages in search results.

A common way to add metadata to pages is to add [react-helmet](https://github.com/nfl/react-helmet) components (together with the [Gatsby React Helmet plugin](/packages/gatsby-plugin-react-helmet) for SSR support) to your page components. Here's a [guide on how to add an SEO component](https://www.gatsbyjs.org/docs/add-seo-component/) to your Gatsby app.

Some examples using react-helmet:

- [Official GatsbyJS.org site](https://github.com/gatsbyjs/gatsby/blob/87ad6e81b9bd78b25d089434600750f5903baaee/www/src/components/package-readme.js#L16-L25)
- [Official GatsbyJS default starter](https://github.com/gatsbyjs/gatsby/blob/776dc1d6fe8d5ce7b5ea6d884736bb3c76280975/starters/default/src/components/seo.js)
- [Gatsby Mail](https://github.com/DSchau/gatsby-mail/blob/89b467e5654619ffe3073133ef0ae48b4d7502e3/src/components/meta.js)
- [Jason Lengstorf’s personal blog](https://github.com/jlengstorf/gatsby-theme-jason-blog/blob/e6d25ca927afdc75c759e611d4ba6ba086452bb8/src/components/SEO/SEO.js)
