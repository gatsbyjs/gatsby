# Changelog Generator

Generates changelogs based on Gatsby Release Process conventions:

1. Each `minor` release has its own release branch (e.g. `release/2.32`)
2. Each `minor` release branch starts from master with pre-minor `next` tag
   (e.g. minor `2.32.0` starts from `2.32.0-next.0`)
3. So all commits of a minor release are in a range like this: [2.32.0-next.0...2.32.0](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.32.0-next.0...gatsby@2.32.0).
4. Commits of a patch release are in the usual range: [2.32.0...2.32.1](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.32.0...gatsby@2.32.1).

## Conventional Commits

This generator relies on [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)
and under the hood uses tooling from [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)
(adapter for Gatsby Release Process conventions).

Using modified [templates](./templates) from the [angular preset](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular).
