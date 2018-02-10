# using-page-loading-indicator

https://using-page-loading-indicator.gatsbyjs.org

The loading indicator only will show up in the production version of the site.

So first run `gatsby build` then `gatsby serve`.

Then you'll need to open up the chrome (or equivalent in other browsers)
devtools and go to the Network tab. There where it says "No throttling" along
the top, click that and use the "Slow 3G" preset (or an equivalent slow speed).

Then open the built site (generally at localhost:9000) and (important) wait
until the initial four JavaScript files are downloaded then click on the "Page
2" link and after a second, you'll see the nprogress bar along the top come in.
