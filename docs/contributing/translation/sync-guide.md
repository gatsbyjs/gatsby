---
title: Keeping Translations Up-to-date
---

> ⚠️ Note: At the moment our localization efforts are on pause, as we shifted towwards a [redesign of the docs](https://www.gatsbyjs.com/blog/announcing-new-gatsby-docs-site/). Right now, we're prioritizing a new version of the tutorial. As with all prioritization efforts, we will weigh this, amongst other potential features, fixes, and improvements, and may consider picking up on the internationalization efforts of 2020. The repositories inside the GitHub org will remain. For now we archived the respective language channels on our Discord and the role for language maintainers.

Every Friday at 6:00 PM PST, gatsbybot will run a sync script on every translation repo to bring them up-to-date with the current English repo. If there is an update to a page that is already translated, gatsbybot will create a pull request listing the conflicts between the translation and the new English content. Resolving these conflicts and merging these pull requests is essential to keeping your translation repo up-to-date.

## Gatsbybot sync behavior

If there are existing sync pull requests marked by the `sync` label, gatsbybot will skip the repository until the next time it runs. Because of this, it is important to make sure that you merge sync and conflict pull requests promptly, so that stale translations don't build up.

## Resolving sync pull requests

When it runs the sync script, gatsbybot will create up to two pull requests. One is named:

```text
(sync) Sync with gatsby-i18n-source @ {hash}
```

This pull request contains updates to all files that do not have conflicts. This includes files that have not been translated yet, and files that have been added to Gatsby. In general, these files can be merged in as-is, but it may be worth looking over them to see if there are any new files that were added to the repo that need to be translated.

> 🚨NOTE: Make sure you do **NOT** choose the ["Squash and merge"](https://help.github.com/en/github/administering-a-repository/about-merge-methods-on-github#squashing-your-merge-commits) option when merging this pull request. Squashing will result in Git losing information about the sync, and will lead to extra conflicts on your next sync. Always make sure that you use the "Merge pull request" option.

The second pull request will be named:

```text
(sync) Resolve conflicts with gatsby-i18n-source @ {hash}
```

This pull request will list files that have conflicts between translated content and English content. These updates will appear as Git conflicts:

```diff
+ <<<<<<< HEAD
Ahora, el componente `Box` estará al pendiente del estado de la transición de la página que es hijo, y aparecerá de entrada/salida en consecuencia.
+ =======
+ Now, the `Box` component will be aware of whether the page it's a child of is mounting or unmounting, and it will fade in/out accordingly.
+ >>>>>>> 90932a06db2e297cf416552b84e48b4b82e56fbc
```

Here, the top block is the original translated line and the bottom block is the updated source content. You should resolve these conflicts by updating the top block to reflect the content of the bottom block.

You may use whatever tools you like to resolve these conflicts: the GitHub UI, the command line, or a code editor like VS Code. See the [Common types of merge issues](#common-types-of-merge-issues) section for how to resolve various conflicts.

## Manually syncing translation repos

If for whatever reason you'd like to manually sync your translation repo, you can do so by running these commands:

```shell
git remote add source https://github.com/gatsbyjs/gatsby-i18n-source.git
git pull source master
```

Fix all [merge conflicts](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-using-the-command-line) and create a pull request to finish the merge.

## Common types of merge issues

### Frontmatter changes

This type of conflict reflects a change to the [frontmatter](/docs/adding-markdown-pages/#frontmatter-for-metadata-in-markdown-files) of a document.

Removing a field:

```diff
+ <<<<<<<
title: my stub article
issue: #12345
+ =======
+ title: My Stub Article
+ >>>>>>>
```

Adding a field:

```diff
+ <<<<<<<
title: Documentation
+ =======
+ title: Docs
+ description: The one-stop shop for documentation in Gatsby!
+ >>>>>>>
```

Changing a field:

```diff
+ <<<<<<<
title: My old title
+ =======
+ title: My new title
+ >>>>>>>
```

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
- Please see our [plugins page](/plugins).
+ Please see our [plugins page](/plugins).
```

```diff
- Check out our [GitHub](http://github.com/gatsbyjs/gatsby)
+ Check out our [GitHub](https://github.com/gatsbyjs/gatsby)
```

Resolve these changes by updating the link.

### Content changes

Sometimes, the content of the source page is actually updated and needs a translation. Make sure to read the change carefully and change the translation to match its meaning.

### Conflicts in untranslated files

Sometimes, you may find conflicts in files that haven't been translated yet:

```diff
+ <<<<<<<
This is old English content.
+ =======
+ This is new English content.
+ >>>>>>>
```

This is usually because of a previous improper merge (for example, using the "Squash and merge" option). In this case, it's usually alright to accept the new content. In VS Code, this is done using the "Accept Incoming Change" option:

```diff
- This is old English content.
+ This is new English content.
```

## Creating a separate pull request

If a page has significant changes, it may be worth splitting it into its own pull request:

```shell
git checkout conflicts-9032a0
git checkout -b sync-tutorial-0
# Fix conflicts in /docs/docs/tutorial/part-zero/index.md
git commit -am "Fix conflicts in tutorial part zero"
git push -u origin sync-tutorial-0
```

Once the branch is pushed, create a pull request for branch `sync-tutorial-0` with `conflicts-9032a0` as the base branch.
