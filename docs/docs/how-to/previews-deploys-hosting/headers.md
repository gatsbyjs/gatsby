---
title: HTTP Headers
tableOfContentsDepth: 2
---

## Introduction

You can set custom [HTTP headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers) on the response of a given path. This allows you to modify the caching behavior or configure access control. You can apply HTTP headers to static routes and redirects.

This feature was added in `gatsby@5.12.0`.

## Usage

Use the `headers` config option inside `gatsby-config`:

```js:title=gatsby-config.js
module.exports = {
  headers: [
    {
      source: `/slug`,
      headers: [
        {
          key: `x-custom-header`,
          value: `Hello World`,
        }
      ]
    }
  ]
}
```

The `headers` option accepts an array of objects in the following shape:

- `source`: A request path pattern. See [path matching](#path-matching) for more details on its syntax. The paths `/slug` and `/slug/` are equivalent since Gatsby normalizes [trailing slashes](/docs/reference/config-files/gatsby-config/#trailingslash).
- `headers`: An array of objects in the following shape:
  - `key`: The case-insensitive name of the header
  - `value`: The value of the header

## Overriding behavior

The order in which you insert values into `headers` doesn't matter because Gatsby determines the specificity of each `source` path.

If two headers match the same path and set the same header `key`, the entry with the more specific `source` path will override the other. Examples of the overriding behavior are included [below](#examples).

Once entries with matching paths are handled, all header entries are merged together into one array of headers.

Generally speaking, the headers get created in this order. Note that static entries can override the first two:

1. [Default](#defaults) headers
1. Entries with [path matching](#path-matching) on `source`
1. Entries with a static `source` path

### Examples

To help illustrate how header overrides work, here are some examples. The `input` represents what you can pass to the `headers` config option and the `output` is what Gatsby produces for the given matched path.

#### Non-overlapping keys

```js
const input = [
  {
    source: `*`,
    headers: [
      {
        key: `x-another-custom-header`,
        value: `win`,
      },
    ],
  },
  {
    source: `/some-path/`,
    headers: [
      {
        key: `x-custom-header`,
        value: `win`,
      },
    ],
  },
]

// => Match for path "/some-path/"

const output = [
  { key: `x-another-custom-header`, value: `win` },
  { key: `x-custom-header`, value: `win` },
]
```

#### Overlapping keys

This example also shows that static entries will override ones with path matching.

```js
const input = [
  {
    source: `/some-path/`,
    headers: [
      {
        key: `x-custom-header`,
        value: `win`,
      },
    ],
  },
  {
    source: `*`,
    headers: [
      {
        key: `x-custom-header`,
        value: `lose`,
      },
    ],
  },
]

// => Match for path "/some-path/"

const output = [{ key: `x-custom-header`, value: `win` }]
```

#### Specificity

Gatsby internally adds scores to each path matching entry and sorts the entries by that score — the entry with the highest specificity will override other matching entries. In the following example, `/some-path/:slug` overrides the rest because it's more specific than `*` and `/some-path/*`.

```js
const input = [
  {
    source: `*`,
    headers: [
      {
        key: `x-custom-header`,
        value: `lose-1`,
      },
    ],
  },
  {
    source: `/some-path/*`,
    headers: [
      {
        key: `x-custom-header`,
        value: `lose-2`,
      },
    ],
  },
  {
    source: `/some-path/:slug`,
    headers: [
      {
        key: `x-custom-header`,
        value: `win`,
      },
    ],
  },
]

// => Match for path "/some-path/foo"

const output = [{ key: `x-custom-header`, value: `win` }]
```

## Path matching

As outlined in the previous paragraphs, you can not only define static `source` paths like `/some-path/` but also ones with path matching. This allows you to target more than one path, opening up more flexibility. You can currently use two path matchers:

- Dynamic: Matches a path segment (no nested paths)
- Wildcard: Matches every path segment after its definition

### Dynamic path

You can use a colon (`:`) to declare a dynamic path. For example, `/some-path/:slug` will match `/some-path/foo` and `/some-path/bar`.

```js:title=gatsby-config.js
module.exports = {
  headers: [
    {
      source: `/some-path/:slug`,
      headers: [
        {
          key: `x-custom-header`,
          value: `Hello World`,
        }
      ]
    }
  ]
}
```

### Wildcard path

You can use an asterisk (`*`) to declare a wildcard path. For example, `/some-path/*` will match `/some-path/foo` and `/some-path/foo/bar`.

```js:title=gatsby-config.js
module.exports = {
  headers: [
    {
      source: `/some-path/*`,
      headers: [
        {
          key: `x-custom-header`,
          value: `Hello World`,
        }
      ]
    }
  ]
}
```

## Defaults

By default, Gatsby applies HTTP caching headers to its assets following the guide [Caching Static Sites](/docs/how-to/previews-deploys-hosting/caching/). You can find the specific values [on GitHub](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/utils/adapter/constants.ts).

You can use the `headers` option to override these defaults.

## Additional resources

- [HTTP Headers MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
