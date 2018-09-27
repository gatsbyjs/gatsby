Everything here corresponds to the Starter Showcase initiated and maintained by @sw-yx.

# For Gatsby users: How to add your starter

open a PR to add a markdown file with your starter. Look at the other markdown files in the `/startersData` folder for format. the other folders will be generated when we run our scripts at scrape time.

---

# For Maintainers

## Context

- Prior work: <https://github.com/sw-yx/gatsby-starter-search>
- Related issue: <https://github.com/gatsbyjs/gatsby/issues/5334#issuecomment-394413932>
- Related project: [Site Showcase](https://github.com/gatsbyjs/gatsby/issues/4392)

## How this works

We intentionally take a different approach than the Site Showcase. Here's a slack convo:

```
swyx [8:39 PM]
digging into gatsby-source-github right now to see if i can crawl dependencies within gatsby instead of outside it (which is how I currently do it). it seems slightly problematic with security in particular (have to supply a github personal access token, which I assume we have to host in netlify somewhere) and we dont really need much beyond just grabbing a package.json. I think my node-based approach is faster and simpler, but less automated.

there’s reasonable doubt as to whether my approach is best (given we want to show off gatsby’s capabilities) but for the timeframe I have I should probably just port over my existing approach. happy to completely throw it out and rewrite if we decide we want to make full automation a priority (i suspect it’s not)

kylemathews [8:45 PM]
We'd almost certainly want to crawl the data outside of a source plugin and then suck that data in at build time. Similar to the screenshot plugin
It'd take a lot of time potentially which we'd want to avoid especially as caching would probably be harder

swyx [8:48 PM]
ok sounds like you’re fine with a separate crawl process. happens to be what i did :stuck_out_tongue:
```
