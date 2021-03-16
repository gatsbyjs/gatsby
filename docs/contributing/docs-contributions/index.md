---
title: Docs Contributions
---

Gatsby, unsurprisingly, uses Gatsby for its documentation website. Thank you in advance and cheers for contributing to Gatsby documentation! As of June 2020, over 2,100 people have contributed. It's people like you that make this community great!

> _When deciding where to contribute to Gatsby (docs or [blog](/contributing/blog-contributions/)?), check out the [docs templates](/contributing/docs-templates/) page._

When writing (or reviewing) learning materials that show Gatsby users how to complete tasks, you are expected to **test out any code examples or steps to ensure they work**. This can also help with writing in your own words, rather than copying from other sources. If you have a demo project or code example that strengthens docs and you don't know where to put it, mention it to the Gatsby Documentation team in a PR.

## Top priorities

Check the GitHub repo for issues labeled with ["type: documentation" and "good first issue"](https://github.com/gatsbyjs/gatsby/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22type%3A+documentation%22+label%3A%22good+first+issue%22) for your first time contributing to Gatsby, or [type: documentation" and "help wanted"](https://github.com/gatsbyjs/gatsby/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22type%3A+documentation%22+label%3A%22help+wanted%22) to see all documentation issues that are ready for community help. Once you start a Pull Request to address one of these issues, you can remove the "help wanted" label. As well, examine the list of articles that haven't been fully fleshed out at the [Stub List](/contributing/stub-list).

## Options for contributing to the Gatsby docs

When working on the Gatsby.js documentation, you can choose between two major styles of working:

- [Work directly in the GitHub UI](#modifying-markdown-files), using the "Edit this File" and commit capabilities without having to clone the repository. This is useful for quick documentation updates, typo fixes, and lightweight Markdown changes.
- Clone the Gatsby.js repo and make changes to the Markdown files using your favorite text editor. Currently (as of March 2021), there is no way for community members to build the docs site locally. We are working internally to figure out a fix for this.

## Fixing image and link paths

If you find a broken image URL in the Gatsby docs, it should be fixed and kept relative to the site source rather than linked to the remote repo on GitHub. This ensures that when the site is deployed, all images are included in the build.

To address missing images, check the doc or tutorial source [in the Gatsby repo](https://github.com/gatsbyjs/gatsby/tree/master/docs) to see if it was moved in its history and if the images are still in its old location. Check to see if those images are also referenced from more than one doc. If they aren't, move them to the new directory location (and update URL references relative to the content, if necessary). If they are referenced in more than one location, use relative paths and don't duplicate images.

If you find a broken link in the Gatsby docs, feel free to fix it and submit a PR!

Keep in mind that some links in here are already correct because they work on gatsbyjs.com. While it would be nice for links in documentation to work on GitHub, having them working on gatsbyjs.com is a higher priority!

## Headings

Docs with frontmatter metadata at the top including a `title` will automatically receive an `<h1>` heading in the rendered page, and it should be the only one. Additional headings in docs content should start with `<h2>`, denoted by `##` in Markdown.

For the purposes of an accessible document outline, content headings should go in order from h2-h4 (`####`) until all levels have been established. This will ensure the Gatsby docs have a content hierarchy that works well for users of assistive technology. Read more about the importance of [headings and semantic structure in HTML](https://webaim.org/techniques/semanticstructure/).

## Modifying Markdown files

> 💡 New to writing Markdown? Check out the Gatsby [guide on Markdown Syntax](/docs/how-to/routing/mdx/markdown-syntax/)!

1. If you want to add/modify any Gatsby documentation, go to the
   [docs folder](https://github.com/gatsbyjs/gatsby/tree/master/docs) or [contributing folder](https://github.com/gatsbyjs/gatsby/tree/master/docs/contributing) on GitHub and
   use the file editor to edit and then preview your changes.
2. Before committing the change and raising a PR in the UI, you need to make sure the PR meets the docs contribution criteria:
   - Follow the standards outlined in the [Gatsby Style Guide](/contributing/gatsby-style-guide/).
   - If your PR did not come from an issue written by the core team, please add a comment to your PR that explains why it should be included in the docs, according to the [Docs Decision Tree](/blog/2018-10-12-uptick-docs-contributions-hacktoberfest/#docs-decision-tree-and-examples).
     > Note: If your issue and/or PR doesn't meet the above contribution criteria, it may receive a comment reminding you to do so. If, after two weeks, these updates haven't been made, your issue and/or PR may be closed, which helps us triage issues and PRs efficiently. You can request that it be reopened if and when you are ready to make the updates required.
3. GitHub then allows you to commit the change and raise a PR right in the UI. This is the _easiest_ way you can contribute to the project!

## Docs site setup instructions

After going through the [development setup instructions](/contributing/setting-up-your-local-dev-environment/), there are a few additional things that are helpful to know when setting up a version of the [docs site](/docs/), which mostly lives in the [docs](https://github.com/gatsbyjs/gatsby/tree/master/docs) directory. There are also some [examples](https://github.com/gatsbyjs/gatsby/tree/master/examples) in the repo that are referenced in docs.

> **Note:** The version of the site that you can run locally is separate and visually distinct from the live site. You will be able to change the _content_ of the documentation but the _structure_ of the docs site is developed by Gatsby internally.

- Prerequisites: install Node.js and Yarn. See [development setup instructions](/contributing/setting-up-your-local-dev-environment/).
- [Fork and clone the Gatsby repo](/contributing/setting-up-your-local-dev-environment/#gatsby-repo-install-instructions).
- For docs-only changes, consider using `git checkout -b docs/some-change` or `git checkout -b docs-some-change`, as this will short circuit the CI process and only run linting tasks.
- Change directories into the docs site folder: `cd www`
- Install dependencies with Yarn: `yarn install`
- Add the following env variable to an `.env.development` file inside the `www` directory to [enable image placeholders](https://github.com/gatsbyjs/gatsby/tree/master/www#running-slow-build-screenshots-placeholder): `GATSBY_SCREENSHOT_PLACEHOLDER=true`. This will speed up building the docs site significantly!
- Make sure you have the Gatsby CLI installed with `gatsby -v`, if not run `yarn global add gatsby-cli`
- Start a build of `www` with `gatsby develop`.
- Edit Markdown files in the [docs](https://github.com/gatsbyjs/gatsby/tree/master/docs) and [contributing](https://github.com/gatsbyjs/gatsby/tree/master/docs/contributing) folders, as well as the [YAML sidebar files](https://github.com/gatsbyjs/gatsby/tree/master/www/src/data/sidebars).
- View the changes in your browser at `http://localhost:8000`.
- Commit your changes and [submit a pull request](/contributing/how-to-open-a-pull-request/)!

## Changing headers

It can be necessary to change a heading within the docs. It's important to note that headers automatically generate links with a corresponding URL that can be deep-linked from elsewhere on the site. When changing a header, be sure to point all corresponding links to the new URL. Here are some workflow tips:

- Determine the URL you're looking for. `Changing headers` is linked with a URL ending in `changing-headers`, `Docs renaming instructions` becomes `docs-renaming-instructions`, etc.
- Update all instances of the old URL to your new one. [Find and replace](https://code.visualstudio.com/docs/editor/codebasics#_search-across-files) in VS Code can help. Check that the context of the original link reference still makes sense with the new one.

## Adding a description

The site automatically creates description tags in order to boost SEO:

```html
<meta name="description" content="Documentation of Gatsby" />
<meta property="og:description" content="Documentation of Gatsby" />
<meta name="twitter:description" content="Documentation of Gatsby" />
```

By default, this description is generated from the `page.excerpt`. If you would like to add a custom description, you can use the `description` frontmatter tag:

```markdown
---
title: Gatsby Community Events
description: Learn about other events happening around the globe to connect with other members of the Gatsby community
---
```

## Configuring site navigation

The docs include custom built components to aid with navigation. In order to customize the navigation experience, these components allow some configurations without changing any of the React code.

### Adjusting breadcrumb titles

The `<Breadcrumb />` component is used in layout files to display the hierarchy of pages a user is currently browsing on at the top of each doc.

To alter the title of a doc that is displayed in the Breadcrumb component, `breadcrumbTitle` is supported as a key in the [sidebar YAML files](https://github.com/gatsbyjs/gatsby/tree/master/www/src/data/sidebars). It is commonly used to provide an abbreviated version of a doc's title when displayed next to its parent page title, e.g. shortening "Adding a Custom webpack Config" to "webpack Config".

```yaml
- title: Adding Page Transitions
  link: /docs/adding-page-transitions/
  breadcrumbTitle: Page Transitions # highlight-line
```

### Disabling or shortening Table of Contents

The `<TableOfContents />` component is used to render a list of subheaders from a docs page and automatically provide deep links to them. It can be tweaked by values set in the frontmatter of a doc's markdown.

In docs where the Table of Contents isn't required and should be disabled, a key in the frontmatter called `disableTableOfContents` can be set to `true` like this:

```markdown
---
title: Glossary
disableTableOfContents: true
---

When you're new to Gatsby there can be a lot of words to learn...
```

In other docs where the Table of Contents is extremely long it can make sense to only show headers from the doc up to a certain level, rather than all subheadings. You can set the `tableOfContentsDepth` key to a number that will limit the subheadings shown in the table of contents to that "depth". If it is set to 2, `<h2>`/`##`, and `<h3>`/`###` headers will be listed, if set to 3, `<h2>`/`##`, `<h3>`/`###`, and `<h4>`/`####` will all be shown. It is set like this:

```markdown
---
title: Glossary
tableOfContentsDepth: 2
---

When you're new to Gatsby there can be a lot of words to learn...
```

## Adding embedded GraphQL examples

There are embedded examples in a few places in the docs (like the [GraphQL Reference guide](/docs/graphql-reference/)) that provide a working version of the code described. In the specific example of the GraphQL Query Options Reference page, these examples of the GraphiQL interface show how data can be queried from Gatsby's data layer.

To write a new GraphQL example, a CodeSandbox project with a Gatsby site can be opened at its server container link, for example: https://graphql-reference-1124782374.gtsb.io/. Because CodeSandbox is running a Gatsby site in [`develop` mode instead of `build` mode](/docs/overview-of-the-gatsby-build-process/) you can navigate to GraphiQL by adding `/___graphql` to the link. Write an example query, and when you have a query you are satisfied with, the query fields and names will be saved as URL parameters so you can share the link. Copy the URL and use it as the `src` of an iframe:

<!-- prettier-ignore -->
```mdx
Here's an example of a GraphQL query inline:

<iframe src="https://graphql-reference-1124782374.gtsb.io/___graphql?query=query%20TitleQuery%20%7B%0A%20%20site%20%7B%0A%20%20%20%20siteMetadata%20%7B%0A%20%20%20%20%20%20title%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A&explorerIsOpen=false&operationName=TitleQuery" /> // highlight-line

More markdown content...
```

> Note that you should set the `explorerIsOpen` parameter in the URL to `false` if it isn't already.

## Docs renaming instructions

Sometimes it makes sense to move or rename a file as part of docs restructuring or for content clarification. While we recommend keeping URLs consistent as often as possible, here are some tips to minimize errors and keep the docs in a good state:

- Run proposed structure changes by the Gatsby docs team in [a GitHub issue](/contributing/how-to-file-an-issue/) to ensure your change is accepted.
- Update all instances of the old URL to your new one. [Find and replace](https://code.visualstudio.com/docs/editor/codebasics#_search-across-files) in VS Code can help. Check that the context of the original link reference still makes sense with the new one.
- For SEO purposes, add a redirect to [`www/redirects.yaml`](https://github.com/gatsbyjs/gatsby/tree/master/www/redirects.yaml). Here's an example:

```yaml:title=www/redirects.yaml
- fromPath: /docs/source-plugin-tutorial/
  toPath: /tutorial/source-plugin-tutorial/
```

## Claim your swag

After your first code contribution to the Gatsby repo (including documentation) you become eligible for a free shirt or pair of socks. See the [swag page](/contributing/contributor-swag/) for more details!

## Want more?

Check out our additional pages on docs contributions:

- [Gatsby Style Guide](/contributing/gatsby-style-guide/)
- [Docs Templates](/contributing/docs-templates/)
- [How to Write a Stub](/contributing/how-to-write-a-stub/)
