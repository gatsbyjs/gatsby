---
title: "@reach/router and Gatsby"
---

This guide gives a peek under the hood of using `@reach/router` with Gatsby.

## Why do we use @reach/router?

The main reasons Gatsby uses `@reach/router` are:

1. Preloading. You can read more about preloading in the docs for the [Gatsby Link API](https://www.gatsbyjs.org/docs/gatsby-link/).
2. The [routing accessibility](https://reach.tech/router/accessibility) it provides.
3. It supports [server rendering](https://reach.tech/router/server-rendering) which helps Gatsby build routed files at build time.
4. Scroll restoration.

With Gatsby, you will mostly be using the `<Link />` component provided by the `gatsby` package. The [`<Link />` API docs](https://www.gatsbyjs.org/docs/gatsby-link/) explain the relationship between `gatsby` `<Link />` and `@reach/router` `<Link />` very nicely:

> The component is a wrapper around @reach/router’s Link component that adds useful enhancements specific to Gatsby.

## Client and Server Routing 🤝

Besides using the [`<Link />` API](https://www.gatsbyjs.org/docs/gatsby-link/) for linking between pages Gatsby generates, you can define your own client-side routes. See the [client only paths example](https://github.com/gatsbyjs/gatsby/tree/master/examples/client-only-paths) on how to use `<Router />` from `@reach/router` to make client routes work seamlessly together with your server routes.

## Scroll Restoration

Gatsby will handle scroll restoration for you in most cases. However, when you render containers that have their own scroll values, those scroll positions are typically lost between page transitions. To solve that, users can use the `useScrollRestoration` hook or the (deprecated) `ScrollContainer` component in their code to tell Gatsby about scroll containers that we should track and restore.

Here is an example of using the `useScrollRestoration` hook to render a list of countries in an overflow `ul` element.

```jsx
import { useScrollRestoration } from "gatsby";
import countryList from "../utils/country-list";

export default function PageComponent() {
    const ulScrollRestoration = useScrollRestoration(`page-component-ul-list`)

    return (
        <ul style={{ height: 200, overflow: `auto` }} {...ulScrollRestoration}>
            {countryList.map(country => <li>{country}</li>)
        </ul>
    );
}
```

This is an example of using the (deprecated) ScrollContainer component with the same code.

```jsx
import { ScrollContainer } from "gatsby-react-router-scroll";
import countryList from "../utils/country-list";

export default class PageComponent extends React.Component {
    render() {
        return (
            <ScrollContainer key="page-component-ul-list">
                <ul style={{ height: 200, overflow: `auto` }}>
                    {countryList.map(country => <li>{country}</li>)
                </ul>
            </ScrollContainer>
        );
    }
}
```

## Other resources

- [Reach Router docs](https://reach.tech/router)
- [Video about using @reach/router in a standalone project (not Gatsby)](https://www.youtube.com/watch?v=J1vsBrSUptA).
