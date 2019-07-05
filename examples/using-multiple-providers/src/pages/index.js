import React, { Fragment } from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import { gql } from "apollo-boost"
import { Query } from "react-apollo"
import injectSheet from "react-jss"

const styles = {
  listItem: {
    cursor: `pointer`,
    fontSize: `1.5em`,
    color: `blue`,
    textDecoration: `underline`,
  },
}

const Counter = styled.p`
  color: palevioletred;
`

const GET_POSTS = gql`
  query {
    blogPosts {
      id
      title
    }
  }
`

const GET_POST = gql`
  query($id: ID) {
    blogPost(where: { id: $id }) {
      title
      post
    }
  }
`

class IndexPage extends React.Component {
  render() {
    return (
      <div>
        <h1>Multiple provider-example</h1>
        <h2>Redux component:</h2>
        <Counter>
          ReduxState:
          <pre>{JSON.stringify(this.props.reduxState)}</pre>
        </Counter>
        <h2>Apollo</h2>
        <h3>List (click on something)</h3>
        <Query query={GET_POSTS}>
          {({ loading, error, data }) => {
            if (loading) return <div>Loading...</div>
            if (error) return <div>Error :(</div>

            return (
              <ul>
                {data.blogPosts.map(data => {
                  const { id, title } = data
                  return (
                    <li
                      className={this.props.classes.listItem}
                      onClick={() => {
                        this.props.setBlogPost(data)
                      }}
                      key={id}
                    >
                      {title}
                    </li>
                  )
                })}
              </ul>
            )
          }}
        </Query>
        {this.props.reduxState.id && (
          <Query query={GET_POST} variables={{ id: this.props.reduxState.id }}>
            {({ loading, error, data }) => {
              if (loading) return <div>Loading...</div>
              if (error) return <div>Error :(</div>

              return (
                <Fragment>
                  <h3>Details {data.blogPost.title}</h3>
                  <div>{data.blogPost.post}</div>` `
                </Fragment>
              )
            }}
          </Query>
        )}
      </div>
    )
  }
}

const mapStateToProps = state => {
  return { reduxState: state }
}

const mapDispatchToProps = dispatch => {
  return {
    setBlogPost: blogPost =>
      dispatch({ type: `SET_BLOG_POST`, payload: blogPost }),
  }
}

const ReduxConnectedIndexPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(IndexPage)

export default injectSheet(styles)(ReduxConnectedIndexPage)
