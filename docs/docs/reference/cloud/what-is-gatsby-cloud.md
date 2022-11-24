---
title: "What is Gatsby Cloud"
description: "Become familiar with the features and functionality of the Gatsby Cloud platform"
---

Gatsby Cloud is a custom cloud infrastructure designed to build and host Gatsby sites. It uses intelligent caching to incrementally build your site faster than any other platform. This article provides an overview of the core components of the platform.

## Dashboard

Whenever you create or log into your Gatsby Cloud account, you will start at the dashboard. From the dashboard, you can:

- Change account settings.
- Switch Workspaces.
- Change Workspace or site settings.
- Manage Workspace Members.
- Search sites.
- View and trigger builds and previews.

## Workspaces

A Workspace is a collection of sites. It has a name, Members, and a billing plan (free or paid) associated with it.

## Members

Members include the owner and any other individuals invited to collaborate in a specific Workspace. Members have a defined role and may or may not have a Gatsby Cloud account themselves. They can have access to all sites in a Workspace or a specific scope. Learn more about [Member management](/docs/how-to/cloud/managing-Workspace-members).

## Sites

Sites are Gatsby projects. They can be connected to a Content Management System (CMS) to source content for builds and previews. They can be connected to a hosting service to deploy a build to the internet.

## Builds and previews

A "build" is a version of your site that results from compiling your site's source code. A "preview" is a specific kind of build used during development to show what your site looks like before building it for production. On Gatsby Cloud, there are specific names for builds and previews:

- Production Builds
- Pull Request Builds
- CMS Previews

See the [Production Builds and Pull Request Builds](/docs/reference/cloud/production-builds-and-pull-request-builds) and [CMS Previews](/docs/reference/cloud/cms-previews) articles for more information.
