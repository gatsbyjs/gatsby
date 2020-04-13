# Gatsby Internationalization Scripts

These scripts are used to create and maintain new Gatsby translation repositories. They should be run by an admin of the GatsbyJS GitHub organization to start new translations and keep them up-to-date.

## Overview

The repo `gatsby-i18n-source` contains a copy of the contents of the Gatsby monorepo of all the files that need to be translated. For now, this consists of the MDX files in `/docs`. This repo is updated every time the monorepo changes through the `update-source` script. The reason we need a template repo is that it simplifies the process of updating the translation repos.

The `create` script generates the translation repos using `gatsby-i18n-source` as a template, setting up everything necessary for maintainers to start translating. The `sync` script updates the generated translation repos by performing a `git pull` on `gatsby-i18n-source`.

## Environment

These scripts require the following variables to be defined in the environment, e.g. through a `.env` file:

- `GITHUB_ADMIN_AUTH_TOKEN` - a personal access token for a user with admin access to the gatsbyjs organization. This token must have the following write permissions: `admin:org`, `public_repo`
- `GITHUB_BOT_AUTH_TOKEN` - a personal access token for [gatsbybot](https://github.com/gatsbybot) with `public_repo` permission.

## Scripts

### `update-source`

Usage:

```shell
yarn run update-source
```

The `update-source` script updates the contents of `gatsby-i18n-source` based on the contents of the Gatsby monorepo. It should be run in an automated manner whenever there is a commit to the monorepo.

### `create`

Usage:

```shell
yarn run create [issue #]
```

The `create` script sets up a new translation repository. It takes in the issue number of a [translation request issue](https://github.com/gatsbyjs/gatsby/issues/new?template=new_translation.md) that has a YAML code block:

```yaml
name: English # name of the language to be translated *in English*
code: en # ISO-639 code or IETF language tag
maintainers: # List of maintainers
  - tesseralis
  - marcysutton
```

The script will take this info and:

- Create a new repo `gatsby-en`
- Populate the repo with content from `gatsby-i18n-source`, containing all translateable content
- Create an issue as gatsbybot showing the prioritized list of pages to translate
- Assign all maintainers as CODEOWNERS and permissions
- Invite all maintainers to the GatsbyJS GitHub organization

This script should **only** be run by an admin of the GatsbyJS organization.

### `sync`

Usage:

```shell
yarn run sync [language code]
```

The `sync` script updates contents of the translation repository based on new changes to the repo. It can be run manually or through a bot.

When run, the script will:

- Pulls the latest version of `gatsby-i18n-source`.
- Creates a "sync" pull request that updates all files that do not contain conflicts from the merge.
- Creates a "conflicts" pull request that contains all merge conflicts, with instructions on how to resolve them.

### `run-all`

Usage:

```shell
yarn run-all [script name]
```

The `run-all` script runs the script provided in the argument across all languages for which there are translations of gatbyjs.org, listed in /www/src/i18n.json.
