---
title: Improvements to Schema Customization API - Available in Gatsby 2.5.0
date: 2019-05-17
author: Mikhail Novikov
tags:
  - schema
  - graphql
---

Today we are releasing further improvements to the schema customization that [we've released in version 2.2.0](/blog/2019-03-18-releasing-new-schema-customization). You can use them with Gatsby 2.5.0.

It is now possible to indicate to Gatsby, that you want to add a resolver to an explicitly defined fields. Use extensions like `@link` and `@dateformat` to add default arguments or/and resolvers to fields. In addition, when `@dontInfer` is set, Gatsby will no longer run inference for marked type, allowing one to improve performance for large data sets.

## Summary

After about a month of testing schema customization both pre and post release, we determined a couple of issues. The original aim of our schema customisation work was to remove uncertainty in a user's schemas when their data changes.

However, the original design allowed some uncertainties to still creep in. In addition, it made inference a heavier process, trading performance for consistency without providing a way to opt-out completely. To summarize, the schema customization work released in Gatsby 2.2.0 suffered from a few non-ideal issues:

- Resolvers and arguments of fields like Date and File was determined by inferred data
- There was no easy way to use arguments/resolvers to override the above
- Inference was run even when `@dontInfer` flag was on
- There was no way to control inference outside of SDL, eg in Type Builders

Therefore we are excited to announce some changes in how we perform inference. In addition, we are deprecating some of the features introduced in 2.2.0 and will remove them in Gatsby v3.

## Changes in Gatsby 2.5.0

### `noDefaultResolvers` and inference modes

First of all, we are deprecating `noDefaultResolvers`. It was an argument of `infer` and `dontInfer`. We feel it was confusing and in some cases it didn't even actually add resolvers :). We will support `noDefaultResolvers` until version 3, after which `@infer` behavior (see below) will become a default and `noDefaultResolvers` will be removed.

We didn't want to break things, so we keep old default behavior, even though we think it's not optimal. Add explicit `@infer` and resolver extensions (like `@link`) to fields to be future proof.

#### Default (deprecated, removed in v3)

Applies with no `@infer` and no `@dontInfer` on a type. Equals to `@infer(noDefaultResolvers: false)`.

Type gets all inferred fields added. If type has defined fields of types `Date`, `File` and any other node, and we inferred that they should have resolver options, resolver options will be added to type with a warning.

#### Strict inference (future default in v3)

Applies with `@infer` or `@infer(noDefaultResolvers: true)`.

Type gets all inferred fields added. Existing fields won't automatically get resolvers (use the provided resolver extensions).

#### No inference

Applies with `@dontInfer` or `@dontInfer(noDefaultResolvers: true)`.

Inference won't run at all. Existing fields won't automatically get resolvers (use resolver extensions).

#### No new fields with default resolvers (deprecated, removed in v3)

Applies with `@dontInfer(noDefaultResolvers: false)`

Inference will run, but fields won't be added. If a type has defined fields of types `Date`, `File`, and any other node, and we inferred that they should have resolvers/args. These will still be added in Gatsby v2, but we will now warn and note the deprecation.

### Migrating your code

Here are suggested changes to your code if you are using schema customization already. Your code will work in Gatsby 2.5.0, but those changes will ensure it stays compatible with Gatsby 3.0

1. Add resolver directives to fields
2. Add `@infer` or `@dontInfer` to your type if you don't have it already

```graphql:title=gatsby-node.js
exports.sourceNodes = function sourceNodes({ actions }) {
  const { createTypes } = actions

  createTypes(`
    type MyType {
      date: Date
      image: File
      authorByEmail: AuthorJson
    }
  `)
}
```

```graphql:title=gatsby-node.js
exports.sourceNodes = function sourceNodes({ actions }) {
  const { createTypes } = actions

  createTypes(`
    type MyType @infer {
      date: Date @dateformat
      image: File @fileByRelativePath
      authorByEmail: Author @link
    }
  `)
}
```

### Resolver extensions

Add resolver and resolver options (such as arguments) to the given field. There are currently 3 extensions available.

- `@dateformat` - add date formatting arguments. Accepts `formatString` and
  `locale` options that sets the defaults for this field
- `@link` - connect to a different Node. Arguments `by` and `from`, which
  define which field to compare to on a remote node and which field to use on
  the source node
- `@fileByRelativePath` - connect to a File node. Same arguments. The
  difference from link is that this normalizes the relative path to be
  relative from the path where source node is found.
- `proxy` - in case the underlying node data contains field names with
  characters that are invalid in GraphQL, `proxy` allows to explicitly
  proxy those properties to fields with valid field names. Takes a `from` arg.

```graphql:title=gatsby-node.js
exports.sourceNodes = function sourceNodes({ actions }) {
  const { createTypes } = actions

  createTypes(`
    type MyType @infer {
      date: Date @dateformat(formatString: "DD MMM", locale: "fi")
      image: File @fileByRelativePath
      authorByEmail: Author @link(by: "email")
    }
  `)
}
```

### Type Builders and extensions

You can now apply configuration to type builder types through an exposed `extensions` property.

```js
schema.buildObjectType({
  name: MyType,
  extensions: {
    infer: true,
  },
  fields: {
    date: {
      type: "Date",
      extensions: {
        dateformat: {
          formatString: "DD MMM",
          locale: "fi",
        },
      },
    },
  },
})
```

## Conclusions

With these improvements we are confident that we've solved some pain points that people may have been experiencing with the schema customization API. We would love for feedback about these new features and schema customization, in general. Please post your thoughts to the [schema customization umbrella issue](https://github.com/gatsbyjs/gatsby/issues/12272) if you encounter any problems or have any suggestions!

However, this is but a start and a path of continual, gradual improvement. We are continuously working on further improvements, like allowing users and plugins to define their own extensions (see [PR #13738](https://github.com/gatsbyjs/gatsby/pull/13738)).

## Helpful links

- [createTypes Documentation](https://www.gatsbyjs.org/docs/actions/#createTypes)
- [Umbrella issue for schema customization bug reports](https://github.com/gatsbyjs/gatsby/issues/12272)
