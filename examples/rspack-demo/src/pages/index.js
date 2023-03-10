import * as React from "react"
import { graphql } from "gatsby"
import { Nav } from "../components/nav"

export default function Home({ data }) {
  const [t, setT] = React.useState(false)

  return (
    <div>
      {data.site.siteMetadata.title} {t ? "true" : "false"}{" "}
      <button onClick={() => setT(a => !a)}>toggle</button>
      <Nav />
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <p>
        zzzsshellod ffsacsszcxxdfsaxcxsazfcasfasfsafasfasahzz watzzdszzazvvzzz
      </p>
    </div>
  )
}

export function Head({ data }) {
  return (
    <>
      <title>{data.site.siteMetadata.title} - works</title>
    </>
  )
}

export const query = graphql`
  {
    site {
      siteMetadata {
        title
        addition: title
      }
    }
  }
`
