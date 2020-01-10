---
title: "Incremental PRs: a new Github workflow for the Cloud team"
date: 2020-01-08
author: "Josh Comeau"
excerpt: "A look at how the Cloud team adopted a new workflow to achieve smaller, non-blocking PRs."
tags: ["source control", "Github", "workflows"]
---

import Breakout from "./Breakout"
import { visuallyHidden } from "../../../www/src/utils/styles"

2020 is shaping up to be a really exciting year for Gatsby. On the Cloud team, we have a bunch of really cool stuff on the roadmap. In order to help us build all the stuff we want to build, we've been refining some processes. And managing code reviews were at the top of the list.

Specifically, we were seeing a lot of "stalled" Pull Requests (PRs)—work was being put up for review, but not receiving prompt attention. These PRs tended to be quite large and complex.

If you've ever been tasked with reviewing a large PR, you know how much trouble it can be. In addition to the time commitment, it requires so much mental energy to keep all that context in your head at once. It can also make it harder to suggest tweaks; large PRs develop a kind of inertia. If the reviewer has a great idea around an alternate approach, but that approach would require a week of development time to implement, it's likely that the feedback won't even be shared.

So it's easy to say that developers should limit the size of their PRs, but this is very much easier said than done. Github really doesn't make it clear or intuitive how to break work up into multiple reviewable units. Pull Requests (PRs) are based on branches, and it's not always clear how to manage multiple simultaneous PRs. Effectively, this gives developers 2 common choices:

1. Work on the feature until it's done, and then open a mammoth everything-included PR.
2. Work on the feature until you've finished the first chunk, open a reasonably-small PR, and switch to another task while you wait for a review.

At a distributed company like Gatsby, where our team is located across the globe, there isn't always a teammate around to review your work. So we really don't want developers to be blocked waiting for feedback.

Ideally, the developer could spin up new PRs as they went, allowing them to solicit feedback early, without being blocked while waiting for it. If the feedback _does_ require significant changes, it should be easy to integrate those changes into their more-recent work.

This blog post explains how we solved for these concerns!

# Workflow overview

Let's say we're working on a blog, and want to incorporate a headless CMS, switching from using local markdown files and hardcoded data.

First, we create a new branch, `feat/headless-cms`. This will be our _root branch_; we'll merge PRs as we go into this branch. We never commit to it directly, and so for the time being, it's a clone of our _deploy branch_ (typically master or staging, whichever branch features are typically merged into). Even though it doesn't hold any commits yet, we should push it to Github.

Right after creating that branch and pushing it to Github, we create another branch, `feat/headless-cms-pt1`. This will be an _incremental branch_, holding some of the changes needed for this feature. We get to work on the most fundamental parts of this change (for example, adding a source plugin and configuring it to pull data from our new CMS). Once we have a "hello world" based on this new architecture, we're ready to solicit some feedback. We push our branch to Github, and open a PR comparing our _incremental_ branch to our _root_ branch:

import baseGithub from "./base-github.png"

<img src={baseGithub} aria-describedby="base-github-description" />

<span id="base-github-description" css={visuallyHidden}>4 git branches are represented with parallel lines. Our root branch, feat/headless-cms, is forked from staging, and contains no commits. feat/headless-cms-pt1 is forked from our root branch, and includes two commits, A and B. Finally, a fourth branch, feat/headless-cms-pt2, is forked after commit B, and includes one commit, C.</span>

In a traditional workflow, opening a PR makes it hard for us to keep working on that feature; we'll bloat the PR if we keep committing to it, and it's not obvious how to manage "chained" PRs. This is a big part of why teams wind up with big PRs.

In this alternative workflow, we can keep working. We'll create a new _incremental branch_, `feat/headless-cms-pt2`, forked from `feat/headless-cms-pt1`.

Here's a visualization of this setup:

import initialSvg from "./1-initial.svg"

<Breakout>
  <img src={initialSvg} />
</Breakout>

Our first incremental branch has two commits, `A` and `B`. Our second branch is forked from that first branch, and adds a new commit `C`.

### When changes are requested

At first blush, this workflow might seem problematic to you. How can you start work on the second part of the feature before getting feedback on the first? What if a bunch of changes are requested?

In fact, this workflow shines when it comes to implementing requested changes.

Let's say that we get feedback that fundamentally changes how we want to approach it. It requires a good amount of restructuring. We do those changes, and create a new commit, `D`, on our `pt1` branch:

import additionalWorkSvg from "./2-additional-work.svg"

<Breakout>
  <img src={additionalWorkSvg} />
</Breakout>

