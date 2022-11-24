import * as React from "react"
import { graphql, Link } from "gatsby"

function Index({ data }) {
  return (
    <div className="wrapper">
      <main>
        <h1>File System Route API</h1>
        <p>
          Please see the{` `}
          <a href="https://www.gatsbyjs.com/docs/file-system-route-api">
            documentation
          </a>
          {` `}
          to learn about all options. Below you'll see some example pages
          created.
        </p>
        <h2>Collection routes</h2>
        <p>
          List of products (both linked by name & SKU). Those were created via
          {` `}
          <em>collection</em> routes. When you link to a page that doesn't exist
          a <em>client-only</em> page acts like a fallback (the{` `}
          <em>[name].js</em> page). This example also shows that you can create
          multiple pages for the same view, in this case display product
          information both for the name and SKU.
        </p>
        <p>
          In order to link to create the correct links in this overview{` `}
          <em>gatsbyPath</em> was used.
        </p>
        <ul>
          {data.products.nodes.map(product => (
            <li key={product.meta.sku}>
              <Link to={product.nameSlug}>{product.name}</Link>
              {` `}
              <Link to={product.skuSlug}>(SKU)</Link>
            </li>
          ))}
          <li>
            <Link to={`/products/self-parking-attack-motorcycle`}>
              Self-parking attack motorcycle
            </Link>
            {` `}
            (entry doesn't exist)
          </li>
        </ul>
        <h3>Accessing parent data</h3>
        <p>
          The example below is a list of blog posts that were written in
          markdown and named in the format <em>YYYY-MM-DD-title.md</em>.
          Markdown nodes automatically add the <em>File</em> node as a parent
          thus you can access things like the <em>name</em>, e.g. to construct a
          route at <em>/blog/YYYY-MM-DD-title</em>.
        </p>
        <ul>
          {data.blog.nodes.map(post => (
            <li key={post.parent.name}>
              <Link to={`/blog/${post.parent.name}`}>
                {post.frontmatter.title}
              </Link>
            </li>
          ))}
        </ul>
        <h3>Nested collections</h3>
        <p>
          The example below does a <em>group</em> query on all parks and links
          to them. The paths are created as nested collections, e.g. to
          construct a route at <em>/parks/theme-park/park-one/</em>.
        </p>
        <div>
          {data.parks.group.map(field => {
            const groupName = field.fieldValue
            const inValidLinkPrefix =
              groupName === `Resort` ? `/parks/resort/` : `/parks/theme-park/`

            return (
              <React.Fragment>
                <h4>{groupName}</h4>
                <ul>
                  <li>
                    <Link to={`${inValidLinkPrefix}hogwarts`}>
                      Non-existing {groupName}
                    </Link>
                  </li>
                  {field.nodes.map(park => (
                    <li key={park.gatsbyPath}>
                      <Link to={park.gatsbyPath}>{park.name}</Link>
                    </li>
                  ))}
                </ul>
              </React.Fragment>
            )
          })}
        </div>
        <h2>Client-Only routes</h2>
        <p>
          As shortly mentioned for the "Collection routes" the{` `}
          <em>[name].js</em> file inside <em>src/pages/products</em> is already
          a client-only page. But you can do even more with those! See the
          example below:
        </p>
        <ul>
          <li>
            <Link to="/products/incite/offer/REHOBOAM">
              /products/[brand]/offer/[coupon]
            </Link>
          </li>
          <li>
            <Link to="/image/www.gatsbyjs.com/Gatsby-Logo.svg">
              /image/[...imageUrl]
            </Link>
          </li>
        </ul>
      </main>
    </div>
  )
}

export default Index

export const query = graphql`
  {
    products: allProduct {
      nodes {
        name
        nameSlug: gatsbyPath(filePath: "/products/{Product.name}")
        skuSlug: gatsbyPath(filePath: "/products/{Product.meta__sku}")
        meta {
          sku
        }
      }
    }
    blog: allMarkdownRemark {
      nodes {
        frontmatter {
          title
        }
        parent {
          ... on File {
            name
          }
        }
      }
    }
    parks: allPark {
      group(field: { meta: { location: { type: SELECT } } }) {
        fieldValue
        nodes {
          name
          gatsbyPath(filePath: "/parks/{park.meta__location__type}/{park.name}")
        }
      }
    }
  }
`
