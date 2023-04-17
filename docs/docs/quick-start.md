---
title: Quick Start
---

This quick start is intended for intermediate to advanced developers. For a gentler intro to Gatsby, [head to our tutorial](/docs/tutorial/getting-started/)!

## Getting started with Gatsby

1. Create a new site

```shell
npm init gatsby
```

It'll ask for a site title and the name of the project's directory. Continue following the prompts to choose your preferred language (JavaScript or TypeScript), CMS, styling tools and additional features.

2. Once everything is downloaded you will see a message with instructions for navigating to your site and running it locally.

The CLI created the site as a new folder with the name you chose in step 1.

Start by going to the directory with

```shell
cd my-gatsby-site
```

Start the local development server with

```shell
npm run develop
```

Gatsby will start a hot-reloading development environment accessible by default at `http://localhost:8000`.

3. Now you're ready to make changes to your site!

Try editing the home page in `src/pages/index.js`. Saved changes will live reload in the browser.

## What's next?

### Use flags

The CLI also supports two flags:

- `-y` skips the questionnaire
- `-ts` initializes your project with the [minimal TypeScript starter](https://github.com/gatsbyjs/gatsby-starter-minimal-ts) instead of the [minimal JavaScript starter](https://github.com/gatsbyjs/gatsby-starter-minimal)

Flags are not positional, so these commands are equivalent:

- `npm init gatsby -- -y -ts my-site-name`
- `npm init gatsby my-site-name -- -y -ts`

### Add more features

[Follow our guides](/docs/how-to/) to add more functionality to your site or browse [our plugins](/plugins/) to quickly install additional features.

### Deploy your site

Try using [Gatsby Cloud](/products/cloud/) to build and deploy your site to one of many hosting providers.
