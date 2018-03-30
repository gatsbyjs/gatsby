# SEO with Gatsby

Gatsby offers several advantages to your site in search engine result placement. Some come out of the box, and some require light configuration.

### Server rendering

Because Gatsby pages are server-rendered, rather than client-rendered, the entire DOM tree is visible in the page source, and thus available to Google and all search indexes.

(You can see this by clicking "View Source" on this page).

### Speed boost

Gatsby's many built-in speed optimizations, such as rendering to static files, progressive image loading, and following the PRPL pattern, help your site be lightning-fast by default. 

Starting in January 2018, Google [gives faster sites a bump in search rankings](https://searchengineland.com/google-speed-update-page-speed-will-become-ranking-factor-mobile-search-289904) -- so using Gatsby gives your site a ranking boost, as well as a search boost.

### Page metadata

Storing elements such as page title and description in the metadata allows search engines to better index your content.

A common way to do this is to place a Helmet component from the [Gatsby React Helmet plugin](/packages/gatsby-plugin-react-helmet) in your layout element, and place metadata within the Helmet component.

Some examples:
* [Official GatsbyJS.org site](https://github.com/gatsbyjs/gatsby/blob/master/www/src/layouts/index.js)
* [Jason Lengstorf's personal website](https://github.com/jlengstorf/lengstorf.com/blob/master/src/components/SEO.js)

