# gatsby-remark-katex

[gatsby-remark-katex][1] adds math equation support to gatsby using
[remark-math][2] and [katex][3]. Live example at [using-remark.gatsbyjs.org/katex/](https://using-remark.gatsbyjs.org/katex/).

## Install

```shell
npm install gatsby-transformer-remark gatsby-remark-katex katex
```

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        {
          resolve: `gatsby-remark-katex`,
          options: {
            // Add any KaTeX options from https://github.com/KaTeX/KaTeX/blob/master/docs/options.md here
            strict: `ignore`
          }
        }
      ],
    },
  },
],
```

**Add Katex CSS to your template:** Katex's CSS file is required to render the formulas correctly. Include the CSS file in your template ([example][4]):

```javascript
require(`katex/dist/katex.min.css`)
```

### Math Equations in Inline Mode

Surround your equation with `$` to generate a math equation in inline mode.

**Example markdown:**

```markdown
$a^2 + b^2 = c^2$
```

### Math Equations in Display Mode

Surround your equation with `$$` and new-lines to generate a math equation in
display mode.

**Example markdown:**

```markdown
$$
a^2 + b^2 = c^2
$$
```

[1]: https://www.gatsbyjs.com/plugins/gatsby-remark-katex/
[2]: https://github.com/Rokt33r/remark-math
[3]: https://github.com/KaTeX/KaTeX
[4]: https://github.com/gatsbyjs/gatsby/blob/master/examples/using-remark/src/templates/template-blog-post.js
