- Start Date: 2019-02-07)
- RFC PR:
- Gatsby Issue:

# Summary

Reorganize the contributor documentation to aid in Gatsby core and docs development.

# Motivation

The Gatsby.js docs, while wonderful, are light on coding instructions for contributors. With dedicated sections in the Contributing docs, it will be easier to learn how to clone the repository, where to find certain things like docs or plugins, how to run tests, and insider infrastructure knowledge required to submit a successful pull request on the first try.

A lot of this information already lives on the "How to Contribute" page, but it's buried. It would help discoverability if this information lived on separate pages.

# Detailed design

I propose that we add some pages to the existing contributor documentation and move some content around. Here is an IA diagram that (briefly) reflects the current structure and what I think we should add (open for discussion, of course):

Docs

- Guides
- Ecosystem
- API Reference
- Releases & Migration
- Conceptual Guide
- Behind the Scenes
- Advanced Tutorials

Contributing

- Community
  - Why Contribute to Gatsby?
  - Pair Programming Sessions
  - Free Swag for Contributors
  - Where to Participate in the Community
  - How to Run a Gatsby Workshop
  - How to Pitch Gatsby
- Code of Conduct
- Gatsby Style Guide
- How to Contribute
  - How to File an Issue
  - How to Label an Issue
  - Triaging GitHub Issues
  - Docs Contributions
  - Blog & Website Contributions
  - Code Contributions
  - Setting up your Local Dev Environment
  - Community Contributions
    - Submit to Site Showcase
    - Submit to Creator Showcase
    - Submit to Starter Library
    - Submit to Plugin Library
- RFC Process
- Gatsby's Governance Model\*

# Drawbacks

Why should we _not_ do this? Please consider:

- we will need some redirects so people who have bookmarked things don't get 404s
- there will be a user adjustment required to learn the new locations of things

# Alternatives

Adding more top-level docs instead of reorganizing them. It's a pretty large section though, and it seems like it could be reorganized.

# Adoption strategy

If we implement this, I will move some pages and content around and fill in missing gaps. There may be additional subpages added for more detailed technical instructions.

# Unresolved questions

How do people feel about this idea?
