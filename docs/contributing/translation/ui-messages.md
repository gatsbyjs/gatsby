---
title: Translating UI Messages
---

Most content that needs to be translated is in Markdown files in translation repos. However, Gatsbyjs.org also has several pieces of UI text that should be translated. To do that, we use a library called [Lingui]().

## Translation Guide

Unlike Markdown documents, UI messages are kept in the same monorepo as the gatsby source. The reason the docs are in a separate repo is to give translation maintainers full control and prevent the main monorepo from being cluttered with translation PRs.

However, keeping the UI text in the same repo simplifies our build process, and because UI text is rarely changed/added compared to docs, it shouldn't result in too many PRs.

1. Go to `www/` and run `yarn lingui:add-locale [lang code]` to generate a file for your language.
2. Translate all strings like so:

```po
#: src/components/prev-and-next.js:51
msgid: "Previous"
msgstr: "前"
```

## Dealing with embedded content

Some messages will be surrounded by tags, usually referenced by an xml tag. It is important to keep these tags around the appropriate text so that formatting is maintained.

```po
msgid: "<0/> edit this page on GitHub"
```

```po
msgid "Video hosted on <0>egghead.io</0>"
```

If you are unsure about the purpose of a particular tag, please check the source file.

## Making a pull request

## Updating content

Sometimes additional content is added to the UI, leading to untranslated text. In this case, [gatsbybot should ]
