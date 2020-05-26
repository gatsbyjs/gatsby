- Start Date: 2018-03-21
- RFC PR: (leave this empty)
- Gatsby Issue: #4311

# Summary

Implement a labelling system for [issues on Gatsby's GitHub repo](https://github.com/gatsbyjs/gatsby/issues). This is following up from discussion at the recent Gatsby Maintainer Summit.

Refs https://github.com/gatsbyjs/gatsby/issues/4311

# Motivation

People _want_ to contribute to Gatsby, but with (currently) over 500 open issues it's difficult to know where to start.

The aim is to make it easier for new and existing contributors to work on Gatsby without adding too much admin overhead. It's important for the labelling system to be quick to manage to ensure that it's used!

# Detailed design

The broad areas discussed were:

- Type: labels like `bug`, `discussion`, `feature request`
- Status: labels like `needs repro`, `ready`
- Misc: labels like `good first issue`
- Target (area of responsibility): Use GitHub projects
- Roadmap: Use GitHub Milestones

At a minimum every new issue should have a _Type_ label applied to it, everything else is optional. Labelling can be fluid - a lot of issues might start with the label 'type: discussion', before being changed to a more specific _type_.

Taking that information along with the existing repo structure gives a setup something like this:

### Type label

Every issue should have exactly one _Type_ label.

labels: `bug`, `discussion`, `feature`, `maintenance`, `documentation`

### Status label

Optional

labels: `needs repro`, `help wanted`

### Misc label

Optional

So far these are labels indicating that an issue is a well-defined piece of work or labels used by bots.

label: `good first issue`, `hacktober`, `stale?`, `review`

### Projects

Optional

Assign an issue to one of the existing [projects](https://github.com/gatsbyjs/gatsby/projects): docs, v2, UX (add projects as required)

> Question: Do we need to create any additional projects?

### Milestones

We talked about using GitHub's Milestones as a way of defining a roadmap however, Gatsby already has a [`v2` Project](https://github.com/gatsbyjs/gatsby/projects/2) which contains more info than a Milestone could. In the interest of keeping this plan as simple as possible, I'm going to drop Milestones for now (unless anyone has strong objections). This could be looked at again once the labelling and projects are in place.

### Existing labels

There are 20 existing labels. While we're adding new labels, it makes sense to revisit the existing ones. Having a small, clearly defined set of labels makes it much more likely that the labelling system will be used. Here's what I propose should happen to each of them:

| Label                   | Destiny  | Notes                                                                                                                    |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| API/Plugins             | ❌delete | too specific (currently applied to 66 issues)                                                                            |
| bug                     | ✅keep   | rename to `type: bug` or similar                                                                                         |
| Documentation           | ✅keep   | rename to `type: documentation` or similar                                                                               |
| DX                      | ❌delete | too specific (currently applied to 13 issues)                                                                            |
| Feature Request         | ✅keep   | rename to `type: feature` or similar                                                                                     |
| good first issue        | ✅keep   | exact name is used by GitHub, don't rename                                                                               |
| GraphQL                 | ❌delete | too specific (currently applied to 13 issues)                                                                            |
| Hacktoberfest           | ✅keep   | exact name is used by Hacktoberfest, don't rename                                                                        |
| Help Wanted for Plugins | ❌delete | too specific (currently applied to 4 issues)                                                                             |
| Help Wanted in Core     | ✅keep   | rename to `help wanted` or similar                                                                                       |
| needs-repro             | ✅keep   | rename to `needs repro` or similar                                                                                       |
| performance             | ❌delete | too specific (currently applied to 4 issues)                                                                             |
| question                | ✅keep   | rename to `type: discussion` or similar                                                                                  |
| review                  | ❌delete | ~~~Used by wafflebot? Investigate this~~~ No longer used                                                                 |
| stale?                  | ✅keep   | Used by stalebot to close stale issues. Maybe rename to `bot: stale?`                                                    |
| upstream-issue          | ❌delete | I'm 50/50 on this one. There are only two issues using it so have opted to delete it                                     |
| UX Design               | ❌delete | redundant - add all issues with this label to the 'UX' project before deleting the label                                 |
| v0                      | ❌delete | it's never been used                                                                                                     |
| v1                      | ❌delete | We _could_ keep this but I don't think it adds much value (currently applied to 8 issues)                                |
| v2                      | ❌delete | redundant - add all issues with this label to the 'v2' project before deleting the label (currently applied to 7 issues) |

### Implementation steps

- [ ] collate any feedback on this RFC
- [ ] for 'redundant' labels, add their issues to the appropriate projects
- [ ] rename, delete and add labels
- [ ] start labelling up _new_ and _recently updated_ issues

# Drawbacks

The time to implement is fairly short, but we may discover that the proposed labels don't cover all categories of issues.

Maybe this system turns out not to be useful? If that happens we can stop labelling issues and be in the same situation as now.

It's probably unreasonable to go back and label up _every_ issue. New and recently updated issues should be labelled.

# Alternatives

Alternatives are:

- not labelling issues
- using a different labelling system

# Adoption strategy

This is relevant to the Gatsby GitHub repo, so no adoption strategy is necessary.

# How we teach this

A few approaches:

- By example i.e. start labelling up issues
- Posting to the [Gatsby core maintainers discussion board](https://github.com/orgs/gatsbyjs/teams/gatsby-core-maintainers)
- Adding label descriptions to [GitHub's labels page](https://github.com/gatsbyjs/gatsby/labels)
- Adding labelling info to [CONTRIBUTING.MD](https://github.com/gatsbyjs/gatsby/blob/master/CONTRIBUTING.md)

As a follow on from this, it'd be interesting to explore automated contributor onboarding. See https://github.com/styled-components/styled-components/blob/master/CONTRIBUTING.md#ownership for a good example.

# Unresolved questions

- Do we need to create any additional projects to assign issues to?
