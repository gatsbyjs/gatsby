When architecting a professional Gatsby website, you need to choose a number of systems: build & hosting provider, headless CMS, component library, e-commerce, analytics, auth, search, forms, and so on.

In addition, your team probably has a number of workflows involving multiple systems. Setting up content preview involves your CMS, Gatsby, and your hosting provider. Creating CMS-driven landing pages involves your CMS, your React components, and Gatsby.

## Architecture = Systems + Workflows

![Systems & Workflows](../../images/systems-workflows.png)

The interaction of systems and workflows is an architecture. Typically, a team lead, or tech lead on a Gatsby project is responsible for the architecture.

## Choosing Systems, Optimizing Workflows

Systems and workflows in your architecture can be complex. We've written blog posts and docs with best practices for many of them.

- [Choosing Your CMS](/docs/conceptual/choosing-a-cms)

- [Gatsby for E-commerce](/docs/conceptual/gatsby-for-ecommerce)

- [How CMS Preview Fits Into Your Content Workflows](/blog/how-cms-preview-fits-into-your-content-workflows/) (blog post)

- CMS-driven landing pages: [A Content Marketer's Paradise](/blog/content-paradise/) (blog post)

- Custom fields and product variants: [Product Experience Management with Gatsby](/blog/product-experience-management-with-gatsby-delivering-a-rich-e-commerce-experience) (blog post)

- [Choosing Analytics Systems](/blog/conceptual/choosing-analytics-systems) (doc)

- [Improving Your Site Performance](/docs/how-to/performance/improving-site-performance) (doc)

- [Common Website Features](/docs/how-to/adding-common-features) (doc section)

## Making Architecture Decisions Incrementally

Architectures don't need to be finalized before the project starts. Sometimes, teams can build projects faster by parallelizing development and architecture decisions.

For example, [one team](/blog/jaxxon-gatsby-shopify-faster-growth) had a senior developer work out the full architecture while the junior developer built components. [Another team](/blog/how-elevar-used-storybook-with-gatsby-to-support-a-modular-design-process) started by building components as they figured out their CMS and hosting providers.

![Project Architecture](../../images/project-architecture.png)
