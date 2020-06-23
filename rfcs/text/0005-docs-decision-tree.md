- Start Date: 2018-10-05
- RFC PR: [leave blank]
- Related Issue: [add if relevant]

## Summary

The increase in docs contributions means the Gatsby inkteam makes more frequent decisions about what goes in the docs and what doesn't, how to title them, the best slugs for SEO, and when to create new categories. We need a way to make decisions that align with our goals more quickly without needing to deliberate as much or discuss our decisions on Slack (those are fine, just if we can save time, we should).

This has led to one change and necessitates a new one!:

1.  @jlengstorf already created the [@gatsbyjs/docs team](https://github.com/orgs/gatsbyjs/teams/docs) in GitHub that automatically notifies whomever is on the team whenever a PR includes edits to anything within /docs/

2.  New change needed: I've written up this RFC about a docs decision tree so that when the @gatsbyjs/docs team is notified, they can make decisions in a unified manner according to a set of agreed-upon principles (which can be adjusted over time). This will help the OSS process escape any biases and fickleness. This will be tested over Hacktoberfest and facilitate discussion through comments on this RFC.

## Why is this important?

In order to be clear and professional, it's important for the docs to be consistent in style, tone, and purpose, and contributors also ought to be able to depend upon a predictable contribution process. This decision making process will help us act as a unified team according to a set of agreed-upon principles (which can be adjusted over time) and help us escape any biases and fickleness as we make the docs more awesome.

## What is required to make this happen?

- [ ] Get enough feedback and testing on the [docs decision tree](https://whimsical.co/78PmoqFTbJJxpXHA1a6gba) with Hacktoberfest to polish the idea and this RFC
- [ ] Merge the RFC
- [ ] Regularly revisit the RFC with the @gatsbyjs/docs team to revise it
- [ ] Blog about the decision-making process and refer to the blogpost in difficult situations to help contributors understand our decision-making process

## Who will own this?

Learning AoR: Shannon Soper

## What are the drawbacks and/or downsides of doing this?

Creating a decision tree can sometimes mean that we could be tempted to blindly follow it and be too strict, thinking of it as a set of hard rules rather than guiding principles. We could also swing too far in the other direction and not use it enough and be inconsistent with contributors and thereby create inconsistent docs.

## Are there alternative approaches that would work to accomplish the same goal?

I can't see another way to accomplish the goal of becoming a unified, unbiased (as far as it is possible) @gatsbyjs/docs team. There are other formats (i.e. we could print the docs decision tree and laminate it, for example, or make a rap about it), but the core heuristic ought to exist in some form or another.

## How will we drive adoption?

Test it during Hacktoberfest. For the time being, that's good enough because @amberley and I are already getting tagged as @docsteam, so we can test the decision tree anytime we get tagged.

If/when there are more @gatsbyjs/docs team members, we can drive adoption through onboarding and then prizes or something when someone refers to the decision tree in their GitHub PR or issue comments as a reason for a docs decision. Finally, regularly meeting to revise the decision tree will help everyone have a voice in revising it and own the decision-making process.

## What questions still need to be answered about this idea?

- There is still disagreement on when and in what ways to include documentation about core dependencies and third-party software (I think there is 100% agreement on maintaining documentation about any code in the Gatsby OSS repo).
