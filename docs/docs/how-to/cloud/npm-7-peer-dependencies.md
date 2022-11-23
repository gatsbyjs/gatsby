---
title: "Using npm 7 Peer Dependencies With Gatsby Cloud"
description: "Learn how to handle conflicting peer dependencies on Gatsby Cloud when using npm 7"
---

If you are using [npm](/docs/glossary/npm/) 7, you may encounter conflicting peer dependencies that cause a build failure.

[Adding the environment variable](/docs/reference/cloud/managing-environment-variables) `NPM_CONFIG_LEGACY_PEER_DEPS=true` will force the legacy behavior and use the peer dependency behavior of npm versions 3 - 6. Be aware that, per the [npm docs](https://docs.npmjs.com/cli/v7/using-npm/config#legacy-peer-deps), use of `legacy-peer-deps` is not recommended, as it will not enforce the `peerDependencies` contract that meta-dependencies may rely on.
