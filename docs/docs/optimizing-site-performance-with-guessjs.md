---
title: Optimizing Site Performance with Guess.js
---

Preloading resources is a great way to improve application performance. However, preloading everything on a page can waste bandwidth. This is especially true for mobile phone users who may have limited data and bandwidth. So how do you know which resources to preload? Is it just a guessing game? Not anymore.

## Introducing Guess.js

By leveraging Google Analytics data and machine learning, [Guess.js](https://github.com/guess-js/guess) is able to determine which pages a user is most likely to navigate to from the current page and only preload those resources. Thus, there are fewer network requests which improves performance on slower networks.

## How does it work?

Guess.js will download a file from Google Analytics during the production build. This file is then used to construct the model for predictive analytics.

## Guess.js and Gatsby

See the [Gatsby Guess.js Plugin](/plugins/gatsby-plugin-guess-js) for more information on integrating Guess.js with Gatsby.

### References:

- [Introducing Guess.js](https://blog.mgechev.com/2018/05/09/introducing-guess-js-data-driven-user-experiences-web/)
- [Gatsby Plugin Guess.js](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-guess-js)
- [Cutting Edge Static Sites](https://www.contentful.com/blog/2018/06/13/journey-cutting-edge-static-sites-gatsbyjs-v2/)
