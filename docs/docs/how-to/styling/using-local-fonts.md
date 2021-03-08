---
title: Using Local Fonts
---

If you have custom fonts hosted on your computer, Gatsby supports their use in your project. This guide covers how to add local fonts to your Gatsby site.

## Prerequisites

This guide uses the Gatsby [default starter](https://github.com/gatsbyjs/gatsby-starter-default) and a font file. Some common font file extensions are `.woff2`, `.ttf`, and `otf`.

## Using local fonts in Gatsby

Get started by using local fonts by adding them to your project. Copy the font file in your Gatsby project, for example, `src/fonts/fontname.woff2`.

**NOTE:** It’s recommended to limit custom font usage to only the essential needed for performance.

The Gatsby default starter project adds [browser safe font](https://developer.mozilla.org/en-US/docs/Learn/CSS/Styling_text/Fundamentals#Default_fonts) styling in the `layout.css` file.

```css:title=src/components/layout.css
body {
  color: hsla(0, 0%, 0%, 0.8);
  // highlight-next-line
  font-family: georgia, serif;
  font-weight: normal;
  word-wrap: break-word;
  font-kerning: normal;
}
```

You will need to create a new CSS rule to use your local font in your project. First, create a `typography.css` file and declare your `@font-face` selector.

```css:title=src/css/typography.css
@font-face {
  font-family: "Font Name";
  src: url("../fonts/fontname.woff2");
}
```

Next, import the `typography.css` file into `layout.css`. Add the `font-family` value in the appropriate CSS rules to adjust the styling.

```css:title=src/components/layout.css
// highlight-next-line
@import "../css/typography.css";

body {
  color: hsla(0, 0%, 0%, 0.8);
  // highlight-next-line
  font-family: "Font Name", georgia, serif;
  font-weight: normal;
  word-wrap: break-word;
  font-kerning: normal;
}
```

**NOTE:** If fonts are not updating by following the above, add the `font-family` value in your CSS file as needed.

## Other resources

- Check out the [Adding a Local Font](/docs/recipes/styling-css/#adding-a-local-font) Gatsby recipe.
