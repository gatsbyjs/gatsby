---
title: Docs Contributions
---

Gatsby, unsurprisingly, uses Gatsby for its documentation website. Thank you in advance and cheers for contributing to Gatsby documentation! It's people like you that make this community great!

> _When deciding where to contribute to Gatsby (docs or [blog](/contributing/blog-contributions/)?), check out the [docs structure](/contributing/docs-contributions/docs-structure/) page._

When writing (or reviewing) learning materials that show Gatsby users how to complete tasks, you are expected to **test out any code examples or steps to ensure they work**. This can also help with writing in your own words, rather than copying from other sources. If you have a demo project or code example that strengthens docs and you don't know where to put it, mention it to the Gatsby Documentation team in a PR.

## Top priorities

Check the GitHub repo for issues labeled with ["type: documentation" and "good first issue"](https://github.com/gatsbyjs/gatsby/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22type%3A+documentation%22+label%3A%22good+first+issue%22) for your first time contributing to Gatsby, or [type: documentation" and "help wanted"](https://github.com/gatsbyjs/gatsby/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22type%3A+documentation%22+label%3A%22help+wanted%22) to see all documentation issues that are ready for community help.

## Options for contributing to the Gatsby docs

When working on the Gatsby documentation, you can choose between two major styles of working:

- [Work directly in the GitHub UI](#modifying-markdown-files), using the "Edit this File" and commit capabilities without having to clone the repository. This is useful for quick documentation updates, typo fixes, and lightweight Markdown changes.
- Clone the Gatsby repo and make changes to the Markdown files using your favorite text editor. Currently (as of February 2022), there is no way for community members to build the docs site locally. We are working internally to figure out a fix for this.

## Fixing image and link paths

If you find a broken image URL in the Gatsby docs, it should be fixed and kept relative to the site source rather than linked to the remote repo on GitHub. This ensures that when the site is deployed, all images are included in the build.

To address missing images, check the doc or tutorial source [in the Gatsby repo](https://github.com/gatsbyjs/gatsby/tree/master/docs) to see if it was moved in its history and if the images are still in its old location. Check to see if those images are also referenced from more than one doc. If they aren't, move them to the new directory location (and update URL references relative to the content, if necessary). If they are referenced in more than one location, use relative paths and don't duplicate images.

If you find a broken link in the Gatsby docs, feel free to fix it and submit a PR!

Keep in mind that some links in here are already correct because they work on gatsbyjs.com. While it would be nice for links in documentation to work on GitHub, having them working on gatsbyjs.com is a higher priority!

## Headings

Docs with frontmatter metadata at the top including a `title` will automatically receive an `<h1>` heading in the rendered page, and it should be the only one. Additional headings in docs content should start with `<h2>`, denoted by `##` in Markdown.

For the purposes of an accessible document outline, content headings should go in order from h2-h4 (`####`) until all levels have been established. This will ensure the Gatsby docs have a content hierarchy that works well for users of assistive technology. Read more about the importance of [headings and semantic structure in HTML](https://webaim.org/techniques/semanticstructure/).

## Modifying Markdown files

> 💡 New to writing Markdown? Check out the Gatsby [guide on Markdown Syntax](/docs/reference/markdown-syntax/)!

1. If you want to add/modify any Gatsby documentation, go to the [docs folder](https://github.com/gatsbyjs/gatsby/tree/master/docs) or [contributing folder](https://github.com/gatsbyjs/gatsby/tree/master/docs/contributing) on GitHub and use the file editor to edit and then preview your changes.
2. Before committing the change and raising a PR in the UI, you need to make sure the PR meets the docs contribution criteria:
   - Follow the standards outlined in the [Gatsby Style Guide](/contributing/gatsby-style-guide/).
   - If your PR did not come from an issue written by the core team, please add a comment to your PR that explains why it should be included in the docs, according to the [Docs Decision Tree](/blog/2018-10-12-uptick-docs-contributions-hacktoberfest/#docs-decision-tree-and-examples).
     > Note: If your issue and/or PR doesn't meet the above contribution criteria, it may receive a comment reminding you to do so. If, after two weeks, these updates haven't been made, your issue and/or PR may be closed, which helps us triage issues and PRs efficiently. You can request that it be reopened if and when you are ready to make the updates required.
3. GitHub then allows you to commit the change and raise a PR right in the UI. This is the _easiest_ way you can contribute to the project!

## Docs site setup instructions

The content of the docs site mostly lives in the [docs](https://github.com/gatsbyjs/gatsby/tree/master/docs) directory. There are also some [examples](https://github.com/gatsbyjs/gatsby/tree/master/examples) in the repo that are referenced in docs. You can directly edit the markdown files.

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

The docs include custom-built components to aid with navigation. In order to customize the navigation experience, these components allow some configurations without changing any of the React code.

### Adjusting breadcrumb titles

The `<Breadcrumb />` component is used in layout files to display the hierarchy of pages a user is currently browsing on at the top of each doc. Currently, you can only change the breadcrumb titles if you have access to the private GitHub repo where the Gatsby docs site is built. (This is only available to internal Gatsby staff at this time. We plan to make this available to open-source community members in the future, but we don't yet have a timeline for when that will happen.)

To alter the title of a doc that is displayed in the Breadcrumb component, `breadcrumbTitle` is supported as a key in the sidebar YAML files. It is commonly used to provide an abbreviated version of a doc's title when displayed next to its parent page title, e.g. shortening "Adding a Custom webpack Config" to "webpack Config".

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

## Docs renaming instructions

Sometimes it makes sense to move or rename a file as part of docs restructuring or for content clarification. While we recommend keeping URLs consistent as often as possible, here are some tips to minimize errors and keep the docs in a good state:

- Run proposed structure changes by the Gatsby docs team in [a GitHub issue](/contributing/how-to-file-an-issue/) to ensure your change is accepted.
- Update all instances of the old URL to your new one. [Find and replace](https://code.visualstudio.com/docs/editor/codebasics#_search-across-files) in VS Code can help. Check that the context of the original link reference still makes sense with the new one.

## Claim your swag

After your first code contribution to the Gatsby repo (including documentation) you become eligible for a free shirt or pair of socks. See the [swag page](/contributing/contributor-swag/) for more details!
