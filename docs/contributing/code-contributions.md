---
title: Code Contributions
---

The beauty of contributing to open source is that you can clone your favorite framework, get it running locally, and test out experiments and changes in real time! Way to feel like a wizard.

This page includes instructions specific to the Gatsby core codebase, blog, and website. To start setting up the Gatsby repo on your machine, check out the page on [setting up your local dev environment](/contributing/setting-up-your-local-dev-environment/). For additional instructions on contributing to the docs, visit the [docs contributions page](/contributing/docs-contributions/).

## Making changes to the website

If you want to make more changes to the website functionality or documentation, that is, change layout components or templates, add sections/pages, follow the steps for [setting up your local dev environment](/contributing/setting-up-your-local-dev-environment/). You can then spin up your own instance of the Gatsby website and make/preview your changes before raising
a pull request.

## Making changes to the starter library

Note: You don't need to follow these steps to submit to the starter library. This is only necessary if you'd like to contribute to the functionality of the starter library. To submit a starter, [follow these steps instead](/contributing/submit-to-starter-library/).

To develop on the starter library, you'll need to supply a GitHub personal access token.

1. Create a personal access token in your GitHub [Developer settings](https://github.com/settings/tokens).
2. In the new token's settings, grant that token the "public_repo" scope.
3. Create a file in the root of `www` called `.env.development`, and add the token to that file like so:

```text:title=.env.development
GITHUB_API_TOKEN=YOUR_TOKEN_HERE
```

The `.env.development` file is ignored by git. Your token should never be committed.

## Contributing to the blog

Note: Before adding a blog post ensure you have approval from a member of the Gatsby team. You can do this by [opening an issue](https://github.com/gatsbyjs/gatsby/issues/new/choose) or contacting [@gatsbyjs on Twitter](https://twitter.com/gatsbyjs).

To add a new blog post to the gatsbyjs.org blog:

- Clone [the Gatsby repo](https://github.com/gatsbyjs/gatsby/) and navigate to `/www`
- Run `yarn` to install all of the website's dependencies.
- Run `npm run develop` to preview the blog at `http://localhost:8000/blog`.
- The content for the blog lives in the `/docs/blog` folder. Make additions or modifications here.
- Add your avatar image to `/docs/blog/avatars`
- Add your name to `/docs/blog/author.yaml`
- Add a new folder following the pattern `/docs/blog/yyyy-mm-dd-title`. Within this newly created folder add an `index.md` file.
- Add `title`, `date`, `author`, and `tags` ([view existing tags](https://www.gatsbyjs.org/blog/tags/) or add a new one) to the frontmatter of your `index.md`. If you are cross posting your post you can add `canonicalLink` for SEO benefits. You can check the other blog posts in `/docs/blog` for examples.
- If your blog post contains images add them to your blog post folder and reference them in your post's `index.md`.
- Ensure any links to gatsbyjs.org are relative links - `/contributing/how-to-contribute/` instead of `https://gatsbyjs.org/contributing/how-to-contribute`
- Follow the [Style Guide](https://www.gatsbyjs.org/contributing/gatsby-style-guide/#word-choice) to make sure you're using the appropriate wording.
- Double check your grammar and capitalise correctly
- Commit and push to your fork
- Create a pull request from your branch
  - We recommend using a prefix of `docs`, e.g. `docs/your-change` or `docs-your-change`

## Development tools

### Debugging the build process

Check [Debugging the build process](/docs/debugging-the-build-process/) page to learn how to debug Gatsby.
