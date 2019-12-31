---
title: "Incremental PRs: a new Github workflow for the Cloud team"
date: 2019-12-30
author: Josh Comeau
excerpt: "A look at how the Cloud team adopted a new workflow to achieve smaller, non-blocking PRs."
tags: ["source control", "Github", "workflows"]
---

On the Gatsby Cloud team, we have a bunch of ambitious stuff on the roadmap for 2020. It's important that we come up with processes that empower us to do good work, without bogging us down. We've been looking at how we manage code reviews, in order to improve the experience for developers and reviewers.

Github doesn't really make it clear or intuitive how to break work up into multiple reviewable units. Pull Requests (PRs) are based on branches, and juggling branches can be tricky and unwieldy. Effectively, this gives developers 2 common choices:

1. Work on the feature until it's done, and then open a ginormous everything-included PR.
1. Work on the feature until you've finished the first chunk, open a reasonably-small PR, and switch to another task while you wait for a review.

Large PRs are problematic for a number of reasons:

- They're difficult to review, and so they'll sit in "awaiting review" status until a developer has enough time and brainpower to get through it.
- There's more opportunities for bugs to slip through. A sufficiently complex change will be hard for reviewers to wrap their minds around.
- It's harder to course-correct. If a reviewer has a different idea on how to structure the change, it's probably too late to bring it up. When so much time is invested into a change, it's much harder to justify rethinking the approach.

Smaller PRs are easier to review, and lead to higher-quality code, but they can slow the author down substantially. If merging directly to a deploy branch like master or staging, the author needs to make sure this part of the feature is hidden behind a flag, safe to deploy. After opening the PR, they become blocked until they get a review. At a distributed company like Gatsby, where our team is located across the globe, it can take some time for small PRs to get a review. Context-switching is expensive!

Ideally, the developer could spin up new PRs as they went, allowing them to solicit feedback early, without being blocked while waiting for it. If the feedback _does_ require significant changes, it should be easy to integrate those changes into their more-recent work. In short, developers should be able to open incremental PRs without Git fear or stress.

This blog post explains how we manage such a feat!

### Workflow overview

Let's say we're working on a blog, and want to switch from local markdown files / hardcoded data to a headless CMS.

First, we create a new branch, `feat/headless-cms`. This will be our _root branch_; we'll merge PRs as we go into this branch. We never commit to it directly, and so for the time being, it's a clone of our deploy branch (master/staging/whatever).

Right after creating that branch and pushing it to Github, we create another branch, `feat/headless-cms-pt1`. This will be an _incremental branch_, holding some of the changes needed for this feature. We get to work on the most fundamental parts of this change (for example, adding a source plugin and configuring it to pull data from our new CMS). Once we have a "hello world" based on this new architecture, we're ready to solicit some feedback. We push our branch to Github, and open a PR comparing our _incremental_ branch to our _root_ branch.

In a traditional workflow, opening a PR makes it hard for us to keep working on that feature; we'll bloat the PR if we keep committing to it, and it's not obvious how to manage "chained" PRs. This is a big reason that teams wind up with big PRs; because there isn't a good mechanism in place to allow developers to keep working while awaiting review, we tend to wait too long before opening a PR.

In this alternative workflow, we can keep going. We'll create a new _incremental branch_, `feat/headless-cms-pt2`, forked from `feat/headless-cms-pt1`.

Here's a visualization of this setup:

![Three vertical columns representing each branch in question]()
