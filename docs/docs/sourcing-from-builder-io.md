---
title: Sourcing from Builder.io
---

[Builder.io](https://builder.io) has all the benefits of a modern headless CMS platform, plus the power of an easy to learn drag and drop editor that enables everyone to edit more than just content. Builder + Gatsby empowers your entire team to create performant and fully customizable pages quickly.

<img src="https://imgur.com/HjBWIbv.gif" alt="Editor example" />

---

## Quick Start

### Fresh project:

To start on a fresh project quickly, take a look at our [Gatsby starter](https://github.com/BuilderIO/gatsby-starter-builder)

```shell
gatsby new my-builder-site https://github.com/BuilderIO/gatsby-starter-builder
```

### Existing project:

Make a free account over at [Builder.io](https://www.builder.io/) and grab your public API key from your [organization page](https://builder.io/account/organization) and:

```javascript:title=gatsby-config.js

const path = require("path")
module.exports = {
  plugins: [
    {
      resolve: "@builder.io/gatsby",
      options: {
        // public API Key
        publicAPIKey: "MY_PUBLIC_API_KEY",
        templates: {
          // `page` can be any model of choice, camelCased
          page: path.resolve("templates/my-page.tsx"),
        },
      },
    },
  ],
}
```

Then start building pages in Builder.io, hit publish, and they will be included in your Gatsby site on each new build!

### Using your components in the editor

See this [design systems example](/examples/react-design-system) for lots of examples using your design system + custom components

👉**Tip: want to limit page building to only your components? Try [components only mode](https://builder.io/c/docs/guides/components-only-mode)**

Register a component

```tsx
import { Builder } from "@builder.io/react"

class SimpleText extends React.Component {
  render() {
    return <h1>{this.props.text}</h1>
  }
}

Builder.registerComponent(SimpleText, {
  name: "Simple Text",
  inputs: [{ name: "text", type: "string" }],
})
```

### How to Query

For an up-to-date complete examples take a look at our [Gatsby starter](https://github.com/BuilderIO/gatsby-starter-builder)

```graphql
{
  allBuilderModels {
    myPageModel(options: { cachebust: true }) {
      content
    }
  }
}
```

## Learn more

- [@builder.io/gatsby plugin](https://github.com/BuilderIO/builder/tree/master/packages/gatsby)
- [Design system example](https://github.com/BuilderIO/builder/tree/master/examples/react-design-system)
- [Official docs](https://www.builder.io/c/docs/getting-started)
