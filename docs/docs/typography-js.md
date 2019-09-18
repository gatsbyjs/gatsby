---
title: Typography.js
---

## Using Typography.js in Gatsby

Typography.js is a JavaScript library that enables you to define and explore the typographic design of your website and define beautiful custom and pre-existing typographic themes. It limits the number of tedious changes you need to make to your website just to change the font. Typography.js currently maintains over 30 themes for you to use, however you can also define your own custom font themes if none of the available themes meet your requirements. Implementing Typography into your project involves specifying a configuration object for Typography and installing a Gatsby plugin.

## Installing the Typography plugin

Gatsby has the plugin `gatsby-plugin-typography` to assist with introducing Typography.js library into your project.

You can install the plugin and its peer dependencies into your project by running the command `npm install gatsby-plugin-typography react-typography typography --save`

After the installation of the plugin has completed, navigate to your `gatsby-config.js` file located in the root of your project's directory and add the plugin to the configuration:

```diff:title=gatsby-config.js
module.exports = {
siteMetadata: {
    title: 'Gatsby Default Starter',
},
plugins: [
+ {
+  resolve: `gatsby-plugin-typography`,
+  options: {
+    pathToConfigModule: `src/utils/typography`,
+  }
+ }
],
}
```

`gatsby-plugin-typography` takes two options for you to specify:

- **pathToConfigModule**: (string) The path to the file in which you export your typography configuration.
- **omitGoogleFont**: (boolean, default: false) Typography includes a helper that makes a request to Google’s font CDN for the fonts you
  need. You might, however, want to inject the fonts into JS or use a
  CDN of your choosing. Setting this value to true will make
  gatsby-plugin-typography skip the inclusion of this helper. You will
  have to include the appropriate fonts yourself.

## Creating the Typography configuration

Now that you have added the plugin, create the directory `src/utils/` if it does not already exist in your project and add a new file name `typography.js`. This file will be used to specify the typography configuration and used as the path for the `pathToConfigModule` option that the plugin requires.

Inside the `typography.js` file you just created, you can now define your websites typography configuration. A basic typography.js configuration looks like this:

```js:title=src/utils/typography.js
import Typography from "typography"

const typography = new Typography({
  baseFontSize: "18px",
  baseLineHeight: 1.666,
  headerFontFamily: [
    "Avenir Next",
    "Helvetica Neue",
    "Segoe UI",
    "Helvetica",
    "Arial",
    "sans-serif",
  ],
  bodyFontFamily: ["Georgia", "serif"],
})

export default typography
```

Font sizes of all elements in Typography.js grow and shrink in relation to the `baseFontSize` defined above. Try playing around with this value and see the visual difference it can make to your website.

A full list of options that can be specified when defining a new typography can be found at [Typography.js](https://kyleamathews.github.io/typography.js/).

## Installing Typography themes

Typography.js has some built in themes that can save time when defining your websites font styling. The Funston theme maintained by Typography is one such theme and can be installed from npm running the command: `npm install typography-theme-funston --save`

To use the theme, edit the `typography.js` file that you created before and inform typography of the new configuration:

```diff:title=src/utils/typography.js
import Typography from "typography";
+ import funstonTheme from 'typography-theme-funston'
const typography = new Typography(
- {
-     baseFontSize: '18px',
-     baseLineHeight: 1.666,
-     headerFontFamily: ['Avenir Next', 'Helvetica Neue', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
-     bodyFontFamily: ['Georgia', 'serif'],
- },
+ funstonTheme
);

export default typography;
```

After completing the above steps, you can start the development server using the command `gatsby develop` and navigate to the local website `http://localhost:8000`. If all went well you should see the text on your website using the Funston typographic theme just installed.

If you would like to find more themes to install into your project check out at the official [Typography.js](https://kyleamathews.github.io/typography.js/) website.
