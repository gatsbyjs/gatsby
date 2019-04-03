---
title: How to Make an Example Project
---

> Looking for how to create a reproduction for a Gatsby bug? Check out [How to Make a Reproducible Test Case][reproducible-test-case]

## What is an example project?

An example project is a project that can be used to validate that an issue exists or has been addressed with a fix or a new feature. For example, if a pull request is opened fixing an issue in a plugin, an example project would have been used to _validate_ that the issue both exists and also that it can be fixed with the proposed solution.

## Why should you create an example project?

An example project helps the maintainers of Gatsby establish context and similarly validate the changes in a PR in an isolated system. Oftentimes the burden of creating these example projects is put onto the maintainers, which can be a time-consuming and sometimes challenging process. Providing this example project **up front** in the pull request or issue lets us focus on quickly shipping and delivering features and fixes to as many users of Gatsby as possible.

## Steps to create an example project

- If connecting to some third party system (Wordpress, Drupal, etc.), the system should be configured to demonstrate the issue
  - Necesary plugins and/or features are configured appropriately
  - (If necessary) credentials provided to the Gatsby maintainer to access
- If using a Gatsby project to connect to this project, consider checking out [How to Make a Reproducible Test Case][reproducible-test-case]
  - For example, if fixing a bug in Contentful a Gatsby project would come pre-configured with access to Contentful

[reproducible-test-case]: /contributing/how-to-make-a-reproduction/
