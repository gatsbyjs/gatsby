import * as React from "react"
import { Layout } from "../../layout/default"
import { containerCss } from "../blog/post.module.css"

export default function BlogPostTemplate({ serverData }) {
  if (!serverData) {
    return <div>No server data got received</div>
  }

  return (
    <Layout>
      <article
        className={containerCss}
        itemScope
        itemType="http://schema.org/Article"
      >
        <header>
          <h1 itemProp="headline">{serverData.name}</h1>
          <p></p>
        </header>
        <section
          dangerouslySetInnerHTML={{ __html: serverData.description }}
          itemProp="articleBody"
        />
        <hr />
      </article>
    </Layout>
  )
}

export async function getServerData({ params }) {
  const { default: fetch } = require("node-fetch")

  try {
    const res = await fetch(`https://graphql.us.fauna.com/graphql`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + "fnAEOEwsPmAAQPSMCPst8le3PKMTqM-MT3WAihkC",
      },
      body: JSON.stringify({
        query: `
query findProduct($slug: String!) {
  findProductBySlug(slug: $slug) {
      name
      description
  }
}

    `,
        variables: { slug: params.slug },
      }),
    })

    const { data, errors } = await res.json()
    if (errors) {
      return {
        name: "UNKNOWN",
        description: `we couldn't find the product ${params.slug}`,
      }
    }

    if (data) {
      return data.findProductBySlug
    }
  } catch (err) {
    throw new Error(`error: ${err.message}`)
  }
}
