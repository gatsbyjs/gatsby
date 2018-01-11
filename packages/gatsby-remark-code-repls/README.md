# gatsby-remark-code-repls

This plug-in adds support for generating links to popular REPLs, using code in
local files to populate the contents of the REPL. This enables example code to
be stored along side of, and revisioned with, your website content.

It currently supports:

* [Babel](https://babeljs.io/repl/)
* [Codepen](https://codepen.io/)
* [CodeSandbox](https://codesandbox.io/)
* [Ramda](http://ramdajs.com/repl)

This plug-in was created to solve a couple of problems the React team has faced
with [reactjs.org](https://github.com/reactjs/reactjs.org):

* Examples were stored separately from documentation (eg in Codepen) which made
  it more difficult to coordinate updates. (It was easy to forget to update an
  example when an API changes.)
* Examples (eg Codepens) were owned by a single author, so the community
  couldn't contribute PRs to update them without forking and fragmenting
  ownership.
* It was easy to create invalid links (eg Babel REPL links that \_don't quite
  work).

## Overview

For example, given the following project directory structure:

```
./examples/
├── components-and-props
│   ├── composing-components.js
│   ├── extracting-components.js
│   └── rendering-a-component.js
├── hello-world.js
├── introducing-jsx.js
```

These example files can be referenced via links in markdown that get transformed
to HTML links that open the embedded code examples in a REPL. For example:

```html
<!-- before -->
[See it in Babel](babel://hello-world)

<!-- after -->
<a href="https://babeljs.io/repl/#?presets=react&code_lz=...">
  See it in Babel
</a>

<!-- before -->
[Try it on CodePen](codepen://components-and-props/rendering-a-component)

<!-- after -->
<a href="/redirect-to-codepen/components-and-props/rendering-a-component">
  Try it on CodePen
</a>

<!-- before -->
[Try it on CodeSandbox](codesandbox://components-and-props/rendering-a-component)

<!-- after -->
<a href="https://codesandbox.io/api/v1/sandboxes/define?parameters=...">
  Try it on CodeSandbox
</a>
```

### How does it work?

Codepen links point to Gatsby pages (also created by this plug-in) that redirect
using the
[Codepen prefill API](https://blog.codepen.io/documentation/api/prefill/) to
create a working, runnable demo with the linked example code.

Babel and CodeSandbox links use the
[same URL compression schema used by the Babel REPL](https://github.com/babel/website/blob/c9dd1f516985f7267eb58c286789e0c66bc0a21d/js/repl/UriUtils.js#L22-L26)
to embed the local code example in a URL that enables it to be viewed directly
within the target REPL.

Ramda links use basic URL encoding to embed the local code example in a URL that
enables it to be viewed directly within Ramda's REPL.

All example links are also verified to ensure that they reference valid example
files. For example, if there is a link to
`codepen://components-and-props/rendering-a-component`, this plug-in will verify
that a file `components-and-props/rendering-a-component.js` exists within the
specified examples directory. (This will avoid broken links at runtime.)

## Installation

`npm install --save gatsby-remark-code-repls`

## Usage

```javascript
// In your gatsby-config.js
{
  resolve: 'gatsby-remark-code-repls',
  options: {
    // Optional default link text.
    // Defaults to "REPL".
    // eg <a href="...">Click here</a>
    defaultText: 'Click here',

    // Optional runtime dependencies to load from NPM.
    // This option only applies to REPLs that support it (eg CodeSandbox).
    // eg ['react', 'react-dom'] or ['react@15', 'react-dom@15']
    dependencies: [],

    // Example code links are relative to this dir.
    // eg examples/path/to/file.js
    directory: `${__dirname}/examples/`,

    // Optional externals to load from a CDN.
    // This option only applies to REPLs that support it (eg Codepen).
    // eg '//unpkg.com/react/umd/react.development.js'
    externals: [],

    // Optional HTML contents to inject into REPL.
    // Defaults to `<div id="root"></div>`.
    // This option only applies to REPLs that support it (eg Codepen, CodeSandbox).
    // eg '<div id="root"></div>'
    html: '',

    // Optional path to a custom redirect template.
    // The redirect page is only shown briefly,
    // But you can use this setting to override its CSS styling.
    redirectTemplate: `${__dirname}/src/redirect-template.js`),

    // Optional link target.
    // Note that if a target is specified, "noreferrer" will also be added.
    // eg <a href="..." target="_blank" rel="noreferrer">...</a>
    target: '_blank',
  },
},
```
