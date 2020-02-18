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
The CLI:
- [x] suggests the correct spellings for misspelled Gatsby commands so people save time.
- [x] When people type the wrong thing in the browser (e.g. “localhost:8000/_ _ graphiql), we could either redirect to "correct" one or just support multiple different cases. This will help them spend less time looking for the right link.
- [x] Accepts shorter input for starter URL's (users can omit the https://www part of the starter URL)
- [x] Gives options of starters in the CLI. See PR https://github.com/gatsbyjs/gatsby/pull/14097
- [x] accepts shortened input needed for starting a new project: you can take away the  before the starter name and it still works
- [ ] dogfoods and runs the correct commands just like Google search does when you mispell something (requires us to update the did-you-mean file)
- [ ] Includes createPages page count in output to help users optimize for speed and catch errors faster''
- [ ] notifies user they might need to hit `r` if they’ve changed package.json, gatsby node, etc. when `gatsby develop` is running
- [ ] omits peer dependency warnings that people can ignore
- [ ] offers to restart & clear cache when a user is developing a local plugin, so the plugin will take effect
- [ ] Clears irrelevant output by omitting erroneously repeated error reports
- [ ] Only shows stack traces for _user errors_ instead of stack traces for babel parsing, for example
- [ ] Prioritizes status changes that are relevant to a user, e.g. success of a process or failure of a user initiated action
- [ ] Enables users to set aliases for commands, e.g. `gd` for `gatsby develop` 
- [ ] helps users choose between yarn and npm
- [ ] Make auxiliary actions observable by showing what items were deleted, which gives users a chance to confirm that the actions were correct or, if not, reverse the last action
- [ ] Opens localhost automatically when `gatsby develop` succeeds (or, other options: Make sure that links to development site / graphiql are easily discoverable in some way, which will also help make sure users can find the links without much scrolling. The problem is that errors / recompiling notices are getting appended endlessly so users need to scroll very far sometimes to get to those links. Possible solutions: If we would clear older errors / notices so the links are few lines away would fix it as well. Another option is for `gatsby develop` to be interactive (like `jest --watch`) where you can use commands while it's running and we could have a command to open the browser with development site / graphiql as part of the available commands. With Ink we can make sure we don't add too much info at the bottom.)
- [ ] Gives users warnings when they commit something that could affect build time, such as a large number of image files (since Gatsby Cloud will do this, too, I wonder if it’d be redundant and less specific to do this in the CLI also. It’d just be a general warning with no specific metrics)



Things to keep doing well:
- `gatsby new [project-name]` is easy!
- Keep develop and build output easy to find
- Keep a list of all CLI information on docs site because it’s one click and searchable there


There will be many more proposed changes based on the CLI style guide.

# Drawbacks

Why should we *not* do this? Please consider:

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



