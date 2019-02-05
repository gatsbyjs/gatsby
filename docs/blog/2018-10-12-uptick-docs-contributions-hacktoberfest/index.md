---
title: Uptick in docs contributions for Gatsby Hacktoberfest
date: 2018-10-12
author: Shannon Soper
tags: ["documentation", "hacktoberfest"]
---

## Hacktoberfest docs explosion!

Since October 1st -- the start of Hacktoberfest -- the Gatsby OSS community has seen a huge uptick in docs contributions. In the first 5 days of October we [merged 31 PR's with the `documentation` label](https://github.com/gatsbyjs/gatsby/pulls?utf8=%E2%9C%93&q=is%3Apr+sort%3Aupdated-desc+is%3Aclosed+label%3A%22type%3A+documentation%22+language%3Aswift+closed%3A%3E2018-10-01) (and by the time you click on that link, it will likely be more than 31, especially if PR’s are labeled correctly!).

A big thanks to every contributor who jumped in to help Gatsby docs keep becoming more polished, comprehensive, and clear. In fact, many of the PR’s fixed problems we hadn’t even created issues for yet! And we’re increasing the number of `hacktoberfest` + `documentation` labeled issues to account for the surge of helpful contributions. A special thanks to [@amberleyromo](https://github.com/amberleyromo), [@jlengstorf](https://github.com/jlengstorf), [@DSchau](https://github.com/DSchau), and [@pieh](https://github.com/pieh) for their hard work giving feedback and merging PR’s!

Read more on how to participate in Gatsby Hacktoberfest in our [Hacktoberfest kickoff post](/blog/2018-10-09-hacktoberfest-kickoff/)

## With great contributions comes great responsibility

The increase in contributions means the Gatsby community makes more frequent decisions about what goes in the docs and what doesn't, how to title them, the best slugs for SEO, and when to create new categories.

This has led to two changes:

1.  [@jlengstorf](https://github.com/jlengstorf) created the [@gatsbyjs/docs team](https://github.com/orgs/gatsbyjs/teams/docs) in GitHub that automatically notifies whomever is on the team whenever a PR includes edits to anything within /docs/.

2.  With the help of many people, I created a “docs decision tree,” so that when the [@gatsbyjs/docs team](https://github.com/orgs/gatsbyjs/teams/docs) is notified, they can make decisions in a unified manner according to a set of agreed-upon principles (which can be adjusted over time). This will help anyone making decisions pertaining to docs escape any biases and fickleness. The “docs decision tree” will be tested over Hacktoberfest with all issues labeled `documentation` and collect discussion in the [Docs Decision Tree RFC](https://github.com/gatsbyjs/rfcs/pull/14).

## Docs Decision Tree and Examples

Here is a summary of the “docs decision tree,” a tool we’ll use to make decisions about how to grow and maintain Gatsby docs.

> You can also look at a visualization of the decision tree(s) in [Whimsical](https://whimsical.co/78PmoqFTbJJxpXHA1a6gba).

## Doc qualification criteria

A doc qualifies to be in the .org site if it:

1.  Deals with a piece of Gatsby-maintained software (e.g. pertains to code in the [Gatsby OSS repository](https://www.github.com/gatsbyjs/gatsby)), a core dependency of the code in the Gatsby OSS repo, or a third-party software that works well with Gatsby and is in high demand

> **Yes** --> Belongs in the docs (to make sure we don’t have to maintain docs about core dependencies and third-party software, we will focus on linking to their docs as much as possible)

> **No** --> Belongs in blog, marketing, Twitter, podcast, starter library, plugin library, etc.

2.  Helps further something on the [developer journey](https://pronovix.com/blog/analyzing-api-docs-and-dx-patterns-best-banking-developer-portals):

    - Discover
    - Evaluate
    - Get Started
    - Implement & Troubleshoot
    - Celebrate & Share
    - Contribute & Maintain

> **Yes** --> Belongs in the docs

> **No** --> Does not belong in the docs

## Handling proposed doc changes

### Someone wants to create a new doc

Does doc already exist?

> **Yes** --> Is there a discovery problem? If so, solve it

> **No** --> move ahead

Is there a demand to create the doc?

> **Yes** --> move ahead

> **No** --> don't create it

Does the doc qualify to be in the /docs/?

> **Yes** --> Create it

> **No** --> Don't create it

### Someone wants to create new categories in the docs sidebar

Is there a category that the doc(s) could fit in that has more than 5-7 docs in it?

> **Yes** --> Put in existing category

> **No** --> Move on

Would the new category have more than 2 docs in it?

> **Yes** --> Create new category

> **No** --> consider waiting to create the category until there is more than 2 docs

### Someone wants to reorder the categories in the sidebar or shift docs to new categories

Is there evidence that the reorganization would help further one of the steps on the developer journey?

> **Yes** --> Reorder them and do usability testing to measure the value of the change

> **No** --> Don't reorder the categories

## Naming criteria

Names categories in the .org site should:

- be SEO-friendly (common google search term, easy-to-remember URL that is not likely to change anytime soon)
- communicate a core concept of Gatsby (TBD) and/or a core value (TBD)
- be a noun, like "plugins, styling, guides, core concepts" etc.

Names for guides, tutorial sections, and sub-headings in the .org site should:

- be SEO friendly (common google search term, easy-to-remember URL that is not likely to change anytime soon)
- nearly always start with an -ing verb, like "adding", since all tasks are action-oriented.

## Thanks and keep Hacktoberfesting with Gatsby

It’s been incredible to see how many hard-working contributors have gotten PR’s merged with us so far! Don't forget to check out [how to participate in Gatsby Hacktoberfest!](/blog/2018-10-09-hacktoberfest-kickoff/)

And don’t forget to also read the [Docs Decision Tree RFC](https://github.com/gatsbyjs/rfcs/pull/14) and leave your comments before October 31st, when the commenting period will be closed.
