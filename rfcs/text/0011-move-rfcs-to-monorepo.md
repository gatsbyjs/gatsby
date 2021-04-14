- Start Date: 2019-12-30
- RFC PR:
- Gatsby Issue:

# Summary

This `rfcs` repository has unfortunately not been given the care and attention that such crucial and sweeping changes deserve. One seemingly obvious reason is that the `rfcs` repo is separate from the GatsbyJS monorepo which gets much more traffic and attention from not only the community but also the GatsbyJS open-source team (@gatsbyjs/core).

From this perspective, I propose a revamp of this underlying model to more effectively surface this valuable community feedback and ensure that the community has ample opportunity to help shape and _influence_ Gatsby open-source, with a direct line of feedback to the open-source team. Specifically, I propose:

1. We deprecate this repo and close any outstanding pull requests in this repo
1. We document and encourage users to open up RFCs as pull requests to the official GatsbyJS monorepo (`gatsbyjs/gatsby`)

# Motivation

We are doing this to get more eyes on the crucial, sweeping changes that are expected of the RFC. The open-source team does the great majority of its work in the [GatsbyJS monorepo](https://github.com/gatsbyjs/gatsby), including previously moving content such as the starters into the monorepo. Moving this content into the monorepo means that:

1. The open-source team can view, respond to, and create RFCs within their normal workflow
1. The community can view, respond to, and create RFCs with the same repository they make other contributions towards (e.g. pull requests, issues, etc.)
1. Decrease response time and improve visibility of this crucial mechanism of our open-source community

# Detailed design

The design for this is quite simple, it is effectively moving the contents of this repository into a new, top-level folder within the `gatsbyjs/gatsby` monorepo. The changes will consist of the following:

## `rfcs` folder in the monorepo

We will create a new, top-level `rfcs` folder within the `gatsbyjs/gatsby` monorepo.

## Deprecate and archive this repo

As we will now be using the monorepo, we will want to encourage contributions towards the monorepo. From this perspective, we will deprecate and mark this repository as read-only.

## Close all pull requests in `gatsbyjs/rfcs`

All open pull requests will be closed. We encourage any RFC authors in this repo to re-open the pull request to the gatsbyjs/gatsby monorepo if necessary.

## Create an `rfcs/README.md` file

This will be how we teach the RFC process. We _may_ publish this to gatsbyjs.org/rfcs.

## Create an `rfcs/0000-template.md` file

This Markdown file will be the source from which all RFCs are created. It will look like the following:

```md
---
title: "RFC Template"
date: YYYY-MM-DD
status: "IN_REVIEW" | "MERGED" | "PUBLISHED"
# optional fields, e.g. that can be added when merging
issue: 
---

# Summary

Brief explanation of the feature.

# Basic example

If the proposal involves a new or changed API, include a basic code example.
Omit this section if it's not applicable.

# Motivation

Why are we doing this? What use cases does it support? What is the expected
outcome?

Please focus on explaining the motivation so that if this RFC is not accepted,
the motivation could be used to develop alternative solutions. In other words,
enumerate the constraints you are trying to solve without coupling them too
closely to the solution you have in mind.

# Detailed design

This is the bulk of the RFC. Explain the design in enough detail for somebody
familiar with React to understand, and for somebody familiar with the
implementation to implement. This should get into specifics and corner-cases,
and include examples of how the feature is used. Any new terminology should be
defined here.

# Drawbacks

Why should we _not_ do this? Please consider:

- implementation cost, both in term of code size and complexity
- whether the proposed feature can be implemented in user space
- the impact on teaching people React
- integration of this feature with other existing and planned features
- cost of migrating existing React applications (is it a breaking change?)

There are tradeoffs to choosing any path. Attempt to identify them here.

# Alternatives

What other designs have been considered? What is the impact of not doing this?

# Adoption strategy

If we implement this proposal, how will existing React developers adopt it? Is
this a breaking change? Can we write a codemod? Should we coordinate with
other projects or libraries?

# How we teach this

What names and terminology work best for these concepts and why? How is this
idea best presented? As a continuation of existing React patterns?

Would the acceptance of this proposal mean the React documentation must be
re-organized or altered? Does it change how React is taught to new developers
at any level?

How should this feature be taught to existing React developers?

# Unresolved questions

Optional, but suggested for first drafts. What parts of the design are still
TBD?
```

You'll note the use of [frontmatter](https://jekyllrb.com/docs/front-matter/) (the three dashes with content within). This is so that we can parse this cleanly with `gatsby-transformer-remark` (or `gatsby-plugin-mdx`) and eventually make RFCs viewable via gatsbyjs.org/rfcs/rfc-name-here/

# Drawbacks

## Size of monorepo

The size of the monorepo has been considered a barrier to entry for some, for example consider gatsbyjs/gatsby#13699, an issue in which the repo size is seen as prohibitory towards contributions specifically:

> Cloning the Gatsby repository is becoming a little absurd due to its size

Adding more content, and moving content to the monorepo means that the RFC contribution workflow now has this initial sunk cost as its first step.

I contend that this is worth work doing regardless. The likelihood of opening an RFC and not then needing to (eventually) open a PR implementing the RFC is slim. In any scenario -- GitHub's existing tools for this, e.g. in-app editing, mitigate this cost and ensure that there are still mechanisms to add an RFC without cloning the repo.

## Separation of concerns

Some may claim that the implicit separation of concerns here is implicitly valuable. They may point to prior art, e.g. [reactjs/rfcs](https://github.com/reactjs/rfcs).

I contend that they aren't really separate concerns. A successful RFC leads to a merged pull request _in_ the open-source repo, so from this perspective it's reasonable to conclude that opening up an RFC alongside the eventual pull request makes intuitive sense and is worth doing.

# Alternatives

There are a few alternatives worth considering. Specifically:

## Keep this repo as-is

We could not do this (of course) and keep the status quo. This has no drawbacks, and one positive in that there is zero effort required to keep the status quo.

However this also does not have any of the aforementioned advantages of moving this content into the monorepo.

## Use automation to e.g. clone content from monorepo to this repo

We currently do an approach like this for [starters in the monorepo](https://github.com/gatsbyjs/gatsby/blob/master/scripts/publish-starters.sh#L20). I can't see any benefit in following something similar in this case, and just seems like redundant work.

# Adoption strategy

Existing Gatsby developers will refer to a document the @gatsbyjs/core and @gatsbyjs/learning team will draft that will live at gatsbyjs.org/rfcs/.

This will spell out the process for an RFC, specifically:

1. **Why** to submit an RFC
1. **How** to submit an RFC
1. The lifecycle of an RFC, e.g. when an RFC can be closed, merged, etc.
1. The expectations around an RFC, e.g. the open-source team will have final approval (as with existing pull requests) but will solicit the community's feedback

# How we teach this

We will refer Gatsby developers to the aforementioned guide which will be sourced from the README that will exist at `gatsbyjs/rfcs/README.md`

# Unresolved questions

1. When can an RFC be closed/merged?
   - My proposal: _ideally_ an RFC is merged alongside the implementation
   - If a separate author implements the RFC, the RFC can be closed when the pull request is opened closing the RFC
1. Does an RFC start as an issue? Or a PR?
   - An RFC _may_ implement an existing issue, but it does not _need_ to
