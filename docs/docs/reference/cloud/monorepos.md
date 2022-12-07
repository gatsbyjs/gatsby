---
title: "Monorepos"
description: "Monorepos support in Gatsby Cloud"
---

## Introduction

Gatsby Cloud has support for projects organized as [monorepos](https://monorepo.tools/), but since there are different competing tools to build a monorepo it's important to know what Gatsby Cloud supports today.

This document will explain which tools are supported and how you can troubleshoot issues.

## Supported tools

The following table shows the level of support for each tool.

**Legend:**

| Icon | Feature Capability                       |
| ---- | ---------------------------------------- |
| ●    | Fully Supported                          |
| ◐    | Somewhat Supported (support is minimal ) |
| ○    | Not Supported                            |

**Support:**

| Tool.                            | Level of Support | Notes                                                                                                                    |
| -------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Yarn Workspaces (v1)             | ●                |                                                                                                                          |
| Yarn Workspaces (v2/v3 with PnP) | ◐                |                                                                                                                          |
| Lerna                            | ●                |                                                                                                                          |
| NPM Workspaces (v7 and onwards)  | ●                |                                                                                                                          |
| NX                               | ●                | Full support for detecting and installing dependencies                                                                   |
| Turborepo                        | ○                | We do not have plans to support Turborepo at this time.                                                                  |
| pnpm                             | ○                | If you want to see this feature, [upvote the request](https://gatsby.canny.io/gatsby-cloud/p/support-pnpm-for-monorepos) |

## Troubleshooting

### PnP and Yarn compatibility issues

Some tools don't work under Plug'n'Play environments, check the Yarn [compatibility table](https://yarnpkg.com/features/pnp#compatibility-table). You can enable the built-in `node-modules` plugin by adding the following into your local `.yarnrc.yml` file before running a fresh `yarn install`:

```yml
nodeLinker: node-modules
```
