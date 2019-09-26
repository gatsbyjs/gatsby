---
title: How to Open a Pull Request
---

A big part of contributing to open source is submitting changes to a project: improvements to source code or tests, updates to docs content, even typos or broken links. This doc will cover what you need to know to **open a pull request** in Gatsby.

## What is a Pull Request (PR)?

In case you aren't familiar, here's how the folks at GitHub [define a pull request](https://help.github.com/en/articles/about-pull-requests):

> Pull requests let you tell others about changes you've pushed to a branch in a repository on GitHub. Once a pull request is opened, you can discuss and review the potential changes with collaborators and add follow-up commits before your changes are merged into the base branch.

Gatsby uses the PR process to review and test changes before they’re added to Gatsby’s GitHub repository. Anyone can open a pull request. The same process is used for all contributors, whether this is your first open source contribution or you’re a core member of the Gatsby team.

When someone wants to contribute to Gatsby, they open a request to _pull_ their code into the repo. Depending on the type of change, PRs are categorized into:

- [Documentation](#documentation)
- [Code](#code-changes)
- [Starters or Site Showcase](#starters-or-site-showcase)
- [Blog posts](#blog-posts)

Recommendations for different kinds of contributions will follow in this guide and throughout the contributing docs.

## Things to know before opening a PR

We typically recommend [opening an issue](/contributing/how-to-file-an-issue/) before a pull request if there isn't already an issue for the problem you'd like to solve. This helps facilitate a discussion before deciding on an implementation.

For some changes, such as typo fixes or broken links, it may be appropriate to open a small PR by itself. This is somewhat subjective so if you have any questions, [feel free to ask us](/contributing/how-to-contribute/#not-sure-how-to-start-contributing).

The Gatsby core team uses a triaging process outlined in [Managing Pull Requests](/contributing/managing-pull-requests/), if you're interested in learning more about how that works.

## Opening PRs in Gatsby

For any kind of change to files in the Gatsby repo, you can follow the below steps. Be sure to check out additional tips for contributing to various parts of the repo later in this doc, such as docs changes, blog posts, starters, or code improvements and tests.

Some PRs can be done completely from the [GitHub UI](https://help.github.com/en/articles/creating-a-pull-request), such as edits to README files or docs.

To test changes locally against the Gatsby [site and project files](https://github.com/gatsbyjs/gatsby), you can fork the repo and install parts of it to run on your local machine.

- [Fork and clone the Gatsby repo](/contributing/setting-up-your-local-dev-environment/#gatsby-repo-install-instructions).
- Install [yarn](https://yarnpkg.com/) to pull in dependencies and build the project.
- Follow the instructions for the part of the project you want to change. (See specific sections below.)
- [Create a branch in Git](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging) to isolate your changes:

  ```shell
  git checkout -b some-change
  ```

- Once you have changes in Git you want to push, [add them and create a commit](https://help.github.com/en/articles/adding-a-file-to-a-repository-using-the-command-line). For information on how to structure your commits, check out the [Managing PRs](/contributing/managing-pull-requests/#commit-and-pr-title) doc.
  - Using a dot character `.` will add all untracked files in the current directory and subdirectories.
  ```shell
  git add .
  ```
  - Using a visual tool like [GitHub Desktop](https://desktop.github.com/) or [GitX](https://rowanj.github.io/gitx/) can help for choosing which files and lines to commit.
- Committing code will run the automated linter using [Prettier](https://prettier.io). To run the linter manually, run an npm script in the project's base directory:
  ```shell
  npm run format
  ```
- Commit any linting changes before pushing by [amending the previous commit](https://help.github.com/en/articles/changing-a-commit-message) or by adding a new commit. For more on linting and tests, visit the [Managing PRs](/contributing/managing-pull-requests/#automated-checks) doc.
  ```shell
  git commit --amend
  ```
- Push your changes to your fork, assuming it is set up as [`origin`](https://www.git-tower.com/learn/git/glossary/origin):
  ```shell
  git push origin head
  ```
- To open a PR with your changes against the Gatsby repo, you can use the [GitHub Pull Request UI](https://help.github.com/en/articles/creating-a-pull-request). Alternatively, you can use the command line: we recommend [hub](https://github.com/github/hub) for that.

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

For the Gatsby blog, it's necessary to run your content idea by the Gatsby team before submitting it. For more information, refer to the page on [blog and website contributions](/contributing/blog-and-website-contributions/), including how to propose an idea and setting up the blog to run locally.

## Update your fork with the latest Gatsby changes

The Gatsby GitHub repo is very active, so it's likely you'll need to update your fork with the latest changes to be able to merge in your code. This requires adding Gatsby as an [upstream remote](https://help.github.com/en/articles/configuring-a-remote-for-a-fork):

- Set Gatsby's repo URL as a remote source. The name of the remote is arbitrary; this example uses `upstream`.
  ```shell
  git remote set-url upstream git@github.com:gatsbyjs/gatsby.git
  ```
  - _Note: this syntax [uses SSH and keys: you can also use `https`](https://help.github.com/en/articles/which-remote-url-should-i-use) and your username/password._
- You can verify the remote name and URL at any time:
  ```shell
  git remote -v
  ```
- Fetch the latest changes from Gatsby:
  ```shell
  git fetch upstream master
  ```
- [In the branch](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging) you want to update, merge any changes from Gatsby into your fork:
  ```shell
  git merge upstream master
  ```
  - If there are any [merge conflicts](https://help.github.com/en/articles/resolving-a-merge-conflict-on-github), you'll want to address those to get a clean merge.
- Once your branch is in good working order, push the changes to your fork:
  ```shell
  git push origin head
  ```

For more information on working with upstream repos, [visit the GitHub docs](https://help.github.com/en/articles/configuring-a-remote-for-a-fork).

_**Note:** as a member of the Gatsby repo, you can also clone it directly instead of forking and push your changes to [feature branches](https://git-scm.com/book/en/v1/Git-Branching-Branching-Workflows)._

## Additional resources

- CSS Tricks: [How to Contribute to an Open Source Project](https://css-tricks.com/how-to-contribute-to-an-open-source-project/)
- [Creating a pull request](https://help.github.com/en/articles/creating-a-pull-request) from GitHub
- [Configuring a remote for a fork](https://help.github.com/en/articles/configuring-a-remote-for-a-fork)
- [Which remote URL should I use?](https://help.github.com/en/articles/which-remote-url-should-i-use)
- [Git Branching and Merging](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging)
- [Feature Branching and Workflows](https://git-scm.com/book/en/v1/Git-Branching-Branching-Workflows)
- [Resolving merge conflicts](https://help.github.com/en/articles/resolving-a-merge-conflict-on-github)
- [Managing Pull Requests](/contributing/managing-pull-requests/) on the Gatsby core team
