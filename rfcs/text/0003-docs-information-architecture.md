- Start Date: 2018-04-25
- RFC PR:
- Gatsby Issue:

# Summary

A proposal to add a second (maybe even third) level of navigation to the docs on gatsbyjs.org and to add new top-level categories.

# Motivation

Through many user research interviews, I've heard that it's difficult for people to find what they are looking for in the docs. They have mentioned many instances where the information they are looking for does not exist, it exists but they couldn't find it, or it exists and they could find it in multiple places (not in one single place). This is likely because the docs have outgrown their current categories.
This design also proposes a possibly heuristic for determining what we can reasonably commit to maintaining as part of Gatsby core docs, and what might be too far outside the scope of core docs (either because the topics don't fit or because they are not a priority, given our limited time and resources). includes a list of what will _not_ be included in Gatsby core docs.

# Detailed design

MVP

- [x] add a second (possibly third) level to docs navigation in the sidebar in accordion style menu, e.g. how do we make the sidebar not too long or overwhelming?
      Expand top (and potentially second-level) navigation items that do not belong to the current section on user interaction (see e.g. https://reactjs.org/, https://stripe.com/docs/stripe-js for second-level)
- [x] Selected state for sidebar items
  - Maybe the current “bullet point” doesn’t work very well for indented navigation items
  - The current purple doesn’t stand out enough
  - The use of the “bold” Futura may cause the navigation item text to take one more line than the default “normal” Futura state, causing the navigation items below to change their position
  - Digital Ocean does cool selected state and hover state stuff: https://developers.digitalocean.com/documentation/v2/#authentication
- [x] create new categories of docs. When clicked, the only thing that happens is that sub-items become visible and the active page remains the same as it was before clicking the category name until a sub-item is clicked. So essentially, clicking on a sub-item is the only way to see a new active page.
- [x] create stub articles for the ones we don’t have yet
- [x] mobile menu that you can access w/o scrolling to bottom of screen (see Flo’s notes below on Reactjs.com’s mobile version vs. Stripe’s docs which ignore small screens)
  - Currently https://www.gatsbyjs.org/docs/ is the only way on Mobile to access the Desktop sidebar content
  - https://reactjs.org/ is an excellent example of a Mobile navigation for our sidebar content, but the button position conflicts with our current mobile navigation
  - Noteworthy: the equally excellent https://stripe.com/docs/quickstart and https://stripe.com/docs/api completely ignore smaller screens
- [x] Find a place for starter showcase in top nav
- [ ] Sidebar toggle all open / all closed button

Phase 2:

- [ ] write instructions for contributors to fill out stub articles
- [ ] choose gold standard examples of docs for contributors to imitate (different gold standard for each type of doc)
- [ ] publish templates for each category of docs to facilitate contributions and contract work
- [ ] rename titles of docs to make them more concise and add redirects
- [ ] Every month (or some amount of time), do a docs sprint for a new section of the docs
- [ ] Add issue submission form at bottom of each doc
- [ ] Popup/slideout form that asks people: What are you looking for on gatsbyjs.org today? with a rating/form to ask if they found what they're looking for.
- [ ] Way to copy and paste code easily Ref. gatsbyjs/gatsby#5030

Phase 3:

- [ ] API on top level nav
- [ ] versions of the docs
- [ ] Way to test APIs. Ask devs for their favorite ones.
- [ ] automatically pull in doc prereqs at top of each page (see https://www.cockroachlabs.com/docs/stable/transactions.html as a great example of how to design this. Not sure how to code it)
- [ ] doc accessibility/design options (changing font type and size or screen and font colors, what about language?), toggle sidebar to disappear, reappear
- [ ] searchable API reference
- [ ] track one ideal "paths" through the docs to see if idea is worth expanding
- [ ] a breadcrumb trail (like Amazon does)
- [ ] suggesting "next steps" at the bottom of docs
- [ ] vet feasibility/desirability of new project that focuses on enhancing our search results (perhaps pulling in Google search, showing previews, etc)

Here is a possible restructure of the current docs information architecture (with the inclusion of many docs we still need to write):

Introduction to the docs (use Django’s docs landing page), perhaps some featured docs\*

Quick start/download/installing

Basic hardware and software requirements\*

- Backwards compatibility\*
- Upgrading\*
- Uninstall\*

Versions/Changelog/Release Notes

- v0\*
- v1\*
- v2\*

Gatsby core concepts/How Gatsby works (Gatsby tutorials will frequently refer to this section)

- The Gatsby core philosophy\*
- Basic structure of a Gatsby site (includes config.js)\*
- How Gatsby works with GraphQL (includes Node interface and how GraphQL works)\*
- How Gatsby works with React (API specification)\*
- How Gatsby works with Redux (bound action creators)\*
- How Gatsby works with plugins
- PRPL pattern
- Lifecycle APIs

Tutorials

- Build and deploy a site
  - Introduction
  - 0. Setting up the development environment
  - 1. Creating pages
  - 2. Adding styles
  - 3. Using layouts to build reusable site sections
  - 4. Deploying a site live online (debating whether to keep this inside part 1, where it currently is)
- Build a blog with GraphQL
  - 5. Querying data for your blog
  - 6. Source plugins and rendering queried data
  - 7. Transformer plugins and transforming data into site content
  - 8. Programmatically creating pages from data
- Adding images to your site (or "Adding svg or blur-up effect to images)\*
- Creating your own plugin (tutorial for creating a plugin we've already vetted as easy to create)\*
- E-commerce\*
- User authentication\*

Commands (Gatsby CLI)

Reference docs

- API references
  - API specification
  - Gatsby Browser APIs
  - Gatsby Node APIs
  - Gatsby SSR APIs
- Guides/Fundamentals
  - Setting up dev environment
    - Gatsby on Windows
    - Gatsby on Macs
  - Customizing site structure
    - html.js
    - webpack config
    - Environment variables (right place for this??)
    - ENV
  - Adding content
    - Images
    - Markdown pages
    - adding tags and categories to blogposts
    - adding a 404 page
  - Querying for data with GraphQL
  - Creating a styling system
    - Glamor
    - Styled components
  - Debugging
    - Debugging HTML builds
    - Debugging Replace Renderer API
  - Adding dynamic functionality
    - Building apps with Gatsby
    - E-commerce
    - authentication
    - dynamically rendered navigation\*
  - Deploying
  - Hosting
    - Path Prefix
  - Performance
    - Search Engine Optimization (SEO)
    - Browser
    - Setting up proper HTTP caching

Plugins

- Plugin Authoring Guides
  - How Gatsby works with plugins
  - Plugin library
  - When to create your own plugin?\*
  - Source plugins
  - Transformer plugins
  - All other plugins
  - How to get your plugin to show up in the Plugin Library\*

Community

- Code of Conduct
- Where to participate in the community

Contributing

- Welcome to Gatsby's open source community!
- Code of Conduct
- How to Contribute
  - List of ways to contribute\*
  - How to file an issue
  - How to submit a PR\*
  - RFC process\*
- Style Guides
  - Written documents\*
  - Visual design\*
- Templates & Resources\*
  - Workshops
  - PowerPoint presentations
  - Blogpost
  - Tutorial
  - Plugin READme
  - Site READme

# Drawbacks

Why should we _not_ do this? Please consider:

- Redesigning the side bar could take a lot of work.

# Alternatives

I'm not aware of any other designs we've considered. The potential benefits of doing this outweighs the negatives, imo. Especially because docs are only going to keep growing. The current hierarchy doesn't allow for much more growth.

# Adoption strategy

If the design is intuitive, it will be easier to adopt than the current design. See # How we teach this below, which includes blogging about it and then creating a landing page for the docs that introduces the IA.

# How we teach this

If it's really good information architecture, it won't need to be taught ;). If we find that we have to explain it to people, we would redesign it. We could write an initial blogpost with a tour of the docs structure for those who want to understand the change and see an overview, and then this overview could be included in an intro to the docs.

# Unresolved questions

None.

# Resolved questions

- How many levels of nav? We'll try 3 levels of nav and adapt if that doesn't work.
- What is the code complexity of changing the URL structure of pages? We'll need to make a list of old urls and new urls, then the site can be configured to send people from old to new. e.g.
  /docs/add-404-page/ changes to /docs/basic-tasks/adding-content/add-404-page
- Could these plans break links people have to current docs? In many cases yes, but adding redirects is easy.
- Should we include integration tutorials and guides (such as Gatsby + Netlify, Gatsby + Contentful)? Yes, we'll encourage these contributions and encourage people to submit edits / report issues just like with any other doc and see how it goes.
- Where did Awesome Gatsby and Starter list go? Those will be their own separate landing pages accessible from main .org nav very soon!
