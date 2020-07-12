# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.10](https://github.com/gatsbyjs/gatsby/compare/gatsby-design-tokens@2.0.9...gatsby-design-tokens@2.0.10) (2020-07-03)

### Bug Fixes

- **gatsby-design-tokens:** Add border definitions to theme ([#25486](https://github.com/gatsbyjs/gatsby/issues/25486)) ([7efdbd3](https://github.com/gatsbyjs/gatsby/commit/7efdbd3))

## [2.0.9](https://github.com/gatsbyjs/gatsby/compare/gatsby-design-tokens@2.0.8...gatsby-design-tokens@2.0.9) (2020-06-29)

### Bug Fixes

- **gatsby-design-tokens:** yarn run watch broken ([#25369](https://github.com/gatsbyjs/gatsby/issues/25369)) ([e563a2e](https://github.com/gatsbyjs/gatsby/commit/e563a2e))

## [2.0.8](https://github.com/gatsbyjs/gatsby/compare/gatsby-design-tokens@2.0.7...gatsby-design-tokens@2.0.8) (2020-06-24)

**Note:** Version bump only for package gatsby-design-tokens

## [2.0.7](https://github.com/gatsbyjs/gatsby/compare/gatsby-design-tokens@2.0.6...gatsby-design-tokens@2.0.7) (2020-06-22)

### Bug Fixes

- **docs:** change bash to shell in code language blocks ([#22899](https://github.com/gatsbyjs/gatsby/issues/22899)) ([6b6b2f2](https://github.com/gatsbyjs/gatsby/commit/6b6b2f2))

## [2.0.6](https://github.com/gatsbyjs/gatsby/compare/gatsby-design-tokens@2.0.5...gatsby-design-tokens@2.0.6) (2020-05-20)

**Note:** Version bump only for package gatsby-design-tokens

## [2.0.5](https://github.com/gatsbyjs/gatsby/compare/gatsby-design-tokens@2.0.4...gatsby-design-tokens@2.0.5) (2020-04-18)

**Note:** Version bump only for package gatsby-design-tokens

## [2.0.4](https://github.com/gatsbyjs/gatsby/compare/gatsby-design-tokens@2.0.3...gatsby-design-tokens@2.0.4) (2020-03-23)

**Note:** Version bump only for package gatsby-design-tokens

## [2.0.3](https://github.com/gatsbyjs/gatsby/compare/gatsby-design-tokens@2.0.2...gatsby-design-tokens@2.0.3) (2020-03-16)

**Note:** Version bump only for package gatsby-design-tokens

## [2.0.2](https://github.com/gatsbyjs/gatsby/compare/gatsby-design-tokens@2.0.1...gatsby-design-tokens@2.0.2) (2020-02-20)

### Features

- **gatsby-design-tokens:** Add "Inter" font stack ([#21598](https://github.com/gatsbyjs/gatsby/issues/21598)) ([b870db9](https://github.com/gatsbyjs/gatsby/commit/b870db9))

### BREAKING CHANGES

- **gatsby-design-tokens:** `fonts.sans` now delivers the "Inter" font stack, not the `system` font stack anymore
  fix: `fonts.sans` and `.brand` aliases

## [2.0.1](https://github.com/gatsbyjs/gatsby/compare/gatsby-design-tokens@2.0.0...gatsby-design-tokens@2.0.1) (2020-02-11)

**Note:** Version bump only for package gatsby-design-tokens

### Bug Fixes

- fix(gatsby-design-tokens): Fix `files` field in `package.json`: `dist` now includes `index.esm.js` and the two `dist/theme`s; before it only offered the main CommonJS module ([8c0d55c](https://github.com/gatsbyjs/gatsby/commit/8c0d55c))

# [2.0.0](https://github.com/gatsbyjs/gatsby/compare/gatsby-design-tokens@1.0.10...gatsby-design-tokens@2.0.0) (2020-02-10)

### Features

- **gatsby-design-tokens:** v2 ([#21240](https://github.com/gatsbyjs/gatsby/issues/21240)) ([f754fc2](https://github.com/gatsbyjs/gatsby/commit/f754fc2))

#### Tokens

This update moves the rudimentary tokens even closer to our current sole target, CSS. This e.g. means that instead of exporting an array of integers for `fontSizes` or `space`, we now provide `rem` values instead (while still making the v1 variants available — but we do have "soft" preferences regarding default units for CSS, which are emphasized by these breaking changes).

We currently only consume these tokens in the context of CSS, so let's make things a bit easier there:

- `fontsSizes` exports `rem` values now; old values available at `fontSizesRaw`
- `space` exports `rem` values now, too; old stuff available at `spaceRaw`
- `fonts` exports a string now, ready to be used with the `font-family` CSS prop; old array of font family names available as `fontsLists`
- `radii` now contains the `px` unit

The update also embraces `theme-ui` a bit more directly by partially adopting and/or inheriting its naming conventions for a bunch of tokens, making "theme composition using token groups" even easier than before.

Regarding the discussion in https://github.com/gatsby-inc/gatsby-interface/issues/181, everything but the `space` scale has been adjusted to hopefully "just work", or work easier than before. The update to v2 of `gatsby-design-tokens` should require almost no refactoring of values in `gatsby-interface` —

- the `transition` properties partially follow a different naming convention
- `fonts.header` changed to `fonts.heading`
- `radii` values now come with the `px` unit, so the latter is not needed anymore in template literals

— and apart from that should be solved by removing the transformation of `fontSizes` and `spaces` `to`rem`, and the`join`of`fonts` stacks.

Here's all changes listed by "token group":

##### `breakpoints`

- BREAKING CHANGE: Remove `breakpoints.xxs`
  - All tokens started as only being consumed via `styled-system`. In its context, and using an object to define breakpoints, `breakpoints.xxs` made sense/was required. Since we switched to `theme-ui`, it doesn't anymore. `gatsby-interface` defines its own set of `breakpoints`; the `www` source already adjusted this when composing its `theme-ui`theme, so this shouldn't hurt at all.
- feat: add export `breakpointsArray`, ready for `theme-ui`'s [responsive styles](https://theme-ui.com/getting-started/#responsive-styles) feature

##### `colors`

- feat: add missing steps in `colors.blackFade` and `colors.whiteFade`:
  - add `colors.blackFade[90]`
  - add `colors.blackFade[40]`
  - add `colors.blackFade[20]`
  - add `colors.blackFade[5]`
  - add `colors.whiteFade[90]`
  - add `colors.whiteFade[40]`
  - add `colors.whiteFade[20]`
  - add `colors.whiteFade[5]`
- BREAKING CHANGE: fix `colors.blackFade[80]`, `colors.whiteFade[80]`
  - both were set to an opacity of `.85`, adjusted to `.8`
  - TODO: Adjust a couple of values for gatsbyjs.org; no clue about where we currently might use this in `gatsby-interface` and related (.com/Cloud dashboard).
- feat: port `colors.code` from the gatsbyjs.org `theme-ui` theme to the `colors` tokens
  - 💚 This improves compliance with WCAG 2.0 AA color contrasts.
- feat: add `colors.code.copyButton`
- feat: add `colors.code.lineHighlightBackground`
- feat: add `colors.code.scrollbarTrack`

##### `fonts`

- feat: Add aliases `body` and `sans` for `fonts.system`
- BREAKING CHANGE: rename `fonts.header` to `fonts.heading`
  - Comply with `theme-ui` requirements: https://theme-ui.com/theme-spec#typography.
- feat: Add alias `brand` for `fonts.heading`
- BREAKING CHANGE: `fonts` exports a string now, ready to be used with the `font-family` CSS prop; the array of font family names is still available as `fontsLists`

##### `fontSizes`

- BREAKING CHANGE: `fontSizes` does now contain `rem` values; old scale (integers) still available as `fontSizesRaw`
- feat: add export `fontSizesPx`

##### `fontWeights`

- BREAKING CHANGE: Name `fontWeights` — switch from array to object
  - Include the required theme-ui defaults `body`, `heading`, and `bold` (https://theme-ui.com/theme-spec#typography).
  - `body: 400`
  - `semiBold: 600`
  - `bold: 700`
  - `heading: 700`
  - `extraBold: 800`

##### `lineHeights`

- feat: Add line heights `heading` (equivalent to the existing `dense`) and `body` (equivalent to the existing `default`) to satisfy `theme-ui`'s ["Typography" theme requirements](https://theme-ui.com/theme-spec/#typography)

##### `radii`

- BREAKING CHANGE: Add `px` unit to radii scale values.

##### `sizes`

- BREAKING CHANGE: removed
  - As discussed in https://github.com/gatsby-inc/gatsby-interface/issues/181, this moves the current gatsbyjs.org-centric `sizes` tokens to `theme-gatsbyjs-org` for clarity, until a clear pattern emerges.

##### `space`

- BREAKING CHANGE: `space` does now contain `rem` values; old scale (integers) still available as `spaceRaw`
- feat: add export `spacePx`

##### `transition`

- feat: Add `transition.default` shortcut
- feat: Add `transition.curve.fastOutLinearIn` from `gatsby-interface`
- feat: Add `transition.speed.faster` (`50ms`), matching `gatsby-interface`'s `blink`
- feat: Add `transition.speed.slower` (`1000ms`), matching `gatsby-interface`'s `snail`
- BREAKING CHANGE: change `transition.speed.slow` from `350ms` to `500ms`, now matching `gatsby-interface`

##### `zIndices`

- BREAKING CHANGE: removed
  - As discussed in https://github.com/gatsby-inc/gatsby-interface/issues/181, this moves the current gatsbyjs.org-centric `zIndices` tokens to `theme-gatsbyjs-org`for clarity, until a clear pattern emerges.

#### Themes

- feat: add base `theme-ui` Gatsby theme, gatsbyjs.org `theme-ui` theme
  - Both themes don't tree-shake yet, so no `agadoo` yet in the corresponding `gatsby-design-tokens/package.json` scripts.
  - Both export the `theme-ui` theme as `theme` and also provide individual token group exports (because we require them in `www` for usage outside of the `theme-ui` context).
  - Example usage:
    - `export { theme as default } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"` in `www/src/gatsby-plugin-theme-ui/index`
    - Directly import individual token groups with `import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"`.

## [1.0.10](https://github.com/gatsbyjs/gatsby/compare/gatsby-design-tokens@1.0.9...gatsby-design-tokens@1.0.10) (2019-10-14)

**Note:** Version bump only for package gatsby-design-tokens

## [1.0.9](https://github.com/gatsbyjs/gatsby/compare/gatsby-design-tokens@1.0.8...gatsby-design-tokens@1.0.9) (2019-10-04)

**Note:** Version bump only for package gatsby-design-tokens

## [1.0.8](https://github.com/gatsbyjs/gatsby/compare/gatsby-design-tokens@1.0.6...gatsby-design-tokens@1.0.8) (2019-09-26)

**Note:** Version bump only for package gatsby-design-tokens

## [1.0.7](https://github.com/gatsbyjs/gatsby/compare/gatsby-design-tokens@1.0.6...gatsby-design-tokens@1.0.7) (2019-09-26)

**Note:** Version bump only for package gatsby-design-tokens

## [1.0.6](https://github.com/gatsbyjs/gatsby/compare/gatsby-design-tokens@1.0.5...gatsby-design-tokens@1.0.6) (2019-09-20)

**Note:** Version bump only for package gatsby-design-tokens

## [1.0.5](https://github.com/gatsbyjs/gatsby/compare/gatsby-design-tokens@1.0.4...gatsby-design-tokens@1.0.5) (2019-09-18)

**Note:** Version bump only for package gatsby-design-tokens

## [1.0.4](https://github.com/gatsbyjs/gatsby/compare/gatsby-design-tokens@1.0.3...gatsby-design-tokens@1.0.4) (2019-09-09)

**Note:** Version bump only for package gatsby-design-tokens

## [1.0.3](https://github.com/gatsbyjs/gatsby/compare/gatsby-design-tokens@1.0.2...gatsby-design-tokens@1.0.3) (2019-09-01)

### Bug Fixes

- update minor updates in packages except react, babel and eslint ([#17254](https://github.com/gatsbyjs/gatsby/issues/17254)) ([252d867](https://github.com/gatsbyjs/gatsby/commit/252d867))

## [1.0.2](https://github.com/gatsbyjs/gatsby/compare/gatsby-design-tokens@1.0.1...gatsby-design-tokens@1.0.2) (2019-08-23)

**Note:** Version bump only for package gatsby-design-tokens

## [1.0.1](https://github.com/gatsbyjs/gatsby/compare/gatsby-design-tokens@1.0.0...gatsby-design-tokens@1.0.1) (2019-08-20)

**Note:** Version bump only for package gatsby-design-tokens

# [1.0.0](https://github.com/gatsbyjs/gatsby/compare/gatsby-design-tokens@0.0.2...gatsby-design-tokens@1.0.0) (2019-07-17)

**Note:** Version bump only for package gatsby-design-tokens

## [0.0.2](https://github.com/gatsbyjs/gatsby/compare/gatsby-design-tokens@0.0.1...gatsby-design-tokens@0.0.2) (2019-07-16)

**Note:** Version bump only for package gatsby-design-tokens

## 0.0.1 (2019-07-16)

### Features

- **gatsby-design-tokens:** add gatsby-design-tokens utility ([#15779](https://github.com/gatsbyjs/gatsby/issues/15779)) ([dded37d](https://github.com/gatsbyjs/gatsby/commit/dded37d)), closes [#15596](https://github.com/gatsbyjs/gatsby/issues/15596)
