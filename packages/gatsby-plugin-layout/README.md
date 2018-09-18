# gatsby-plugin-layout

This plugin reimplements the behavior of layout components in `gatsby@1`, which [was removed in version 2](https://github.com/gatsbyjs/rfcs/blob/master/text/0002-remove-special-layout-components.md).

## Install

```
npm install --save gatsby-plugin-layout
```

## How to use

Add the plugin to your `gatsby-config.js`:

By default plugin will try to use Layout component located in `src/layouts/index.js` (same as Gatsby v1)

```js
module.exports = {
    plugins: [
      `gatsby-plugin-layout`
    ]
];
```

If you prefer to keep layout in different place, you can use `component` option:

```js
module.exports = {
    plugins: [
        {
            resolve: `gatsby-plugin-layout`,
            options: {
                component: require.resolve(`./relative/path/to/layout/component`)
            }
        }
    ]
];
```

## Why would you want to reimplement the V1 layout behavior?

There are a few scenarios where it makes sense to reimplement the V1 layout handling:

1.  You have a large or complex V1 site and [refactoring to the new layout component](https://v2--gatsbyjs.netlify.com/docs/migrating-from-v1-to-v2/#update-layout-component) is not feasible
2.  Your site uses page transitions or other transitions that break if the layout component is unmounted and remounted when routes change
3.  Your site attaches global state in the layout that doesn't persist if the component is unmounted and remounted

### How layouts worked in version 1

In the original implementation, the layout component was wrapped around the outside of the page component, which, in pseudo-code, looked something like this:

```jsx
<Root>
  <Layout>
    {/* layout is not affected when the page template changes */}
    <PageElement>{/* page content here */}</PageElement>
  </Layout>
</Root>
```

This meant that the layout component could manage things like transitions and persistent state without any special workarounds, because it never rerendered.

### How layouts work in version 2

In version 2, the layout component is no longer special, and it's included in every page that wants to display it. This means that it _does_ rerender on every route change:

```jsx
<Root>
  <PageElement>
    {/* layout will rerender each time the page template changes */}
    <Layout>{/* page content here */}</Layout>
  </PageElement>
</Root>
```

This can make it complicated to support transitions or state without using the [`wrapPageElement` browser API](https://next.gatsbyjs.org/docs/browser-apis/#wrapPageElement) (and the [SSR equivalent](https://next.gatsbyjs.org/docs/ssr-apis/#wrapPageElement)). This plugin implements those APIs for you, which reimplements the behavior of Gatsby V1.

## Troubleshooting

### Passing data from Layout to Page / from Page to Layout

Use [React Context](https://reactjs.org/docs/context.html) to pass data both ways.

For example you can use this boilerplate:

```js
// Context.js
import React from "react"

const defaultContextValue = {
  data: {
    // set your initial data shape here
    showMenu: false,
  },
  set: () => {},
}

const { Provider, Consumer } = React.createContext(defaultContextValue)

class ContextProviderComponent extends React.Component {
  constructor() {
    super()

    this.setData = this.setData.bind(this)
    this.state = {
      ...defaultContextValue,
      set: this.setData,
    }
  }

  setData(newData) {
    this.setState(state => ({
      data: {
        ...state.data,
        ...newData,
      },
    }))
  }

  render() {
    return <Provider value={this.state}>{this.props.children}</Provider>
  }
}

export { Consumer as default, ContextProviderComponent }
```

Use Provider in Layout Component:

```js
import { ContextProviderComponent } from "./Context"

export default ({ children }) => (
  <ContextProviderComponent>
    <Header />
    {children}
    <Footer />
  </ContextProviderComponent>
)
```

And then you can use it anywhere:

- To read state:

```js
import ContextConsumer from "./Context"

const ComponentThatReadState = () => (
  <ContextConsumer>
    {({ data }) => {
      data.menuOpen ? <Menu /> : null
    }}
  </ContextConsumer>
)
```

- To read and set state:

```js
import ContextConsumer from "./Context"

const ComponentThatChangeState = () => (
  <ContextConsumer>
    {({ data, set }) => (
      <div onClick={() => set({ menuOpen: !data.menuOpen })}>
        {data.menuOpen ? `Opened Menu` : `Closed Menu`}
      </div>
    )}
  </ContextConsumer>
)
```
