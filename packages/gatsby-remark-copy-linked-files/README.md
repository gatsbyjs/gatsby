# gatsby-remark-copy-linked-files

Copies files linked to from markdown to your `public` folder.

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
      plugins: [
        { 
          resolve: 'gatsby-remark-copy-linked-files',
        }
      ]
    }
  }
]
```

#### How to override which file types are ignored

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        { 
          resolve: 'gatsby-remark-copy-linked-files',
          options: {
            // This example ignores png and jpg files but if you don't want to ignore any file types, just specify an empty array
            ignoreFileExtensions: ['png', 'jpg'],
          },
        }
      ]
    }
  }
]
```

Then in your Markdown files, simply link to the file you desire to
reference.

E.g.

```markdown

---
title: My awesome blog post
---

Hey everyone, I just made a sweet PDF with lots of interesting stuff in
it.

[Download it now](my-awesome-pdf.pdf)
```

`my-awesome-pdf.pdf` should be in the same directory as the markdown
file. When you build your site, the file will be copied to the `public`
folder and the markdown HTML will be modified to point to it.

### Supported Markdown tags

- img
- link

### Supported HTML tags

- <img />
- <video />
- <a />
