---
title: How to Contribute
---

We want contributing to Gatsby to be fun, enjoyable, and educational for anyone and everyone. Contributions go far beyond pull requests and commits; we are thrilled to receive a variety of other contributions including the following:

- Blogging, speaking about, or creating tutorials about one of Gatsby's many features. Mention [@gatsbyjs on Twitter](https://twitter.com/gatsbyjs) and/or email shannon [at] gatsbyjs [dot] com so we can give pointers and tips (if you want them 😄) and help you spread the word. Please add your blog posts and videos of talks to our [Awesome Gatsby](/docs/awesome-gatsby/) page.
- [Submitting new feature ideas through an RFC](/blog/2018-04-06-introducing-gatsby-rfc-process/)
- Submitting new documentation; titles in the side navigation on [docs](/docs) which are lighter in color on gatsbyjs.org are stubs and need contributions
- Tweeting about things you [#buildwithgatsby](https://twitter.com/search?q=%23buildwithgatsby) (make sure to use the hashtag and/or @ mention us!)
- Submitting documentation updates, enhancements, designs, or bugfixes
- Submitting spelling or grammar fixes
- Adding unit or functional tests
- Triaging [GitHub issues](https://github.com/gatsbyjs/gatsby/issues) -- especially determining whether an issue still persists or is reproducible
- [Reporting bugs or issues](/docs/how-to-file-an-issue/)
- Searching for Gatsby on Discord or Spectrum and helping someone else who needs help
- Teaching others how to contribute to Gatsby's repo!

As our way of saying “thank you” to our contributors, **_all contributors_ are eligible for [free Gatsby swag](/docs/contributor-swag/)** — whether you’re contributing code, docs, a talk, an article, or something else that helps the Gatsby community. [Learn how to claim free swag for contributors.](/docs/contributor-swag/)

### Not sure how to start contributing?

If you are worried or don't know where to start, you can always reach out to [Shannon Soper (@shannonb_ux) on Twitter](https://twitter.com/shannonb_ux) or submit an issue and a maintainer can help give you guidance!

Looking to speak about Gatsby? We'd love to review your talk abstract/CFP! You can email it to shannon [at] gatsbyjs [dot] com, and we can give pointers or tips!

### Creating your own plugins and loaders

If you create a loader or plugin, we would <3 for you to open source it and put it on npm. For more information on creating custom plugins, please see the documentation for [plugins](/docs/plugins/) and the [API specification](/docs/api-specification/).

### Contributing to the repo

Gatsby uses a "monorepo" pattern to manage its many dependencies and relies on
lerna and yarn to configure the repository for active development.

You can install the latest version of Gatsby by following these steps:

- Clone the repo, navigate to its directory.
- ensure you have the latest version of yarn installed (>= 1.0.2)
  https://yarnpkg.com/en/docs/install
- Install dependencies using `yarn run bootstrap` in the root of the repo.

There are two ways to contribute. This is the most usual way:

- Fork the [official repository](https://github.com/gatsbyjs/gatsby).
- Clone your fork: `git clone --depth=1 https://github.com/<your-username>/gatsby.git`
- Setup up repo and install dependencies: `yarn run bootstrap`
- Make sure tests are passing for you: `yarn test`
- Create a topic branch: `git checkout -b topics/new-feature-name`
- Run `yarn run watch` from the root of the repo to watch for changes to packages' source code and compile these changes on-the-fly as you work. Note that the watch command can be resource intensive. To limit it to the packages you're working on, add a scope flag, like `yarn run watch -- --scope={gatsby,gatsby-cli}`. To watch just one package, run `yarn run watch -- --scope=gatsby`.
- Install [gatsby-dev-cli](/packages/gatsby-dev-cli/) globally: `yarn global add gatsby-dev-cli`
- Run `yarn install` in each of the sites you're testing.
- For each of your Gatsby test sites, run the `gatsby-dev` command inside the test site's directory to copy
  the built files from your cloned copy of Gatsby. It'll watch for your changes
  to Gatsby packages and copy them into the site. For more detailed instructions
  see the [gatsby-dev-cli README](/packages/gatsby-dev-cli/) and check out the [gatsby-dev-cli demo video](https://www.youtube.com/watch?v=D0SwX1MSuas).  
  Note: if you plan to modify packages that are exported from `gatsby` directly, you need to either add those manually to your test sites so that they are listed in `package.json` (e.g. `yarn add gatsby-link`), or specify them explicitly with `gatsby-dev --packages gatsby-link`).
- Add tests and code for your changes.
- Once you're done, make sure all tests still pass: `yarn test`.
- Commit and push to your fork.
- Create a pull request from your branch.

### Contributing to the documentation.

Gatsby, unsurprisingly, uses Gatsby for its documentation website.

If you want to add/modify any Gatsby documentation, go to the
[docs folder on GitHub](https://github.com/gatsbyjs/gatsby/tree/master/docs) and
use the file editor to edit and then preview your changes. GitHub then allows
you to commit the change and raise a PR right in the UI. This is the _easiest_
way you can contribute to the project!

However, if you want to make more changes to the website, that is, change
layout components or templates, add sections/pages, follow the steps below. You can then spin up your own instance of the Gatsby website and make/preview your changes before raising
a pull request.

- Clone the repo and navigate to `/www`
- Run `yarn` to install all of the website's dependencies.
- Run `gatsby develop` to preview the website in `http://localhost:8000`
- The Markdown files for the documentation live in `/docs` folder. Make
  additions or modifications here.
- Make sure to double check your grammar and capitalise correctly.
- Commit and push to your fork.
- Create a pull request from your branch.

### Contributing to the blog

Note: Before adding a blog post ensure you have approval from a member of the Gatsby team. You can do this by [opening an issue](https://github.com/gatsbyjs/gatsby/issues/new/choose) or contacting [@gatsbyjs on Twitter](https://twitter.com/gatsbyjs).

To add a new blog post to the gatsbyjs.org blog:

- Clone [the Gatsby repo](https://github.com/gatsbyjs/gatsby/) and navigate to `/www`
- Run `yarn` to install all of the website's dependencies.
- Run `gatsby develop` to preview the blog at `http://localhost:8000/blog`.
- The content for the blog lives in the `/docs/blog` folder. Make additions or modifications here.
- Add your avatar image to `/docs/blog/avatars`
- Add your name to `/docs/blog/author.yaml`
- Add a new folder following the pattern `/docs/blog/yyyy-mm-dd-title`. Within this newly created folder add an `index.md` file.
- Add `title`, `date`, `author`, and `tags` ([view existing tags](https://www.gatsbyjs.org/blog/tags/) or add a new one) to the frontmatter of your `index.md`. If you are cross posting your post you can add `canonicalLink` for SEO benefits. You can check the other blog posts in `/docs/blog` for examples.
- If your blog post contains images add them to your blog post folder and reference them in your post's `index.md`.
- Ensure any links to gatsbyjs.org are relative links - `/docs/how-to-contribute` instead of `https://gatsbyjs.org/docs/how-to-contribute`
- Double check your grammar and capitalise correctly
- Commit and push to your fork
- Create a pull request from your branch

## Development tools

### Debugging the build process

Check [Debugging the build process](/docs/debugging-the-build-process/) page to learn how to debug Gatsby.
