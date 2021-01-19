---
title: Sourcing from Builder.io
---

[Builder.io](https://builder.io) has all the benefits of a modern headless CMS platform, plus the power of a drag and drop editor that enables everyone to edit more than just content. Builder.io + Gatsby empowers your entire team to create performant and fully customizable pages quickly.

<img src="https://imgur.com/HjBWIbv.gif" alt="Editor example" />

---

## Quick Start

### Prerequisites

Make a free account over at [Builder.io](https://www.builder.io/fork-sample-org) and grab your public API key from your [organization page](https://builder.io/account/organization)

### Fresh project:

To start on a fresh project quickly, use the [BuilderIO Gatsby starter](/starters/BuilderIO/gatsby-starter-builder/)

```shell
gatsby new my-builder-site https://github.com/BuilderIO/gatsby-starter-builder
```

### Existing project:

Use [@builder.io/gatsby plugin](/plugins/@builder.io/gatsby/) which will expose Builder.io data and optionally generate pages dynamically from a provided templates.

## Query Builder.io data

The `@Builder.io/gatsby` plugin will add `allBuilderModels` to GraphQL, under which you can specify which model you'd like to get entries from.

For example to get the entries from your models `myHeader`, `myFooter`:

```graphql
{
  allBuilderModels {
    myHeader(limit: 1, options: { cachebust: true }) {
      content
    }
    myFooter(limit: 1, options: { cachebust: true }) {
      content
    }
  }
}
```

Or you can query by urlPath for your page models:

```graphql
query($path: String!) {
  allBuilderModels {
    myPageModel(
      target: { urlPath: $path }
      limit: 1
      options: { cachebust: true }
    ) {
      content
    }
  }
}
```

## Learn more

- [Builder.io GraphQL docs](https://www.builder.io/c/docs/graphql-api)
- [@builder.io/gatsby plugin](/plugins/@builder.io/gatsby/)
- [Design system example](https://github.com/BuilderIO/builder/tree/master/examples/react-design-system)
- [Official docs](https://www.builder.io/c/docs/getting-started)
