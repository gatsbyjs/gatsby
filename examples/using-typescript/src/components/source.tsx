import React, { ReactElement } from "react"
import { graphql, useStaticQuery } from "gatsby"

const defaultProps = {
  linkText: `View the source`,
}

type SourceProps = { description: string } & typeof defaultProps

type UrlProps = {
  site: {
    siteMetadata: {
      exampleUrl: string
    }
  }
}

const Source = ({ description, linkText }: SourceProps): ReactElement => {
  const data = useStaticQuery<UrlProps>(graphql`
    query {
      site {
        siteMetadata {
          exampleUrl
        }
      }
    }
  `)

  return (
    <React.Fragment>
      <p>
        {description} <br />{" "}
        <a href={data.site.siteMetadata.exampleUrl}>{linkText}</a>
      </p>
    </React.Fragment>
  )
}

export default Source

Source.defaultProps = defaultProps
