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
    // Optional default link text.
    // eg <a href="...">Click here</a>
    defaultText: 'Click here',

    // Example code links are relative to this dir.
    // eg examples/path/to/file.js
    directory: 'examples',

    // Optional additional externals to load from CDN.
    // This option only applies to REPLs that support it (eg Codepen).
    // By default, only react and react-dom will be loaded.
    externals: [],

    // Optional path to a custom redirect template.
    // The redirect page is only shown briefly,
    // But you can use this setting to override its CSS styling.
    redirectTemplate: join(__dirname, 'src/redirect-template.js'),
    
    // Optional link target.
    // eg <a href="..." target="_blank">...</a>
    target: '_blank',
  },
},
```