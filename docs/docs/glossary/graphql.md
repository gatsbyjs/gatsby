---
title: GraphQL
disableTableOfContents: true
---

## What is GraphQL?

GraphQL is a query language for requesting information from an [API](/docs/glossary#api), and a protocol for servers that support it. GraphQL is one of the ways that you can import data into your Gatsby components.

Facebook created GraphQL in 2012 when it realized that it needed an API capable of supporting both web-based and native mobile applications. Facebook released GraphQL with an open source license in 2015.

More traditional APIs use a separate endpoint for each piece or type of data you'd like to request. For example, a newspaper API might contain:

- an `/articles/<id>` endpoint that returns a specific news story;
- a `/reporters/<id>` endpoint that returns information about a particular reporter.

A single news article page might require two separate network requests: one to retrieve the story data, and another for the reporter's contact details. What's more, the `/reporters` endpoint may return more data than you want to display; it might return their biography and social media accounts, when their name, email, and photo are all that you need for the page.

A GraphQL API, on the other hand, has a single endpoint. To retrieve data, you send one request string that uses a GraphQL-specific syntax. GraphQL executes the functions necessary to retrieve the data that you've requested, and returns a single JSON response.

A request for an article and its reporter might look like the example that follows.

```graphql
{
  article(id: '7fdc2787469b') {
    title
    body
    reporter(id: '64669b3f') {
      name
      email
      photo
    }
  }
}
```

And its response contains only what you've requested.

```json
{
  "data": {
    "article": {
      "title": "Gatsby promotes GraphQL adoption",
      "body": "...",
      "reporter": {
        "name": "Jane Gatsby",
        "email": "janereports@example.com",
        "photo": "images/reporters/janegatsby.jpg"
      }
    }
  }
}
```

You do not have to use GraphQL with Gatsby, however GraphQL offers a few advantages over other methods of importing data.

- You can retrieve only the data that you need for a view.
- You can add new data types and capabilities without needing to create a new endpoint.
- You can store content in whatever way makes sense for your site, whether that's in a database, a third-party headless CMS, or Markdown-formatted text files.

## Learn more

- [GraphQL & Gatsby](/docs/graphql/)

- [Why Gatsby Uses GraphQL](/docs/why-gatsby-uses-graphql/)

- [GraphQL](https://graphql.org) official site

- [How to GraphQL](https://www.howtographql.com/)
