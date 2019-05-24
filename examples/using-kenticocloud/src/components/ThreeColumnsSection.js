import React from 'react'

import BlogPostThumbnail from './BlogPostThumbnail'

const threeColumnsSection = ({ elements }) => {
  const blogThumbnails = elements.columns.map(blogPost => (
    <BlogPostThumbnail
      {...blogPost}
      key={blogPost.system.id}
      detailValue={elements.detail_text.value}
    />
  ))

  return (
    <section id="three" className="main style1 special">
      <div className="grid-wrapper">
        <div className="col-12">
          <header className="major">
            <h2>{elements.primary_text.value}</h2>
          </header>
          <div
            dangerouslySetInnerHTML={{ __html: elements.secondary_text.value }}
          />
        </div>
        {blogThumbnails}
      </div>
    </section>
  )
}

export default threeColumnsSection
