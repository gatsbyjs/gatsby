---
title: "Monorepos"
description: "Monorepos support in Gatsby Cloud"
---

## Introduction

Gatsby Cloud has support for projects organized as [monorepos](https://monorepo.tools/), but since there are different competing tools to build a monorepo it's important to know what Gatsby Cloud supports today.

This document will explain which tools are supported and how you can troubleshoot issues.

## Supported tools

The following table shows the level of support for each tool.

**Legend**

| Icon | Feature Capability                       |
| ---- | ---------------------------------------- |
| ●    | Fully Supported                          |
| ◐    | Somewhat Supported (support is minimal ) |
| ○    | Not Supported                            |

**Support**

| Tool.                            | Level of Support | Notes                                                   |
| -------------------------------- | ---------------- | ------------------------------------------------------- |
| Yarn Workspaces (v1)             | ◐                |                                                         |
| Yarn Workspaces (v2/v3 with PnP) | ◐                |                                                         |
| Lerna                            | ●                |                                                         |
| NPM Workspaces (v7 and onwards)  | ●                |                                                         |
| NX                               | ○                | Work in progress                                     |
| Turborepo                        | ○                | We do not have plans to support Turborepo at this time. |

## Troubleshooting
