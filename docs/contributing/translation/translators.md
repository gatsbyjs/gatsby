---
title: Contributing to a Translation
---

> ⚠️ Note: At the moment our localization efforts are on pause, as we shifted towwards a [redesign of the docs](https://www.gatsbyjs.com/blog/announcing-new-gatsby-docs-site/). Right now, we're prioritizing a new version of the tutorial. As with all prioritization efforts, we will weigh this, amongst other potential features, fixes, and improvements, and may consider picking up on the internationalization efforts of 2020. The repositories inside the GitHub org will remain. For now we archived the respective language channels on our Discord and the role for language maintainers.

Once a language repository is created and someone on the Gatsby team has assigned codeowners, contributions can begin. It is up to the discretion of the contributor how exactly they want to work, but it's recommended to limit the scope of PRs to 1 doc at a time to aid with code reviewing.

> ⚠️ Note: All contributors are expected to follow the [Gatsby Code of Conduct](/contributing/code-of-conduct/) and work professionally with fellow contributors. For issues with conduct, if you are unable to work things out amicably amongst yourselves (perhaps after filing a public issue or having a discussion on Discord), you can contact the Gatsby team at [conduct@gatsbyjs.com](mailto:conduct@gatsbyjs.com) with details about the situation.

## Translation Tips

### Use English as the source

The [gatsbyjs.com](https://www.gatsbyjs.com) website is written first in English and should be considered the source material for all translations (as opposed to starting from another translation). When a repository is created, it will provide a copy of the docs to be translated which you can then update through [pull requests](/contributing/how-to-open-a-pull-request/) against them in the relevant language.

Changes to the meaning of a text or code example should be done in the main [English repo](https://github.com/gatsbyjs/gatsby/), and then translated afterwards to keep the content aligned across languages.

### Collaborate on difficult pages

Some pages are very long and difficult to translate for a single contributor. Feel free to split these pages up into sections and work on them together!

In addition, if you cannot continue a PR for whatever reason, please let maintainers know so that they can assign the translation for someone else to finish.

### Check "allow edits from maintainers"

Contributors should check "allow edits from maintainers" when making Pull Requests (PRs). This will [allow maintainers to make changes](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/allowing-changes-to-a-pull-request-branch-created-from-a-fork) directly to a PR branch created from a fork. Maintainers can add these instructions to a PR template to serve as a reminder to contributors.

## Code review process

Translation contributions must be opened as pull requests to provide time for review and comments. If actionable feedback is given on a PR review, the author must acknowledge the review and make changes with their discretion. Ignoring review feedback completely is not allowed (see response templates below for help with this).

## Becoming a maintainer

If you would like to be a maintainer of an existing translation repo, submit a PR to the repo editing the `CODEOWNERS` file of that repo adding your GitHub username. In the PR description, include the following information:

- Why you would like to be a maintainer
- A summary of your contributions to the translation repo so far
- Your experience with open source and translation
- How much time per week you'll be able to commit to being a translation maintainer

## When a contributor will be removed

Consistent with the [Code of Conduct](/contributing/code-of-conduct/) the Gatsby team reserves the right to remove a contributor (including translation maintainers) from the Gatsby organization if necessary. Some reasons for being removed include spammy comments, closing PRs or issues without action or productive dialogue, or generally harmful or abusive behavior inconsistent with Gatsby's policies.
