# gatsby-remark-code-repls

Gatsby plugin to auto-generate links to popular REPLs like [Babel](https://babeljs.io/repl/) and [Codepen](https://codepen.io/).

This plug-in reads source code that is stored alongside your Gatsby site and passes it to the specified REPL when a user clicks the generated link.

## Install

`npm install --save gatsby-remark-code-repls`

## How to Use

```javascript
// In your gatsby-config.js
{
  resolve: 'gatsby-remark-code-repls',
  options: {
    defaultText: 'Click here', // (Optional) default link text
    directory: 'examples',     // Example code links are relative to this dir
    target: '_blank',          // (Optional) link target
  },
},
```