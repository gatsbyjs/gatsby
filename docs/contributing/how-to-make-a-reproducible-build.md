---
title: How to Make a Reproducible Build
---

One way to try to dig down at resolving an issue is to have a demo project that shows off just the singular issue at hand. If you are able to, you could link the repo that the bug is found in, but it is easier to tackle the bug with a reproducible build instead so you have a lot less surface area to tackle.

A reproducible build is a reproduction of a problem in a much smaller context so other developers can reproduce the bug in a more narrow codebase rather than an entire application.

## Places to develop a reproducible build

- Locally with a starter: We can start out with a starter and then add the bare minimum to reproduce the bug. Once done, you can push this code to a public git hosting platform on GitHub or GitLab and then link it when [creating an issue](/contributing/how-to-file-an-issue/).
- Host on CodeSandbox: CodeSandbox has a Gatsby template which you can develop a site up online without needing to download anything. Then you can link a URL to the project and have a live project.
