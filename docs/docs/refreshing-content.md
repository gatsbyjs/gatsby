---
title: Refreshing Content
---

During local development it can be useful to refresh sourced content without restarting the development server. To faciliate this Gatsby exposes an environmental variable `ENABLE_GATSBY_REFRESH_ENDPOINT`.

If set to true, this will expose a /\_\_refresh webhook that is able to receive POST requests to refresh the sourced content. This exposed webhook can be triggered whenever remote data changes.

You can trigger this endpoint locally, for example, on Unix-based operating systems (like Ubuntu and macOS) using curl -X POST http://localhost:8000/__refresh.

Additionally, the sourced content can also be refreshed through the GraphiQL explorer.

Securing the refresh endpoint is possible by supplying a value for the environmental variable `GATSBY_REFRESH_TOKEN`, which will cause Gatsby to only accept requests with a matching authorization header. For example `GATSBY_REFRESH_TOKEN=12345` would require a request with header: `authorization: 12345`.
