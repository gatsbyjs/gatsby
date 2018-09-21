# Using Javascript Transforms

### An exploration of the javascript ecosystem in Gatsby

#### Demo at [https://using-javascript-transforms.netlify.com](https://using-javascript-transforms.netlify.com)

The example mixes javascript and remark, uses scss and bulma.io, has use case
examples for graphql in layouts, and some "manual" page creation with the help
of the jsFrontmatter transformer aka gatsby-transformer-static-exports.

There are two "root" data types that we use. There are routes that are based in
markdown such as /a-first-post/ found at
`src/articles/2017-01-22-a-first-post/index.md`. Of greater interest are routes
based on JavaScript. This is not to be confused with the JavaScript react
components in `src/templates/*` or even `src/components/*`.
In this example, we use JavaScript for some articles. Check out
`src/articles/2017-03-09-choropleth-on-d3v4/index.js`. Typically most examples
will use a JavaScript root data type for the homepage.

Most sources including our markdown based routes will be processed through a
template (`src/templates/*`). In the template, we can include dumb components to
compose our structure in a DRY manner. The JavaScript routes are used directly
which means you will need to include some of the route specific structure on
every JavaScript page. This can be painful, but it can be managed with good use
of higher order components (see `src/components/BlogPostChrome` and `src/components/Layouts`)
and graphql fragments. For further discussion and relevant prototypes see
[#1866](https://github.com/gatsbyjs/gatsby/issues/1866).

The last thing of note is this example's `gatsby-node.js`. Gatsby by default
will createPage on any JavaScript file within `src/pages`. This example does not
use that folder to opt for more control in how pages are created.
