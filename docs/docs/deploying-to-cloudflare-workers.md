---
title: Deploying to Cloudflare Workers
---

[Cloudflare Workers](https://workers.cloudflare.com/) is a serverless platform for creating entirely new applications or augmenting existing ones without configuring or maintaining infrastructure. With [Workers Sites](https://developers.cloudflare.com/workers/sites/start-from-existing/) you can deploy any static site including your Gatsby projects to a domain on Cloudflare or for free on your [workers.dev](https://workers.dev) subdomain.

To enable the KV store required to serve the Gatsby files, you'll need the [Workers Unlimited plan](https://developers.cloudflare.com/workers/about/pricing/) for \$5/month.

This guide will get you started in a few steps:

1. Installing wrangler CLI

Workers Sites requires [wrangler](https://developers.cloudflare.com/workers/tooling/wrangler/). The more straight forward way to install wrangler is with [npm](https://www.npmjs.com/), run the following command:

```shell
npm install -g @cloudflare/wrangler
```

2. Initialize the Project

To create the Worker code that will serve your Gatsby files, from the root of your Gatsby project run:

```shell
wrangler init --site
```

You'll notice your project structure should now look something like:

```diff
+ ├── wrangler.toml
+ └── workers-site
+ │   ├── index.js
+ │   ├── package-lock.json
+ │   └── package.json
  ├── src
  │   ├── components
  │   ├── images
  │   └── pages
  ├── gatsby-config.js
  ├── package.json
```

3. Configure

To authenticate into your Cloudflare account run:

```shell
wrangler config
```

Follow the [Quick Start](https://developers.cloudflare.com/workers/quickstart/#configure) for steps on gathering the correct account ID and API token to link wrangler to your Cloudflare account.

If you don't already have a workers.dev domain run:

```shell
wrangler subdomain
```

Then, add your account ID to the `wrangler.toml` file, and set `bucket` to `"./public"`, which is where Gatsby's built files are output by default:

```toml
name = "gatsby-project"
type = "webpack"
account_id = "abcd..."
workers_dev = true

[site]
bucket = "./public"
entry-point = "workers-site"
```

This deploys to your workers.dev subdomain. For a custom domain see [Quick Start](https://developers.cloudflare.com/workers/quickstart/#publish-to-your-domain).

4. Deploy

You can deploy your application by running the following command in the root of the project directory:

```shell
wrangler publish
```

Now your site is available at gatsby-project.subdomain.workers.dev!

5. CI with GitHub Actions

Use wrangler's GitHub action [plugin](https://github.com/cloudflare/wrangler-action) to automatically deploy to Workers every time you push to master.

Once GitHub Actions is enabled on your repo, add a file to your project's root called `.github/workflows/main.yml` with the contents:

```yaml
name: Deploy production site

on:
  push:
    branches:
      - master

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - name: Navigate to repo
        run: cd $GITHUB_WORKSPACE
      - uses: actions/setup-node@v1
        with:
          node-version: "10.x"
      - name: Install deps
        run: npm install
      - name: Build docs
        run: npm run build
      - name: Publish
        uses: cloudflare/wrangler-action@1.1.0
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          environment: "production"
```

Set up `CF_API_TOKEN` in GitHub secrets with appropriate values from [Quick Start](https://developers.cloudflare.com/workers/quickstart/#configure).

## Additional resources

- [Quickstart for Workers Sites](https://developers.cloudflare.com/workers/sites/start-from-existing/)
- [GitHub Action wrangler plugin](https://github.com/cloudflare/wrangler-action)
