- Start Date: 2018-04-06
- RFC PR: (leave this empty)
- Gatsby Issue: (leave this empty)

# Summary

Gatsby v1 includes a special "layout" component that can wrap page components.
This RFC proposes removing it and encouraging people to use normal React
component composition.

# Basic example

Currently people might have a single or multiple global layout components e.g.

```jsx
import React from 'react'

export default ({ children }) => (
  <div>
    <div>Global navigation</div>
    {children()}
  </div>
)
```

Now people would import the same component into each page component e.g.

```jsx
import React from 'react'
import Layout from '../components/layout'

export default ({ props }) => (
  <Layout>
    <div>Hello world</div>
  </Layout>
)
```

# Motivation

There are several motivations for eliminating the special layout component:

* It's frequently confusing to people used to React as it breaks the normal component composition model
* It has a number of limitations e.g. we don't support multiple levels of layouts e.g. a global header and footer and then on some pages, a sidebar menu. Currently you have to stuff both into a single layout component with a lot of
conditional logic keyed to pathnames.
* There's no easy way for a page component to communicate with a layout component
* It significantly complicates Gatsby's codebase and client runtime
* It reduces the effectiveness of our new code splitting setup in Gatsby v2 and prevents some potential code splitting/loading improvements
* It makes Gatsby page transitions very non-standard compared to normal React and relatively
difficult to do well

So it short, it complicates learning and using Gatsby as well as our codebase
for no benefit over using normal React components. Many people report that they
didn't realize the special layout components existed so they followed the
proposed pattern of creating a layout component which they imported into pages.

# Detailed design

V1 layout components are normal components in all respect *except* they, like
page components, can export a query. People sometimes use that to query data
like the site title, etc. for setting site metadata with react-helmet.

To replace this, I propose adding support to Gatsby for "static queries" so
that layout components (and any other component) can query for data.

During the planning stages of Gatsby, I considered adding something similar to
this so that people could query data into any component. Ultimately I decided
against this as a very common use case is "page template" components e.g.
a component for blog posts. The query for this page component would need to
accept variables e.g. the id of the markdown file that's being shown on that
page.

This was also convenient as it allowed us to easily split data from code so
we could load the code for the blog post page separtely from the data for pages.

When we added the layout component, we reused the same graphql syntax so they could
query for data.

When layout components become normal components, they'll now need a way to query
for data.

You'd write queries like the following:

```jsx
import React from 'react'
import Helmet from 'react-helmet'
import { StaticQuery } from 'gatsby'

export default class ExampleComponent extends React.Component {
  render () {
    <StaticQuery
      query={graphql`
        {
           site {
             siteMetadata {
               title
             }
           }
       }
      `}
      render={staticData => (
        <div>
          <Helmet title={staticData.site.siteMetadata.title} />
          <h1>Welcome to {staticData.site.siteMetadata.title}!</h1>
          <p>We hope your stay is pleasant.</p>
        </div>
      )}
    />
  }
}
```

Just like with our current GraphQL implementation, we'd extract the graphql queries and run them for you. You'd be able to use fragments, etc. The only difference is you can't pass arguments to the query (hence the name, staticQuery :-)).

During development, we'd hot-reload changes to the query & underlying data.

Then in production, we'd do a cool optimization. We'd have a babel plugin which compiles the above into something that looks like:

```jsx
import React from 'react'
import Helmet from 'react-helmet'
import { StaticData } from 'gatsby'
import staticData12513 from './staticData12513'

export default class ExampleComponent extends React.Component {
  render () {
    <StaticQuery
      data={staticData12513}
      render={staticData => (
        <div>
          <Helmet title={staticData.site.siteMetadata.title} />
          <h1>Welcome to {staticData.site.siteMetadata.title}!</h1>
          <p>We hope your stay is pleasant.</p>
        </div>
      )}
    />
  }
}
```

There's now a little packet of JSON attached to the component! Also, the static file name would be a hash of the query so on the off-chance you reuse a query, webpack 4 would split out the query result module into a new chunk that's shared between components.

It'll also enable new types of components that you can now attach not just markup, styles, and interactivity, but also bits of data. E.g. imagine a SEO component that queries standard data + you can pass in page specific data as well. Or a team member avatar component that has queried the name + image of the 10 team members so you can drop in the component anywhere it's needed. Or a product preview that you can manually add throughout the site as needed. Or translation strings.

# Drawbacks

* Requires implementing the new StaticQuery feature — which isn't trivial — and means
 more code to maintain.
* It's a breaking change so we'd need to educate existing users of layouts who'll need to migrate v1 sites.
 This could involve inventing new patterns to handle more comples cases like
 i18n

# Alternatives

Keep things as they are. It's not a terrible alternative. Layouts as they exist
are mediocre but get the job done more-or-less.

# Adoption strategy

* Add how to update to the v2 migration guide
* Update any relevant docs/tutorials

Fortunately it's very easy to migrate to this new setup. Most people
can just leave their existing layout component as is (other than making
`children` a normal prop instead of a function) and import it into their
pages and make it the top-most component there.

# How we teach this

For layouts, there's nothing to teach as it's just normal React now. Probably
will want some guides around more sophesticated patterns e.g. i18n.

For `<StaticQuery>`, we'll add documentation to the tutorial + our GraphQL
concepts page.
