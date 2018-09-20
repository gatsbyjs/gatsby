# gatsby-remark-prismjs

Adds syntax highlighting to code blocks in markdown files using
[PrismJS](http://prismjs.com/).

## Install

`npm install --save gatsby-transformer-remark gatsby-remark-prismjs prismjs`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        {
          resolve: `gatsby-remark-prismjs`,
          options: {
            // Class prefix for <pre> tags containing syntax highlighting;
            // defaults to 'language-' (eg <pre class="language-js">).
            // If your site loads Prism into the browser at runtime,
            // (eg for use with libraries like react-live),
            // you may use this to prevent Prism from re-processing syntax.
            // This is an uncommon use-case though;
            // If you're unsure, it's best to use the default value.
            classPrefix: "language-",
            // This is used to allow setting a language for inline code
            // (i.e. single backticks) by creating a separator.
            // This separator is a string and will do no white-space
            // stripping.
            // A suggested value for English speakers is the non-ascii
            // character '›'.
            inlineCodeMarker: null,
            // This lets you set up language aliases.  For example,
            // setting this to '{ sh: "bash" }' will let you use
            // the language "sh" which will highlight using the
            // bash highlighter.
            aliases: {},
            // This toggles the display of line numbers alongside the code.
            // To use it, add the following line in src/layouts/index.js
            // right after importing the prism color scheme:
            //  `require("prismjs/plugins/line-numbers/prism-line-numbers.css");`
            // Defaults to false.
            showLineNumbers: false,
          },
        },
      ],
    },
  },
]
```

### Include CSS

#### Required: Pick a PrismJS theme or create your own

PrismJS ships with a number of [themes][5] (previewable on the [PrismJS
website][6]) that you can easily include in your Gatsby site, or you can build
your own by copying and modifying an example (which is what we've done for
[gatsbyjs.org](https://gatsbyjs.org)).

To load a theme, just require its CSS file in your `gatsby-browser.js` file, e.g.

```javascript
// gatsby-browser.js
require("prismjs/themes/prism-solarizedlight.css")
```

#### Optional: Add line highlighting styles

If you want to highlight lines of code, you also need to add some additional CSS
that targets our _custom line highlighting implementation_ (which slightly
differs from PrismJS's own plugin for that – more on that later).

For line highlights similar to PrismJS's, try:

```css
.gatsby-highlight-code-line {
  background-color: #feb;
  display: block;
  margin-right: -1em;
  margin-left: -1em;
  padding-right: 1em;
  padding-left: 0.75em;
  border-left: 0.25em solid #f99;
}
```

This should work out quite nicely for the "Solarized Light" PrismJS theme we
just added in the previous part. However, you will notice that when a
highlighted line runs wider than the surrounding code block container (causing a
horizontal scrollbar), its background won't be drawn for the initially hidden,
overflowing part. :(

We saw others fix that problem and decided to do so, too. Just add the following
CSS along your PrismJS theme and the styles for `.gatsby-highlight-code-line`:

```css
/**
 * Add back the container background-color, border-radius, padding, margin
 * and overflow that we removed from <pre>.
 */
.gatsby-highlight {
  background-color: #fdf6e3;
  border-radius: 0.3em;
  margin: 0.5em 0;
  padding: 1em;
  overflow: auto;
}

/**
 * Remove the default PrismJS theme background-color, border-radius, margin,
 * padding and overflow.
 * 1. Make the element just wide enough to fit its content.
 * 2. Always fill the visible space in .gatsby-highlight.
 * 3. Adjust the position of the line numbers
 */
