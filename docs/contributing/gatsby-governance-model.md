---
title: Gatsby's Governance Model
---

## Introduction

Gatsby is an [open source](https://opensource.org/) project supported by [Gatsby, Inc.](https://www.gatsbyjs.com/about/) employees and an active community of contributors.

Our objectives for this document are to provide current information about the management and maintenance of Gatsby open source software (OSS) and present a variety of resources and avenues of communication between Gatsby’s leadership and community. It also includes a detailed description of contributor levels, accepted contribution types, the voting process, and moderation. Furthermore, it outlines how you can get involved with Gatsby OSS. Establishing this governance models will help support active and productive communication/collaboration within the Gatsby community and between the community and the company.

**All community members must follow the [Code of Conduct (CoC)](/contributing/code-of-conduct/).** Consequences for CoC violations are detailed in [moderation](#moderation).

## Get involved

All contributions are welcome, including issues, contributing code, new docs as well as updates and tweaks, blog posts, helping out people, and more. Read the [How to Contribute guide](/contributing/#how-to-contribute) to learn what the community can do for you and what you can do for the community.

### Gatsby User Collective

The [Gatsby User Collective](https://gatsbyuc.dev/)'s goal is to democratize the maintenance of community plugins to allow more folks to assist in their maintenance and to create higher quality plugins in the Gatsby ecosystem. Contributing to the Gatsby User Collective is a valuable contribution!

### Areas for contribution

As the core of Gatsby is a complex piece of software, it requires some onboarding before contributions can be made efficiently. We're clearly defining here in which areas we accept contributions without any prior interaction with the team at the moment and in which not. This is especially important for new features as they always have an inherent maintenance cost -- and making changes without the complete context around Gatsby is difficult. _This list is not set in stone and can change when e.g. a "Core Maintainer (L3)" role is introduced._

We accept all types of contributions to:

- [`examples`](https://github.com/gatsbyjs/gatsby/tree/master/examples)
- [`starters`](https://github.com/gatsbyjs/gatsby/tree/master/starters)
- [`integration-tests`](https://github.com/gatsbyjs/gatsby/tree/master/integration-tests)
- [`e2e-tests`](https://github.com/gatsbyjs/gatsby/tree/master/e2e-tests)
- [`docs`](https://github.com/gatsbyjs/gatsby/tree/master/docs)

We accept all types of contributions to [`packages`](https://github.com/gatsbyjs/gatsby/tree/master/packages) but the following packages have extra requirements:

- [`gatsby`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby)
- [`gatsby-core-utils/remote-file-utils`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-core-utils/src/remote-file-utils)

For these two packages, we ask you to open a [feature request](#feature-requests) (or for larger changes an [RFC](/contributing/rfc-process/)) before opening PRs for features. Contributions, such as bug fixes and documentation updates, can be made without any prior interaction with the team and don't require a feature request/RFC.

## Contributor levels

We recognize different degrees of contribution as levels, and most levels can be reached regardless of coding skill or years of experience. The two most important things that we look for in contributors are:

- **Being here** - Everyone's time is valuable, and the fact that you're here and contributing to Gatsby is amazing! Thank you for being a part of this journey with us.

- **Being a positive member of our community** - Go above and beyond our Code of Conduct, and commit to healthy communication in pull requests, issue discussions, Discord conversations, and interactions outside of our community.

Each level unlocks new privileges and responsibilities on Discord and GitHub. Below is a summary of each contributor level.

### Level 1 (L1) - Contributor

Have you done something (big or small) to contribute to the health, success, or growth of Gatsby? Congratulations, you're officially recognized as a contributor to the project!

#### Recognized contributions

- **GitHub:** Submitting a merged pull request
- **GitHub:** Sending in a detailed feature request or RFC
- **GitHub:** Updating documentation
- Helping people on GitHub, Discord, etc.
- Answering questions on Stack Overflow, Twitter, etc.
- Blogging, Vlogging, Podcasting, and Livestreaming about Gatsby
- This list is incomplete! Similar contributions are also recognized.

#### Privileges

At this time we have no specific privileges for this role except that you can claim yourself [free Gatsby swag](/contributing/contributor-swag/). If you have ideas here please let us know!

#### Responsibilities

This role does not require any extra responsibilities or time commitment. We hope you stick around and keep participating!

If you're interested in reaching the next level and becoming a Maintainer, you can begin to explore some of those responsibilities in the next section.

#### Nomination Process

n/a

### Level 2 (L2) - Maintainer

The **Maintainer** role is available to any contributor who wants to join the team and take part in the long-term maintenance of Gatsby.

The Maintainer role is critical to the long-term health of Gatsby. Maintainers support the **Team** members and together they act as the first line of defense when it comes to new issues, pull requests and Discord activity. Maintainers are most likely the first people that a user will interact with on Discord or GitHub.

**A Maintainer is not required to write code!** Some Maintainers spend most of their time inside of Discord, maintaining a healthy community there. Maintainers can also be thought of as **Moderators** on Discord and carry special privileges for moderation.

#### Recognized contributions

There is no strict minimum number of contributions needed to reach this level, as long as you can show **sustained** involvement over some amount of time (at least a couple of weeks).

- **GitHub:** Submitting non-trivial pull requests and RFCs
- **GitHub:** Reviewing non-trivial pull requests and RFCs
- **Discord:** Supporting users in Discord, especially in the "Help" category
- **Discord:** Active participation in RFC calls and other events
- **GitHub + Discord:** Triaging and confirming user issues
- This list is incomplete! Similar contributions are also recognized.

#### Privileges

- All privileges of the [Contributor role](#level-1-l1---contributor), plus...
- Invitation to the `@Maintainer` role on [Discord](https://gatsby.dev/discord)
- Invitation to the `Maintainers` team on GitHub.
- New name color on Discord: **Blue**.
- Invitation to the private `#maintainers` channel on Discord.
- Ability to moderate Discord to remove spam, harmful speech, etc.
- Ability to join the `@Moderator` role on Discord (optional, opt-in).
- Ability to review GitHub PRs.
- Ability to vote on _some_ initiatives (see [Voting](#voting) below).

#### Responsibilities

- Participate in the project as a team player.
- Bring a friendly, welcoming voice to the Gatsby community.
- Be active on Discord, especially in the "Help" category.
- Triage new issues.
- Review pull requests.
- Merge some, non-trivial community pull requests.
- Merge your own pull requests (once reviewed and approved).

#### Nomination

To be nominated, a nominee is expected to already be performing some of the responsibilities of a Maintainer over the course of at least a couple of weeks. You can apply through contacting one of the `@Team` members on Discord who then in turn will trigger a [Voting](#voting) process.

In some rare cases, this role may be revoked by an **Admin**. However, under normal circumstances this role is granted for as long as the contributor wishes to engage with the project.

## Other roles

### Team

Team is a special designation for employees of [Gatsby, Inc.](https://www.gatsbyjs.com/about/) that lives outside of our Governance model. The team role was designed to help those of us working full-time on Gatsby to work productively without "skipping the line" and circumventing our governance model entirely.

#### Privileges

- All privileges of the [Maintainer role](#level-2-l2---maintainer), plus...
- `@Team` role on [Discord](https://gatsby.dev/discord)
- New name color on Discord: **Purple**.
- `Team` on GitHub.
- Ability to merge all GitHub PRs.
- Ability to vote on all initiatives (see [Voting](#voting) below).
- Publish access to all npm packages.

#### Responsibilities

- All of the responsibilities of L2, including...
- Ownership of the project.
- Maintaining and improving overall architecture.
- Tracking and ensuring progress of open pull requests.
- Reviewing and merging larger, non-trivial PRs.
- Define project direction and planning.
- Ability to decide on moderation decisions.

#### Nomination

n/a

#### Leaving Team

When someone leaves Gatsby, Inc., they lose team privileges and return to their original membership level in our governance structure (whatever level they were at before joining team).

If that person wishes to continue working on Gatsby after leaving, they may request a nomination to become an official L2 contributor. This nomination would follow the normal voting rules & procedure for that role (see [Voting](#voting) below).

### Admin

Admin is an additional privilege inside the **Team** and is mainly an administrative one.

#### Privileges

- All privileges of the [Team](#team), plus...
- `@Admin` role on [Discord](https://gatsby.dev/discord)
- Administration privileges on GitHub.
- Administration privileges on Discord (optional).

#### Responsibilities

- All of the responsibilities of Team

#### Nomination

n/a

## Decision-making process

Decisions about Gatsby open source software are ultimately made by Gatsby, Inc. leadership and the Team. We believe that founding organizations built around open source software have a responsibility to build strong businesses to sustain those open source tools and the community that depends on them, which will sometimes require us to reserve high-demand tools and features for Gatsby commercial products. That said, we take our responsibility to the community very seriously and carefully consider community needs and concerns when determining our product roadmaps.

If you’d like to learn more about how we approach the relationship between our commercial and open source work, check out this blog post: [Founding Organizations: Creating a Company That Sustains Our Open-Source Community](/blog/2020-02-11-founding-organizations/).

### Feature requests

Please open a [feature request on GitHub Discussions](https://github.com/gatsbyjs/gatsby/discussions/categories/ideas-feature-requests) to voice your ideas. For larger changes please consider opening an [RFC](/contributing/rfc-process/). The **Team** will review incoming requests and give a first assessment.

### RFCs

Please see the dedicated [RFC Process document](/contributing/rfc-process/) for more details.

## Voting

Certain project decisions (like membership nominations) require a vote. Below are the changes that require a vote, and the rules that govern that vote.

One **Admin** may initiate a vote for any unlisted project decision. This person then will be the leading Admin for this vote and handle all necessary actions. General rules will apply, along with any additional rules provided at the admin's discretion. If this unlisted project decision is expected to be repeated in the future, voting rules should be agreed on and then added to this document.

### General Voting Rules

- Members may abstain from any vote.
- Members who do not vote within 3 days will automatically abstain.
- Admins may reduce the 3 day automatic abstain for urgent decisions.
- Admins reserve the right to veto approval with a publicly disclosed reason.

### Voting: Maintainer (L2) Nomination

This process kicks off once a valid nomination has been made.

**Who can vote:** All Maintainers (L2 and above).

1. A vote thread should be created in Discord #maintainers channel (the private channel for all maintainers).
2. A vote thread can be created by any maintainer, team member, or Admin.
3. Once a vote thread is created, existing Maintainers can discuss the nomination in private.
4. The normal 3 day voting & discussion window begins with the thread creation.
5. Voting can be done in the thread (visible to other voters) or in a private DM to the leading Admin.
6. Once the vote is complete, the thread is deleted.
7. The vote must receive an overwhelming majority (70%+) to pass.
8. **If the vote passes:** The nominee will be made a Maintainer and all privileges will be made available to them.
9. **If the vote fails:** The leading Admin is responsible for informing the nominee with constructive, actionable feedback. (Note: This is not required if the nominee was otherwise not made aware of their nomination).

## Moderation

Outlined below is the process for Code of Conduct violation reviews.

### Reporting

Anyone may report a violation. Violations can be reported in the following ways:

- In private, via email to [conduct@gatsbyjs.com](mailto:conduct@gatsbyjs.com).
- In private, via direct message to a team member on Discord.
- In public, via a GitHub comment (mentioning `@gatsbyjs/team`).
- In public, via the project Discord server.

### Who gets involved?

Each report will be assigned reviewers. These will initially be all team members.

In the event of any conflict of interest - ie. team members who are personally connected to a situation, they must immediately recuse themselves.

At request of the reporter and if deemed appropriate by the reviewers, another neutral third-party may be involved in the review and decision process.

### Review

If a report doesn’t contain enough information, the reviewers will strive to obtain all relevant data before acting.

The reviewers will then review the incident and determine, to the best of their ability:

- What happened.
- Whether this event constitutes a Code of Conduct violation.
- Who, if anyone, was involved in the violation.
- Whether this is an ongoing situation.

The reviewers should aim to have a resolution agreed very rapidly; if not agreed within a week, they will inform the parties of the planned date.

### Resolution

Responses will be determined by the reviewers on the basis of the information gathered and of the potential consequences. It may include:

- taking no further action
- issuing a reprimand (private or public)
- asking for an apology (private or public)
- permanent ban from the GitHub org and Discord server
- revoked contributor status

---

Inspired by [Astro](https://github.com/withastro/astro/blob/main/GOVERNANCE.md) and [Blitz](https://blitzjs.com/docs/maintainers).
