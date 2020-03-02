---
title: Experimental Flags in Gatsby
---

We're always making improvements to Gatsby and sometimes, these improvements might be available behind a feature flag. These flags are typically an environment variable that can be set to turn the feature on when starting up either `gatsby develop` or `gatsby build`.

This page aims to list currently known and supported experimental feature flags in Gatsby v2.

Please note that everything on this page is _experimental_ in that they might or might _not_ make it into a stable version of Gatsby in the future. APIs marked as experimental may also include breaking changes in a patch or minor version bump or be removed and users should only proceed with caution.

## Currently Supported Experimental Flags

### GATSBY_DB_NODES

In preparation for future versions of Gatsby, we’ve enabled experimental support for a different mechanism for the persistence of nodes: [Loki](https://www.npmjs.com/package/lokijs). You can try this by setting `GATSBY_DB_NODES` to `loki`

Read up more about this in the [Scaling Issues documentation](https://www.gatsbyjs.org/docs/scaling-issues/#gatsby_db_nodes).
