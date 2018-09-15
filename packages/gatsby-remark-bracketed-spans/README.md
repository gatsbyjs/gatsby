# gatsby-remark-bracketed-spans

Adds attributes to span tags to `MarkdownRemark` using [remark-bracketed-spans](https://github.com/sethvincent/remark-bracketed-spans).

## Install

`npm install --save gatsby-remark-bracketed-spans`

## How to use

Leverage parser with syntax below:

```markdown
[text in span]{.class .other-class id=anything another=example}
```

And get the following html:

```html
<p><span class="class other-class" id="anything" data-another="example">text in span</span></p>
```

Here is an example of how you can add plugin to your `gatsby-config.js` file:

```javascript
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        "gatsby-remark-custom-blocks",
      ],
    },
  },
]
```
