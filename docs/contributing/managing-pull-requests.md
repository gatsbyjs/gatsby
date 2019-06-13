---
title: Managing Pull Requests
---

## Pull Requests and the Community

Gatsby is an open source project. We have over 2,000 contributors and so much of what makes Gatsby great is contributed by folks like you!

Needless to say, we get a lot of PRs and we've been merging over a [100 contributions](https://twitter.com/kylemathews/status/1111435640581689345) every week. Yes, _every week_.

Let's talk a little about how we manage pull requests in the Gatsby repo!

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

### General

Some general things to verify in a pull request are:

- Links ought to be relative
- Language ought to be inclusive and accessible

Each kind of PR also requires a different set of specific checks from us before they are merged in!

Let's go over them real quick.

### Documentation

We typically look for the following in PRs that add documentation:

- Correctness — whether the added documentation is technically correct
- Style — whether the written language follows our [style guide](https://www.gatsbyjs.org/contributing/gatsby-style-guide/)

### Code

For PRs that add code (whether a feature or fix), we look for the following:

- Correctness — whether the code does what we think it does
- Tests — when fixing a bug or adding a new feature, it can be very valuable to add tests. While we do merge some small PRs without them, more often than not, it's good to have tests asserting behaviour! This can be a combination of unit tests for the specific package, snapshot tests and end to end tests. The goal here is to ensure that something that is being fixed or added _remains_ fixed or working the way we expect it to. Good tests ensure this!
- Code Quality — while it isn't good to nit pick, reasonable changes that improve readability are great to point out
- Documentation in the package's README if you're adding something

### Starters or Site Showcase

For PRs that add a site or a starter to the showcase, we ought to check:

- We check if the site or starter is indeed a Gatsby site or starter respectively
- Links — check if the links are working and accessible
- Tags — ensure the tags are not arbitrary
- Featured Status — for the site showcase, we like to default to _not_ featuring a site and typically someone from the Gatsby team features it later if they like!

### Blog posts

For PRs that add a blog posts, we ought to check:

- Correctness — whether the added documentation is technically correct
- Style — whether the written language follows our [style guide](https://www.gatsbyjs.org/contributing/gatsby-style-guide/)
- Blog posts are similar to documentation in that they're long form writing, but also want to ensure that blog posts on [gatsbyjs.org](https://www.gatsbyjs.org) aren't purely promotional, spammy or inappropriate.

## Automated Checks

Our repository on [GitHub](https://github.com/gatsbyjs/gatsby) has several automated CI checks that are run automatically for all PRs. These include tests, linting and even preview builds [gatsbyjs.org](https://www.gatsbyjs.org).

We want all of these checks to pass. While it's okay to review a work in progress PR with some failed checks, a PR is only ready to ship when everything is green.

Let's go over some common failure cases in our cases and how to approach fixing them:

### Linting

- Document what commands to run
- Installing prettier and other tools

## Other Checks

### Test the PR locally

- Test the feature locally

  - (Side note: link to another doc?)
  - [https://www.gatsbyjs.org/contributing/setting-up-your-local-dev-environment/](https://www.gatsbyjs.org/contributing/setting-up-your-local-dev-environment/)
  - Talk about gatsby-dev-cli (and how that helps in testing out changes in a package in the monorepo)
  - [https://www.gatsbyjs.org/contributing/code-contributions/#using-docker-to-set-up-test-environments](https://www.gatsbyjs.org/contributing/code-contributions/#using-docker-to-set-up-test-environments)

  how to run tests

- PRs get squashed so individual commit messages are not important (but helpful anyway) but do this to [https://www.conventionalcommits.org/en/v1.0.0-beta.3/](https://www.conventionalcommits.org/en/v1.0.0-beta.3/)))

## Giving Feedback

- Be _nice_. We're stronger everyday because of our community so empathy is important and we want our contributors to feel welcome.
- Make suggestions using [GitHub's suggestions feature](https://help.github.com/en/articles/commenting-on-a-pull-request#adding-line-comments-to-a-pull-request) if possible. This makes accepting your suggestions easier for the author.
- Link to examples when necessary
- Try not to [bikeshed](http://bikeshed.com/) too much
- Note when a suggestion is optional (as opposed to required)
- Be objective and limit nitpicks (a few are fine if they add value or improve code readability)

## Rights and Permissions

Talk about bots

- [ ] Who owns what type of questions
- When can you review? Should people comment on PRs that are WIP/Draft
  - Marcy thinks having a go ahead from the author is a good thing to wait for
  - [ ] Add details about being invited after your first contribution and what that allows one to do
  - [ ] Talk to the Core Team
- Who can review?
  - Everyone!
- Who can approve/merge?
  - CODEOWNERS / core team

## Gotchas

- You might not always be able to push to an author's fork (depending on their settings). In such a case, leave suggestions.

## Frequently Asked Questions

We don't have any at the moment but if you have one, feel free to add it here.
