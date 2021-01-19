- Start Date: 2019-04-23
- RFC PR: (leave this empty)
- Gatsby Issue: (leave this empty)

# Summary

Our command-line interface (CLI) is OK but not great. It will be useful to generate a set of design principles to base the CLI around — but not change what's working well (which is a lot of it). So let’s do it!

The CLI is the main entry point and interface people have (currently) for Gatsby. Everyone sees it! So it has a huge influence on people’s experience of Gatsby.

We’re going to create a CLI style guide and then implement that style guide, which includes redesigning error messages, introducing `gatsby --quiet` as a default mode and make more extensive use of `gatsby --verbose` flag. To make the CLI easier to design and improve, we’ll implement Ink. To optimize the CLI design, we’ll use the data being collected through our telemetry setup, which collects data about CLI usage (opt out is possible).

# Basic example

Note: [Ink](https://www.npmjs.com/package/ink), an npm package that gives us the use of React for CLIs, will make it easier to design the CLI with consistency. Just as React helps web UIs have a consistent design, Ink will provide the same thing for our CLI.

# Motivation

## Why are we doing this?

We have found many areas where the Gatsby CLI is doing well and many other areas where it is lacking. Here are resources that informed our knowledge of problems that Gatsby CLI has and possible ways to solve those problems:

- [Evaluation of other CLI tools](https://github.com/gatsbyjs/gatsby/issues/12951)
- [Nielsen Norman Group 10 usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [Nielsen Norman Group error message design](https://www.nngroup.com/articles/error-message-guidelines/)
- [Heroku CLI style guide](https://devcenter.heroku.com/articles/cli-style-guide)
- [12 Factor CLI Apps](https://medium.com/@jdxcode/12-factor-cli-apps-dd3c227a0e46)
- [User journey through the Gatsby CLI](https://whimsical.co/2PxMcRGE63bwk1Ayc3emAB) (informed by usability interviews and the Gatsby core team’s observations of what issues are most common regarding the CLI)

## What use cases does it support?

Developers who use the Gatsby CLI to start, develop, and build Gatsby sites.

## What is the expected outcome?

The expected outcome is that the Gatsby CLI will adhere to common sense usability and accessibility standards and will also help people start, develop, and build Gatsby sites faster and with less frustration.

Here are the “user can” statements we want to be true after this redesign:
Contributors and Ink team members can decide which changes to merge or not through usability heuristics and style principles
Users can know what an error is and how to solve it
Users can know the current state of the system
Users can know when they need to take action and how to take that action

## Data collection outcomes

See this [RFC on Error surveying & improvement](https://github.com/gatsbyjs/rfcs/pull/37)

## Objectives

- Increase the rate of adoption - more Gatsby CLI users!
- Make sure users can reach their goals through the CLI
- CLI should embody the principles in the CLI style guide

## Anti-goals

- Losing Gatsby users
- Creating frustration or making tasks take more time

# Detailed design

We’d like to create a [CLI style guide](https://docs.google.com/document/d/1rv7tBUeqHN4t_UecuEAKVCWAVzQoCmcDoONBmf3HggI/edit?usp=sharing) and implement its principles.
We'd also like to make the changes outlined in the section titled below, called "List of top action items"
A related RFC is the [Error surveying & improvement RFC](https://github.com/gatsbyjs/rfcs/pull/37)

## Make these statements come true

The user can:

- [x] get suggestions for the correct spellings for misspelled Gatsby commands (https://github.com/gatsbyjs/gatsby/issues/13512#issuecomment-580314970)
- [x] enter shorter input for starter URL's (users can omit the https://www part of the starter URL)
- [x] select a starter in the CLI without needing a URL. See PR https://github.com/gatsbyjs/gatsby/pull/14097
- [ ] be redirected to the correct URL when typing in “localhost:8000/\_ \_ graphiql incorrectly (we could either redirect to "correct" one or just support multiple different cases)
- [ ] be directed to another localhost address is localhost:8000 is already taken (https://github.com/gatsbyjs/gatsby/issues/368 and https://github.com/gatsbyjs/gatsby/issues/13512#issuecomment-485781525)
- [ ] misspell a Gatsby command and the CLI will run the correct command anyway just like Google search does when you misspell something (requires us to update the did-you-mean file). https://github.com/gatsbyjs/gatsby/issues/13512
- [ ] get createPages page count in output to help users optimize for speed and catch errors faster''
- [ ] get notified that they might need to hit `r` if they’ve changed package.json, gatsby node, etc. when `gatsby develop` is running
- [ ] see only relevant warnings; e.g. omission of peer dependency warnings that they can ignore
- [ ] gets notification to restart & clear cache when they are developing a local plugin, so the plugin will take effect
- [ ] gets only relevant error reports, e.g. omission of erroneously repeated error reports
- [ ] Only gets stack traces for _user errors_ instead of stack traces for babel parsing, for example
- [ ] set aliases for commands, e.g. `gd` for `gatsby develop`
- [ ] know when to choose between yarn and npm
- [ ] see what items were deleted, which gives them a chance to confirm that the actions were correct or, if not, reverse the last action
- [ ] see status and open localhost automatically after `gatsby develop` succeeds (https://github.com/gatsbyjs/gatsby/issues/13513)
- [ ] get warned when they commit something that could affect build time, such as a large number of image files (since Gatsby Cloud will do this, too, I wonder if it’d be redundant and less specific to do this in the CLI also. It’d just be a general warning with no specific metrics)
- [ ] support adding a Gatsby starter to a path within another Gatsby project (https://github.com/gatsbyjs/gatsby/issues/16135#issuecomment-516054266)
- [ ] detect if the user is doing plugin authoring, and invite them to read documentation on it (https://github.com/gatsbyjs/gatsby/issues/13377)

Things to keep doing well:

- `gatsby new [project-name]` is easy!
- Keep develop and build output easy to find
- Keep a list of all CLI information on docs site because it’s one click and searchable there

There will be many more proposed changes based on the CLI style guide.

# Drawbacks

Why should we _not_ do this? Please consider:

- Implementation cost, both in term of code size and complexity
- Whether the proposed feature can be implemented in user space
- The impact on teaching people Gatsby
- Integration of this feature with other existing and planned features
- Cost of migrating existing Gatsby applications (is it a breaking change?)

There are tradeoffs to choosing any path. Attempt to identify them here.

# Alternatives

We’ve considered many designs, and will do testing throughout implementation to make sure these changes improve the user experience of Gatsby users.

If we don’t do this, things will still be ok; we’ll just miss out on becoming a more helpful CLI.

# Adoption strategy

Existing Gatsby developers will enjoy the benefits of this redesign without doing much work; when they update Gatsby, we can notify them that `gatsby --quiet` is their new default, and they can learn of any new flag in `gatsby --help`. Most other changes will be embedded in the flow they’re already used to.

# How we teach this

We teach this through the CLI style guide and an updated CLI document, which we’ll need to publish in the docs.

# Unresolved questions

We don't know for sure which changes will definitely help solve problems in the CLI. We'll need to gather data and test our hypotheses. We can get a lot of value from implementing the RFC on Error surveying & improvements. Other data collected from telemetry will help us optimize the CLI experience.
