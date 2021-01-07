import React from 'react';
import './PostDetails.css'
import Img from 'gatsby-image'

const PostDetails = ({ item, dynamicPageItem }) => {
	const post = dynamicPageItem;

	const renderHTML = (html) => {
		return { __html: html };
	}
	return (

		<section className="post-details">
			<div className="container">
				<div className="post">
					<h1>{post.customFields.title}</h1>

					<Img fluid={post.customFields.imageLocalImg.childImageSharp.fluid} alt={post.customFields.title} />


					<hr />
					<div className="post-content" dangerouslySetInnerHTML={renderHTML(post.customFields.content)}></div>
				</div>
			</div>
		</section>
	);
}
export default PostDetails;
