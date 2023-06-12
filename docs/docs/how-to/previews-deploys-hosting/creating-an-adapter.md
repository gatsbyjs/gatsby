---
title: Creating an Adapter
examples:
  - label: gatsby-adapter-netlify
    href: "https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-adapter-netlify"
---

import Collapsible from "@components/collapsible"

## Introduction

If an [adapter](/docs/how-to/previews-deploys-hosting/adapters/) for your preferred deployment platform doesn't exist yet, you can build your own. While the specifics of the adapter depend on the deployment platform and its requirements, the initial setup is the same for every adapter.

By the end of this guide you should be able to create, use, and publish an adapter.

## Authoring

An adapter's entrypoint has to have the following API:

```js
/**
 * @type {import("gatsby").AdapterInit}
 */
const createAdapterFoo = adapterOptions => {
  return {
    name: `gatsby-adapter-foo`,
    cache: {
      restore({ directories, reporter }) {
        // Cache restore implementation
      },
      store({ directories, reporter }) {
        // Cache store implementation
      },
    },
    adapt({ routesManifest, functionsManifest, reporter }) {
      // Adapt implementation
    },
  }
}

module.exports = createAdapterFoo
```

<Collapsible
  summary={<em>TypeScript version</em>}
>

Gatsby makes a `AdapterInit` type available which you can use to author your adapter. It also accepts a generic for the adapter options:

```ts
import type { AdapterInit } from "gatsby"

type AdapterOptions = {
  foo: boolean
}

const createAdapterFoo: AdapterInit<AdapterOptions> = ({ foo }) => {
  return {
    name: `gatsby-adapter-foo`,
    cache: {
      restore({ directories, reporter }) {
        // Cache restore implementation
      },
      store({ directories, reporter }) {
        // Cache store implementation
      },
    },
    adapt({ routesManifest, functionsManifest, reporter }) {
      // Adapt implementation
    },
  }
}

export default createAdapterFoo
```

You can find all TypeScript types [on GitHub](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/utils/adapter/types.ts).

</Collapsible>

The adapter has to export a function as a default export with these object keys:

- `name`: Unique name of the adapter. Please follow the naming convention `gatsby-adapter-name` or `@scope/gatsby-adapter-name` as it'll make it easier for folks to discover your adapter.
- `cache` (Optional): Both handlers receive `directories` which are the directories that should be cached/restored for a build.
  - `restore`: Hook to restore `directories` from previous builds. This is executed very early on in the build process. If `false` is returned Gatsby will skip its cache restoration.
  - `store`: Hook to store `directories` for the current build. Executed as one of the last steps in the build process.
- [`adapt`](#adapt): Hook to take Gatsby's output and preparing it for deployment on the adapter's platform. Executed as one of the last steps in the build process.

If your adapter accepts custom options, consider setting default values (if reasonable). This will make it easier to use your adapter.

`cache.restore`, `cache.store`, and `adapt` receive the [`reporter` instance](/docs/reference/config-files/node-api-helpers/#reporter) you’re used to, so you can output structured logs to the user’s terminal. **However**, please don’t overdo it and keep the output to a minimum. The user will already get information what adapter is used and can debug things further by running in `verbose` mode. In most cases no additional logs are necessary.

### adapt

The `adapt` hook takes Gatsby's output and prepares it for deployment on the adapter's platform. It receives the following inputs:

- `routesManifest`: Array of objects with three different types: `static`, `function`, and `redirect`. Each objects contains all necessary information to deploy and apply these routes. `static` routes will have default `headers` applied which users can extend/overwrite with the [HTTP headers](/docs/how-to/previews-deploys-hosting/headers/) option inside `gatsby-config`.
- `functionsManifest`: Array of objects to give the adapter each function entrypoint and its required files.

You can find the TypeScript types for these inputs on [on GitHub](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/utils/adapter/types.ts) to learn more.

The `adapt` hook should do the following things:

- Apply HTTP headers to assets
- Apply redirects and rewrites. The adapter should can also create its own redirects/rewrites if necessary (e.g. mapping serverless functions to internal URLs).
- Wrap serverless functions coming from Gatsby with platform-specific code (if necessary). Gatsby will produce [Express-like](https://expressjs.com/) handlers.
- Possibly upload assets to CDN

## Testing locally

1. Copy adapter or create adapter file locally
1. Import in gatsby-config
1. Configure adapter option
1. Profit

## Publishing

TODO

## Additional resources

- [gatsby-adapter-netlify source code](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-adapter-netlify)
- [Adapters](/docs/how-to/previews-deploys-hosting/adapters/)
- [Zero-Configuration Deployments](/docs/how-to/previews-deploys-hosting/zero-configuration-deployments/)
- [Gatsby Adapters RFC](#TODO)
