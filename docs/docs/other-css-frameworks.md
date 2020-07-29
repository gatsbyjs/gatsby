---
title: Other CSS Frameworks
---

This guide provides a brief introduction and list of resources for some of the other popular styling libraries worth highlighting.

## How These Frameworks Were Chosen

The following criteria were used to determine which frameworks to include in this guide:

* It must work with React and Gatsby.
* It must impact the styling of a Gatsby site.
* It should be a commonly requested or searched in the Gatsby docs.
* It must consider accessibility and not promote UI anti-patterns.

## Bootstrap

Bootstrap is a widely used CSS and JS framework that was created at Twitter in 2010. It gained popularity for its support of responsive and mobile-first design.

Under the hood, Bootstrap uses [Sass](https://sass-lang.com/). Unlike other frameworks in this guide, Bootstrap does not provide React components directly. Instead, it provides a set of pre-built CSS class names like `"btn-primary"` or `"dropdown"` that you can use to style HTML elements.

If you're using Bootstrap v4 or older, many of the JavaScript components will require you to also install jQuery to work correctly. However, as of [Bootstrap v5](https://blog.getbootstrap.com/2020/06/16/bootstrap-5-alpha/), the framework no longer depends on jQuery.

**Browser-support warning:** Bootstrap v5 also dropped Internet Explorer support.

If you're interested in using Bootstrap and want to host the CSS and JS files yourself, you can install the [Boostrap npm package](https://www.npmjs.com/package/bootstrap). Alternatively, if you'd rather not host the files yourself, you can source them using the [Boostrap Content Delivery Network (CDN)](https://www.bootstrapcdn.com/).

* [Bootstrap documentation](https://getbootstrap.com/docs)
* [Bootstrap repo on GitHub](https://github.com/twbs/bootstrap)

## Chakra UI

Chakra UI is built on top of the [Emotion styling library](https://emotion.sh/docs/introduction). It uses [Styled System](https://styled-system.com/) style props to override individual CSS properties for a component. Chakra UI supports theme customization, provides a library of components, and comes with dark mode out of the box.

If you're interested in using Chakra UI, check out the [`gatsby-plugin-chakra-ui` documentation](/packages/gatsby-plugin-chakra-ui/?=chakra).

* [Chakra UI documentation](https://chakra-ui.com/getting-started)
* [Chakra UI repo on GitHub](https://github.com/chakra-ui/chakra-ui/)
* [Setting Up Chakra UI in a GatsbyJS App (YouTube)](https://www.youtube.com/watch?v=PjQHqDWnzGw)

## Grommet

Grommet is built on [Styled Components](https://styled-components.com/) and provides a library of modular, responsive components designed with a mobile-first approach. It also provides built-in support for the W3C [Web Content Accessibility Guidelines (WCAG) 2.1](http://www.w3.org/WAI/intro/wcag) specification.

For designers, the [Grommet Design Kit](https://github.com/grommet/design-kit) provides sticker sheets and templates for a number of popular design tools, including Sketch, Figma, and Adobe XD.

If you're interested in using Grommet, check out [Using Grommet with Gatsby (Hewlett Packard Enterprise)](https://developer.hpe.com/blog/using-grommet-with-gatsby).

* [Grommet component documentation](https://v2.grommet.io/components)
* [Grommet repo on GitHub](https://github.com/grommet/grommet)
* [Grommet component examples on Storybook](https://storybook.grommet.io/)

## Material UI

Material UI provides a library of components designed using Google's [Material Design guidelines](https://material.io/design/introduction). It also supports customizing theme elements like color, typography, and breakpoints.

If you're interested in using Material UI, check out the [`gatsby-plugin-material-ui` documentation](/packages/gatsby-plugin-material-ui/?=material%20ui).

* [Material UI documentation](https://material-ui.com/)
* [Material UI repo on GitHub](https://github.com/mui-org/material-ui)
* [Material UI example projects](https://material-ui.com/getting-started/example-projects/)
