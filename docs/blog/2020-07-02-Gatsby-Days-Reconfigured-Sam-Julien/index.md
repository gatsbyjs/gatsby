---
title: "Gatsby Days Video: A Recipe to Power Up Your Gatsby Apps with Auth0"
date: 2020-07-02
author: Kat Huang
excerpt: "Gatsby Recipes help automate common site building tasks like automate package and plugin installation. Recipes can even generate pages and code! In his Gatsby Days presentation Sam Julien, Senior Developer Advocate Engineer at Auth0, walks viewers through building a Recipe to automatically set up authentication in a Gatsby site."
tags:
  - getting-started
  - gatsby-days
  - community
---

_After much thought and discussion, the Gatsby team has decided not to hold Virtual Gatsby Days in the way we originally planned. While we were very much looking forward to our first digital community gathering, we feel now is not the time to take attention and space away from the Black Lives Matter movement._

_Transforming Gatsby Days from a live event into a content series keeps the focus on more important events while sharing the amazing speakers and learning opportunities in a way the community can access when the time is right for each of us. All of the product and program announcements planned for Gatsby Days have been rolled up into [an initial blog post](https://www.gatsbyjs.org/blog/2020-06-23-Reconfiguring-Gatsby-Days/), and now we are following with a video series to present the speakers who had been scheduled to share their knowledge during the event. We hope you enjoy._ 💜

_We look forward to seeing you at our next Gatsby Days, planned for October, though it’s difficult to say right now exactly what form that will take. Follow [Gatsby on Twitter](https://twitter.com/gatsbyjs) to keep up with announcements around our fall Gatsby Days planning, calls for proposals, when registration starts, and other developments._

[Gatsby Recipes](https://www.gatsbyjs.org/docs/recipes/) are a tool that automates common site building tasks like creating pages and layouts, installing and setting up plugins, or setting up TypeScript, plus many more. Recipes can even generate pages and code! Sam Julien is a Senior Developer Advocate Engineer at Auth0 as well as an instructor for Thinkster and egghead. Sam’s Gatsby Days presentation walks viewers through building a Recipe to automatically set up authentication in a Gatsby site. Though many people discover Gatsby as a static site generator, Gatsby is a dynamic framework that allows for features like authentication. Does authentication work the same way as it does in React, though? Not quite.

https://www.youtube.com/watch?v=eMOnbgKRIYE

While demonstrating building his Recipe, Sam explains how to supply a default React Context object with mock values. This is so that Gatsby's build process, which generates static files, doesn't raise errors from failing to find a Context that the authentication code references. The recipe also uses `gatsby-browser.js` to wrap the authentication provider around the app, as well as `gatsby-node.js` to handle authentication libraries that rely on DOM API objects like `document` and `window`.
