---
title: "Monorepos"
description: "Monorepos support in Gatsby Cloud"
---

## Introduction

Gatsby Cloud has support for monorepos projects, but since there is a plethora of dependency management tools out there some issues can occure.
This document will walk you through the tools that are supported and how to troubleshoot some edge cases

## Monorepo Support

The following tables shows the level of support for each tool

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
| NX                               | ○                | Work is in progress                                     |
| Turborepo                        | ○                | We do not have plans to support Turborepo at this time. |

## Troubleshooting
