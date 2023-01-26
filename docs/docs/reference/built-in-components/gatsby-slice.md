---
title: Gatsby Slice API
---

> Support for the Gatsby Slice API was added in `gatsby@5.0.0`.

Gatsby includes a `<Slice>` React component and a `createSlice` action in `gatsby-node` to help speed up common updates across your site. By pulling out common components into separate HTML files, common components can be built separately and "stitched" together with existing pages.

The `<Slice>` React component is also referred to as "Slice placeholder". The React component you pass to `createSlice` via its `component` key is also referred to as "Slice component".

## `createSlice` action

The [`createSlice`](/docs/reference/config-files/actions/#createSlice) action from the [`createPages`](/docs/reference/config-files/gatsby-node/#createPages) API is the first step in creating a new Slice.

```js:title=gatsby-node.js
exports.createPages = async ({ actions }) => {
  actions.createSlice({
    id: `navigation-bar`,
    component: require.resolve(`./src/components/navigation-bar.js`),
    context: {
      jokeOfTheDay: `What's blue and not heavy? Light blue.`,
    }
  })
}
```

| Argument               | Type     | Description                                                                |
| ---------------------- | -------- | -------------------------------------------------------------------------- |
| `id` (Required)        | `string` | A unique identifier for this specific Slice. See also: [Aliases](#aliases) |
| `component` (Required) | `string` | The path to the component being used as a Slice component.                 |
| `context`              | `object` | An object passed to the `component` as `sliceContext`.                     |

## `<Slice>` placeholder

The `<Slice>` placeholder requires an `alias` prop. Any additional props will be passed to the underlying component.

```jsx
<Slice alias="unique-name" />
```

```jsx
<Slice alias="unique-name" additionalProp="hello world" />
```

| Prop               | Type     | Description                                                                                             |
| ------------------ | -------- | ------------------------------------------------------------------------------------------------------- |
| `alias` (Required) | `string` | The Slice component created in `gatsby-node` to replace this placeholder. See also: [Aliases](#aliases) |

## Aliases

An "`alias`" for a Slice is the string value a page will use to identify which Slice component to render. The reason `alias` is used (as opposed to `id` from [`createSlice`](/docs/reference/config-files/actions/#createSlice)) is an alias is a one-to-one mapping for each page created. By default, an `alias` is always created for each `id` given in [`createSlice`](/docs/reference/config-files/actions/#createSlice). Therefore, if the Slice placeholder is given an `alias` prop of `"my-image"`, the Slice component with the `id` of `"my-image"` will be used.

However, if you need to customize which Slice component is utilized based on the page, you can pass an `alias`-to-`id` map in [`createPage`](/docs/reference/config-files/actions/#createPage) through the `slices` key. If you map `"my-image"` to `"my-image--dog"`, any time the `"my-image"` Slice placeholder is used, it'll use the Slice component with the id of `"my-image--dog"` on that page.

```js:title=gatsby-node.js
exports.createPages = async ({ actions }) => {
  const animals = ['dog', 'cat', 'giraffe']

  for (const animal of animals) {
    // create a slice for each animal, i.e. `my-image--dog`
    actions.createSlice({
      // highlight-next-line
      id: `my-image--${animal}`,
      component: require.resolve(`./src/components/my-image-slice.js`),
      context: {
        imagePath: `./images/${animal}.jpg`,
      }
    })

    actions.createPage({
      path: `/animals/${animal}`,
      // a page component that utilizes the MyImage slice
      component: require.resolve(`./src/templates/page.js`),
      slices: {
        // Any time `<Slice alias="my-image">` is seen on this page,
        // use the `my-image--${animal}` id
        // highlight-next-line
        'my-image': `my-image--${animal}`
      }
    })
  }
}
```

## Queries

Slices can use "slice queries", just as pages can use [page queries](/docs/how-to/querying-data/page-query). By exporting a `graphql` query, you can query Gatsby's data layer within the slice. Variables can be accessed from the `context` passed in [`createSlice`](#createslice-action).

```js:title=src/components/my-slice.js
export const query = graphql`
  query ($title: String) { // highlight-line
    myField(title: {eq: $title}) { // highlight-line
      id
      title
    }
  }
`
```

## Restrictions on using `<Slice>` placeholder

### JSS and styled-components support

Using styled-components or JSS within Slice components is currently [not supported](https://github.com/gatsbyjs/gatsby/issues/37278). Alternatively, you can use emotion or normal CSS.

### Must be in `src` directory

Slice placeholders must be used in files that are nested below your site's top-level `src` directory. For example:

Slice placeholders work in these files:

- `<SITE_ROOT>/src/my-page.js`
- `<SITE_ROOT>/src/components/my-component.js`

Slice placeholders **do not** work in these files:

- `<SITE_ROOT>/other-components/other-component.js`
- `<SITE_ROOT>/other-library/other-component.js`

### Nested Slices

Gatsby does not support nested Slice placeholders. This means if you have a high level `<Layout>` component as a slice component, other Slice placeholders cannot exist within that `<Layout>` component anywhere in the tree.

### Contexts

Slice placeholders do not inherit contexts from their parent components. If a context is needed, its provider can either be added to [`wrapRootElement`](/docs/reference/config-files/gatsby-browser/#wrapRootElement) or its value can be passed directly to the Slice component (as long is it follows restrictions for [other props](#others))

```js
export function MyImage() {
  const location = useLocation()

  // highlight-next-line
  return <Slice alias="my-image" location={location} />
}
```

### Props

#### `alias`

The `alias` prop must be statically analyzable, which means it must be an inline string.

```js
// ⚠️ Doesn't work

export function MyComponent({ sliceName }) {
  // You can't use an alias passed from the parent component
  return <Slice alias={sliceName} />
}
```

```js
// ⚠️ Doesn't work

export function MyComponent() {
  // Aliases can't come from function calls
  const aliasName = getAliasFromSomewhere()
  return <Slice alias={aliasName} />
}
```

```js
// OK

export function MyComponent() {
  const alias = "my-image"
  return <Slice alias={alias} />
}
```

```js
// OK

export function MyComponent() {
  const type = "image"
  return <Slice alias={`my-${type}`} />
}
```

```js
// OK

export function MyComponent() {
  return <Slice alias="my-image" />
}
```

#### `children`

The children prop does not have any restrictions and can be used in typical fashion.

```js
// OK

export function MyImage() {
  return (
    <Slice alias="my-image">
      // highlight-next-line
      <p>I am a caption, neat!</p>
    </Slice>
  )
}
```

#### Others

Any props passed to the Slice placeholder must be serializable.

This does not work:

```js
// ⚠️ Doesn't work

export function MyImage() {
  const fetchImage = () => {
    return "/static/images/img.jpg"
  }

  // You can't use function props, as they are not serializable
  // highlight-next-line
  return <Slice alias="my-image" fetchImage={fetchImage} />
}
```

However, a prop that ends with (for example) a string does work:

```js
// OK

export function MyImage() {
  const fetchImage = () => {
    return "/static/images/img.jpg"
  }

  // `image` ends up being a string when passed to <Slice />
  // highlight-next-line
  return <Slice alias="my-image" image={fetchImage()} />
}
```

## Additional Resources

- [Slices How-To Guide](/docs/how-to/performance/using-slices)
- [Using Gatsby Slice API with TypeScript](/docs/how-to/custom-configuration/typescript/#gatsby-slice-api)
- [Enable Slices API Optimizations](/docs/how-to/cloud/slices-optimization/)
