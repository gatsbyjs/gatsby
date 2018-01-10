# gatsby-plugin-remove-trailing-slashes

This plugin removes trailing slashes from your project's paths. For
example, `yoursite.com/about/` becomes `yoursite.com/about`.

## Usage

Install:

```
yarn add --dev gatsby-plugin-remove-trailing-slashes
```

Then configure via `gatsby-config.js`.

```js
{
  ...
  plugins: [
    ...,
    `gatsby-plugin-remove-trailing-slashes`,
  ]
}
```

That's it.
