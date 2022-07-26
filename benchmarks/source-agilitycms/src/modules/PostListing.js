import React from 'react';
import { Link, graphql, StaticQuery } from 'gatsby'
import './PostListing.css'

export default (props) => (
	<StaticQuery
		query={graphql`
        query PostListingModuleQuery {
            allAgilityPost(
              filter: {
                properties: { referenceName: { eq: "posts"}}
              }
            ) {
                totalCount
                nodes {
                    contentID
                    customFields {
						articleNumber
                        title
                    }
                    sitemapNode {
                        pagePath
                    }
                    properties {
                        referenceName
                    }
                }
            }
          }
        `}
		render={queryData => {
			return (
				<PostsListing posts={queryData.allAgilityPost.nodes} {...props} />
			);
		}}
	/>
)

const PostsListing = ({ item, posts }) => {
	return (
		<section className="posts-listing" >
			<div className="container">
				<h1>{item.customFields.title}</h1>
				<ul className="posts-listing-container">
					<Posts posts={posts} />
				</ul>
			</div>
		</section>
	)
}

const Posts = ({ posts }) => {
	return posts.map(post => {
		return <Post key={post.contentID} post={post} />;
	})
}

const Post = ({ post }) => {

	if (!post.sitemapNode) return;
	return (
		<li className="post" key={post.contentID}>
			<Link to={post.sitemapNode.pagePath}>
				{post.customFields.title}
			</Link>
		</li>
	)
}
