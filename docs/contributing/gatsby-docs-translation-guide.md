---
title: Gatsby Docs Translation Guide
---

There is an ongoing effort to translate the content on Gatsbyjs.org into multiple languages. For members of the community around the world building Gatsby sites and learning about web development, having docs and learning materials in your own language provides a lot of value. There's also a great opportunity for folks like you to contribute to the translations of the Gatsby docs.

If you're a fluent speaker of a language other than English and you're interested in helping translate [gatsbyjs.org](https://gatsbyjs.org), here is some information for you to know:

## The general process

Each translation has its own repository in the [gatsbyjs](https://github.com/gatsbyjs/) organization on GitHub, with designated codeowners to review and approve changes. Each repo will include all pages needing translations (with some prioritized over others), and a bot to notify of changes in the main repo to keep everything up-to-date.

This doc will outline how to request a new language repository with its own team, what decisions each team can make, and suggestions for how you can work together.

### Page translation priorities

The Gatsby learning team is in charge of determining priorities for which docs should be translated. Refer to the [i18n page spreadsheet](https://docs.google.com/spreadsheets/d/1u2amGnqFLKxJuL5h9UrDblUueFgg0EBt7xbau4n8iTM/edit) to get the most up-to-date priority list, which includes frequently-visited pages in the Gatsby docs, tutorial, recipes, and other important pages.

[Reference guide overview pages](/contributing/docs-templates/#reference-guide-overview) are also worth translating to establish a fully translated path to a frequently visited [reference guide](/contributing/docs-templates/#reference-guides), though they are listed at a lower priority. Pages not translated will appear in English alongside translated pages to present a complete website without gaps, similar to the [React.js docs](https://reactjs.org).

### Use English as the source

The [gatsbyjs.org](https://gatsbyjs.org) website is written first in English and should be considered the source material for all translations (as opposed to starting from another translation). When a repository is created, it will provide a copy of the docs to be translated which you can then update through [pull requests](/contributing/how-to-open-a-pull-request/) against them in the relevant language.

Changes to the meaning of a text or code example should be done in the main [English repo](https://github.com/gatsbyjs/gatsby/), and then translated afterwards to keep the content aligned across languages.

## Process for starting a new translation

The first step for starting a new translation is to check what exists. So far, there are repositories for the following languages:

- [Arabic](https://github.com/gatsbyjs/gatsby-ar)
- [German](https://github.com/gatsbyjs/gatsby-de)
- [Spanish](https://github.com/gatsbyjs/gatsby-es)
- [French](https://github.com/gatsbyjs/gatsby-fr)
- [Gujarati](https://github.com/gatsbyjs/gatsby-gu)
- [Hindi](https://github.com/gatsbyjs/gatsby-hi)
- [Indonesian](https://github.com/gatsbyjs/gatsby-id)
- [Italian](https://github.com/gatsbyjs/gatsby-it)
- [Korean](https://github.com/gatsbyjs/gatsby-ko)
- [Mongolian](https://github.com/gatsbyjs/gatsby-mn)
- [Dutch](https://github.com/gatsbyjs/gatsby-nl)
- [Polish](https://github.com/gatsbyjs/gatsby-pl)
- [Brazilian Portuguese](https://github.com/gatsbyjs/gatsby-pt-BR)
- [Russian](https://github.com/gatsbyjs/gatsby-ru)
- [Turkish](https://github.com/gatsbyjs/gatsby-tr)
- [Vietnamese](https://github.com/gatsbyjs/gatsby-vi)
- [Simplified Chinese](https://github.com/gatsbyjs/gatsby-zh-Hans)
- [Traditional Chinese](https://github.com/gatsbyjs/gatsby-zh-Hant)

> Note: Once a new translation repository is created, feel free to add it here in a PR!

If your language is not listed above, check the list of [open translation requests](https://github.com/gatsbyjs/gatsby/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+%22New+Translation+Request%22).

If you don't see the language among the issues listed, feel free to create a new [translation request issue](https://github.com/gatsbyjs/gatsby/issues/new?template=new_translation.md) for it and follow the instructions.

### Finding codeowners

For a new translation, open an issue with information about your intended language. If you already have co-contributors to act as fellow [code owners](https://help.github.com/en/articles/about-code-owners) and provide checks and balances for PR reviews and quality assurance, that would be very helpful! Otherwise, you can check out other [translation request issues](https://github.com/gatsbyjs/gatsby/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+%22New+Translation+Request%22) people have made and offer to join, or [get in touch with us](/contributing/how-to-contribute/#not-sure-how-to-start-contributing) at Gatsby for help in building your translation team.

## Contributing to a translation

Once a language repository is created and someone on the Gatsby team has assigned codeowners, contributions can begin. It is up to the discretion of the contributor how exactly they want to work, but it's recommended to limit the scope of PRs to 1 doc at a time to aid with code reviewing.

Maintainers of a translation are expected to review translations for quality, friendly and encouraging tone of voice, and technical accuracy. These qualities should be considered in every pull request regardless of who it comes from; contributions should be encouraged from anyone in the community, not just maintainers.

> ⚠️ Note: All contributors are expected to follow the [Gatsby Code of Conduct](/contributing/code-of-conduct/) and work professionally with fellow contributors. For issues with conduct, if you are unable to work things out amicably amongst yourselves (perhaps after filing a public issue or having a discussion on Discord), you can contact the Gatsby team at [conduct@gatsbyjs.com](mailto:conduct@gatsbyjs.com) with details about the situation.

### Code review process

Translation contributions must be opened as pull requests to provide time for review and comments. If actionable feedback is given on a PR review, the author must acknowledge the review and make changes with their discretion. Ignoring review feedback completely is not allowed (see response templates below for help with this).

## Maintainer responsibilities

As repo maintainers and members of the Gatsby community, your responsibilities are as follows:

- Keep issues up-to-date as people volunteer to translate pages.
- Review pull requests made by contributors promptly.
- Review pull requests generated by gatsbybot in order to make sure translations remain up-to-date with the source repo. (details to come)
- Act as point of contact for your language and answer questions from both contributors to your language and the core Gatsby team.
- Set up a process in order to get your translation published. (details to come)

As a maintainer, you are welcome to add a contributing doc written in your language to assist with the process. You can find an example in the [gatsby-es repo](https://github.com/gatsbyjs/gatsby-es/blob/master/CONTRIBUTING.MD). Translating [this page](https://github.com/gatsbyjs/gatsby/blob/master/docs/contributing/gatsby-docs-translation-guide.md) and copying it into a `contributing.md` file would be an option as well.

### Keeping translations up-to-date

Periodically, gatsbybot will create pull requests to keep translations repos up-to-date with the original English source. Make sure to review these PRs to ensure that your translation remains accurate.

> Note: the bot doesn't work yet but will come soon. Until then, see the next section to learn how to manually sync your repo.

#### Manually syncing translation repos

If for whatever reason you'd like to manually sync your translation repo, you can do so by running these commands:

```
git remote add source https://github.com/gatsbyjs/gatsby-i18n-source.git
git pull source master
```

Fix all [merge conflicts](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-using-the-command-line) and create a pull request to finish the merge.

### Additional tips

#### Set up a style guide and glossary

Your language repo comes with a template [style guide](https://github.com/gatsbyjs/gatsby-i18n-source/blob/master/style-guide.md) that you can use to put in style rules specific to your language. Refer to the [translation style guide](#translation-style-guide) section for more information.

#### Collaborate on difficult pages

Some pages are very long and difficult to translate for a single contributor. Feel free to split these pages up into sections and work on them together!

In addition, sometimes a contributor cannot continue a PR for whatever reason. It may help to ask them if they need assistance and to bring someone else on to complete the work in a timely fashion.

#### Set up a review process

As codeowners, you have the freedom and responsibility to decide what your review process will be like. You can decide how many reviewers you'd like. If your team is small, one reviewer may be enough. But if you have lots of contributors and enough codeowners, you may want to require two reviewers for additional quality.

You have the ability to install any plugin or automation tool that will make your life easier as codeowners. Is there a text linter that works well in your language? Is there any automation that you can add? If you feel that these improvements would be beneficial to other languages as well, create an issue or PR for it in the main Gatsby repository.

#### Ask for help

Don't be afraid to ask for help! If you're not sure about something, you can post in the `#localization` channel on the [Gatsby Discord](https://gatsby.dev/discord) or create an issue in the Gatsby repo.

If it feels like there is too much work and you need help, you have the ability to to add more codeowners by editing the `CODEOWNERS` file in the repo. Are there any contributors who are making exceptional contributions? If so, consider making them a codeowner.

We also understand that life sometimes gets in the way. If you find that you are no longer able to satisfy your codeowner duties, let the Gatsby team know so we can figure out the best path forward.

#### Spread the word!

If you're finding it hard to find people to help translate, spread the word about your translation effort! If you use social media like Twitter, tag the [gatsby Twitter account](https://twitter.com/gatsbyjs) and we'll share it. Ask people in local Gatsby or React meetups if they would be interested in contributing.

### When a maintainer or contributor will be removed

Consistent with the [Code of Conduct](/docs/code-of-conduct/) the Gatsby team reserves the right to remove a maintainer (or contributor) from the Gatsby organization if necessary. Some reasons for being removed include spammy comments, closing PRs or issues without action or productive dialogue,or generally harmful or abusive behavior inconsistent with Gatsby's policies.

### Template responses for closing PRs

Sometimes a PR has a valid reason to not be merged as-is. Templates can help speed up the process of responding to someone while encouraging future contributions.

#### PRs with quality issues

If a PR includes content that is of poor quality (such as from Google Translate or missing important nuance) or doesn't meet the requirements, it would help to include a drafted reply to encourage contributors to continue with the project. Here is an example that can be translated for a given repo:

```
Hey! Thanks so much for opening a pull request!

We really appreciate you sending this over, but the change you’ve proposed is not going to be accepted because it doesn't meaningfully translate the Gatsby docs content.

We absolutely want to have you as a contributor, so please take a look at [our open issues][open-issues] for ideas and reach out to the Gatsby team [on Twitter at @gatsbyjs](https://twitter.com/gatsbyjs) with questions.

Thanks again, and we look forward to seeing more PRs from you in the future! 💪💜
[open-issues]: YOUR_REPO_ISSUE_URL_HERE
```

#### PRs with changes more fitting for the main Gatsby repo

Because the main Gatsby repo is the source of content, more substantive changes should be closed and redirected there. Here is a template that could be translated for your repo:

```
Hey! Thanks so much for opening a pull request!

We really appreciate you sending this over, but the change you’ve proposed is not going to be accepted because it includes broad changes to the docs content that should be done in the [main Gatsby repo](https://github.com/gatsbyjs/gatsby) instead.

We absolutely want to have you as a contributor, so please take a look at the original source for these changes and make them there first before translating. You can also visit [our open issues][open-issues] for ideas and reach out to the Gatsby team [on Twitter at @gatsbyjs](https://twitter.com/gatsbyjs) with questions.

Thanks again, and we look forward to seeing more PRs from you in the future! 💪💜
[open-issues]: YOUR_REPO_ISSUE_URL_HERE
```

## Style guide for translations

Each language translation may have some specific ways it differs from the advice Gatsby provides for writing in English, such as the use of "you" as the pronoun or the Oxford comma. Each translation group should decide on conventions and stick with them for consistency, documenting those decisions in the repo's [style guide](https://github.com/gatsbyjs/gatsby-i18n-source/blob/master/style-guide.md) file to set contributors up for success. Use the [English style guide](/contributing/gatsby-style-guide/) as a reference as a reference to determine the equivalent rules in your language.

Guidelines that remain firm no matter the language stem from the goals and values of Gatsby as a project: to provide a **friendly community for Gatsby learners of all skill and experience levels** that's also **safe and welcoming to contributors**. Translated docs and learning materials should [maintain these values](/blog/2019-04-19-gatsby-why-we-write/) with **high-quality spelling and grammar**, accurate information, similar structure and purpose. For any questions about guidelines, feel free to [get in touch](/contributing/how-to-contribute/#not-sure-how-to-start-contributing) with the Gatsby team.

### Glossary

The style guide has a [glossary section](https://github.com/gatsbyjs/gatsby-i18n-source/blob/master/style-guide.md#glossary) that you can use to fill in common translations. Look at the English [Glossary](/docs/glossary/) for a list of terms that are useful to have translations for.

### Universal style guide

The following rules should apply in all translations and can serve as a basis for your language-specific style guide.

#### Keep the meaning of the source

Keep the meaning of the original English source even if it is confusing or has a typo. If you find an error that can be fixed, create an issue or pull request to the original [gatsby repo](https://github.com/gatsbyjs/gatsby) so that all translations can benefit from the change.

#### Text in code blocks

Leave text in code blocks untranslated except for comments. You may optionally translate text in strings, but be careful not to translate strings that refer to code!

✅ DO:

```js
// Ejemplo
import React from "react"
export default () => (
  <div style={{ color: `purple`, fontSize: `72px` }}>Hello Gatsby!</div>
)
```

✅ ALSO OKAY:

```js
// Ejemplo
import React from "react"
export default () => (
  <div style={{ color: `purple`, fontSize: `72px` }}>¡Hola Gatsby!</div>
)
```

❌ DON'T:

```js
// Ejemplo
import React from "react"
export default () => (
  // 'purple' is a CSS keyword
  <div style={{ color: `morado`, fontSize: `72px` }}>¡Hola Gatsby!</div>
)
```

❌ DEFINITELY DON'T:

```js
importar Reaccionar desde "reaccionar"
exportar defecto () => (
   <div estilo = {{color: `morado`, fontSize:` 72px`}}> ¡Hola Gatsby! </div>
)
```

#### Internal links

Translate link text but keep all slugs and hashes in links the same as they are in English.

✅ OK:

```md
- [Configure su entorno de desarrollo](/tutorial/set-up-your-development-environment)
```

❌ DON'T:

```md
- [Configura tu entorno de desarrollo](/tutorial/configura-tu-entorno-de-desarrollo)
```

#### External links

If an external link is to an article in a reference like [MDN] or [Wikipedia], and a version of that article exists in your language that is of decent quality, consider linking to that version instead.

[mdn]: https://developer.mozilla.org/en-US/
[wikipedia]: https://en.wikipedia.org/wiki/Main_Page

✅ OK:

```md
Los elementos de React son [inmutables](https://es.wikipedia.org/wiki/Objeto_inmutable).
```

For links that have no equivalent (Stack Overflow, YouTube videos, etc.), use the English link.

## Language-specific maintainer channels

Each translation group may want to have a space for maintainers and community members to ask questions and coordinate the project. **[Discord](https://gatsby.dev/discord) is the official channel** and maintainers can have their own private groups if desired. Some groups may elect to use a different platform such as Wechat or Whatsapp, but that will be at your own discretion.

To set up a Discord channel for a translation group (if it doesn't already exist), [ping the Gatsbyjs team](/contributing/how-to-contribute/#not-sure-how-to-start-contributing).
