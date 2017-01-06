# Structure of a Gatsby Site

* `config.toml` - Core application configuration is stored here. Available via a `require`
or `import` of 'config'. Values:
  * `linkPrevix` - Defaults to `/`. If your site's root is hosted at `example.com/some-prefix/`, then you would set this to `/some-prefix/`.
  * `noProductionJavascript` - set to a truthy value to prevent generation of bundle.js
  (containing your client-side Single Page App) during a `gatbsy build`. You'll need
  to update your top-level `html.js` file so that it doesn't pull in `bundle.js` in
  production, but you'll want to keep it for `gatsby develop` mode.
* `/pages` - All pages go here. Everything is turned into a page except
files which start with an underscore:
  * `_template` files under `/pages` are treated as parent templates for other pages in
  the same directory tree.
  * (optional) `pages/404.js` or `pages/404.html` - automatically picked up as your 'not
  found' page. If you `<Link>` to an unknown URL, this page will be shown. Note: in
  production, you'll need to [set up your server host to show this page when it can't find
  the requested file](https://github.com/gatsbyjs/gatsby/pull/121#issuecomment-194715068).
* (optional) `gatsby-browser.js` - a way to hook into key application events. Export
`onRouteUpdate` of type `function()` to be notified whenever React-Router
navigates.
* (optional) `gatsby-node.js` - a way to hook into events during build
and development.
