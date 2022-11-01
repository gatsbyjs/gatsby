---
title: Partial Hydration
---

> This document is a **work in progress**!

Partial Hydration enables you to selectively add interactivity to your otherwise completly static app. This results in improved frontend performance while keeping the benefits of client-side apps. Gatsby uses [React Server Components](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md) to achieve this.

## Overview

[Hydration](/docs/conceptual/react-hydration/) (or often referred to as rehydration) is the process of using client-side JavaScript to add application state and interactivity to server-rendered HTML. Since the initial release of Gatsby apps built with Gatsby were always fully hydrated on the client. This combines

![Two stylized browser windows on the left and right side. The left one has the title "Full Hydration", the right one "Partial Hydration". Both browser windows have a stylized web page (with header, content, footer, etc.) with mostly static content except for an interactive gallery. The left window has its complete window marked blue (as the full page hydrates), the right one only the interactive gallery (because of Partial Hydration).](https://user-images.githubusercontent.com/16143594/199020505-1f509c9b-ae74-4a72-beda-4182e21bcc9f.png)

TODO

![A stylized browser window showing a website with a header, main section and footer. The main section has a blue marked interactive gallery. The gallery is served through partial hydration, the rest of the site stays static HTML.](https://user-images.githubusercontent.com/16143594/199020525-affb16ad-8722-440d-b0b8-f812f080064f.png)

## How Partial Hydration works in Gatsby

TODO

![Tree diagram of server and client components. It showcases that server components can contain client and server components. And client components can contain server and client components.](https://user-images.githubusercontent.com/16143594/199020530-f6d9961a-dd46-4760-a272-503ce9037f99.png)

## Benefits

TODO

![Timeline view of a page being rendered in the browser. From left to right: Initial request, server returns HTML, view painted, JS arrives, JS processed, UI is interactive. The illustrations shows that the hydration (when JS arrives) adds additional time to the overall timeline. Resulting in a penalty for "Time to interactive" metric.](https://user-images.githubusercontent.com/16143594/199029175-7381a3cb-3c6d-4ba7-9f9f-3aa1fb70f561.png)

## Why React Server Components?

If you don't know what React Server Components are or need a refresher, we recommend watching [the talk introducing Server Components](https://www.youtube.com/watch?v=TQQPAU21ZUw) or reading the [Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md).

The main reason why I chose Server components over Islands is because it works seamlessly. If you use islands, you can't share context between them (at least not without custom store logic) and you end up with different react trees so changes don't bubble up or bubble down correctly.
In my mind this is the big difference, with islands I need to shift my application to a new world with React server components I keep doing what I doing with a few restrictions but my application flow stays current

## Further reading

- [Partial Hydration How-To Guide](/docs/how-to/performance/partial-hydration)
- [RFC: React Server Components](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
