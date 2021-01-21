- Start Date: 2019-01-04
- RFC PR:
- Gatsby Issue:

# Summary

We want to move to begin supporting Node 8 as our minimum recommended and supported version we support with Gatsby.

# Motivation

We are doing this for several reasons, specifically:

- Node 6 is near the end of its life, and will enter into [maintenance mode in April 2019][node6-lts]
- Node 8 supports several features that make documentation and general ease-of-use arguably easier, specifically:
  - native `async/await` support

Coupled together, the two main benefits of moving to Node 8 as a minimum supported version are

1. Easier, clearer documentation
2. Ability to use/target features which will allow us to ship less code (eventually!)

# Detailed design

The design of this change is primarily documentation driven. This is due to the primary reason that we are considering deprecating Node 6 support, not outright dropping support. In much the same way that Node 6 will enter into maintenance mode it will similarly enter a deprecation/maintenance mode for Gatsby v2.

To the best of our abilities, we will _not_ introduce breaking changes which break Node 6 support. Primarily, this is due to the fact that we will continue to use [`babel-preset-gatsby-package`][babel-preset-gatsby-package] to _continue_ to target Node 6 APIs and code requirements. We want to keep Node 6 support (from a library/framework) level as long as we are able to, because the cost of continuing to support it is relatively small from a library/framework level, but the cost of breaking builds unknowingly is much more burdensome.

In effect, the approach is as simple as:

1. Continue to support Node 6 as a `node` version target in `babel-preset-gatsby-package`
1. Document Node 8 as a minimum recommended Node version, so that new/repeat visitors to Gatsby's documentation are already using our recommended Node minimum versions and future upgrades/breaking changes have a minimal/null cost

On 1), when we are ready and we feel sufficient time has elapsed, we will bump `babel-preset-gatsby-package` to target version `8` of node, like so:

```diff
const nodeConfig = {
    targets: {
-      node: PRODUCTION ? 6.0 : `current`,
+      node: PRODUCTION ? 8.0 : `current`
    },
  }
```

When doing so, we will also bump the version(s) of the packages that are being released with this breaking change, perhaps as Gatsby v3, or perhaps as a minor release (e.g. `2.0.0` -> `2.1.0` if we feel it has been sufficiently communicated)

This change will allow us to transpile _less_ code, in particular we will get native `async/await` support, rather than generators and `yield` functions, as an example. The benefit of this isn't _huge_ but.. as no one knows better than us, small wins stack up.

As far as documentation goes, we will (minimally) be able to make the following changes:

- Document `async` / `await`

  ```diff
  -exports.createPages = function createPages({ graphql }) {
  -  return new Promise((resolve, reject) => {
  -    return graphql(`
  -      {
  -        site {
  -          siteMetadata {
  -            title
  -          }
  +exports.createPages = async function createPages({ graphql }) {
  +  const result = await graphql(`
  +    {
  +      site {
  +        siteMetadata {
  +          title
          }
        }
  -    `)
  -      .then(result => {
  -        // do something with result
  -        resolve()
  -      })
  -  })
  +    }
  +  `)
  +
  +  // do something with result
  }
  ```

Both _seem_ like small changes, but in practice both of these have led to much confusion and clarification.

# Drawbacks

Breaking support for a perfectly valid (and still in LTS) version of Node is _not ideal._ If someone bumps a version of a dependency, they expect it to keep remaining as it previous was--even oftentimes in a major release. There are several drawbacks:

- Possibility of a developer unknowingly breaking his build
- Confusion as to _how_ to solve a broken build
- Chance of confusion in documenting `async/await` and developer is using Node < 8

# Alternatives

There aren't really any reasonable alternatives. A library must eventually be deprecated, and this seems like a fairly reasonable and minimally impactful way of eventually dropping support.

The impact of _not_ doing this is two-fold:

1. The _engineering cost_ of not being able to use a growing number of libraries that require Node 8 or greater
1. The _support cost_ of answering questions/concerns re: possibly confusing APIs, global installs, and general just many experiencing _more issues_ on Node 6

# Adoption strategy

This (could) be a breaking change _only_ if the developer was previously using a version of Gatsby prior to this change _and_ using Node 6. The changes of this are growing increasingly smaller.

The adoption strategy will be to not drop support until we deem that it makes sense, and at such time, we will bump the versions of our published packages targeting our (new) minimum supported version, Node 8.

We should communicate this possible breaking change as best as we can. Tweets and blog posts (and this RFC!) are helpful, but it's still something that can take people by surprise. The safest approach is to bump the major version of Gatsby, but even that can sometimes take people by surprise.

We've internally discussed something called `gatsby doctor` which can be run prior to starting a Gatsby project--this would ease the migration cost and give clear, concise upgrade instructions if Node 6 is detected.

# How we teach this

This proposal requires documentation to be updated. Our documentation can be considered a code style-guide and oftentimes developers directly copy and paste from our documentation. If we are documenting what we think is a best practice (e.g. Node 6 features like async/await) we are implicitly easing the migration cost of any developer who reads our documentation--which is hopefully all of them!

I strongly feel that tweaking the documentation, as well as minimum version requirements, will lead to developers having a _better_ experience using Gatsby, and Gatsby as a whole becomes easier to teach. It resolves the idiosyncrasy of _why_ do I need a global install and _when_ do I use `async` / `await` or `return new Promise`. This change should have a net positive impact on the ease-of-use of teaching Gatsby to new and experienced developers, alike.

# Unresolved questions

- Should the breaking change (when made) be a semver major release for _each_ package
  - It seems weird to bump to a major release of Gatsby (e.g. Gatsby v3.0.0) for a change that is _not necessarily breaking_; that being said, it is safer to do this since this is and could be a breaking change
  - Could we couple this with more meaningful changes that necessitate targeting Node 8?
- How do we best communicate this change?
  - @pieh mentioned perhaps an "annoying" warning suggesting to migrate to Node 8 if we detect Node 6
- How do we measure the number of developers we're impacting (e.g. % of Gatsby users impacted by this change)

[node6-lts]: https://nodejs.org/en/blog/release/v6.9.0/
[babel-preset-gatsby-package]: https://github.com/gatsbyjs/gatsby/tree/master/packages/babel-preset-gatsby-package
