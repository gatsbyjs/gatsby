import React from "react"
import PropTypes from "prop-types"
import { Row, Page, Column, BlockLink, P2, P4 } from "./styled"
import styled from "styled-components"
import theme from "./styled/theme"
import striptags from 'striptags'

const BlogPreviewImg = styled.img`width: 100%;`

const PostPreview = ({ article, id }) => {
  console.log(`article is`, article)
  return (
    <Column outline fluid xs={4} sm={4} md={4} lg={4}>
      <BlockLink
        to={`/post/${id}`}
        paddingHorizontal={2}
        paddingTop={2}
        paddingBottom={5}
        block
      >
        <BlogPreviewImg
          src={`http://via.placeholder.com/416x245`}
          alt="placeholder"
        />
        <P2
          color={theme.color.han}
          dangerouslySetInnerHTML={{ __html: article.node.title }}
        />
        <P4
          color={theme.color.han}
          dangerouslySetInnerHTML={{ __html: striptags(article.node.excerpt) }}
        />
        <P4 color={theme.color.link}>Read More</P4>
      </BlockLink>
    </Column>
  )
}

PostPreview.propType = {
  article: PropTypes.object.isRequired,
  id: PropTypes.string,
}

export default PostPreview
