---
title: Uptick in docs contributions for Gatsby Hacktoberfest
date: 2018-10-09
author: Shannon Soper
tags: ["documentation"]
---

## Hacktoberfest docs explosion!

Since October 1st--the start of Hacktoberfest--the Gatsby OSS community has seen a huge uptick in docs contributions. In the first 5 days of October we [merged 28 PR's with the `documentation` label](https://github.com/gatsbyjs/gatsby/pulls?utf8=%E2%9C%93&q=is%3Apr+sort%3Aupdated-desc+is%3Aclosed+label%3A%22type%3A+documentation%22+language%3Aswift+closed%3A%3E2018-10-01) (and by the time you click on that link, it will likely be more than 28, especially if PR’s are labelled correctly!).

A big thanks to every contributor who jumped in to help Gatsby docs keep becoming more polished, comprehensive, and clear. In fact, many of the PR’s fixed problems we hadn’t even created issues for yet! And we’re increasing the number of `hacktoberfest` + `documentation` labelled issues to account for the surge of helpful contributions. A special thanks to @amberley, @jlengstorf, @dustin, and @pieh for their hard work giving feedback and merging PR’s!

- See how to participate in [Gatsby Hacktoberfest](https://github.com/gatsbyjs/gatsby/issues/7928)

## With great contributions comes great responsibility

The increase in contributions means the Gatsby community makes more frequent decisions about what goes in the docs and what doesn't, how to title them, the best slugs for SEO, and when to create new categories.

This has led to two changes:

1.  @jlengstorf created the [@docsteam](https://github.com/orgs/gatsbyjs/teams/docs) in GitHub that automatically notifies whomever is on the team whenever a PR includes edits to anything within /docs/.

2.  With the help of many people, I created a “docs decision tree,” so that when the @docsteam is notified, they can make decisions in a unified manner according to a set of agreed-upon principles (which can be adjusted over time). This will help anyone making decisions pertaining to docs escape any biases and fickleness. The “docs decision tree” will be tested over Hacktoberfest with all issues labelled `documentation` and collect discussion in the [Docs Decision Tree RFC](https://github.com/gatsbyjs/rfcs/pull/14).

## Docs Decision Tree and Examples

Here is a summary of the “docs decision tree,” a tool we’ll use to make decisions about how to grow and maintain Gatsby docs.

> You can also look at a visualization of the decision tree(s) in [Whimsical](https://whimsical.co/78PmoqFTbJJxpXHA1a6gba).

## Doc qualification criteria

A doc qualifies to be in the .org site if it:

1.  Deals with a piece of Gatsby-maintained software (e.g. pertains to code in the Gatsby OSS repository [www.github.com/gatsbyjs/gatsby](www.github.com/gatsbyjs/gatsby)), a core dependency of the code in the Gatsby OSS repo, or a third-party software that works well with Gatsby and is in high demand

Yes? --> Belongs in the docs (to make sure we don’t have to maintain docs about core dependencies and third-party software, we will focus on linking to their docs as much as possible)

No --> Belongs in blog, marketing, Twitter, podcast, starter library, plugin library, etc.

2.  Helps further something on the [developer journey](https://pronovix.com/blog/analyzing-api-docs-and-dx-patterns-best-banking-developer-portals):

- Discover
- Evaluate
- Get Started
- Implement & Troubleshoot
- Celebrate & Share
- Contribute & Maintain

Yes? --> Belongs in the docs
No? --> Does not belong in the docs

### Someone wants to create a new doc

Does doc already exist?

- Yes --> Is there a discovery problem? If so, solve it
- No --> move ahead

Is there a demand to create the doc?

- No --> don't create it
- Yes --> move ahead

Does the doc qualify to be in the /docs/?

- Yes --> Create it
- No --> Don't create it

### Someone wants to create new categories in the docs sidebar

Is there a category that the doc(s) could fit in that has more than 5-7 docs in it?

- No --> Move on
- Yes --> Put in existing category

Would the new category have more than 2 docs in it?

- No --> consider waiting to create the category until there is more than 2 docs
- Yes --> Create new category

### Someone wants to reorder the categories in the sidebar or shift docs to new categories

Is there evidence that the reorganization would help further one of the steps on the developer journey?

- No --> Don't reorder the categories
- Yes --> Reorder them and do usability testing to measure the value of the change

## Naming criteria

Names categories in the .org site should:

- be SEO-friendly (common google search term, easy-to-remember URL that is not likely to change anytime soon)
- communicate a core concept of Gatsby (TBD) and/or a core value (TBD)
- be a noun, like "plugins, styling, guides, core concepts" etc.

Names for guides, tutorial sections, and sub-headings in the .org site should:

- be SEO friendly (common google search term, easy-to-remember URL that is not likely to change anytime soon)
- nearly always start with an -ing verb, like "adding", since all tasks are action-oriented.

## Thanks and keep Hacktoberfesting with Gatsby

It’s been incredible to see how many hard-working contributors have gotten PR’s merged this week for Gatsby. Check out [how to participate in Gatsby Hacktoberfest](https://github.com/gatsbyjs/gatsby/issues/7928) and filter out `hacktoberfest - claimed` issues to see which ones are left unclaimed!

And don’t forget to read the [Docs Decision Tree RFC](https://github.com/gatsbyjs/rfcs/pull/14) and leave your comments before October 31st, when the commenting period will be closed.
