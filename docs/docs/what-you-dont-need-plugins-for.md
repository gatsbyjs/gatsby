---
title: What You Don't Need Plugins For
---

Most third-party functionality you want to add to your website will follow standard JavaScript and React.js patterns for importing packages and composing UIs. These do not require a Gatsby plugin!

Some examples:

- Importing JavaScript packages that provide general functionality, such as `lodash` or `axios`
- Integrating visualization libraries, such as `Highcharts` or `d3`.

As a general rule, you may use _any_ npm package you might use without Gatsby, with Gatsby. What plugins offer is a prepackaged integration into the core Gatsby APIs to save you time and energy, with minimal configuration. In the case of `Styled Components`, you could manually render the `Provider` component near the root of your application, or you could just use `gatsby-plugin-styled-components` which takes care of this step for you in addition to any other difficulties you may run into configuring Styled Components to work with server side rendering.
