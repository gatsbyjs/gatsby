---
title: Gatsby Script API
---

> Support for the Gatsby Script API was added in `gatsby@4.15.0`.

Gatsby includes a built-in `<Script>` component that aids in loading scripts performantly.

It offers a convenient way to declare different [loading strategies](#strategies), and a default loading strategy that gives Gatsby users strong performance out of the box. It supports both [scripts with sources](#scripts-with-sources) and [inline scripts](#inline-scripts).

Whether you want to leave the heavy lifting of managing scripts to Gatsby or you want maxiumum flexibility and control, the Gatsby `<Script>` component is a great tool for the job.

## Using Gatsby Script in your site

Here is an example of how you can import and use the `<Script>` component in your site's JSX or TSX source files:

```jsx
import React from "react"
// highlight-next-line
import { Script } from "gatsby"

function MyPage() {
  // highlight-next-line
  return <Script src="https://my-example-script" />
}

export default MyPage
```

If you have existing scripts, using the Gatsby `<Script>` component is as simple as importing `Script` and changing lowercase `script` tag names to capitalized `Script` tag names in most cases:

```diff
import React from "react"
+import { Script } from "gatsby"

function MyPage() {
  return (
-   <script src="https://my-example-script" />
+   <Script src="https://my-example-script" />
  )
}

export default MyPage
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

- [`post-hydrate`](#post-hydrate-strategy-default) (default) - Loads after the page has hydrated
- [`idle`](#idle-strategy) - Loads after the page has become idle
- [`off-main-thread`](#off-main-thread-strategy-experimental) (experimental) - Loads off the main thread in a web worker via [Partytown](https://partytown.builder.io)

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

### Post hydrate strategy (default)

The `post-hydrate` strategy is the **default** loading strategy and will be used if you do not specificy a `strategy` attribute.

The advantage of this strategy is that you have the ability to declare that your script should start loading _after_ [hydration](/docs/glossary/hydration/). This is impactful because hydration is what makes your page interactive, and by using regular `<script>` tags (even with `async` or `defer` applied), you run the risk of your script being loaded in parallel with the framework JavaScript that hydrates your page.

This can have negative implications for key web vital metrics like [Total Blocking Time](https://web.dev/tbt/). By leveraging the `<Script>` component with the `post-hydrate` strategy, you ensure that your script avoids interfering with your page reaching an interactive state, resulting in a better experience for your users.

The `post-hydrate` strategy is ideal for cases where you want to make sure a script loads early without impacting your site's time to interactive.

### Idle strategy

The `idle` strategy is similar to `post-hydrate` in that it loads after hydration, with the difference being `idle` will tell the browser to load the script when the main thread is free.

This means that if your page is doing other crucial work such as DOM manipulations or other calculations that occupy the main thread, your script will wait until after that work is complete to start loading.

The `idle` strategy is ideal for cases where you want to ensure a script loads in a way that does not compete with other work being done on the main thread.

### Off main thread strategy (experimental)

The `off-main-thread` strategy, unlike `post-hydrate` and `idle`, loads your script in a [web worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) via [Partytown](https://partytown.builder.io).

This means that the burden of evaluation of your script is no longer the conern of the main thread, freeing it up to take care of other crucial tasks.

Here is an example configuring the `<Script>` component with the `off-main-thread` strategy to load [Google Analytics](https://analytics.google.com/analytics/web/):

```jsx
import { Script } from "gatsby"

// `process.env.GTM` is your Google Analytics 4 identifier defined in your `.env.production` and `.env.development` files

<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GTM}`}
  strategy="off-main-thread"
  forward={[`gtag`]}
/>
<Script id="gtag-config" strategy="off-main-thread">
  {`
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() { window.dataLayer.push(arguments) }
    gtag('js', new Date())
    gtag('config', ${process.env.GTM}, { send_page_view: false })
  `}
</Script>
```

#### Forward collection

Gatsby will collect all `off-main-thread` scripts on a page, and automatically merge any [Partytown forwarded events](https://partytown.builder.io/forwarding-events) defined via the `forward` property into a single configuration for each page:

```jsx
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GTM}`}
  strategy="off-main-thread"
  // highlight-next-line
  forward={[`gtag`]}
