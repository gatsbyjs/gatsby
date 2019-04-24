---
title: Using the GraphQL Playground
---

## Intro

In this page we want to introduce you to an alternative to the current IDE for your GraphQL queries: The [Prisma Playground](https://github.com/prisma/graphql-playground).

## What is The Prisma Playground?

The Playground is a way for you to interact with the data your sources and plugins add as schemas. You will be interacting with this data a lot and the Playground will help you greatly with exploring this data.

## Accessing the Playground

As this is an experimental feature, you need to access it by adding an environmental variable, you need to add `GATSBY_GRAPHQL_IDE` to your `develop` script in your `package.json`, like this:

```
"develop": "GATSBY_GRAPHQL_IDE=playground gatsby develop",
```

You can then access it, when the development server is running on `https://localhost:8000/___graphql`

![An image pointing out where to find the GraphQl schema](images/playground-schema.png)
