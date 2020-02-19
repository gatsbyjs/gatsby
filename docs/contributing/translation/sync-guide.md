---
title: Keeping Translations Up-to-date
---

Periodically, gatsbybot will update your translation repo to be up-to-date with the current English repo. If there is an update to a page that is already translated, gatsbybot will create a pull request listing the conflicts between translation and the new English content. Resolving these conflicts and merging these pull requests is essential to keeping your translation repo up-to-date.

## Resolving sync pull requests

When it runs the sync script, gatsbybot will create up to two pull requests. One is named:

```
(sync) Sync with gatsby-i18n-source @ {hash}
```

This pull request contains updates to all files that do not have conflicts. This includes files that have not been translated yet, and files that have been added to Gatsby. In general, these files can be merged in as-is, but it may be worth looking over them to see if there are any new files that were added to the repo that need to be translated.

> 🚨NOTE: Make sure you do **NOT** choose the ["Squash and merge"](https://help.github.com/en/github/administering-a-repository/about-merge-methods-on-github#squashing-your-merge-commits) option when merging this pull request. Squashing will result in Git losing information about the sync, and will lead to extra conflicts on your next sync. Always make sure that you use the "Merge pull request" option.

The second pull request will be named:

```
(sync) Resolve conflicts with gatsby-i18n-source @ {hash}
```

This pull request will list files that have conflicts between translated content and English content. These updates will appear as Git conflict markers (`<<<<<<<`).

You may resolve these conflicts however you feel comfortable: through the GitHub UI, from the command line, or with a code editor like VS Code. See the [Common types of merge issues](#common-types-of-merge-issues) section for how to resolve various conflicts.

## Manually syncing translation repos

If for whatever reason you'd like to manually sync your translation repo, you can do so by running these commands:

```shell
git remote add source https://github.com/gatsbyjs/gatsby-i18n-source.git
git pull source master
```

Fix all [merge conflicts](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-using-the-command-line) and create a pull request to finish the merge.

## Common types of merge issues

### Typos fixes

Sometimes there is a typo or grammatical error in the English source that gets fixed in an update.

```diff
- Let's all use Gabsty!
+ Let's all use Gatsby!
```

```diff
- Gatsby is awesome framework!
+ Gatsby is an awesome framework!
```

Since these typos most likely don't exist in the translated version, you can most likely use the translated version as-is.

### Formatting changes

Sometimes the only difference is a change in formatting, such as adding back-ticks to annotate something as code, or changing the level of headings:

```diff
- Sass files have the extension .scss.
+ Sass files have the extension `.scss`.
```

```diff
- #### Formatting changes
+ ### Formatting changes
```

The only necessary change is to ensure the translated content carries over these formatting updates.

### Link updates

These changes involve updating the URL of a link:

```diff
- Please see our [plugins page](/packages).
+ Please see our [plugins page](/plugins).
```

```diff
- Check out our [GitHub](http://github.com/gatsbyjs/gatsby)
+ Check out our [GitHub](https://github.com/gatsbyjs/gatsby)
```

Resolve these changes by updating the link.

### Content changes

Sometimes, the content of the source page is actually updated and needs a translation. Make sure to read the change carefully and change the translation to match its meaning.

### Content additions

Sometimes pages is updated with additional paragraphs, lists, or other content.

```diff
-In English, your articles should use the second person ("you") to provide a conversational tone. This way, the text and instructions seem to speak directly to the person reading it. Try to avoid using the first person ("I", "we", "let's", and "us").

+In English, your articles should use the second person ("you") to provide a conversational tone. This way, the text and instructions seem to speak directly to the person reading it. Try to avoid using the first person ("I", "we", "let's", and "us").
+For other languages, refer to each translation's guidelines (if applicable) for consistent phrasing. When appropriate, we suggest starting with the informal "you" to keep a conversational tone.
```

In this case, the new content should be translated as with any other content. If there is a significant amount of new content, you may want to create a separate pull request to translate it.
