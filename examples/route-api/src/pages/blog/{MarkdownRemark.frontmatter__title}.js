import * as React from "react"
import { graphql, Link } from "gatsby"

function BlogPost({ data }) {
  const post = data.markdownRemark.frontmatter

  return (
    <div className="wrapper">
      <header>
        <Link to="/">Go back to "Home"</Link>
      </header>
      <main>
        <h1>{post.title}</h1>
        <em>{post.date}</em> - {post.topic}
        <div dangerouslySetInnerHTML={{ __html: data.markdownRemark.html }} />
      </main>
    </div>
  )
}

export default BlogPost

export const query = graphql`
  query($id: String!) {
    markdownRemark(id: { eq: $id }) {
      frontmatter {
        date(formatString: "MM-DD-YYYY")
        topic
        title
        priority
      }
      html
    }
  }
`

export async function config(){
  const { data } = graphql`
  {
    oldPosts: allMarkdownRemark(filter: {frontmatter: {date: {lt: "2020-10-02"}}}) {
      nodes {
        frontmatter {
          date
          title
          topic
          priority
        }
      }
    }
  }
  
`

return ({params})=>{
    console.log(`Here are the params: ${JSON.stringify(params)}`);
    return {
      defer: params.frontmatter__priority === "high"
    }
  }
}