---
title: How to Open a Pull Request
---

A big part of contributing to open source is submitting changes to a project: improvements to source code or tests, updates to docs content, even typos or broken links. This doc will cover what you need to know to **open a pull request** in Gatsby.

## What is a Pull Request (PR)?

In case you aren't familiar, here's how the fine folks at GitHub [define a pull request](https://help.github.com/en/articles/about-pull-requests):

> Pull requests let you tell others about changes you've pushed to a branch in a repository on GitHub. Once a pull request is opened, you can discuss and review the potential changes with collaborators and add follow-up commits before your changes are merged into the base branch.

Gatsby uses the pull request process to review and test changes before they’re added to Gatsby’s GitHub repository. Anyone can open a pull request. The same process is used for all contributors, whether this is your first open source contribution or you’re a core member of the Gatsby team.

Simply put, when someone wants to contribute to Gatsby, they open a request to _pull_ their code into ours. Depending on the type of change, we like to categorize pull requests (or PRs for short) into:

- [Documentation](#documentation)
- [Code](#code-changes)
- [Starters or Site Showcase](#starters-or-site-showcase)
- [Blog posts](#blog-posts)

Recommendations for different kinds of contributions will follow in this guide and throughout the contributing docs.

## Things to know before opening a PR

We typically recommend [opening an issue](/contributing/how-to-file-an-issue/) before a pull request if there isn't already an issue for the problem you'd like to solve. This helps facilitate a discussion before deciding on an implementation.

For some changes, such as typo fixes or broken links, it may be appropriate to open a small PR by itself. This is somewhat subjective so if you have any questions, [feel free to ask us](/contributing/how-to-contribute/#not-sure-how-to-start-contributing).

The Gatsby team uses the triaging process outlined in [Managing Pull Requests](/contributing/managing-pull-requests/), if you're interested in learning more about how that works.

## Opening PRs in Gatsby

For any kind of change to files in the Gatsby repo, you can follow the below steps. Be sure to check out additional tips for contributing to various parts of the repo later in this doc, such as docs changes, blog posts, starters, or code improvements.

Some PRs can be done completely from the [GitHub UI](https://help.github.com/en/articles/creating-a-pull-request). To test changes locally against the Gatsby [site and project files](https://github.com/gatsbyjs/gatsby), you can fork the repo and install parts of it to run on your local machine.

- [Fork and clone the Gatsby repo](/contributing/setting-up-your-local-dev-environment/#gatsby-repo-install-instructions).
- Follow the instructions for the part of the project you want to change. (See specifics below)
- [Create a branch in Git](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging) to isolate your changes:

  ```bash
  git checkout -b some-change
  ```

- Once you have changes in Git you want to push, [add them and create a commit](https://help.github.com/en/articles/adding-a-file-to-a-repository-using-the-command-line).
  - Using a dot character `.` will add all untracked files in the current directory and subdirectories.
  ```bash
  git add .
  ```
  - Using a visual tool like [GitHub Desktop](https://desktop.github.com/) or [GitX](https://rowanj.github.io/gitx/) can help for choosing which files and lines to commit.
- Push your changes to your fork, assuming it is set up as [`origin`](https://www.git-tower.com/learn/git/glossary/origin):
  ```bash
  git push origin head
  ```
- To open the PR against the Gatsby repo, you can use the [GitHub Pull Request UI](https://help.github.com/en/articles/creating-a-pull-request), or the command line: we recommend [hub](https://github.com/github/hub) for that.

### Documentation PRs

The Gatsby.js docs site mostly lives in the [www](https://github.com/gatsbyjs/gatsby/tree/master/www) and [docs](https://github.com/gatsbyjs/gatsby/tree/master/docs) directories on GitHub, including docs and tutorial content. There are also some [examples in the Gatsby repo](https://github.com/gatsbyjs/gatsby/tree/master/examples) referenced in the docs.

Additional docs PR steps:

- For docs-only changes, consider using `git checkout -b docs/some-change` or `git checkout -b docs-some-change`, as this will short circuit the CI process and only run linting tasks.

Further instructions can be found on the [docs contributions](/contributing/docs-contributions/) page.

### Code changes

Instructions for making changes to the Gatsby source code, tests, internals, APIs, packages, and more can be found in the contributing docs on [setting up your local dev environment](/contributing/setting-up-your-local-dev-environment/). There are also additional details on the [Code contributions](/contributing/code-contributions/) page.

### Starters or Site Showcase

There are specific pages about contributing to various parts of the Gatsby ecosystem:

- [Showcase submissions](/contributing/site-showcase-submissions/)
- [Starter library](/contributing/submit-to-starter-library/)

### Blog posts

For the Gatsby blog, it's necessary to run your content idea by the Gatsby team before submitting it. For more information, refer to the page on [blog and website contributions](/contributing/blog-and-website-contributions/).

## Additional resources

- [Creating a pull request](https://help.github.com/en/articles/creating-a-pull-request) from GitHub
