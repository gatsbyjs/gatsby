const questions = require(`./questions`)

module.exports = {
  bugReport: {
    prettyName: `Bug Report 🐞`,
    questions: [questions.envinfoConfirmation, questions.filesConfirmation],
    template: answers => `
<!--
  Please fill out each section below, otherwise your issue will be closed. This
  info allows Gatsby maintainers to diagnose (and fix!) your issue as quickly as
  possible.

  Useful Links:
  - Documentation: https://www.gatsbyjs.org/docs/
  - How to File an Issue: https://www.gatsbyjs.org/docs/how-to-file-an-issue/

  Before opening a new issue, please search existing issues: https://github.com/gatsbyjs/gatsby/issues
-->

## Description

Describe the issue that you're seeing.

### Steps to reproduce

Clear steps describing how to reproduce the issue. Please please please link to a demo project if possible, this makes your issue _much_ easier to diagnose (seriously).

### Expected result

What should happen?

### Actual result

What happened.
    `,
  },
  featureRequest: {
    prettyName: `Feature Request 💡`,
    questions: [],
    template: answers => `
<!--
  Please fill out each section below, otherwise your issue will be closed.

  Useful Links:
  - Gatsby RFCs: https://github.com/gatsbyjs/rfcs
  - How to Contribute: https://www.gatsbyjs.org/docs/how-to-contribute/
  - How to File an Issue: https://www.gatsbyjs.org/docs/how-to-file-an-issue/

  Before opening a new issue, please search existing issues:  https://github.com/gatsbyjs/gatsby/issues

  ## A note on adding features to Gatsby and its official plugins

  Every feature needs to strike a balance - complex features are less likely to be worked on, whether that complexity comes from design, implementation or ongoing   maintenance costs. On the other side, features that are useful to all (or most) of Gatsby's users are more likely to be accepted.

  This means that not every feature request will be added to Gatsby, but hearing about what you want Gatsby to do is important. Don't be afraid to add a feature request!
-->

## Summary

Brief explanation of the feature.

### Basic example

If the proposal involves a new or changed API, include a basic code example. Omit this section if it's not applicable.

### Motivation

Why are we doing this? What use cases does it support? What is the expected outcome?
   `,
  },
  question: {
    prettyName: `Question 🤔`,
    questions: [questions.envinfoConfirmation, questions.filesConfirmation],
    template: answers => `
<!--
  To make it easier for us to help you, please include as much useful information as possible.

  Useful Links:
  - Documentation: https://www.gatsbyjs.org/docs/

  Gatsby has several community support channels, try asking your question on:

  - Discord: https://discord.gg/0ZcbPKXt5bVoxkfV
  - Spectrum: https://spectrum.chat/gatsby-js
  - Twitter: https://twitter.com/gatsbyjs

  Before opening a new issue, please search existing issues https://github.com/gatsbyjs/gatsby/issues
-->

## Summary

## Relevant information

<!-- Provide as much useful information as you can -->
    `,
  },
}
