---
title: Creating an Adapter
examples:
  - label: gatsby-adapter-netlify
    href: "https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-adapter-netlify"
---

import Collapsible from "@components/collapsible"

## Introduction

If an [adapter](/docs/how-to/previews-deploys-hosting/adapters/) for your preferred deployment platform doesn't exist yet, you can build your own. While the specifics of the adapter depend on the deployment platform and its requirements, the initial setup is the same for every adapter.

By the end of this guide you should be able to create and publish an adapter.

The adapters feature was added in `gatsby@5.12.0`.

## Authoring

An adapter's entry point should have the following API:

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
    adapt({
      routesManifest,
      functionsManifest,
      pathPrefix,
      trailingSlash,
      reporter,
    }) {
      // Adapt implementation
    },
    config({ reporter }) {
      return {
        // Information passed back to Gatsby
      }
    },
  }
}

module.exports = createAdapterFoo
```

<Collapsible
  summary={<em>TypeScript version</em>}
>

Gatsby makes a `AdapterInit` type available that you can use to author your adapter. It also accepts a generic for the adapter options:

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
    adapt({
      routesManifest,
      functionsManifest,
      pathPrefix,
      trailingSlash,
      reporter,
    }) {
      // Adapt implementation
    },
    config({ reporter }) {
      return {
        // Information passed back to Gatsby
      }
    },
  }
}

export default createAdapterFoo
```

You can find all TypeScript types [on GitHub](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/utils/adapter/types.ts).

</Collapsible>

The adapter should export a function as a default export with these object keys:

