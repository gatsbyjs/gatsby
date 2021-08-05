import * as React from "react"
import { Link } from "gatsby"
import { Layout } from "../../layout/default"
import {
  postsListCss,
  postListItemCss,
  postTeaserCss,
  postTeaserTitleCss,
  postTeaserDescriptionCss,
  postTeaserLinkCss,
} from "../index.module.css"

export default function ProductListing({ serverData }) {
  return (
    <Layout>
      <ul className={postsListCss}>
        {serverData.products.map(node => {
          return (
            <li className={postListItemCss}>
              <div className={postTeaserCss}>
                <h2 className={postTeaserTitleCss}>
                  <Link
                    to={`/products/${node.slug}/`}
                    className={postTeaserLinkCss}
                  >
                    {node.name}
                  </Link>
                </h2>
                <p className={postTeaserDescriptionCss}>
                  <Link
                    to={`/products/${node.slug}/`}
                    className={postTeaserLinkCss}
                  >
                    {node.description}
                  </Link>
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </Layout>
  )
}

export async function getServerData() {
  const { default: fetch } = require("node-fetch")

  try {
    const res = await fetch(`https://graphql.us.fauna.com/graphql`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + "fnAEOEwsPmAAQPSMCPst8le3PKMTqM-MT3WAihkC",
      },
      body: JSON.stringify({
        query: `
query allProducts {
  allProducts {
    data {
      name
      slug
      description
    }
  }
}

    `,
      }),
    })

    const { data, errors } = await res.json()
    if (errors) {
      return {
        products: [],
      }
    }

    if (data) {
      return {
        products: data.allProducts.data,
      }
    }
  } catch (err) {
    throw new Error(`error: ${err.message}`)
  }
}