.gatsby-highlight pre[class*="language-"] {
  background-color: transparent;
  margin: 0;
  padding: 0;
  overflow: initial;
  float: left; /* 1 */
  min-width: 100%; /* 2 */
}
.gatsby-highlight pre[class*="language-"].line-numbers {
  padding-left: 2.8em; /* 3 */
}
```

#### Optional: Add line numbering

If you want to add line numbering alongside your code, you need to
import the corresponding CSS file from PrismJS, right after importing your
colorscheme in `layout/index.js`:

```javascript
// layouts/index.js
require("prismjs/plugins/line-numbers/prism-line-numbers.css")
```

### Usage in Markdown

This is some beautiful code:

    ```javascript
    // In your gatsby-config.js
    plugins: [
      {
        resolve: `gatsby-transformer-remark`,
        options: {
          plugins: [
            `gatsby-remark-prismjs`,
          ]
        }
      }
    ]
    ```

To see the line numbers alongside your code, you can use the `numberLines` option:

    ```javascript{numberLines: true}
    // In your gatsby-config.js
    plugins: [
      {
        resolve: `gatsby-transformer-remark`,
        options: {
          plugins: [
            `gatsby-remark-prismjs`,
          ]
        }
      }
    ]
    ```

You can also start numbering at any index you wish (here, numbering
will start at index 5):

    ```javascript{numberLines: 5}
    // In your gatsby-config.js
    plugins: [
      {
        resolve: `gatsby-transformer-remark`,
        options: {
          plugins: [
            `gatsby-remark-prismjs`,
          ]
        }
      }
    ]
    ```

You can also add line highlighting. It adds a span around lines of code with a
special class `.gatsby-highlight-code-line` that you can target with styles. See
this README for more info.

In the following code snippet, lines 1 and 4 through 6 will get the line
highlighting. The line range parsing is done with
<https://www.npmjs.com/package/parse-numeric-range>.

    ```javascript{1,4-6}
    // In your gatsby-config.js
    plugins: [
      {
        resolve: `gatsby-transformer-remark`,
        options: {
          plugins: [
            `gatsby-remark-prismjs`,
          ]
        }
      }
    ]
    ```

In addition to fenced code blocks, inline code blocks will be passed through
PrismJS as well.

If you set the `inlineCodeMarker`, then you can also specify a format style.

Here's an example of how to use this if the `inlineCodeMarker` was set to `±`:

    I can highlight `css±.some-class { background-color: red }` with CSS syntax.

This will be rendered in a `<code class=language-css>` with just the (syntax
highlighted) text of `.some-class { background-color: red }`

If you need to prevent any escaping or highlighting, you can use the `none`
language; the inner contents will not be changed at all.

## Implementation notes

### Line highlighting

Please note that we do _not_ use PrismJS's
[line highlighting plugin](http://prismjs.com/plugins/line-highlight/). Here's
why:

- [PrismJS plugins][3] assume you're running things client side, but we are
  _build-time folks_.
- PrismJS's line highlighting plugin [implementation][1] does not allow for
  solid background colors or 100% wide backgrounds that are drawn beyond the
  _visible part_ of the container when content is overflowing.

Our approach follows the [Pygments-based][2] implementation of the [React
Tutorial/Documentation][4] for line highlights:

- It uses a wrapper element `<div class="gatsby-highlight">` around the
  PrismJS-formatted `<pre><code>`-blocks.
- Highlighted lines are wrapped in `<span class="gatsby-highlight-code-line">`.
- We insert a linebreak before the closing tag of `.gatsby-highlight-code-line`
  so it ends up at the start of the following line.

With all of this in place, we can apply `float:left; min-width:100%` to `<pre>`,
throw our overflow and background on `.gatsby-highlight`, and use
`display:block` on `.gatsby-highlight-code-line` – all of this coming together
to facilitate the desired line highlight behavior.

### Line numbering

Because [the line numbering PrismJS plugin][7] runs client-side, a few adaptations were required to make it work:

- A class `.line-numbers` is dynamically added to the `<pre>` element.
- A new node `<span class="line-numbers-rows">` is added right before the closing `</pre>`
  containing as many empty `<span>`s as there are lines.

See the [client-side PrismJS implementation][8] for reference.

[1]: https://github.com/PrismJS/prism/tree/8eb0ab6f76484ca47fa7acbf77657fab17b03ca7/plugins/line-highlight
[2]: https://github.com/facebook/react/blob/00ba97a354e841701b4b83983c3a3904895e7b87/docs/_config.yml#L10
[3]: http://prismjs.com/#plugins
[4]: https://facebook.github.io/react/tutorial/tutorial.html
[5]: https://github.com/PrismJS/prism/tree/1d5047df37aacc900f8270b1c6215028f6988eb1/themes
[6]: http://prismjs.com/
[7]: https://prismjs.com/plugins/line-numbers/
[8]: https://github.com/PrismJS/prism/blob/master/plugins/line-numbers/prism-line-numbers.js#L69-L115
