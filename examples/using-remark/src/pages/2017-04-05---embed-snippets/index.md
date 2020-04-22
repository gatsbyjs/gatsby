---
title: "Embed file contents within PrismJS blocks"
date: "2017-04-05"
draft: false
author: Daisy Buchanan
tags:
  - remark
  - Code Highlighting
  - embed snippets
---

You can embed the contents of existing files within your Markdown using the [`gatsby-remark-embed-snippet`][1] with [`gatsby-remark-prismjs`][2].

Let's start by displaying file contents as a highlighted code block, then see how to control line highlighting and visibility from within the source file.

## Embedding files

After installing the required plugins you can embed a file within your Markdown by using `embed` snippets. To embed the file `src/code-examples/plain.js` you could write the following:

<pre>`embed:plain.js`</pre>

This will look like:

`embed:plain.js`

## Highlight lines

You can highlight specific lines by adding special comments to the source file. Let's see how this works in `src/code-examples/highlight-lines.js`.

Take a look at the `highlight-line` comment on line 4 and the `highlight-range` comment on line 8:

```jsx{numberLines: true}
import React from "react"
import ReactDOM from "react-dom"

const name = `Brian` // highlight-line

ReactDOM.render(
  <div>
    {/* highlight-range{1-2} */}
    <h1>Hello, ${name}!</h1>
    <h2>Welcome to this example</h2>
  </div>,
  document.getElementById(`root`)
)
```

When the file is embedded with:

<pre>`embed:highlight-lines.js`</pre>

it will display like this:

`embed:highlight-lines.js`

## Hide lines

You can use similar comments to hide specific lines. Here's another example, this time using `src/code-examples/hide-lines.js`. Check out the `hide-line` comments on lines 1, 7, 13 and 14:

```jsx{numberLines: true}
/* hide-range{1-3} */
import React from "react"
import ReactDOM from "react-dom"

const name = `Brian`

// hide-next-line
ReactDOM.render(
  <div>
    <h1>Hello, ${name}!</h1>
    <h2>Welcome to this example</h2>
  </div>,
  document.getElementById(`root`) // hide-line
) // hide-line
```

Which will display like this:

`embed:hide-lines.js`

## All together now

You can mix line highlighting and hiding in the same file. This is from `src/code-examples/hide-and-highlight-lines.js`

```
/* hide-range{1-3} */
import React from "react"
import ReactDOM from "react-dom"

// highlight-next-line
const name = `Brian`

// highlight-range{4-5}
// hide-next-line
ReactDOM.render(
  <div>
    <h1>Hello, ${name}!</h1>
    <h2>Welcome to this example</h2>
  </div>,
  document.getElementById(`root`) // hide-line
) // hide-line
```

It'll look like this:

`embed:hide-and-highlight-lines.js`

## Related info

You've learnt how to embed the contents of existing files into your Markdown using [`gatsby-remark-embed-snippet`][1] with [`gatsby-remark-prismjs`][2]. Hurray!

If you'd prefer to write your code blocks directly within your Markdown, take a look at the example [Code and Syntax Highlighting with PrismJS][4].

[1]: https://www.gatsbyjs.org/packages/gatsby-remark-embed-snippet/
[2]: https://www.gatsbyjs.org/packages/gatsby-remark-prismjs/
[3]: http://prismjs.com/
[4]: /code-and-syntax-highlighting/
