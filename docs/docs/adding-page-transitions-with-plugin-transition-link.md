---
title: Using transition-link for Page Transitions
---

This guide will cover how to use `gatsby-plugin-transition-link` to animate transitions between pages on your Gatsby site.

## Overview

The `TransitionLink` component is a simple way of describing a page transition via props on a Link component. It works with many animation libraries, like [react-pose](https://popmotion.io/pose/), [gsap](https://greensock.com/), [animejs](https://animejs.com/), and many others.

Note that currently, as the plugin is based on link navigation, transitions when navigating with the browser buttons are not supported.

For other page transition options, see the [overview on adding page animations](/docs/adding-page-transitions).

## Getting started

First, install the plugin:

```shell
yarn add gatsby-plugin-transition-link
```

```shell
npm install --save gatsby-plugin-transition-link
```

Make sure to add the plugin to your `gatsby-config.js`:

```javascript:title=gatsby-config.js
module.exports = {
    plugins: [
      `gatsby-plugin-transition-link`
    ]
];
```

Finally, import the TransitionLink component wherever you want to use it:

```javascript
import TransitionLink from "gatsby-plugin-transition-link"
```

## Predefined transitions

The simplest way to start animating page transitions is using the `AniLink` component. It's a wrapper around `TransitionLink` that provides 4 predefined transitions: `fade`, `swipe`, `cover`, and `paintDrip`. You can preview them at [this demo site](https://gatsby-plugin-transition-link.netlify.com/).

To use AniLink, you will need to install the `gsap` animation library:

```shell
yarn add gsap
```

```shell
npm install --save gsap
```

Then, import the AniLink component:

```javascript
import AniLink from "gatsby-plugin-transition-link/AniLink"
```

Finally, make sure you provide your desired animation's name as a blank prop to `AniLink`:

```javascript
<AniLink paintDrip to="page-4">
  Go to Page 4
</AniLink>
```

Options like transition duration, direction, and more are customizable with props. See [the documentation of AniLink](https://transitionlink.tylerbarnes.ca/docs/anilink/) for more details.
