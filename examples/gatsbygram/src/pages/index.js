import * as PropTypes from "prop-types"
import chunk from "lodash/chunk"
import React from "react"
import { graphql } from "gatsby"

import { rhythm, scale } from "../utils/typography"
import presets from "../utils/presets"
import Avatar from "../components/Avatar"
import Post from "../components/post"
import Layout from "../layouts"

// This would normally be in a Redux store or some other global data store.
if (typeof window !== `undefined`) {
  window.postsToShow = 12
}

function Index({data, location}) {
  const [showingMore, setShowingMore] = React.useState(postsToShow > 12);
  React.useEffect(() => {
    window.addEventListener(`scroll`, handleScroll)
    
    return () => {
      window.removeEventListener(`scroll`, handleScroll)
    window.postsToShow = this.state.postsToShow
    };
  }, []);

  static propTypes = {
    location: PropTypes.object.isRequired,
    data: PropTypes.shape({
      user: PropTypes.object,
      allPostsJson: PropTypes.object,
    }),
  }

  function update() {
    const distanceToBottom =
      document.documentElement.offsetHeight -
      (window.scrollY + window.innerHeight)
    if (showingMore && distanceToBottom < 100) {
      this.setState({ postsToShow: postsToShow + 12 })
    }
    ticking = false
  }

  const handleScroll = () => {
    if (!ticking) {
      ticking = true
      requestAnimationFrame(() => update())
    }
  };

  let { allPostsJson, user } = data

const posts = allPostsJson.edges.map(e => e.node)

user = user.edges[0].node

return (
<Layout location={location}>
<div
css={{
display: `flex`,
alignItems: `stretch`,
flexShrink: 0,
flexDirection: `column`,
}}
>
{/* user profile */}
<div
data-testid="user-avatar"
css={{
paddingBottom: rhythm(2),
paddingTop: rhythm(1.5),
paddingLeft: rhythm(1.5),
paddingRight: rhythm(1.5),
display: `flex`,
flexDirection: `row`,
alignItems: `stretch`,
flexWrap: `wrap`,
}}
>
<div
css={{
marginRight: rhythm(1),
flexGrow: 1,
flexShrink: 0,
}}
>
<Avatar user={user} />
</div>
<div
css={{
flexGrow: 2,
flexShrink: 0,
textAlign: `center`,
[`@media (min-width: 600px)`]: {
paddingTop: rhythm(1 / 2),
textAlign: `left`,
},
}}
>
<h3
data-testid="username"
css={{
fontWeight: `normal`,
}}
>
{user.username}
</h3>
<p data-testid="user-meta">
<strong>{posts.length}</strong> posts
<strong css={{ marginLeft: rhythm(1) }}>192k</strong> followers
</p>
</div>
</div>
{/* posts */}
{chunk(posts.slice(0, this.state.postsToShow), 3).map((chunk, i) => (
<div
key={`chunk-${i}`}
css={{
display: `flex`,
alignItems: `stretch`,
flexShrink: 0,
flexDirection: `row`,
marginBottom: rhythm(1 / 8),
[presets.Tablet]: {
marginBottom: rhythm(1),
},
}}
>
{chunk.map(node => (
<Post
key={node.id}
post={node}
location={location}
onClick={post => this.setState({ activePost: post })}
/>
))}
</div>
))}
{!showingMore && (
<a
data-testid="load-more"
css={{
...scale(-0.5),
border: `1px solid blue`,
boxShadow: 0,
background: `none`,
color: `blue`,
cursor: `pointer`,
margin: `0 auto`,
padding: rhythm(1 / 2),
width: `calc(100vw - ${rhythm(1)})`,
marginLeft: rhythm(0.5),
marginRight: rhythm(0.5),
marginBottom: rhythm(0.5),
marginTop: rhythm(0.5),
[presets.Tablet]: {
borderRadius: `100%`,
margin: `0 auto`,
marginBottom: rhythm(1.5),
marginTop: rhythm(1.5),
padding: rhythm(1),
height: rhythm(5),
width: rhythm(5),
lineHeight: rhythm(3),
textAlign: `center`,
},
}}
onClick={() => {
setShowingMore({
postsToShow: this.state.postsToShow + 12,
showingMore: true,
})
}}
>
Load More
</a>
)}
</div>
</Layout>
);
}

export default Index

export const pageQuery = graphql`
  query {
    user: allPostsJson(limit: 1) {
      edges {
        node {
          username
          ...Avatar_user
        }
      }
    }
    allPostsJson {
      edges {
        node {
          id
          text
          weeksAgo: time(difference: "weeks")
          ...Post_details
          ...PostDetail_details
        }
      }
    }
  }
`
