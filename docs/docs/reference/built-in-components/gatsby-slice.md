---
title: Gatsby Slice API
---

> Support for the Gatsby Slice API was added in `gatsby@5.0.0`.

To further the improvements seen by [Incremental Builds](https://www.gatsbyjs.com/blog/2020-04-22-announcing-incremental-builds/), Gatsby includes a built-in `<Slice>` component that allows you to split pages into individual parts.

By using the `<Slice>` React component in combination with the [`createSlice`](/docs/reference/config-files/actions/#createSlice) API for common UI features, Gatsby will be able to build and deploy individual pieces of your site that had content changes, not entire pages.

## Faster builds in Gatsby Cloud

With the introduction of [Incremental Builds](https://www.gatsbyjs.com/blog/2020-04-22-announcing-incremental-builds/), Gatsby Cloud has been able to reduce build times signficantly by only building the pages that changed. The `<Slice>` component helps reduce those builds times further.

Common components that are shared across the majority of pages on your site might include a navigation bar, footer, or contact form. In today's frameworks, when you re-order the navigation bar items, the entire site needs to be rebuilt. However, if the navigation bar was created as a Gatsby Slice, the new navigation items only need to be built once and all pages will pull the new navigation bar when it's needed.

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
| `component` (Required) | `string` | The path to the component being used as a Slice.                           |
| `context`              | `object` | An object passed to the `component` as `sliceContext`.                     |

## `Slice` component

The Slice component requires an `alias` prop. Any props additional props will be passed to underlying component.

| Prop               | Type     | Description                                                                                 |
| ------------------ | -------- | ------------------------------------------------------------------------------------------- |
| `alias` (Required) | `string` | The Slice created in `gatsby-node` to replace this component. See also: [Aliases](#aliases) |

### Restrictions on using `Slice`

Slices are built during HTML rendering, so any props passed to the Slice component must be static.

This does not work:

```js
// ⚠️ Doesn't work

export function MyImage() {
  const fetchImage = () => {
    return "/static/images/img.jpg"
  }

  // You can't use function props, as they are not static variables
  // highlight-next-line
  return <Slice alias="my-image" fetchImage={fetchImage} />
}
```

However, a prop that ends with a static value does work:

```js
// OK

export function MyImage() {
  const fetchImage = () => {
    return "/static/images/img.jpg"
  }

  // `image` ends up being a string when passed to Slice
  // highlight-next-line
  return <Slice alias="my-image" image={fetchImage()} />
}
```

## Aliases

An "`alias`" for a Slice is the string value a page will use to identify which Slice to render. The reason `alias` is used (as opposed to `id` from [`createSlice`](/docs/reference/config-files/actions/#createSlice)) is an alias is a one-to-one mapping for each page created. By default, an `alias` is always created for each `id` given in [`createSlice`](/docs/reference/config-files/actions/#createSlice). Therefore, if `Slice` is given an `alias` prop of `"my-image"`, the Slice with the `id` of `"my-image"` will be used.

However, if you need to customize which Slice is utilized based on the page, you can pass an `alias`-to-`id` map in [`createPage`](/docs/reference/config-files/actions/#createPage) through the `slices` key. If you map `"my-image"` to `"my-image--dog"`, any time the `"my-image"` Slice is used, it'll use the Slice with the id of `"my-image--dog"` on that page.

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
