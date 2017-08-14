---
title: Customizing html.js
---

Gatsby uses a React component to render the `<head>` and other parts of the HTML
not part of Gatsby's React.js application.

Most sites should use the default `html.js` shipped with Gatsby. But if you need
to customize your site's html.js, simply copy the default one into your source
tree by running:

```shell
cp .cache/default-html.js src/html.js
```

And then making modifications as needed.

Note: the various props that are rendered into pages *are* required e.g. `headComponents`,
`preBodyComponents`, `body`, and `postBodyComponents`.
