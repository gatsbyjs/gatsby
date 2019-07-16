---
title: Debugging Cache Issues
---

There can be certain scenarios in which the Gatsby caching mechanism appears to fail, which can lead to issues like:

- Content not appearing when it should
- Changes to plugin source code not appearing to be invoked appropriately

and more! If you've found yourself writing a script like:

```json:title=package.json
{
  "scripts": {
    "clean": "rm -rf .cache"
  }
}
```

consider utilizing the `gatsby clean` command which can help resolve caching issues for you.

First make sure the version of `gatsby` specified in your `package.json` dependencies is _at least_ `2.1.1`, and then make the following change to `package.json`:

```json:title=package.json
{
  "scripts": {
    "clean": "gatsby clean"
  }
}
```

Now when issues arise that seem to be related to caching, you can use `npm run clean` to wipe out the cache and start from a fresh slate.

_Note: If you find yourself using this command regularly, consider helping us out and [responding to our GitHub Issue][github-issue] with clear reproduction steps._

[github-issue]: https://github.com/gatsbyjs/gatsby/issues/11747
