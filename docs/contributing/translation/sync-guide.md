---
title: Keeping Translations Up-to-date
issue: https://github.com/gatsbyjs/gatsby/issues/21250
---

Periodically, gatsbybot will create pull requests to keep translations repos up-to-date with the original English source. Make sure to review these PRs to ensure that your translation remains accurate.

> Note: the bot doesn't work yet but will come soon. Until then, see the next section to learn how to manually sync your repo.

### Manually syncing translation repos

If for whatever reason you'd like to manually sync your translation repo, you can do so by running these commands:

```shell
git remote add source https://github.com/gatsbyjs/gatsby-i18n-source.git
git pull source master
```

Fix all [merge conflicts](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-using-the-command-line) and create a pull request to finish the merge.
