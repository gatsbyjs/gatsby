# gatsby-remark-embed-snippet

Embeds the contents of specified files within Prism-formatted HTML blocks.

## Overview

### Embedding Files

For example, given the following project directory structure:

```
./examples/
├── sample-javascript-file.js
├── sample-html-file.html
```

The following markdown syntax could be used to embed the contents of these
files:

```md
# Sample JavaScript

`embed:sample-javascript-file.js`

# Sample HTML

`embed:sample-html-file.html`
```

The resulting HTML for the above markdown would look something like this:

```html
<h1>Sample JavaScript</h1>
<div class="gatsby-highlight">
  <pre class="language-jsx">
    <code>
      <!-- Embedded content here ... -->
    </code>
  </pre>
</div>

<h1>Sample HTML</h1>
<div class="gatsby-highlight">
  <pre class="language-html">
    <code>
      <!-- Embedded content here ... -->
    </code>
  </pre>
</div>
```

### Highlighting Lines

You can also specify specific lines for Prism to highlight using
`highlight-line` and `highlight-next-line` comments. You can also specify a
range of lines to highlight, relative to a `highlight-range` comment.

#### JavaScript example

```js
import React from "react";
import ReactDOM from "react-dom";

const name = "Brian"; // highlight-line

ReactDOM.render(
  <div>
    {/* highlight-range{1-3} */}
    <h1>Hello, ${name}!</h1>
  </div>,
  document.getElementById("root")
);
```

#### CSS example

```css
html {
  /* highlight-range{1-2} */
  height: 100%;
  width: 100%;
}

* {
  box-sizing: border-box; /* highlight-line */
}
```

#### HTML example

```html
<html>
  <body>
    <h1>highlight me</h1> <!-- highlight-line -->
    <p>
      <!-- highlight-next-line -->
      And me
    </p>
  </body>
</html>
```

#### YAML example

```yaml
foo: "highlighted" # highlight-line
bar: "not highlighted"
# highlight-range{1-2}
baz: "highlighted"
quz: "highlighted"
```

## Installation

`npm install --save gatsby-remark-embed-snippet`

## Usage

```javascript
// In your gatsby-config.js
{
  resolve: 'gatsby-remark-embed-snippet',
  options: {
    // Class prefix for <pre> tags containing syntax highlighting;
    // defaults to 'language-' (eg <pre class="language-js">).
    // If your site loads Prism into the browser at runtime,
    // (eg for use with libraries like react-live),
    // you may use this to prevent Prism from re-processing syntax.
    // This is an uncommon use-case though;
    // If you're unsure, it's best to use the default value.
    classPrefix: 'language-',

    // Example code links are relative to this dir.
    // eg examples/path/to/file.js
    directory: `${__dirname}/examples/`,
  },
},
```
