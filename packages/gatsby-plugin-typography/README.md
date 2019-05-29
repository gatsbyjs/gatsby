# gatsby-plugin-typography

A Gatsby plugin for utilizing the [Typography](https://kyleamathews.github.io/typography.js/) library with minimal configuration.

See it in action in the [Tutorial](https://www.gatsbyjs.org/tutorial/part-three/)
([source](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-typography))

## Install

`npm install --save gatsby-plugin-typography react-typography typography`

## Why to use

A typical `typography.js` file utilizing one of its themes might look like this:

```javascript
import Typography from "typography"
import grandViewTheme from "typography-theme-grand-view"

const typography = new Typography(grandViewTheme)

// Export helper functions
export const { scale, rhythm, options } = typography
export default typography
```

You then have to take the exported stylesheets and inline them in your entry file. Since a theme comes with two fonts, you also have to make sure you have the fonts available somehow.

By using `gatsby-plugin-typography` and specifying the path to your `typography.js` file via the `pathToConfigModule` option (see below), the inclusion of your typography styles _and_ any relevant fonts is taken care of by a pair of helper methods under the hood, keeping your typography-related config in a single location and your entry file sparse.

## How to use

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
  ],
}
```

## Options

- `pathToConfigModule`: (string) The path to the file in which you export your typography configuration.
- `omitGoogleFont`: (boolean, default: `false`) Typography includes [a helper](https://github.com/KyleAMathews/typography.js/blob/e7e71c82f63c7a146eb1b5ac7017695359dd9cba/packages/react-typography/src/GoogleFont.js) that makes a request to Google's font CDN for the fonts you need. You might, however, want to inject the fonts into JS or use a CDN of your choosing. Setting this value to `true` will make `gatsby-plugin-typography` skip the inclusion of this helper. **You will have to include the appropriate fonts yourself.**
