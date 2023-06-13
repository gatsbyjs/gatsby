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

The adapters feature was added in `gatsby@5.X.0`.

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
- [`adapt`](#adapt): Hook to take Gatsby's output and prepare it for deployment on the adapter's platform. Executed as one of the last steps in the build process.

If your adapter accepts custom options, consider setting default values (if reasonable). This will make it easier to use your adapter.

`cache.restore`, `cache.store`, and `adapt` receive the [`reporter` instance](/docs/reference/config-files/node-api-helpers/#reporter), so you can output structured logs to the user’s terminal. **However**, please don’t overdo it and keep the output to a minimum. The user will already get information what adapter is used and can debug things further by running the CLI with the `--verbose` flag.

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

If you want to test your adapter locally, you can use [npm link](https://docs.npmjs.com/cli/v9/commands/npm-link), [yarn link](https://yarnpkg.com/cli/link), or equivalent in other package managers. You'd use your adapter like so:

```js:title=gatsby-config.js
// gatsby-adapter-foo would be your linked adapter
const adapter = require("gatsby-adapter-foo")

module.exports = {
  adapter: adapter()
}
```

If you want to quickly prototype an adapter, you could also author your file(s) directly in an example project (before moving them to their own repository). Here's how:

1. Create an adapter file called `gatsby-adapter-foo.js` at the root of your project:

   ```js:title=gatsby-adapter-foo.js
   const createAdapterFoo = adapterOptions => {
     return {
       name: `gatsby-adapter-foo`,
       // cache hooks...
       adapt({ routesManifest, functionsManifest, reporter }) {
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

1. If it's all working, don't forget to [publish](#publishing) your adapter so that the community can benefit from it.

## Publishing

You'll need to publish your adapter to [npm](https://www.npmjs.com/) so that others can use it. If you have never published anything to npm, consider following their [guides](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry).

Once your adapter is out there and people are using it, you’ll also need to think about making changes responsibly (following [semver](https://docs.npmjs.com/about-semantic-versioning)) or automating some of the maintenance work.

Be sure to go through this checklist before publishing your plugin for the first time:

- Choose a clear name for your adapter following this naming convention:

  ```
  gatsby-adapter-<name>
  ```

  If you want/need to publish the adapter under a [scope](https://docs.npmjs.com/about-scopes) follow the convention:

  ```
  @scope/gatsby-adapter-<name>
  ```

- Your `README` should explain to the user in concise steps how to install, use, and configure your adapter (also see [How to write a plugin README](/contributing/docs-contributions/how-to-write-a-plugin-readme/)). The `README` will be the first thing a user sees so make sure that it's accessible to everyone.
- Set `1.0.0` as your `version` field in your adapter's `package.json`. Afterwards follow [semantic versioning](https://docs.npmjs.com/about-semantic-versioning).

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

  If now Gatsby comes out with a new major version and your adapter didn't use any APIs that needed changes, you could mark your adapter compatible with Gatsby 5 and Gatsby 6 like so:

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

- Add a `prepare` script to your adapter's `package.json` that runs before `npm publish`. If your `build` script isn't automatically clearing the `dist` folder before doing a new build, add an additional `clean` script. This is to ensure that inside the `dist` folder no old artifacts are being published (e.g. you're renaming a file and without the `clean` the old file would still be published through `dist`). You could use [del-cli](https://www.npmjs.com/package/del-cli) to achieve this. It would look something like this:

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
- [Gatsby Adapters RFC](#TODO)