/>
```

The `forward` property is the only Partytown-specific property that is handled by the `<Script>` component.

#### Proxy configuration

All URLs provided to the Gatsby `<Script>` component with the `off-main-thread` strategy are proxied by Gatsby to `/__third-party-proxy?url=${YOUR_URL}`.

The reason for this is many third-party scripts [require a proxy to work in Partytown](https://partytown.builder.io/proxying-requests), so Gatsby includes built-in proxy functionality to make this easier.

To keep the proxy secure, you must define the absolute URLs you want proxied in your Gatsby config with the `partytownProxiedURLs` key. If you do not do this, the the request will 404.

Here's how you would do that for the Google Analytics example above:

```js:title=gatsby-config.js
import dotenv from "dotenv"

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    title: `Gatsby`,
  },
  // highlight-start
  partytownProxiedURLs: [
    `https://www.googletagmanager.com/gtag/js?id=${process.env.GTM}`
  ],
  // highlight-end
}
```

This works out of the box when running your site via `gatsby develop`, `gatsby serve` and Gatsby Cloud.

Hosting on other providers requires support for Gatsby's [`createRedirect`](/docs/reference/config-files/actions/) action to rewrite requests from `/__third-party-proxy?url=${YOUR_URL}` to `YOUR_URL` with a 200 status code. You may need to check with your hosting provider to see if this is supported.

#### Debugging

You can leverage Partytown's [vanilla config](https://partytown.builder.io/configuration#vanilla-config) to enable debug mode for your off-main-thread scripts:

```jsx:title=gatsby-ssr.js
import React from "react"

export const onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    <script
      key="test"
      dangerouslySetInnerHTML={{
        __html: `partytown = { debug: true }`,
      }}
    />,
  ])
}
```

You may need to adjust your dev tools to the verbose log level in order to see the extra logs in your console.

It is recommended that you only make use of the `debug` property in Partytown's vanilla config to avoid unexpected behavior.

#### Limitations

By leveraging [Partytown](https://partytown.builder.io), scripts that use the `off-main-thread` strategy must also be aware of the [limitations mentioned in the Partytown documentation](https://partytown.builder.io/trade-offs). While the strategy can be powerful, it may not be the best solution for all scenarios.

In addition, the `off-main-thread` strategy does not support the `onLoad` and `onError` callbacks.

## Usage in Gatsby SSR and Browser APIs

The Gatsby `<Script>` component can also be used in the following [Gatsby SSR](/docs/reference/config-files/gatsby-ssr/) and [Gatsby Browser](/docs/reference/config-files/gatsby-browser/) APIs:

- `wrapPageElement`
- `wrapRootElement`

> Note - If you use one of these APIs, it is recommended that you implement it both in Gatsby SSR _and_ Gatsby Browser. A common pattern is to define a single function that you import and use in both files.

Here's an example using `wrapPageElement` in both Gatsby SSR and Gatsby Browser without duplicating your code:

```jsx:title=gatsby-shared.jsx
import React from "react"
import { Script } from "gatsby"

export const wrapPageElement = ({ element }) => {
  return (
    <>
      {element}
      <Script src="https://my-example-script" />
    </>
  )
}
```

```jsx:title=gatsby-ssr.jsx
export { wrapPageElement } from "./gatsby-shared"
```

```jsx:title=gatsby-browser.jsx
export { wrapPageElement } from "./gatsby-shared"
```

## `onLoad` and `onError` callbacks

Scripts with sources loaded with the `post-hydrate` or `idle` strategies have access to two callbacks:

- `onLoad` - Called once the script has loaded
- `onError` - Called if the script failed to load

> Note - Inline scripts and scripts using the `off-main-thread` strategy **do not** support the `onLoad` and `onError` callbacks.

Here is an example using the callbacks:

```jsx
<Script
  src="https://my-example-script"
  onLoad={() => console.log('success') )}
  onError={() => console.log('sadness') )}
/>
```

Duplicate scripts (scripts with the same `id` or `src` attributes) will execute `onLoad` and `onError` callbacks despite not being injected into the DOM.

## Loading scripts dependently

Access to the `onLoad` and `onError` callbacks also enables the ability to load scripts dependently. Here's an example showing how to load the second script after the first:

```jsx
import React, { useState } from "react"
import { Script } from "gatsby"

function MyPage() {
  const [loaded, setLoaded] = useState(false)

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
