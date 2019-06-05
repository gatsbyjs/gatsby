
# gatsby-theme-header

Gatsby theme for including a shadowable page header component

```sh
npm i gatsby-theme-header
```

```js
// gatsby-config.js
module.exports = {
  __experimentalThemes: [
    'gatsby-theme-header',
  ],
}
```

To create a header component, shadow the component at `src/gatsby-theme-header/index.js`

```js
// example src/gatsby-theme-header/index.js
import React from 'react'

export default () =>
  <header>
    Hello, Header!
  </header>
```

Next, in another Gatsby theme, import and use the Header component in your layout.

```js
// example theme layout components
import React from 'react'
import Header from 'gatsby-theme-header'

export default props =>
  <>
    <Header />
    <main>
      {props.children}
    </main>
  </>
```

With this in place, the end-user or other themes can customize the header component by shadowing the same component.
