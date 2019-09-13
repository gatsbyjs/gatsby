* Start Date: 2019-09-11
* RFC PR:
* Gatsby Issue:

## Summary

Begin the process of localizing the documentation of Gatsby into non-English languages.

## Motivation

[You Belong Here.](https://www.gatsbyjs.org/blog/2018-09-07-gatsby-values/#you-belong-here)

Gatsby believces that everyone belongs in Open Source, and that includes developers that do not speak English. Having access to translated documentation opens up the ability to create websites to people who don't speak English and don't have the privileges to be able to learn.

## Detailed Design

There are two main approaches we can take for the translations. Whichever path we choose depends on the prorities of the Gatsby team, hence the Request for Comments. The options are: (1) doing translations on GitHub directly or (2) using a translation SaaS platform such as Crowdin. This document will go over both alternatives and the advantages and drawbacks of each option.

## Alternative 1: GitHub-based translations

The first and simplest option is to simply create and host the translations on GitHub itself, along with the rest of the Gatsby documentation. For smaller websites (like [Dan Abramov's blog](https://github.com/gaearon/overreacted.io)) it's enough to put each translation in a markdown file next to the source file and use `gatsby-i18n`.

For larger websites, especially documentation websites that have lots of PRs and require versioning and up-to-date content, this isn't enough. The docs for [Angular](https://github.com/angular/angular-cn/tree/aio), [Vue](https://github.com/vuejs/jp.vuejs.org), and [React](https://github.com/reactjs/es.reactjs.org) store their translations in copies of the repo.

### Advantages

This was the approach that we took for translating the React docs. It appealed to us for a lot of reasons:

* Open Source Contributors tend to be familiar with Git
* No need to integrate with an external API and software (aside from GitHub)
* People want to be listed as contributors of the React/Gatsby organization on GitHub, and it's an incentive to contribute.
* Can use GitHub features such as Code Owners and pull requests as quality assurance

### Drawbacks

The main drawback of this approach is that the Gatsby docs currently live in a monorepo with the rest of the Gatsby source, which means we can't just do a copy of the entire website and use `git merge` like we do with React (and Vue).

This is also an issue if we want translations to live under a path (e.g. `gatsbyjs.org/ja` rather than `ja.gatsbyjs.org`).

Other drawbacks we learned from working on the React translation:

* Need to maintain a custom bot and system to keep the translations up to date.
* It's not a system that can be easily put into a plugin to allow others to use.

### Mitigation

I think this is a viable approach if we can:

1. move the docs to their own repo and
2. are okay with doing subdomains (`ja.gatsbyjs.org`) instead of paths (`gatsbyjs.org/ja`)

Otherwise we might want to consider the second alternatives:

## Alternative 2: Translations Platform

[Crowdin]() is a SaaS that allows projects to source translations using a built-in web based editor. It's popular in the JS community being used for projects such as [Electron](https://crowdin.com/project/electron) and [Yarn](https://crowdin.com/project/yarn).

### Advantages

* Lots of features, such as [machine translation](https://support.crowdin.com/pre-translation-via-machine/) and [in-context localization](https://support.crowdin.com/in-context-localization/).
* Has a builtin [GitHub integration](https://support.crowdin.com/github-integration/).
* We can make an official plugin for Crowdin integration that other projects can use.

### Drawbacks

We had considered using Crowdin for the localization of the React docs but realized that Crowdin had some [major drawbacks](https://reactjs.org/blog/2019/02/23/is-react-translated-yet.html):

* It has a steep learning curve and hard for new translators to get accustomed to.
* The GitHub integration isn't customizable: it takes three hours to compile all the languages and just publishes something in a single directory.
* Translation quality issues:
  * Doesn't handle web markup well; sites translated with Crowdin sometimes have invalid markup
  * (as far as I can tell) no way to verify that a section/page has to pass a quality check before it gets published
  
Other drawbacks of Crowdin:

* No way to prioritize which pages should get translated first
* Hard to attribution of translators
* Paid program ($125/mo for the 'Bronze' Organization Plan)
* Quality of English documentation is mediocre, which is not a good sign for a translation app (see links above).

### Mitigation

* We'd need to create our resources to supplement Crowdin's documentation
* Research other translation platforms

### Other Translation Platforms

There are more translation platforms other than Crowdin, and using them instead may mitigate some of those issues.

One I've played around with is [Transifex](http://transifex.com/), which is used to translate [Django](https://www.transifex.com/django/django/). It's pricing is comparable to Crowdin ($139/mo for the "Starter" plan), and it eliminates a lot of the drawbacks Crowdin has:

* Good, clear documentation on all its features
* A [GitHub integration](https://docs.transifex.com/transifex-github-integrations/github-tx-ui) that is flexible and allows quality checking, allowing you to merge only when each page is completed and reviewed

My current thoughts are to research Transifex more to find out its strengths and weaknesses.

## Adoption Strategy / How We Teach This

// to be filled when we decide on an approach

## Open Questions

* What translation platforms do people interested in translating Gatsby use and like? **If you are interested in localizing Gatsby to your language, please let us know!**
* If you've used Crowdin or Transifex, how was the experience? What is good about it and what are the pain points?
