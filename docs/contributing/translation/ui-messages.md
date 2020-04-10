---
title: Translating UI Messages
---

Most content that needs to be translated is in Markdown files in translation repos. However, Gatsbyjs.org also has several pieces of UI text that should be translated using a library called [Lingui](https://lingui.js.org/).

## Message Translation Guide

Unlike Markdown documents, UI messages are kept in the same monorepo as the gatsby source.

1. Follow the instructions for [running the Gatsby website](/contributing/website-contributions/).
2. Go to `www/` and run `yarn lingui:add-locale [lang code]` to generate a file for your language at `src/data/locales/[lang-code]/messages.po`.
3. Translate all the strings in `[lang code]/messages.po` by editing the `msgstr` field of each message.

```po
#: src/components/prev-and-next.js:51
msgid: "Previous"
msgstr: "前"
```

## Translating rich content

Some messages will have embedded numerical tags in them. These represent embedded components, formatting, or user-defined text and should be kept in the translated string. If you are unsure about the context of a tag, make sure to look at the source file of the message.

The sections below list the different types of rich content you may encounter.

### Self-closing tags

This type of rich text consists of a single self-closing XML tag (e.g. `<0/>`):

```po
#: src/components/markdown-page-footer.js:24
msgid: "<0/> edit this page on GitHub"
msgstr: ""
```

These are usually icons embedded in the text:

```jsx
<Trans>
  <EditIcon sx={{ marginRight: 2 }} /> Edit this page on GitHub
</Trans>
```

If you are translating a right-to-left language like Arabic, make sure the icons are in the proper position at the start or end of the text.

### Opening and closing tags

This type of rich text consists of matching XML tags (e.g. `<0>` and `</0>`):

```po
#: src/components/shared/egghead-embed.js:39
msgid: "Video hosted on <0>egghead.io</0>"
msgstr: ""
```

These can represent formatting, accessible text, or links:

```jsx
<Trans>
  Video hosted on <a href={lessonLink}>egghead.io</a>
</Trans>
```

Make sure that the tags are paired correctly and surround the corresponding text in the translation.

### Interpolated text

This rich text is represented by braces and a number (e.g. `{0}`):

```po
#: src/components/sidebar/section-title.js:142
msgid: "{0} collapse"
msgstr: ""
```

These represent text in interpolated strings:

```javascript
t`${item.title} collapse`
```

## Plurals, formatting, and grammatical gender

Right now, no text with complex formatting rules is available for translation. When it is, this guide will be updated.

## Updating content

Sometimes additional content is added to the UI, leading to untranslated text. When this occurs, please update your language's `messages.po` file with the new translations.

### New messages

New messages can be found by searching for `msgstr: ""`. These messages may be translated as usual.

### Updated message text

If a previously translated UI message has changed, Lingui will mark that message as outdated and create a new entry for the updated text:

```po
#: src/components/prev-and-next.js:51
#msgid: "Previous"
#msgstr: "前"

#: src/components/prev-and-next.js:51
msgid: "Previous Article"
msgstr: ""
```

Translate the updated entry and delete the old one:

```diff
- #: src/components/prev-and-next.js:51
- #msgid: "Previous"
- #msgstr: "前"

#: src/components/prev-and-next.js:51
msgid: "Previous Article"
- msgstr: ""
+ msgstr: "前の記事"
```
