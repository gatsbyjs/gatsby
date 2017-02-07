# gatsby-plugin-glamor

Provide drop-in support for using the css-in-js library
[Glamor](https://github.com/threepointone/glamor) including optimized
server rendering.

## Install

`npm install --save gatsby-plugin-glamor`

## How to use

First add the plugin to your `gatsby-config.js`.

```javascript
plugins: [
  `gatsby-parser-yaml`,
]
```

Glamor [provides many convenient ways to style your
components](https://github.com/threepointone/glamor/blob/master/docs/howto.md).
One particularly convenient (and suggested) way is to use its `css`
prop. It works exactly the same as the `style` prop except it let's you
write all CSS — psudeo classes/elements, media queries, contextual
selectors, etc.

```jsx
render () {
  return (
    <div
      css={{
        margin: `0 auto`,
        border: `1px solid gray`,
      }}
    >
      <h1
        css={{
          color: `red`,
          // Psuedo styles are supported!
          ':hover': {
            textDecoration: `underline`,
          }
        }}
      >
        This is the title!
      </h1>
      <div>
        The body!
      </div>
    </div>
  )
}
```

The `css` prop works on both the default DOM components as well as most
custom components. Under the hood, Glamor converts the `css` prop to a
`className` prop so the `css` prop will work as long as your or the 3rd
party component you're using uses `className`.
