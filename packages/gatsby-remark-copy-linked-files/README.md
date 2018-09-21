# gatsby-remark-copy-linked-files

Copies local files linked to/from markdown to your `public` folder.

## Install

`npm install --save gatsby-remark-copy-linked-files`

## How to use

#### Basic usage

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: ["gatsby-remark-copy-linked-files"],
    },
  },
]
```

### How to change the directory the files are added to.

By default, all files will be copied to the root of the `public` dir, but you
can choose a different location using the `destinationDir` option. Provide a
path, relative to the `public` directory. The path must be within the public
directory, so `path/to/dir` is fine, but `../../dir` is not.

```
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        {
          resolve: 'gatsby-remark-copy-linked-files',
          options: {
            destinationDir: 'path/to/dir',
          }
        }
      ]
    }
  }
]
```

### How to override which file types are ignored

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        {
          resolve: "gatsby-remark-copy-linked-files",
          options: {
            // `ignoreFileExtensions` defaults to [`png`, `jpg`, `jpeg`, `bmp`, `tiff`]
            // as we assume you'll use gatsby-remark-images to handle
            // images in markdown as it automatically creates responsive
            // versions of images.
            //
            // If you'd like to not use gatsby-remark-images and just copy your
            // original images to the public directory, set
            // `ignoreFileExtensions` to an empty array.
            ignoreFileExtensions: [],
          },
        },
      ],
    },
  },
]
```

Then in your Markdown files, link to the file you desire to reference.

E.g.

```markdown
---
title: My awesome blog post
---

Hey everyone, I just made a sweet PDF with lots of interesting stuff in it.

[Download it now](my-awesome-pdf.pdf)
```

`my-awesome-pdf.pdf` should be in the same directory as the markdown file. When
you build your site, the file will be copied to the `public` folder and the
markdown HTML will be modified to point to it.

### Supported Markdown tags

- img
- link

### Supported HTML tags

- `<img />`
- `<video />`
- `<audio />`
- `<a />`
