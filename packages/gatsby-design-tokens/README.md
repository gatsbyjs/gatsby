# gatsby-design-tokens

Design tokens for Gatsby's design system.

Design tokens originated at Salesforce—quoting the [Lightning Desing System Design Tokens documentation](https://www.lightningdesignsystem.com/design-tokens/):

> Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes. We use them in place of hard-coded values (such as hex values for color or pixel values for spacing) in order to maintain a scalable and consistent visual system for UI development.

Gatsby's design tokens are following the [System UI Theme Specification](https://system-ui.com/theme/).  
They are not fully complying to the design token abstraction and are (initially) primarily focused on CSS/JS development – i.e. a potential _output_ from design tokens.

They also are a work-in-progress but we _do_ follow the [Semantic Versioning](https://semver.org/) specification. As such:

- Minor fixes to tokens will be released as patch versions
- Major design changes will be released as minor versions
- _Breaking_ public API changes will be released in a major versions only

So to prevent your site from breaking due to a breaking change or looking dramatically different due to a minor version bump, we recommend the [~](https://docs.npmjs.com/misc/semver#tilde-ranges-123-12-1) comparator when using this package

## Installation

Using [npm](https://www.npmjs.com/):

```console
npm install gatsby-design-tokens --save
```

Using [Yarn](https://yarnpkg.com/):

```console
yarn add gatsby-design-tokens
```

## Usage

Find a work-in-progress list of design tokens in the design tokens documentation at [gatsbyjs.org/guidelines/design-tokens](https://www.gatsbyjs.org/guidelines/design-tokens/).

```js
import {
  borders,
  breakpoints,
  colors,
  fonts,
  fontSizes,
  fontWeights,
  letterSpacings,
  lineHeights,
  mediaQueries,
  radii,
  shadows,
  sizes,
  space,
  transition,
  zIndices,
} from "gatsby-design-tokens"
```
