---
title: Gatsby Script API
---

Gatsby includes a built-in `<Script>` component that aids in loading third-party scripts performantly.

It offers a convenient way to declare different loading strategies and a default loading strategy that gives Gatsby users strong performance out of the box.

## Using Gatsby Script in your site

Before diving deeper into the details, here is an example of how you can import and use use the `<Script>` component in your JSX or TSX files:

```jsx
import * as React from "react"
// highlight-next-line
import { Script } from "gatsby"

function MyPage() {
  // highlight-next-line
  return <Script src="https://my-example-script" />
}

export default MyPage
```

Other examples on this page will exclude the import statements and function component unless it is necessary.

## Migrating existing scripts

For most scripts, you can migrate to Gatsby Script by importing the `<Script>` component in your file and changing the lowercase `script` tag names to capitalized `Script` tag names:

```diff
-<script src="https://my-example-script" />
+<Script src="https://my-example-script" />
```

By default, the `<Script>` component will load your script after hydration. For more information on declaring loading strategies, see the [Strategies](#strategies) section.

## Scripts with sources and inline scripts

There are two types of scripts that you can tell the `<Script>` component to load:

- Scripts with sources
- Inline scripts

### Scripts with sources

Scripts with sources provide a `src` property like this:

```jsx
<Script src="https://my-example-script" />
```

The `<Script>` component will use the value of `src` to deduplicate loading, so if you include two scripts on the same page with the same `src`, only one will load.

If for some reason you need to load two scripts with the same sources on the same page, you can provide an optional, unique `id` property to each and the `<Script>` component will attempt to load both:

```jsx
<Script id="first-unique-id" src="https://my-example-script" />
<Script id="second-unique-id" src="https://my-example-script" />
```

### Inline scripts

Inline scripts must include a unique `id` property and can be defined in two ways:

- Via React's special [`dangerouslySetInnerHTML`](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml) property
- Via a template literal

Here's a look at both:

```jsx
<Script id="first-unique-id" dangerouslySetInnerHTML={{ __html: `alert('Hello world')` }} />
<Script id="second-unique-id">{`alert('Hello world')`}</Script>
```

Functionally, both of these ways of defining inline scripts are equivalent.

## Strategies

You can declare a loading strategy by passing a `strategy` property. These are the available loading strategies:

- `post-hydrate` - Loads after the page has hydrated
- `idle` - Loads after the page has become idle
- `off-main-thread` - Loads off the main thread in a web worker via [Partytown](https://partytown.builder.io)

The best strategy to use depends on the functionality of the script you would like to include.

A general rule of thumb is if your script can afford to be loaded later (as many analytics scripts can be), then start with `off-main-thread` or `idle` and move to earlier loading strategies if necessary.

Here's how you can define these strategies in the `<Script>` component:

```jsx
<Script src="https://my-example-script" strategy="post-hydrate" />
<Script src="https://my-example-script" strategy="idle" />
<Script src="https://my-example-script" strategy="off-main-thread" />
```

Additionally, Gatsby exports a `ScriptStrategy` enum that you can use in TSX files if you prefer:

```tsx
import { Script, ScriptStrategy } from "gatsby"

<Script src="https://my-example-script" strategy={ScriptStrategy.postHydrate} />
<Script src="https://my-example-script" strategy={ScriptStrategy.idle} />
<Script src="https://my-example-script" strategy={ScriptStrategy.offMainThread} />
```

### Off main thread strategy

The `off-main-thread` strategy leverages [Partytown](https://partytown.builder.io) under the hood, so it may require further configuration. See the [Partytown configuration](https://partytown.builder.io/configuration) documentation for complete details.

Here is an example configuring the `<Script>` component with [Google Analytics](https://analytics.google.com/analytics/web/):

```tsx
import { Script, ScriptStrategy } from "gatsby"

const GTM = `G-XXXXXXXXXX`; // Your Google Analytics 4 identifier
const GTAG = `https://www.googletagmanager.com/gtag/js?id=${GTM}`

<Script src={GTAG} strategy={ScriptStrategy.offMainThread} forward={[`gtag`]} debug={true} />
<Script id="gtag-config" strategy={ScriptStrategy.offMainThread}>
{`
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', ${GTM}, { send_page_view: false })
`}
</Script>
```

See the [Gatsby blog post on the topic](https://www.gatsbyjs.com/blog/how-to-add-google-analytics-gtag-to-gatsby-using-partytown/) for more context.

#### Forward collection

Gatsby will collect all `off-main-thread` scripts on a page, and automatically merge any [Partytown forwarded events](https://partytown.builder.io/forwarding-events) into a single configuration for each page.

There's nothing you need to do to make this work, but it is useful to be aware of in case you have an advanced use case.

#### Proxying requests

One challenge of using Partytown under the hood is [proxying requests](https://partytown.builder.io/proxying-requests). The nature of loading scripts in a web worker means that the script's response requires the correct CORS headers, and not all third party scripts provide them.

Gatsby solves this for you out of the box when running your site via `gatsby develop`, `gatsby serve`, and when your site is deployed with [Gatsby Cloud](https://www.gatsbyjs.com/products/cloud/).

In practice, this means that you should not have to configure your own URL reverse proxy for most use cases.

Hosting on other providers may require you to implement the reverse proxy solution [as described in the Partytown documentation](https://partytown.builder.io/proxying-requests) depending on your third-party script.

#### Trade-offs

By leveraging [Partytown](https://partytown.builder.io), scripts that use the `off-main-thread` strategy must also be aware of the [trade-offs mentioned in the Partytown documentation](https://partytown.builder.io/trade-offs). While the strategy can be powerful, it may not be the best solution for all scenarios.

In addition:

- `off-main-thread` scripts load only on server-side render (e.g. initial page render, page reload, etc.) and not on client-side render (e.g. navigation via Gatsby Link)
- `off-main-thread` scripts cannot use the `onLoad` and `onError` callbacks

### `onLoad` and `onError` callbacks

Scripts with sources loaded with the `post-hydrate` or `idle` strategies have access to two callbacks:

- `onLoad` - Called once the script has loaded
- `onError` - Called if the script failed to load

> Note - Inline scripts and scripts using the `off-main-thread` strategy **do not** support the `onLoad` and `onError` callbacks.

Here is an example using the callbacks:

```tsx
<Script
  src="https://my-example-script"
  onLoad={() => onLoad(`console.log('Hello world!')`)}
  onError={() => onError(`console.log('Sadness')`)}
/>
```

This enables the ability to load scripts dependently. Here's an example showing how to load the second script after the first:

```tsx
import React, { useState } from "react"
import { Script } from "gatsby"

function MyPage() {
  const [loaded, setLoaded] = useState<boolean>(false)
  return (
    <>
      // highlight-next-line
      <Script src="https://my-example-script" onLoad={() => setLoaded(true)} />
      {loaded && <Script src="https://my-other-example-script" />}
    </>
  )
}

export default Page
```
