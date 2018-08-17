# gatsby-plugin-layout

Wrap pages in component that won't get remounted on page changes.

Wrapping component will have access to all props available in Page components. This is an escape hatch to get basic v1 layouts back.

## Install

```
npm install --save gatsby-plugin-layout@next
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
    return <Provider value={this.state}>{this.props.children})</Provider>
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
        <div onClick={() => set({menuOpen: !data.menuOpen})}>
            {data.menuOpen ? `Opened Menu` : `Closed Menu`}
        </div>
    )
  </ContextConsumer>
)
```
