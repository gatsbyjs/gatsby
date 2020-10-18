- Start Date: 2019-02-26
- RFC PR: (leave this empty)
- Gatsby Issue: (leave this empty)

# Summary

Add structured logging support to Gatsby.

As Gatsby has evolved, it's outgrown its current log reporter. In order to fix existing issues, support the upcoming Gatsby Preview service and enable future features like a browser-based logger or indexed error messages, we need to improve the way Gatsby creates and outputs its logs.

See this issue for a good overview of current logging limitations: https://github.com/gatsbyjs/gatsby/issues/11076.

## Requirements

- minimal (ideally 0) breaking changes
- support different log levels
- support multiple log formatters (e.g. output logs in json format, output logs to a file, output without colours and spinners for non-tty environments)
- maybe support custom user-provided log formatters?
- should be easier to use across all parts of Gatsby - e.g. within the sharp transformer or the createRemoteFileNode helper

This doesn't, on its own, fix the concurrent log conflict issue (demo'd in the linked issue) but puts the pieces in place for that to be solved.

# Basic example

Example log message:

```js
{
  "data": "I am a log message, this is freeform text",
  "id": //optional, link related messages to each other
  "time": "2019-02-03T19:02:57.534Z",
  "type": "info",
  "v": 0 // version so we can change the structure in future?
}
```

Example usage in a gatsby-node.js file:

```js
exports.onCreateNode = ({ actions, reporter }) => {
  // Supports the existing 'reporter' API
  reporter.info(`I am a log message, this is freeform text`)

  // Using a new 'log' action instead of the existing reporter API
  const { log } = actions
  log({
    message: `I am a log message, this is freeform text`,
    type: `info`,
  })
}
```

[See this proof of concept for more examples](https://github.com/m-allanson/gatsby/pull/43/files?utf8=✓&diff=unified&w=1), including how activity timers could work. Note that these examples are not in any way final - the implementation of this RFC could take a totally different approach.

# Motivation

(see summary)

# Detailed design

See [this minimal proof-of-concept](https://github.com/m-allanson/gatsby/pull/43) for one approach at implementing this.

This creates [a new `log` action](https://github.com/m-allanson/gatsby/pull/43/files#diff-f61af2b51837961d211c7ea1a4b91837) in Gatsby, and [replaces the existing reporter with a wrapper around the log action](https://github.com/m-allanson/gatsby/pull/43/files#diff-237d3207439e181589c4b0bfbc06a61b). New [log actions are handled](https://github.com/m-allanson/gatsby/pull/43/files#diff-8c8b888e741f1c31e97d4bf05894f50d) in one place.

# Drawbacks

There's the potential to create breaking changes with this work - these should be weighed very carefully before going ahead with them.

This feature is blocking a series of future features and bug fixes. Maybe these issues can be tackled on a case-by-case basis without needing structured logs (although I think it would be difficult).

The exact implementation for this hasn't been worked out, maybe there will be problems that haven't been thought about yet.

Maybe there's an approach that provides the benefits of structured logging without needing to run logs through Gatsby's internal redux store.

# Alternatives

Related tools that have good log output:

- [Expo CLI](https://github.com/expo/expo-cli)
- [Jest's CLI](https://github.com/facebook/jest)
- [Vue CLI](https://cli.vuejs.org/)

# Adoption strategy

This would mostly be an internal change. See the next section for more details.

# How we teach this

Initially by ensuring compatibility with the existing reporter.

Any changes will most likely affect plugin authors. If changes to plugins are required, we can update official plugins, create documentation and reach out directly to plugin maintainers.

Existing Gatsby developers will be unaffected by this change unless they are maintaining a Gatsby plugin. Even then we should aim to avoid creating work for plugin maintainers wherever possible.

# Unresolved questions

- do we have to maintain backward compatibility with the existing reporter? Probably a large majority of usage is in Gatsby monorepo.
- there are some parts of Gatsby that use the existing reporter before the redux store is available. What do we do there?
- should we use something like winston or bunyan to output logs?
- how do we make this easier to use in plugins / helper functions?
- should we monkey patch console.log to point people towards this logger instead, or automatically forward console messages to this new log format?
- should this remain as part of gatsby-cli, move into the gatsby package, or have its own package?

---

Thanks @oorestisime for writing up [issue #11076](https://github.com/gatsbyjs/gatsby/issues/11076)
