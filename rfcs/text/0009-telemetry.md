- 2019-03-05
- RFC PR: (leave this empty)
- Gatsby Issue: (leave this empty)

## Summary

We at Gatsby Inc. are planning to start collecting anonymous telemetry to guide the Gatsby development priorities, track and highlight plugin usage, identify common errors to fix, and overall make more educated decisions to help the Gatsby community grow.

In the future, we’ll create public dashboards with aggregated data from Gatsby usage so the entire community can view the health of various Gatsby ecosystem properties and pitch in to help improve them. A future RFC will cover this work.

## Motivation

Gatsby user base is growing very rapidly. Our small team is trying to better understand the usage patterns so we can best decide how to design future features and prioritize current work.

Products improve rapidly when there’s a fast feedback cycle between making changes and seeing the impact of those changes. If we make a new release of a plugin and immediately see elevated error rates associated with that plugin, we can revert the release while we investigate the cause of the new errors. If we see more people are using a particular source plugin, we can investigate it to ensure it’s fast & high quality.

It is common for larger open source projects to need to start collecting data to drive decision-making:

- [VS Code](https://code.visualstudio.com/docs/supporting/FAQ#_gdpr-and-vs-code)
- [Homebrew](https://docs.brew.sh/Analytics)

## Detailed Design

By collecting anonymous analytics, we’ll be able to prioritize fixes and features based on how, and when people use Gatsby. Since much of Gatsby’s function revolves around community plugins and starters, we want to collect information on usage, and, importantly, reliability, so that we can ensure a high-quality plugin (and soon, theme) ecosystem.

For example:

- We will be able to understand which plugins are used together, surface that information in the public plugin library, and, for example, build more relevant starters and tutorials.
- We will be able to surface popularity of different starters in the starter showcase.
- We will be able to surface error rates in each build stage, and focusing on driving these down over time. We want the experience to remain error free.
- We will be able to surface reliability of different plugins and starters, and detect the ones which seen buggy to then improve these.
- We will be able to see timings for different build stages to guide us in where we should focus optimization work.

### Privacy

We take privacy very seriously. As such, all personally identifiable or sensitive information, such as IP addresses, private NPM packages, email addresses or secret keys, will not be logged. Also analytics will be voluntary and users may opt-out any time.

All code for gathering telemetry will be open-source and maintained inside gatsbyjs/gatsby. We'll create a test suite to ensure that common ways for private information to leak can't happen.

### Event details

We will record the following types of events:

- CLI*COMMAND*[COMMAND], when the user runs a command locally
- CLI*COMMAND*[COMMAND]\_ACTIVE, when e.g. in develop site is reloaded
- BUILD*ERROR*[STAGE] when a gatsby build command throws an error
- CLI*ERROR*[ERROR_TYPE] when a gatsby cli runs into an unexpected error

Depending on the event, we will record following information:

- A Gatsby machine ID, a randomly generated UUID and stored at ~/.config/gatsby. This does not allow us to track individual users but does enable us to accurately measure user counts vs. event counts.
- A Gatsby repo ID, that is a one-way hash of the repository path
- A Timestamp
- The public plugins being used, along with the version of each plugin.
- General OS level information (Node version, Operating system, architecture, cpu model and whether the command is run in a CI service along with the CI service name)
- Summary of the errors experienced, with paths and similar data sanitized

### Opting out

Gatsby analytics helps us maintainers so we will appreciate leaving it on.
If you want to opt out, however, you can run `gatsby analytics --disable` or edit the ~/.config/gatsby/config.json and add `"analytics": false`.

To opt back in, you can run `gatsby analytics --enable`.

## Drawbacks

Some people don't like having their activity tracked and might be annoyed, even say angry things about Gatsby on social media about this.

We do have somewhat detailed (albeit spotty) ways of getting some information about Gatsby usage e.g. NPM downloads, GitHub issues, Twitter questions, UX research, etc. so we're not working blind without this information.

# Alternatives

There aren't really any alternatives — without directly sending information about usage, we only have proxy telemetry which are incomplete and often misleading (hello NPM downloads count).

We could do opt-in instead of opt-out but that would mean most people wouldn't ever know to opt-in and our data collection would be probably useless as we'd only see a small % of user activity and never be sure what % it is of the real total.

Given the information is valuable to the community as a whole and completely private, we're confident this is the right choice.