- `name`: Unique name of the adapter. Please follow the naming convention `gatsby-adapter-<name>` or `@scope/gatsby-adapter-<name>` to make it easier for people to discover your adapter.
- `cache` (Optional): Both handlers receive `directories` which are the directories that should be cached/restored for a build and the [`reporter` instance](/docs/reference/config-files/node-api-helpers/#reporter).
  - `restore`: Hook to restore `directories` from previous builds. Executed very early on in the build process. If the hook returns `false`, Gatsby will skip cache restoration.
  - `store`: Hook to store `directories` for the current build. Executed as one of the last steps in the build process.
- [`adapt`](#adapt): Hook to take Gatsby's output and prepare it for deployment on the adapter's platform. Executed as one of the last steps in the build process. Details on the inputs are [documented below](#adapt).
- [`config`](#config) (Optional): Hook to pass information from the adapter to Gatsby so it can adjust its build process. Details on the required output is [documented below](#adapt).

If your adapter accepts custom options, consider setting default values to make the adapter easier to use.

`cache.restore`, `cache.store`, and `adapt` receive the [`reporter` instance](/docs/reference/config-files/node-api-helpers/#reporter), so you can output structured logs to the user’s terminal. **However**, please don’t overdo it and keep the output to a minimum. If a user requires more details, they can always use the CLI with the `--verbose` flag to get information about the adapter and logs for debugging.

### adapt

The `adapt` hook takes Gatsby's output and prepares it for deployment on the adapter's platform. It receives the following inputs:

- `routesManifest`: Array of objects with three different types: `static`, `function`, and `redirect`. Each object contains all necessary information to deploy and apply these routes. `static` routes will have default `headers` applied, which users can extend or overwrite with the [HTTP headers](/docs/how-to/previews-deploys-hosting/headers/) option inside `gatsby-config`. Routes will also have the [`trailingSlash`](/docs/reference/config-files/gatsby-config/#trailingslash) option applied to their paths.
- `functionsManifest`: Array of objects containing each function's entry point and required files.
- `pathPrefix`: Value of the [`pathPrefix`](/docs/reference/config-files/gatsby-config/#pathprefix) option inside `gatsby-config`
- `trailingSlash`: Value of the [`trailingSlash`](/docs/reference/config-files/gatsby-config/#trailingslash) option inside `gatsby-config`
- `remoteFileAllowedUrls`: Array of objects containing allowed url for Gatsby Image and File CDN (if used source plugin provided those). Optionally used to automatically configure or instruct user how to configure Image and File CDN provided by adapter. Support for this field was added in `gatsby@5.13.0`.

You can find the TypeScript types for these inputs on [on GitHub](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/utils/adapter/types.ts).

The `adapt` hook should do the following things:

- Apply HTTP headers to assets
- Apply redirects and rewrites. The adapter can also create its own redirects and rewrites, if necessary (e.g. mapping serverless functions to internal URLs).
- Wrap serverless functions coming from Gatsby with platform-specific code (if necessary). Gatsby will produce [Express](https://expressjs.com/)-like handlers.
- Apply trailing slash behavior and path prefix to URLs
- Possibly upload assets to CDN

### config

The `config` hook is useful for passing information from an adapter back to Gatsby. This optional hook can enable advanced features of adapters to e.g. workaround platform limitations. It can also warn users against using features that an adapter doesn's currently support and would cause faulty deployments.

The `config` hook has to return an object with the following keys:

- `deployURL` (Optional): URL representing the unique URL for an individual deploy
- `excludeDatastoreFromEngineFunction` (Optional): If `true`, Gatsby will not include the LMDB datastore in the serverless functions used for SSR/DSG. Instead, it will place the LMDB datastore into the `public` folder and later try to download the datastore from the given `deployURL`.
- `supports` (Optional): Describe which features an adapters supports
  - `pathPrefix` (Optional): If `false`, Gatsby will fail the build if user tries to use pathPrefix
  - `trailingSlash` (Optional): Provide an array of supported [`trailingSlash`](/docs/reference/config-files/gatsby-config/#trailingslash) options, e.g. `['always']`
- `pluginsToDisable` (Optional): Provide an array of plugin names that should be disabled when adapter is used. Purpose of this is to disable any potential plugins that serve similar role as adapter that would cause conflicts when both plugin and adapter is used at the same time.
- `imageCDNUrlGeneratorModulePath` (Optional): Specifies the absolute path to a CommonJS module that exports a function to generate CDN URLs for images. This function, matching the `ImageCdnUrlGeneratorFn` type signature, takes `source: ImageCdnSourceImage`, `args: ImageCdnTransformArgs` and `pathPrefix: string` as arguments to create optimized CDN URLs for image assets. It is particularly useful for adapting image paths to different CDN providers to optimize image delivery. Providing this will allow Gatsby from processing `IMAGE_CDN` jobs during the build and instead offload the that work to be done at request time which will decrease build times for sites using Gatsby Image CDN. Support for this field was added in `gatsby@5.13.0`.
- `fileCDNUrlGeneratorModulePath` (Optional): Specifies the absolute path to a CommonJS module that exports a function to generate CDN URLs for files. This function, matching the `FileCdnUrlGeneratorFn` type signature, takes `FileCdnSourceImage` and `pathPrefix: string` as arguments to create CDN URLs for file assets. Providing this will allow Gatsby from processing `FILE_CDN` jobs during the build and instead offload the that work to be done at request time which will decrease build times for sites using Gatsby File CDN. Support for this field was added in `gatsby@5.13.0`.

## Running locally

If you want to test your adapter locally, you can use [npm link](https://docs.npmjs.com/cli/v9/commands/npm-link), [yarn link](https://yarnpkg.com/cli/link), or equivalent in other package managers. You'd use your adapter like so:

```js:title=gatsby-config.js
// gatsby-adapter-foo would be your linked adapter
const adapter = require("gatsby-adapter-foo")

module.exports = {
  adapter: adapter()
}
```

If you want to quickly prototype an adapter, you can also author your file(s) directly in an example project (before moving them to their own repository). Here's how:

1. Create an adapter file called `gatsby-adapter-foo.js` at the root of your project:

   ```js:title=gatsby-adapter-foo.js
   const createAdapterFoo = adapterOptions => {
     return {
       name: `gatsby-adapter-foo`,
       // cache hooks...
       adapt({
        routesManifest,
        functionsManifest,
        pathPrefix,
        trailingSlash,
        reporter
       }) {
         // Adapt implementation
         reporter.info('gatsby-adapter-foo is working')
       },
     }
   }

   module.exports = createAdapterFoo
   ```

1. Import the adapter file into your `gatsby-config`:

   ```js:title=gatsby-config.js
   const adapter = require("./gatsby-adapter-foo")

   module.exports = {
     adapter: adapter()
   }
   ```

1. Once it works, don't forget to [publish](#publishing) your adapter so that the community can benefit from it.

## Testing

You should test your adapter code to improve code quality and reliablity. We recommend using [Jest](https://jestjs.io/) or [Vitest](https://vitest.dev/) for unit testing and [Cypress](https://www.cypress.io/) or [Playwright](https://playwright.dev/) for end-to-end testing.

You can copy Gatsby's complete [adapter end-to-end testing suite](https://github.com/gatsbyjs/gatsby/tree/master/e2e-tests/adapters) and use it for your own adapter.

## Publishing

You'll need to publish your adapter to [npm](https://www.npmjs.com/) so that others can use it. If this is your first time publishing to npm, consider following their [guides](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry).

Before you publish, keep in mind that once people start using your adapter, you'll need to make changes responsibly (following [semver](https://docs.npmjs.com/about-semantic-versioning)) and potentially automate some of the maintenance work.

We recommend that you follow this checklist before you publish your adapter for the first time:

- Choose a clear name for your adapter following this naming convention:

  ```
  gatsby-adapter-<name>
  ```

  To publish the adapter under a [scope](https://docs.npmjs.com/about-scopes), follow this naming convention:

  ```
  @scope/gatsby-adapter-<name>
  ```

- Your `README` should explain to the user in concise steps how to install, use, and configure your adapter (also see [How to write a plugin README](/contributing/docs-contributions/how-to-write-a-plugin-readme/)). The `README` will be the first thing a user reviews so make sure that it's accessible to everyone.
- Set `1.0.0` as the `version` field in your adapter's `package.json`. For future releases, follow [semantic versioning](https://docs.npmjs.com/about-semantic-versioning).

  ```json:title=package.json
  {
    "version": "1.0.0",
  }
  ```

- Include a `keywords` field in your adapter's `package.json`, containing `gatsby`, `gatsby-plugin`, and `gatsby-adapter`. This way the adapter can be found through the [plugin library](/plugins/).

  ```json:title=package.json
  {
    "keywords": [
      "gatsby",
      "gatsby-plugin",
      "gatsby-adapter"
    ],
  }
  ```

- Include a `peerDependencies` field in your adapter's `package.json`, containing the `gatsby` version range that your adapter is compatible with.

  For example, if your adapter supports Gatsby 5 only (e.g. it uses an API only available in Gatsby 5), use:

  ```json:title=package.json
  {
    "peerDependencies": {
      "gatsby": "^5.0.0"
    }
  }
  ```

  If Gatsby releases a new major version and your adapter doesn't require the new changes, you can mark your adapter as compatible with specific versions. For example, to mark your adapter as compatible with Gatsby 5 and Gatsby 6:

  ```json:title=package.json
  {
    "peerDependencies": {
      "gatsby": "^5.0.0 || ^6.0.0"
    }
  }
  ```

- Add a `build` script to your adapter's `package.json`. The `build` script should compile your source code to **CommonJS (CJS)** into a `dist` folder. If you're authoring the code in TypeScript, also consider generating type definitions. If you're authoring the code in CJS already there is no need for a `build` script.

  Depending on your tooling (e.g. [microbundle](https://github.com/developit/microbundle), [Babel](https://babeljs.io/), [Parcel](https://parceljs.org/), [tsup](https://github.com/egoist/tsup)) adjust your build script:

  ```json:title=package.json
  {
    "scripts": {
      "build": "your-build-script",
    }
  }
  ```

  Since your compiled information will be in the `dist` folder, you need to also add a `main` and `files` key to the `package.json`.

  ```json:title=package.json
  {
    "main": "./dist/index.js",
    "files": [
      "./dist/*"
    ],
  }
  ```

  If you've generated TypeScript types, consider [adding a `types` key](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html).

- Add a `prepare` script to your adapter's `package.json` that runs before `npm publish`. If the `build` script doesn't automatically clear the `dist` folder before a new build, add an additional `clean` script. This ensures that old artifacts aren't accidentally published. For example, if you rename a file and don't run `clean`, the old file will still be published through `dist`. You could use [del-cli](https://www.npmjs.com/package/del-cli) to achieve this. It would look something like this:

  ```json:title=package.json
  {
    "scripts": {
      "clean": "del-cli dist",
      "build": "your-build-script",
      "prepare": "npm run clean && npm run build"
    }
  }
  ```

- Follow the other recommendations from npm's [Creating a package.json file](https://docs.npmjs.com/creating-a-package-json-file) documentation, e.g. adding a `description` or `author` field.

## Additional resources

- [gatsby-adapter-netlify source code](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-adapter-netlify)
- [Adapters](/docs/how-to/previews-deploys-hosting/adapters/)
- [Zero-Configuration Deployments](/docs/how-to/previews-deploys-hosting/zero-configuration-deployments/)
- [Gatsby Adapters RFC](https://github.com/gatsbyjs/gatsby/discussions/38231)
