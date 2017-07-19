import React, { Component } from "react"
import PropTypes from "prop-types"
import { H3, Row, Page, Column } from "./styled"
import PostPreview from "./PostPreview"

class PostsListSearchable extends Component {
  // Put the props in the state
  constructor(props) {
    super(props)
    this.state = {
      data: this.props.propsData.allWordpressPost.edges,
    }
  }

  handleFilter = id => {
    this.setState({
      data: this.props.propsData.allWordpressPost.edges.filter(p =>
        p.node.categories.includes(id.replace(`CATEGORY_`, ``))
      ),
    })
  }

  resetFilter = () =>
    this.setState({ data: this.props.propsData.allWordpressPost.edges })

  render() {
    return (
      <Page>
        <H3>The latests blog posts</H3>
        <Row gutter gutterWhite>
          <Column fluid xs={1} sm={10} md={10} lg={10}>
            <span>Filter by category: </span>
            <span onClick={() => this.resetFilter()}>All - </span>
            {this.props.propsData.allWordpressCategory.edges.map((cat, i) =>
              <span
                key={cat.node.id}
                onClick={() => this.handleFilter(cat.node.id)}
              >
                {i !== 0 ? ` - ` : ``}
                {cat.node.name}
              </span>
            )}
            <span onClick={() => this.resetFilter()}> - Reset filter</span>
          </Column>
        </Row>
        <Row gutter>
          {this.state.data.map(article =>
            <PostPreview
              key={article.node.slug}
              id={article.node.slug}
              article={article}
            />
          )}
        </Row>
        <Row gutter height={19} />
      </Page>
    )
  }
}

PostsListSearchable.propTypes = {
  propsData: PropTypes.object.isRequired,
}

export default PostsListSearchable
