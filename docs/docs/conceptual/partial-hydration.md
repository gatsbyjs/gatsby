---
title: Partial Hydration
---

INTRO TEXT

## Overview

TODO

TODO: Image explaining things

## How Partial Hydration works in Gatsby

TODO

TODO: Link to how-to guide

## Benefits

TODO

## Why React Server Components?

TODO

The main reason why I chose Server components over Islands is because it works seamlessly. If you use islands, you can't share context between them (at least not without custom store logic) and you end up with different react trees so changes don't bubble up or bubble down correctly.
In my mind this is the big difference, with islands I need to shift my application to a new world with React server components I keep doing what I doing with a few restrictions but my application flow stays current

## Further reading

- [Partial Hydration How-To Guide](/docs/how-to/performance/partial-hydration)
- [RFC: React Server Components](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
