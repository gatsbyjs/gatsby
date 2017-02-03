# Gatsby Link

A `<Link>` component for Gatsby that preloads resources on browsers
that don't yet support Service Workers.

It's a wrapper around [React Router's Link
component](https://github.com/ReactTraining/react-router/blob/6eeb7ad358f987520f5b519e48bdd31f725cbade/docs/API.md#link)
that adds enhancements specific to Gatsby. All props are passed through
to React Router's Link.

## Install

`npm install --save gatsby-link`

## How to use

```javascript
const Link = require('gatsby-link')

render () {
  <div>
    <Link
      to="/another-page/"
      activeStyle={{
        color: 'red'
      }}
  </div>
}
```
