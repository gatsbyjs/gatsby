# gatsby-theme-blog-mdx

> :warning: This is experimental and subject to breaking changes.

## Installation

```sh
yarn add gatsby-theme-blog-mdx
```

## Usage

```js
// gatsby-config.js
module.exports = {
  return {
    __experimentalThemes: [
      {
        resolve: `gatsby-theme-blog-mdx`,
        options: {
          postsPath: `/writing`
        }
      }
    ]
  }
}
```

### Configuration

| Key            | Default | Description                                             |
| -------------- | ------- | ------------------------------------------------------- |
| `postsPath`    | `/blog` | Path for blog posts listings (`/blog`, `/blog/2`, etc.) |
| `postsPerPage` | `99999` | Number of posts on each page                            |
