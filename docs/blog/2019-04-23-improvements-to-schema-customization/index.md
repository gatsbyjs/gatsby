---
title: Improvements to Schema Customization API - Available in Gatsby 2.4.0
date: 2019-04-23
author: Mikhail Novikov
tags:
  - schema
  - graphql
---

Today we are releasing further improvements to the schema customization that [we've released in version 2.2.0](/blog/2019-03-18-releasing-new-schema-customization). You can use them with Gatsby 2.4.0.

It is now possible to indicate to Gatsby, that you want to add a resolver to an explicitly defined fields. Use `addResolver` to add default arguments or/and resolvers to fields. In addition, when `@dontInfer` is set, Gatsby will no longer run inference for marked type, allowing one to improve performance for large data sets.

## Summary

After about a month of testing schema customization both here and in pre-release we determined a couple of issues. We set up to do this because we wanted to remove uncertainty in people's schemas, when the data changes. However, the original design allowed some uncertainties anyway. In addition, we have made inferrence a more heavy process, trading performance for consistency and didn't really provide a way to opt out of it completely. To summarize:

- Resolvers and arguments of fields like Date and File was determined by inferred data
- There was no easy way to use arguments/resolvers to override the above
- Inferrence was run even when `@dontInfer` flag was on
- There was no way to control inference outside of SDL, eg in Type Builders

Therefore we have some changes to the way we do inferrence. In addition, we are deprecating some of the features introduced is 2.2.0 and will remove them in Gatsby 3.

## noDefaultResolvers and inferrence modes

First of all, we are deprecating `noDefaultResolvers`. It was an argument of `infer` and `dontInfer`. We feel it was confusing and in some cases it didn't even actually add resolvers :). We will support `noDefaultResolvers` until version 3, after which `@infer` behaviour (see below) will become a default and `noDefaultResolvers` will be removed.

We didn't want to break things, so we keep old default behaviour, even though we think it's not optimal. Add explicit `@infer` and `@addResolver` to fields to be future proof.

### Default (deprecated, removed in v3)

Applies with no `@infer` and no `@dontInfer` on a type. Equals to `@infer(noDefaultResolvers: false)`.

Type gets all inferred fields added. If type has defined fields of types `Date`, `File` and any other node, and we inferred that they should have resolver options, resolver options will be added to type with a warning.

### Strict inference (future default in v3)

Applies with `@infer` or `@infer(noDefaultResolvers: true)`.

Type gets all inferred fields added. Existing fields won't automatically get resolvers (use `@addResolver` directive).

### No inferrence

Applies with `@dontInfer` or `@dontInfer(noDefaultResolvers: true)`.

Inferrence won't run at all. Existing fields won't automatically get resolvers (use @addResolver directive).

### No new fields with default resolvers (deprecated, removed in v3)

Applies with `@dontInfer(noDefaultResolvers: false)`

Inferrence will run, but fields won't be added. If type has defined fields of types `Date`, `File` and any other node, and we inferred that they should have resolvers/args, resolvers/args will be added to type with a warning.

## `addResolver`

Add resolver and resolver options (such as arguments) to the given field.

```graphql
type MyType @infer {
  date: Date @addResolver(type: "dateformat", options: { formatString: "DD MMM", locale: "fi" })
  image: File @addResolver(type: "fileByRelativePath")
  authorByEmail: Author @addResolver(type: "link", { by: "email" })
}
```

### Type Builders and extensions

You can now apply configuration to type builder types through extension property on them.

```js
schema.createObjectType({
  name: MyType,
  extensions: {
    infer: true,
  },
  fields: {
    date: {
      type: "Date",
      extensions: {
        addResolver: {
          type: "dateformat",
          options: { formatString: "DD MMM", locale: "fi" },
        },
      },
    },
  },
})
```

## Conclusions

With these improvements we hope we'll solve most of the issues that people are having with new schema customization. We are working on further improvements, like allowing users and plugins to define their own extensions (see [PR #13738](https://github.com/gatsbyjs/gatsby/pull/13738)).

Useful links:

- [createTypes Documentation](https://www.gatsbyjs.org/docs/actions/#createTypes)
- [Umbrella issue for schema customization bug reports](https://github.com/gatsbyjs/gatsby/issues/12272)
