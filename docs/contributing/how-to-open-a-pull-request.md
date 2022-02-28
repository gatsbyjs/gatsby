---
title: How to Open a Pull Request
---

A big part of contributing to open source is submitting changes to a project: improvements to source code or tests, updates to docs content, even typos or broken links. This doc will cover what you need to know to **open a pull request** in Gatsby.

## What is a Pull Request (PR)?

In case you aren't familiar, here's how the folks at GitHub [define a pull request](https://help.github.com/en/articles/about-pull-requests):

> Pull requests let you tell others about changes you've pushed to a branch in a repository on GitHub. Once a pull request is opened, you can discuss and review the potential changes with collaborators and add follow-up commits before your changes are merged into the base branch.

Gatsby uses the PR process to review and test changes before they’re added to Gatsby’s GitHub repository. Anyone can open a pull request. The same process is used for all contributors, whether this is your first open source contribution or you’re a core member of the Gatsby team.

When someone wants to contribute to Gatsby, they open a request to _pull_ their code into the repo. Depending on the type of change, PRs are categorized into:

- [Documentation](#documentation-prs)
- [Code](#code-changes)

Recommendations for different kinds of contributions will follow in this guide and throughout the contributing docs.

## Things to know before opening a PR

We typically recommend [opening an issue](/contributing/how-to-file-an-issue/) before a pull request if there isn't already an issue for the problem you'd like to solve. This helps facilitate a discussion before deciding on an implementation.

For some changes, such as typo fixes or broken links, it may be appropriate to open a small PR by itself.

## Opening PRs in Gatsby

For any kind of change to files in the Gatsby repo, you can follow the below steps. Be sure to check out additional tips for contributing to various parts of the repo later in this doc, such as docs changes, blog posts, starters, or code improvements and tests.

To test changes locally against the Gatsby [site and project files](https://github.com/gatsbyjs/gatsby), fork the repo and install parts of it to run on your local machine.

- [Fork and clone the Gatsby repo](/contributing/code-contributions#setting-up-your-local-dev-environment/).
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

The Gatsby docs site lives in [docs](https://github.com/gatsbyjs/gatsby/tree/master/docs) directories on GitHub, including docs and tutorial content. There are also some [examples in the Gatsby repo](https://github.com/gatsbyjs/gatsby/tree/master/examples) referenced in the docs.

Additional docs PR steps:

- For docs-only changes, consider using `git checkout -b docs/some-change` or `git checkout -b docs-some-change`, as this will short circuit the CI process and only run linting tasks.

Further instructions can be found on the [docs contributions](/contributing/docs-contributions/) page.

### Code changes

Instructions for making changes to the Gatsby source code, tests, internals, APIs, packages, and more can be found in the contributing docs on [setting up your local dev environment](/contributing/code-contributions#setting-up-your-local-dev-environment/).

## Preparing a PR for review

When preparing and merging a PR for the [monorepo](https://github.com/gatsbyjs/gatsby) you’ll need to follow a couple of conventions:

- A bot automatically adds a `status: triage needed` label to your PR. A team member will remove this label and add appropriate ones
- Format the PR title to follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format (more details below)
- Make sure that all required tests pass — if you think that a test is flaky and you’re not sure, ask about it in the pull request
- Put the PR into _Draft_ mode if it’s still a work in progress
- Fill out the PR template (Description, Docs, Related Issues)

### Conventional Commits Examples

_When referring to folders/folder structures the root of the monorepo is assumed._

- If solely something inside `/docs` is changed, e.g. someone fixes a typo in one of our docs or you’re updating the tutorial, the PR title should be `chore(docs): $TEXT`
- If you’re updating something in `/.github` or `.circleci` it’ll be `chore: $TEXT`
- If you’re only updating something in one package, e.g. in `/packages/gatsby-plugin-utils` the [scope](https://www.conventionalcommits.org/en/v1.0.0/#commit-message-with-scope) is the package name `gatsby-plugin-utils`
  - If only docs or README is updated inside the package, the title should be `chore(gatsby-plugin-utils: $TEXT`
  - If any other _chore_ changes like bumping a patch version of a dependency is done, it’s `chore(gatsby-plugin-utils): $TEXT`
  - If you’re fixing a bug: `fix(gatsby-plugin-utils): $TEXT`
  - Adding a new feature: `feat(gatsby-plugin-utils): $TEXT`
  - Making a breaking change for the package: `BREAKING CHANGE(gatsby-plugin-utils): $TEXT` — please note that in this case you’ll need to coordinate this with team members as this requires a closer look & a special release process
  - Improving the performance: `perf(gatsby-plugin-utils): $TEXT`
- If you’re updating two packages, you could combine it like so: `feat(gatsby,gatsby-plugin-utils): $TEXT`
- If you’re updating multiple packages but the main gist of the change is in one package (e.g. you add a feature to `gatsby` and had to update some signatures in other packages) the rules of the “one package” example still apply, so e.g. `feat(gatsby): $TEXT`
- If you’re updating multiple packages and there’s not a clear package that it all relates to, you can skip the _scope_ and only do `fix: $TEXT` , `feat: $TEXT`, etc.
- If you’re updating dependencies in multiple packages you can use `chore(deps): $TEXT`

## Follow up with reviews and suggestions

After a PR is sent to the Gatsby GitHub repo, the Gatsby core team and the community may suggest modifications to the changes that your PR introduces.

The Gatsby teams reviews and approves every PR that the community sends to make sure that it meets the contribution guidelines of the repo, and to find opportunities for improvement to your PR changes.

These suggestions may also be called "request changes" by the GitHub UI. When a change request is added to your PR, this and the rest of the change requests will appear on the GitHub page for your PR. From this page you can use the suggestions UI to:

- Review the suggested changes using the "View changes" button.
- [Commit](https://help.github.com/en/articles/incorporating-feedback-in-your-pull-request#applying-suggested-changes) the suggestions.
- [Discuss suggestions](https://help.github.com/en/articles/about-conversations-on-github) to ask questions about the suggested changes.
- [Add suggestions to a batch](https://help.github.com/en/articles/incorporating-feedback-in-your-pull-request#applying-suggested-changes) so they can be pushed in a single commit.

For suggestions that may not be resolved using the GitHub UI, remember that you can keep adding related commits to your PR before it is merged and those commits will also be a part of such PR.

After all your questions have been resolved and the requested changes have been committed, you can [mark the conversation as solved](https://help.github.com/en/articles/commenting-on-a-pull-request#resolving-conversations).

This process helps both the Gatsby team and the community to contribute with improvements for your changes before they are merged into the Gatsby GitHub repo.

## Update your fork with the latest Gatsby changes

The Gatsby GitHub repo is very active, so it's likely you'll need to update your fork with the latest changes to be able to merge in your code. This requires adding Gatsby as an [upstream remote](https://help.github.com/en/articles/configuring-a-remote-for-a-fork):

- Set Gatsby's repo URL as a remote source. The name of the remote is arbitrary; this example uses `upstream`.
  ```shell
  git remote add upstream git@github.com:gatsbyjs/gatsby.git
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
  git merge upstream/master
  ```
  - If there are any [merge conflicts](https://help.github.com/en/articles/resolving-a-merge-conflict-on-github), you'll want to address those to get a clean merge.
- Once your branch is in good working order, push the changes to your fork:
  ```shell
  git push origin head
  ```

For more information on working with upstream repos, [visit the GitHub docs](https://help.github.com/en/articles/configuring-a-remote-for-a-fork).

## Additional resources

- CSS Tricks: [How to Contribute to an Open Source Project](https://css-tricks.com/how-to-contribute-to-an-open-source-project/)
- [Creating a pull request](https://help.github.com/en/articles/creating-a-pull-request) from GitHub
- [Configuring a remote for a fork](https://help.github.com/en/articles/configuring-a-remote-for-a-fork)
- [Which remote URL should I use?](https://help.github.com/en/articles/which-remote-url-should-i-use)
- [Git Branching and Merging](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging)
- [Feature Branching and Workflows](https://git-scm.com/book/en/v1/Git-Branching-Branching-Workflows)
- [Resolving merge conflicts](https://help.github.com/en/articles/resolving-a-merge-conflict-on-github)
- [Guide on Markdown Syntax](/docs/reference/markdown-syntax/)
