---
title: Customizing html.js
---

Gatsby uses a React component to server render the `<head>` and other parts of
the HTML outside of the core Gatsby application.

Most sites should use the default `html.js` shipped with Gatsby. But if you need
to customize your site's html.js, copy the default one into your source
tree by running:

```shell
cp .cache/default-html.js src/html.js
```

And then making modifications as needed.

### Required props

Note: the various props that are rendered into pages _are_ required e.g.
`headComponents`, `preBodyComponents`, `body`, and `postBodyComponents`.

### React Helmet

Also anything you render in the `html.js` component will _not_ be made "live" in
the client like other components. If you want to dynamically update your
`<head>` we recommend using
[React Helmet](/packages/gatsby-plugin-react-helmet/)

### Target container

If you see this error: `Uncaught Error: _registerComponent(...): Target container is not a DOM element.` it means your `html.js` is missing the required
"target container". Inside your `<body>` you must have a div with an id of
`___gatsby` like:

```jsx
<div
  key={`body`}
  id="___gatsby"
  dangerouslySetInnerHTML={{ __html: this.props.body }}
/>
```

### Adding custom JavaScript

You can add custom JavaScript to your HTML document by using React's [dangerouslySetInnerHTML](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml) attribute.

```jsx
<script
  dangerouslySetInnerHTML={{
    __html: `
            var name = 'world';
            console.log('Hello ' + name);
        `,
  }}
/>
```
