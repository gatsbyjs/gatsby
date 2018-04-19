---
title: "Introducing the Gatsby RFC Process"
author: Kyle Mathews
date: "2018-04-06"
---

We're adopting an RFC ("request for comments") process for contributing ideas to Gatsby.

Inspired by [React](https://github.com/reactjs/rfcs), [Yarn](https://github.com/yarnpkg/rfcs), [Ember](https://github.com/emberjs/rfcs), and [Rust](https://github.com/rust-lang/rfcs), the goal is to allow Gatsby core team members and community members to collaborate on the design of new features. It's also intended to provide a clear path for ideas to enter the project:

* Create an RFC document detailing your proposal.
* Submit a PR to the [RFC repository](https://github.com/gatsbyjs/rfcs).
* Incorporate feedback into the proposal.
* After discussion, the core team may or may not accept the RFC.
* If the RFC is accepted, the PR is merged.

RFCs are accepted when they are approved for implementation in Gatsby. A more thorough description of the process is available in the repository's [README](https://github.com/gatsbyjs/rfcs/blob/master/README.md). The exact details may be refined in the future.

## Who Can Submit RFCs?

Anyone! No knowledge of Gatsby's internals is required, nor are you expected to implement the proposal yourself.

## What Types of Changes Should Be Submitted As RFCs?

Generally, any idea that would benefit from additional review or design before being implemented is a good candidate for an RFC. As a rule of thumb, this means any proposal that adds, changes, or removes a Gatsby API.

Not every change must go through the RFC process. Bug fixes or performance improvements that don't touch the API can be submitted directly to the main library.

## RFCs for a new GitHub labeling system and to remove our special layout component

Coinciding with the launch of our RFC process, we've submitted a [proposal for a new GitHub labeling system](https://github.com/gatsbyjs/rfcs/pull/1) and a [proposal to remove our special layout component](https://github.com/gatsbyjs/rfcs/pull/2). Both proposals have already received many valuable comments from the community that we're incorporating into the design of the new process and API.

Both PRs are good examples of how a typical RFC should be structured. We're excited to start receiving your proposals!
