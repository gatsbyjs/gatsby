# Gatsby Internationalization Scripts

These scripts are used to create and maintain new Gatsby translation repositories. They should be run by an admin of the GatsbyJS GitHub organization to start new translations and keep them up-to-date.

## Environment

These scripts require the following variables to be defined in the environment, e.g. through a `.env` file:

- `GITHUB_ADMIN_AUTH_TOKEN` - a personal access token for a user with admin access to the gatsbyjs organization. This token must have the following write permissions: `admin:org`, `public_repo`
- `GITHUB_BOT_AUTH_TOKEN` - a personal access token for [gatsbybot](https://github.com/gatsbybot) with `public_repo` permission.

## `create`

Usage:

```
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

## `sync` (TODO)

The `sync` script updates contents of the translation repository based on new changes to the repo. It can be run manually or through a bot.
