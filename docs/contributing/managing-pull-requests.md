---
title: Managing Pull Requests
---

## Pull Requests and the Community

Gatsby is an open source project. We have over 2,000 contributors and so much of what makes Gatsby great is contributed by folks like you!

Needless to say, we get a lot of PRs and we've been merging over a [100 contributions](https://twitter.com/kylemathews/status/1111435640581689345) every week. Yes, _every week_.

Let's talk a little about how we manage pull requests in the Gatsby repo.

## What is a Pull Request?

In case you aren't familiar, here is how the fine folks at GitHub [define a pull request](https://help.github.com/en/articles/about-pull-requests):

> Pull requests let you tell others about changes you've pushed to a branch in a repository on GitHub. Once a pull request is opened, you can discuss and review the potential changes with collaborators and add follow-up commits before your changes are merged into the base branch.

Simply put, when someone wants to contribute to Gatsby, they open a request to _pull_ their code into ours. Depending on the type of change, we like to categorise pull requests (or PRs for short) into:

- Documentation
- Code
- Starters or Site Showcase
- Blog posts

When looking at a PR for the first time, it can help to read up on linked issues or RFCs (if there are any) to gain context on what the PR intends to add or fix.

> 💡 If there isn't already an issue that describes the problem a PR is trying to solve, it can be helpful to open one. This helps in sharing context and can be very valuable in the future.

## Verifying a Pull Request

### General Guidelines

Some general things to verify in a pull request are:

- Links ought to be relative
- Language ought to be inclusive and accessible

### Type Specific Guidelines

Each kind of PR also requires a different set of specific checks from us before they are merged in!

Let's go over them real quick.

#### Documentation

We typically look for the following in PRs that add documentation:

- Correctness — whether the added documentation is technically correct
- Style — whether the written language follows our [style guide](https://www.gatsbyjs.org/contributing/gatsby-style-guide/)

#### Code

For PRs that add code (whether a feature or fix), we look for the following:

- Correctness — whether the code does what we think it does
- Tests — when fixing a bug or adding a new feature, it can be very valuable to add tests. While we do merge some small PRs without them, more often than not, it's good to have tests asserting behaviour! This can be a combination of unit tests for the specific package, snapshot tests and end to end tests. The goal here is to ensure that something that is being fixed or added _remains_ fixed or working the way we expect it to. Good tests ensure this!
- Code Quality — while it isn't good to nit pick, reasonable changes that improve readability are great to point out
- Documentation in the package's README if you're adding something

#### Starters or Site Showcase

For PRs that add a site or a starter to the showcase, we ought to check:

- We check if the site or starter is indeed a Gatsby site or starter respectively
- Links — check if the links are working and accessible
- Tags — ensure the tags are not arbitrary
- Featured Status — for the site showcase, we like to default to _not_ featuring a site and typically someone from the Gatsby team features it later if they like!

#### Blog posts

For PRs that add a blog posts, we ought to check:

- Correctness — whether the added documentation is technically correct
- Style — whether the written language follows our [style guide](https://www.gatsbyjs.org/contributing/gatsby-style-guide/)
- Blog posts are similar to documentation in that they're long form writing, but also want to ensure that blog posts on [gatsbyjs.org](https://www.gatsbyjs.org) aren't purely promotional, spammy or inappropriate.

## Automated Checks

Our repository on [GitHub](https://github.com/gatsbyjs/gatsby) has several automated CI checks that are run automatically for all PRs. These include tests, linting and even preview builds [gatsbyjs.org](https://www.gatsbyjs.org).

We want all of these checks to pass. While it's okay to review a work in progress PR with some failed checks, a PR is only ready to ship when everything is green.

Let's go over some common failure cases in our cases and how to approach fixing them:

### Linting

We lint all code and documentation pretty aggressively (consistency is good) and while that is great, you might find some PRs failing the linting check.

An easy fix for this is to run:

> 💡 npm run format

This will format all code and documentation and should get rid of those pesky linting issues!

## Other Checks

### Testing Locally

While we have many _many_ tests in our repository (that are run automatically on every commit), there can be times when there exists an edge case (or five) that isn't covered by these.

In situations like this, testing the change locally can be very valuable.

> 💡 In case this is the first time you're doing this, you might have to [set up your development environment](https://www.gatsbyjs.org/contributing/setting-up-your-local-dev-environment).

Testing out unpublished packages locally can be tricky. We have just the tool to make that easy for you.

Say hello to your new best friend, `gatsby-dev-cli`.

#### gatsby-dev-cli

`gatsby-dev-cli` is a command-line tool for local Gatsby development. When making changes in gatsby packages, this helps copy changes in the packages to a Gatsby site that you can test your changes on.

Learn more about `gatsby-dev-cli` [here](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-dev-cli)!

### Commit and PR Title

It's good to have descriptive commit messages so that other folks can make sense of what your commit is doing. We like [conventional commits](https://www.conventionalcommits.org/en/v1.0.0-beta.3).

However, PRs get squashed when merged into our repository so individual commit messages are not as important as PR titles.

Let's look at some examples of good and bad PR titles:

#### Good PR Titles ✅

- chore(docs): Fix links in contributing page
- feat(gatsby): Add support for per page manifests
- fix(gatsby-plugin-sharp): Ensure images exist before attempting conversion

#### Bad PR Titles ❌

- new tests
- add support for my new cms
- fix bug in gatsby

## Giving Feedback

- Be _nice_. We're stronger everyday because of our community so empathy is important and we want our contributors to feel welcome.
- Make suggestions using [GitHub's suggestions feature](https://help.github.com/en/articles/commenting-on-a-pull-request#adding-line-comments-to-a-pull-request) if possible. This makes accepting your suggestions easier for the author.
- Link to examples when necessary
- Try not to [bikeshed](http://bikeshed.com/) too much
- Note when a suggestion is optional (as opposed to required)
- Be objective and limit nitpicks (a few are fine if they add value or improve code readability)

## Rights and Permissions

### Who can review a PR?

If you're a member of the [gatsbyjs](http://github.com/gatsbyjs) organisation on GitHub, you can review a PR.

> 💡 Not a member yet? Love us and want to help? Make your first contribution and get invited!

### Who can approve a PR?

Every PR opened in the repository needs to be approved before it can be merged. While anyone who is a member of the [gatsbyjs](http://github.com/gatsbyjs) organisation can approve a PR, to be merged in, it needs to be reviewed by a member of the team that owns that part of Gatsby.

Typically this is:

- **gatsbyjs/core** for Code
- **gatsbyjs/docs** for Documentation

We also have `CODEOWNERS` set on different parts of the repo and an approval by someone in the `CODEOWNERS` for the file(s) the PR is changing can also suffice.

### Who can merge a PR?

PRs can only be merged by members of the core team and Gatsbot.

#### Gatsbot

Gatsbot is our little android friend that automatically merges PRs that are ready to go. If a PR is approved and all checks are passing, add the `bot: merge on green` label and Gatsbot will merge it in automatically!

## Gotchas

- You might not always be able to push to an author's fork (depending on their settings). In such a case, leave suggestions.

## Frequently Asked Questions

We don't have any at the moment but if you have one, feel free to add it here.
