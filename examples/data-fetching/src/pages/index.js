import React, { useState, useEffect } from "react"
import { graphql, useStaticQuery } from "gatsby"
import Layout from "../components/layout"

const IndexPage = () => {
  // ----------------------
  // BUILD TIME DATA FETCHING
  // ----------------------
  const gatsbyRepoData = useStaticQuery(graphql`
    query {
      github {
        repository(name: "gatsby", owner: "gatsbyjs") {
          id
          nameWithOwner
          url
        }
      }
    }
  `)

  // ----------------------
  // RUNTIME DATA FETCHING
  // ----------------------
  const [starsCount, setStarsCount] = useState(0)
  useEffect(() => {
    const fetchData = async () => {
      // get data from GitHub api
      const result = await fetch(
        `https://api.github.com/repos/gatsbyjs/gatsby`,
        {
          headers: {
            Authorization: `Bearer ${process.env.GATSBY_GITHUB_TOKEN}`,
          },
        }
      )
      // parse JSON from request
      const resultData = await result.json()
      // set data for the number of stars
      setStarsCount(resultData.stargazers_count)
    }
    fetchData()
  }, [])

  return (
    <Layout>
      <h1>Examples</h1>
      <h2>Build Time</h2>
      <p>
        This data from GitHub is fetched using gatsby-source-graphql file at
        build time. This data will only update when the site is rebuilt by
        Gatsby, but removes the need and latency to hit the GitHub API when the
        site loads.
      </p>
      <p>
        Gatsby repo:{` `}
        <a href="gatsbyRepoData.github.repository.nameWithOwner.url">
          {gatsbyRepoData.github.repository.nameWithOwner}
        </a>
      </p>
      <h2>Runtime</h2>
      <p>
        This data from GitHub is fetched using the Fetch API at runtime. This
        data will update every time you refresh this page.{` `}
      </p>
      <p>Star count for the Gatsby repo: {starsCount}</p>
    </Layout>
  )
}

export default IndexPage
