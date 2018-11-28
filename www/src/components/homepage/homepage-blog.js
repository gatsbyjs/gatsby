import React from "react"
import PropTypes from "prop-types"

import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"

import HomepageSection from "./homepage-section"
import HomepageBlogPosts from "./homepage-blog-posts"

import { BlogIcon } from "../../assets/mobile-nav-icons"

const HomepageBlog = ({ posts }) => (
  <HomepageSection
    sectionName="Blog"
    sectionIcon={BlogIcon}
    title="The Gatsby blog"
    links={[
      {
        label: `View all posts`,
        to: `/blog/`,
        icon: ArrowForwardIcon,
      },
    ]}
  >
    <HomepageBlogPosts posts={posts} />
  </HomepageSection>
)

HomepageBlog.propTypes = {
  posts: PropTypes.array.isRequired,
}

export default HomepageBlog