Our `pt1` PR is approved (🎉), but now we have to reconcile our `pt2` branch. Given that it built on a now-outdated structure, there's a good chance we'll have some conflicts.

We check out the `pt2` branch and rebase it onto the updated `pt1` branch:

```bash
$ git checkout feat/headless-cms-pt2
$ git rebase feat/headless-cms-pt1
```

If you're not familiar with rebasing, it's an alternative to merging that involves "replaying" commits over a different branch. This can be a weird idea for folks who are used to merging, and it takes most people a bit of practice to get comfortable with it. You can learn more about rebasing in [this article from Algolia](https://blog.algolia.com/master-git-rebase/).

### Conflicts

After running that rebase command, we'll likely get a conflict, since our commit `C` is incompatible with the changes in `D`. Here's the cool thing, though: the conflicts _show us exactly what needs to change_.

For many, Git conflicts are a stressful experience, one to be avoided at all costs. In this case, though, conflicts are actually pretty helpful, because they give you targeted information about the problem.

Imagine if we had instead opened one big PR with all of our changes. We'd get the same feedback: fundamental restructuring requested. Now it's on us, the developer, to figure out which parts of this big PR need to change, and which parts can stay the same. We need to do the work of hunting down the conflicts.

In this alternative flow, we're _leveraging_ Git to show us what work needs to be done.

Once we've fixed all the conflicts, we can finish up our rebase by running the following:

```bash
# stage all the changes we just made
$ git add .

# wrap up the rebase
$ git rebase --continue
```

After rebasing, our Git branches look like this:

import rebasedSvg from "./3-rebased.svg"

<Breakout>
  <img src={rebasedSvg} />
</Breakout>

You'll notice that our `C` commit—the only commit in our `pt2` branch—has been replaced with `E`. This is because it's no longer the same commit; it includes the changes that we dealt with in our rebase.

Because we've rewritten the history, by turning `C` into `E`, we need to force-push to update our PR on Github:

```bash
$ git push origin feat/headless-cms-pt2 -f
```

### Merging PRs

When PRs are approved, we can merge them. We have a couple options in this flow:

- Merge from the last one down (merge `pt2` into `pt1`, and then `pt1` into the root branch)
- Merge from the first one up (merge `pt1` into the root branch, and then merge `pt2` into the root branch)

In general, the second strategy is better, because it's more flexible; you don't need to wait for all work to be done before you can start merging!

We'll start by merging `pt1` into the root branch. Merge it in using the standard "Create a merge commit" option:

import mergeSrc from "./merge.png"

<img
  src={mergeSrc}
  alt="The Github pull request screen shows a 'merge' button with a dropdown and several options. This screenshot highlights that the first option is the desired one, 'Create a merge commit'."
/>

Next, we need to update our `pt2` branch. Right now it's still being compared to `pt1`, a branch which has since been merged. We want to point it to our _root_ branch, `feat/headless-cms`, instead.

We can do this on Github by _changing the base_. Github has [great docs](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/changing-the-base-branch-of-a-pull-request) that cover this. In effect, it allows us to switch which branch we want to merge our changes into.

With our new base set, our tree looks like this:

import mergeCommitSvg from "./4-merge-commit.svg"

<Breakout>
  <img src={mergeCommitSvg} />
</Breakout>

A new commit `M` was added, representing the merge.

### 🙅‍♀️ No squashing 🙅‍♀️

It's important that we stick with the default "Create a merge commit" option, in the short term. Before merging our changes into master, we'll be able to squash everything into 1 commit, but for now, preserving the history is important, in order for Git to correctly track what's happening.

When branches are visualized, they're often depicted as groups of commits. This very blog post is guilty of this as well: in the above diagram, our root branch is shown as "containing" commits `A`, `B`, and `D`.

In fact, branches are much thinner abstractions than that; all they do is point towards a specific commit. This works because commits themselves are similar to a linked list; every commit also points to its parent commit.

A more accurate representation of our current state would look like this:

import actualGitSvg from "./6-actual-git.svg"

<Breakout>
  <img src={actualGitSvg} />
</Breakout>

Every commit points to its parent, and branches are just references to a particular commit.

Let's say we had squash-merged our `pt1` branch into the root branch. We would wind up with two _parallel universes_. In our root branch, we'd have a brand new commit `S`, representing the squashed contents of `pt1`. Our `pt2` branch, meanwhile, doesn't know about any of this; the chain of commits still includes the "unsquashed" `pt1` work.

import parallelUniversesSvg from "./7-parallel-universes.svg"

<Breakout>
  <img src={parallelUniversesSvg} />
</Breakout>

These universes collide when we try to change the base, to point `pt2` at the root branch:

import doubleWorkSvg from "./8-double-work.svg"

<Breakout>
  <img src={doubleWorkSvg} />
</Breakout>

The Git history pollution isn't a huge deal, since we'll have the chance to squash or clean this up before deploying, but it can lead to weird issues and nonsensical conflicts.

If you do wind up squash-merging a branch, you'll need to manually snip out the duplicate commits. You can do this with an [interactive rebase](https://hackernoon.com/beginners-guide-to-interactive-rebasing-346a3f9c3a6d):

```bash
$ git checkout feat/headless-cms-pt2
$ git rebase -i feat/headless-cms
# A popup will open, presenting you with a list of commits.
# Delete the lines that contain work covered by the squashed
# commit. Save and close the file.
```

### Incorporating external changes

The work we're doing in this example to migrate to a headless CMS might take a week or two. In that time, other folks at the org will undoubtedly be shipping a bunch of other stuff. We may wish to update our feature to incorporate those changes!

To accomplish this, we'll do some more local rebasing:

```bash
# Update our local state
$ git checkout master
$ git pull origin master

# Rebase our root branch
$ git checkout feat/headless-cms
$ git rebase master

# Continue down the chain
$ git checkout feat/headless-cms-pt2
$ git rebase feat/headless-cms
```

Essentially, we're scooting all of our changes to happen _after_ the most recent commit on master. It's important to rebase instead of merge so that we don't "interleave" the changes from other branches—we're keeping all of our work tightly clustered for now. This can be a bit tedious if you have lots of incremental branches, so you may wish to hold off on this until you've merged everything into the root branch.

# And on and on

The neat thing about this flow is that it isn't limited to two incremental branches; we can keep going!

In this example, we could check out a new branch, `pt3`, based off of `pt2`. And then a fourth, `pt4`, from `pt3`:

import moreIncrementalSvg from "./5-more-incremental.svg"

<Breakout>
  <img src={moreIncrementalSvg} />
</Breakout>

No matter how many branches we have, the process is always the same when we're ready to start merging:

- Merge the earliest open PR into the root branch, using the standard "merge" option.
- _Change the base_ of the next branch to point at the root branch

# Ship it

What about when all the work is done, and we're ready to release?

At this point, we'll have a string of commits on our root branch, `feat/headless-cms`. We can open a PR against our deploy branch (eg. master or staging). Because all the work has already been reviewed, we don't need to go through another review cycle.

At this point, we have the freedom to organize our commits however we want. We can squash it all into 1 commit, or combine them into logical chunks. It's up to us to decide how we want our work to be reflected in the history.

# Drawbacks

No flow is without tradeoffs, and this one has a couple:

##### 1. It rewrites history

This flow relies heavily on rebasing, which rewrites history. This means that pushing to Github requires a force-push, which can be scary, especially for folks newer to using Git.

This also makes it harder to collaborate on a feature; you need to communicate clearly before rebasing, to make sure everyone's work is in beforehand.

##### 2. It involves some branch juggling

With 3-4 incremental branches, developers have to bounce between them and make sure they're kept in sync. This can be tedious.

# When should I use this flow?

Given the drawbacks mentioned above, this is probably not something that should be adopted for _every_ change. It provides the most benefit for changes that are too big to fit into a single PR, and too broad to easily conceal behind a feature flag.

It's hard to define a "big" PR - sometimes, a PR changes 2,000 lines of code, but only because a codemod slightly tweaked a bunch of files. Other times, a 300-line PR is so dense that it could benefit from being broken up into smaller pieces.

The amount of time it takes to _review_ a PR is often correlated with the amount of time it took to _write_ it, so maybe a better rule of thumb is that a PR is too big if it encompasses more than a few days' worth of development effort.

For self-contained changes, a feature flag can be a great way to avoid big PRs. Unfortunately, they don't address the problem of developers being blocked while awaiting feedback, so a streamlined version of this flow can still help in these cases.

# Conclusion

We've been using this flow on the Cloud team for a few weeks now, and it's been a pretty big boon to our productivity! PRs are tailored to be easy to review, and developers don't have to switch tasks to avoid being blocked while awaiting feedback. It's pretty great.

Parts of this flow can be tedious, as the same commands need to be repeated over and over again to update multiple incremental branches. It might be interesting to explore some additional tooling, to manage this for us! But in the meantime, it's a small price to pay.

If you give this flow a shot, I'd love to hear how it works for you! Feel free to [reach out on Twitter](https://twitter.com/JoshWComeau).
