---
title: Docs Contributions
---

Gatsby, unsurprisingly, uses Gatsby for its documentation website. Thank you in advance and cheers for contributing to Gatsby documentation! As of February 2019, over 800 people have contributed. It's people like you that make this community great!

## Top priorities

Check the GitHub repo for issues labeled with ["documentation" and "good first issue"](https://github.com/gatsbyjs/gatsby/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22type%3A+documentation%22+label%3A%22good+first+issue%22) for your first time contributing to Gatsby, or ["documentation" and "status: help wanted"](https://github.com/gatsbyjs/gatsby/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22type%3A+documentation%22+label%3A%22status%3A+help+wanted%22) to see all documentation issues that are ready for community help. Once you start a PR to address one of these issues, you can remove the "help wanted" label.

## Options for contributing to the Gatsby docs

When working on the Gatsby.js documentation, you can choose between two major styles of working:

- [Work directly in the GitHub UI](#modifying-markdown-files), using the "Edit this File" and commit capabilities without having to clone the repository. This is useful for quick documentation updates, typo fixes, and lightweight Markdown changes.
- Clone the Gatsby.js repo and get the `www` site up and running locally. This is necessary for more thorough documentation content and infrastructure changes. Learn how to get set up in the [Gatsby docs setup instructions](/contributing/setting-up-your-local-dev-environment#docs-site-setup-instructions).

### Modifying markdown files

1. If you want to add/modify any Gatsby documentation, go to the
   [docs folder](https://github.com/gatsbyjs/gatsby/tree/master/docs) or [contributing folder](https://github.com/gatsbyjs/gatsby/tree/master/contributing) on GitHub and
   use the file editor to edit and then preview your changes.
2. Before committing the change and raising a PR in the UI, you need to make sure the PR meets the docs contribution criteria:
   - Follow the standards outlined in the [Gatsby Style Guide](https://www.gatsbyjs.org/contributing/gatsby-style-guide/).
   - If your PR did not come from an issue written by the core team, please add a comment to your PR that explains why it should be included in the docs, according to the [Docs Decision Tree](https://www.gatsbyjs.org/blog/2018-10-12-uptick-docs-contributions-hacktoberfest/#docs-decision-tree-and-examples).
     > Note: If your issue and/or PR doesn't meet the above contribution criteria, it may receive a comment reminding you to do so. If, after two weeks, these updates haven't been made, your issue and/or PR may be closed, which helps us triage issues and PRs efficiently. You can request that it be reopened if and when you are ready to make the updates required.
3. GitHub then allows you to commit the change and raise a PR right in the UI. This is the _easiest_ way you can contribute to the project!

#### Converting a document from a stub

If you wrote a new document that was [previously a stub](/contributing/how-to-write-a-stub/), there are two things you need to update.

1. Remove the frontmatter that links to the issue

```diff:title=docs/docs/example-doc.md
  ...
    title: Example Document
- - issue: https://github.com/gatsbyjs/gatsby/issues/00000
+ -
  ...
```

2. Edit `www/src/data/sidebars/doc-links.yaml` by removing the asterisk behind the document's title:

```diff:title=www/src/data/sidebars/doc-links.yaml
  ...
- - title: Example Document*
+ - title: Example Document
    link: /docs/example-document/
  ...
```

### Claim your swag

After your first code contribution to the Gatsby repo (including documentation) you become eligible for a free shirt or pair of socks. See the [swag page](/contributing/contributor-swag/) for more details!


### Want more?

Check out our additional pages on docs contributions:

- [Gatsby Style Guide](/contributing/gatsby-style-guide/)
- [Docs Templates](/contributing/docs-templates/)
- [How to Write a Stub](/contributing/how-to-write-a-stub/)
