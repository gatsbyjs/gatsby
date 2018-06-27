# gatsby-remark-custom-blocks

Adds custom blocks to `MarkdownRemark` using [remark-custom-blocks](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-custom-blocks).

## Install

`npm install --save gatsby-remark-custom-blocks`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        {
          resolve: "gatsby-remark-custom-blocks",
          options: {
            blocks: {
              danger: "custom-block-danger",
              info: "custom-block-info",
            },
          },
        },
      ],
    },
  },
]
```

Use the following Markdown syntax to create blocks in your file:

```
[[danger]]
| content

[[info]]
| content
```

This will wrap your contents in `div`s with the corresponding classes:

```html
<div class="custom-block-danger">
  <p>content</p>
</div>

<div class="custom-block-info">
  <p>content</p>
</div>
```
