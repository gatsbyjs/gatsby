* Start Date: 2019-09-11
* RFC PR:
* Gatsby Issue:


## Summary

Begin the process of localizing the documentation of Gatsby into non-English languages.


## Motivation

[You Belong Here.](https://www.gatsbyjs.org/blog/2018-09-07-gatsby-values/#you-belong-here)

Gatsby believes that everyone belongs in Open Source, and that includes developers that do not speak English. Having access to translated documentation opens up the ability to create websites to people who don't speak English and don't have the privileges to be able to learn.


## Detailed Design

The translations will be done in the [same monorepo](https://github.com/gatsbyjs/gatsby) as the rest of the Gatsby documentation and code. Additional tooling, automation, and documentation will be made to ensure that the languages stay up-to-date and to maintain translation quality.

### Overview of Changes

The following things need to be created:

* [ ] A bot to track changes to the English docs and create pull requests
* [ ] Script to aid in verifying translation accuracy
* [ ] Script to set up a new language
* [ ] Documentation for how to start a new language translation and how to contribute translations
* [ ] A prioritized list of pages to translate

There are several changes to the repo that need to be made in order to support localization:

* [ ] All text strings in `/www` need to be moved to `/docs` so they can be translated
* [ ] All content in `/docs` need to be moved to `/docs/en`
* [ ] Support for right-to-left languages
* [ ] Support for language-specific fonts
* [ ] UI to toggle between languages
* [ ] Preserve hashes when switching languages (e.g. `/en/docs/quick-start/#use-the-gatsby-cli` should go to `/es/docs/quick-start/#use-the-gatsby-cli` even though the heading has been translated to Spanish)
* [ ] Make Algolia only search for results within each language

In addition to these crucial tasks, there are a few nice-to-haves:

* [ ] Language auto-detection based on browser language (e.g. redirecting `gatsbyjs.org` to `gatsbyjs.org/fr`).
* [ ] "Not Yet Translated" warning that appears when trying to access a page that doesn't have a translation

### Project Organization

The documentation of each language will be put in a folder under the top-level `/docs` directory in the monorepo:

```
|-- /docs
    |-- /en
        |-- /docs
        |-- /blog
    |-- /es
        |-- /docs
        |-- /blog
```

All content currently under `/docs` will need to be moved under an `/en` directory, and we will need to change routing logic so that `gatsbyjs.org/[content]` redirects to `gatsbyjs.org/en/[content]` (or possibly do automatic locale detection).

The reason for doing this structure is so that all the documentation for each language can be under a single directory instead of being scattered across the `docs/` repository.

In addition, this allows maintainers of each language to use their language directory to keep additional information such as README's for translators or style guides/glossaries to keep translations consistent.

Another option that `gatsby-i18n` supports is to annotate each file with its language code (e.g. `accessibility.en.md`). If we do this, some directories would be cluttered with too many files:

```
|-- /docs
    |-- accessibility.en.md
    |-- accessibility.es.md
    |-- accessibility.fr.md
    |-- accessibility.ja.md
    |-- accessibility.zh-Hans.md
    |-- accessibility.zh-Hant.md
    |-- links.en.md
    |-- links.es.md
    |-- links.fr.md
    |-- links.ja.md
    |-- links.zh-Hans.md
    |-- links.zh-Hant.md
    |-- ...
```

To prevent missing routes due to typos, we can also create a check in the build process to make sure that every file in a non-English subdirectory has an equivalent English one. This script could also verify the structure of documents (for example, that all translations have the same sequence of headings).

### Maintainers

Each language translation will require at least two *maintainers* who are in charge of coordinating the translation of that language. Responsibilities include:

* Organizing work around which pages to translate and who translates them
* Reviewing new translations
* Keeping translations up-to-date

These maintainers will be assigned as the code owners of their language directory.

### Starting a new language translation

Contributors who would like to be maintainers of a new language repo should create a new issue with:

* the English and native name of the language
* the [IETF language code](https://en.wikipedia.org/wiki/IETF_language_tag) of the language
* the GitHub usernames of all proposed maintainers

in a yaml file like so:

```
name: Spanish
localName: Español
code: es
maintainers:
 - tesseralis 
 - KyleAMatthews
```

When accepted, a script should:

* Create a new folder in the repo (e.g. `/docs/es`) with a template README and style guide
* Edit `CODEOWNERS.md` adding the proposed maintainers (either directly or through creating a new team to the Gatsby org)
* Create a new issue for tracking translation progress, and a new label (e.g. `translation-es`).

The script should *not* copy over any files from the `/docs/en` directory. This should be done as contributors make new translations and to prevent the repo from becoming bloated with copies.

### Organizing work

Each supported language should have its own GitHub label (for example `translation-es`) for all changes made to a file in its directory, so that it will be easy to search for issues relating to the language.

Each language will have a "progress tracking issue" with the prioritized list of pages to translate, much like [React](https://github.com/reactjs/id.reactjs.org/issues/1). Unlike React, the issue should ideally be automated (similar to [Renovate](https://github.com/gatsbyjs/gatsby/issues/16840)).

### Updating content

When a translation of a page is completed, we still need to ensure that the translation remains updated when the English source is changed. To do that, we use a bot similar to [React](https://github.com/reactjs/de.reactjs.org/pull/88), but adapted for Gatsby's monorepo.

When a change is detected in the `/docs/en` directory, the bot should, for each language:

* Determine the time a pull request by the bot has occurred
* Run `git diff` on `/docs/en` from that hash
* Apply the patch on `/docs/[lang]` using `git patch` 
* Commit all the merge conflicts and create a pull request (or some other way to annotate which lines have changed)
* Assign the issue to the language maintainers

If an issue already exists for a previous sync, the bot should just edit it with patches from the last sync instead of creating a new issue.

### Tracking Progress

We should track the progress of each language translation to keep track of what languages are close to completion, which ones need help, etc. We could either use a site like https://isreacttranslatedyet.com or just use the "Translations" page like [Electron](https://electronjs.org/languages) does.

Unlike https://isreacttranslatedyet.com, which scrapes GitHub issues to track progress, we can actually just query the website itself to check which pages exist in which languages.

## Drawbacks

There is a fair amount of work needed to create the automation necessary to run the translations. Unlike a SaaS platform, we don't have side-by-side editing, automatic translation of strings, or translation memory. Since everything needs to be done in the same repo and website, there is a lot more up-front work and branching logic needed to support things like right-to-left text.

### Mitigation

Thankfully, Gatsby has already invested a lot of effort into GitHub-based tooling, and the RFC proposer already has experience implementing a GitHub-based translation management system for React. Translation memory is a nice-to-have, but once the initial work has been done we can think of ways to implement it, for example using a [VSCode extension](https://code.visualstudio.com/docs/editor/extension-gallery).

## Alternatives

### SaaS Platform (Crowdin)

[Crowdin](https://crowdin.com/) is a SaaS that allows projects to source translations using a built-in web based editor. It's popular in the JS community being used for projects such as [Electron](https://crowdin.com/project/electron) and [Yarn](https://crowdin.com/project/yarn).

* Lots of features, such as [machine translation](https://support.crowdin.com/pre-translation-via-machine/) and [in-context localization](https://support.crowdin.com/in-context-localization/).
* Has a builtin [GitHub integration](https://support.crowdin.com/github-integration/).
* Popular with translators.
* We can make an official plugin for Crowdin integration that other projects can use.

However, Crowdin has its fair share of disadvantages as well. We had considered using Crowdin for the localization of the React docs but realized that Crowdin had some [major drawbacks](https://reactjs.org/blog/2019/02/23/is-react-translated-yet.html):

* It has a steep learning curve and hard for new users (especially beginning translators) to get accustomed to.
* Doesn't handle web markup well; sites translated with Crowdin sometimes have invalid markup
* Quality of English documentation is mediocre, which is not a good sign for a translation app (see links above).

There are other SaaS platforms such as Transifex that fix some of Crowdin's issues. However, the core issue relies in that they are new systems that most developers are unfamiliar with. We are relying on developers from the Gatsby community rather than professional translators, and those developers tend to be more familiar with GitHub's UI.

### Other GitHub-based arrangements

The monorepo isn't the only way to organize our code. We could do something like React and have each language be in a separate repo copy. This makes it easier to copy content and check for changes, since we can just use `git merge`.

But this has its own drawbacks as well. Each language is its own website and we can't easily switch between languages. The rest of Gatsby's code is in a monorepo and has tooling to make it work, so it makes sense to continue with that paradigm. We'd also like to dogfood Gatsby's localization utilities such as [`gatsby-plugin-i18n`](https://www.gatsbyjs.org/docs/localization-i18n/#gatsby-plugin-i18n).

## Adoption Strategy

To test-drive the process, we can start with three languages or so, based on user interest in this RFC. We will have to manually set up those translations while we create the automation, but they should provide a test bed to make sure our checks work.

The only thing we need to do before those languages are set up is move content over to `/docs/en` and handle the routing appropriately. Once that's done, the translations can start and we can divide up the other changes needed for the website.

Once the automation work for setting up new translations is done, we can open up pull requests to create new language to more people.

When the first languages have a "core" set of pages translated (for example, the Home Page, Tutorial, and API Reference), that translation can be marked as "Complete".


## How will we teach this

We'll create additional documentation in both the monorepo and the site itself on the process of contributing translations. There should be documentation for:

* How to contribute a new translation (with a link to the progress issue)
* How the automation works and what to expect
* The responsibilities of a translation maintainer
* Tips for translators

We should also do outreach to Gatsby users and communities around the world to inform them that the translations are in progress and (once completed) spread the word that the localizations exist.


## Unresolved Questions

* If we intend to publish different versions of the Gatsby docs, how will versioning work across the different languages?
* How do we limit the Algolia search to only return results for each language?
* How do we manage SEO?
* What is the process for determining who gets to maintain a language? For React, we pretty much let the first two people to create a pull request start their own language translation.
