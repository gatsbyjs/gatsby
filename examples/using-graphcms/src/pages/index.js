import React, { Component } from "react"
import StarRatingComponent from "react-star-rating-component"
import Link from "gatsby-link"

class IndexPage extends Component {
  render() {
    const artists = this.props.data.artists.edges
    const records = this.props.data.records.edges
    const reviews = this.props.data.reviews.edges

    console.log(`artists: `, artists)
    console.log(`records: `, records)
    console.log(`reviews: `, reviews)

    return (
      <div>
        <section className="artists">
          <p>
            Welcome to your new Gatsby example site using the GraphCMS source
            plugin.
          </p>
          <h2>Artists</h2>
          <nav>
            <ul
              style={{
                listStyle: `none`,
                margin: `0 0 2rem`,
              }}
            >
              {artists.map(({ node }, i) => (
                <li key={node.id + `nav`}>
                  <h4>
                    <Link to={`#${node.slug}`}>{node.name}</Link>
                  </h4>
                </li>
              ))}
            </ul>
          </nav>

          {artists.map(({ node }, i) => (
            <article key={node.id}>
              <h3 id={node.slug}>{node.name}</h3>
              <figure>
                <img
                  src={`https://media.graphcms.com/resize=w:512,h:512,a:top,fit:crop/${
                    node.picture.handle
                  }`}
                  alt={node.name}
                  title={node.name}
                  width="256"
                />
                <figcaption>
                  <small
                    style={{
                      fontFamily:
                        `-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif`,
                    }}
                  >
                    <a
                      href={`https://media.graphcms.com/${node.picture.handle}`}
                    >
                      full-size, hi-res photo: ({node.picture.width} W &times;{` `}
                      {node.picture.height} H)
                    </a>
                  </small>
                </figcaption>
              </figure>
              <ul
                style={{
                  listStyle: `none`,
                  margin: `0 0 3rem`,
                }}
              >
                {node.records.map((record, i) => (
                  <li key={record.id}>
                    <h4>
                      <p>
                        <Link to={`#${record.slug}`}>{record.title}</Link>
                      </p>
                    </h4>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
        <section className="records">
          <h2>Records</h2>
          {records.map(({ node }, i) => (
            <article
              id={node.slug}
              key={node.id}
              style={{
                marginBottom: `3rem`,
              }}
            >
              <figure>
                <img
                  src={`https://media.graphcms.com/resize=w:512,h:512,a:top,fit:crop/${
                    node.cover.handle
                  }`}
                  alt={node.title}
                  title={node.title}
                  width="256"
                />
                <figcaption>
                  <h3>{node.title}</h3>
                </figcaption>
                {node.artist ? (
                  <p>
                    <Link to={`#${node.artist.slug}`}>{node.artist.name}</Link>
                  </p>
                ) : (
                  <p>(Compilation album, various artists)</p>
                )}
                {node.tracks.map((track, i) => (
                  <h6 key={track.id}>
                    {track.title}{` `}
                    {new Date(1000 * track.aliasedLength)
                      .toISOString()
                      .substr(14, 5)}
                  </h6>
                ))}
              </figure>
              {node.reviews.map((review, i) => (
                <p key={review.id}>
                  <Link to={`#${review.slug}`}>{review.title}</Link>
                </p>
              ))}
            </article>
          ))}
        </section>
        <section className="reviews">
          <h2>Reviews</h2>
          {reviews.map(({ node }, i) => (
            <article
              key={node.id}
              style={{
                marginBottom: `3rem`,
              }}
            >
              <h3 id={node.slug}>{node.title}</h3>
              <p>
                for <Link to={`#${node.record.slug}`}>{node.record.title}</Link>{` `}
                by{` `}
                <Link to={`#${node.record.artist.slug}`}>
                  {node.record.artist.name}
                </Link>
              </p>
              {node.rating && (
                <div
                  className="star-wrapper"
                  style={{
                    fontSize: `1.5rem`,
                    marginBottom: `1rem`,
                  }}
                >
                  <StarRatingComponent
                    name="Rating"
                    className="rating"
                    starCount={5}
                    value={node.rating}
                    editing={false}
                  />
                </div>
              )}
              {node.review && (
                <div>
                  <p>{node.review}</p>
                </div>
              )}
              {node.comments.length ? (
                <div>
                  <h6>Comments</h6>
                  {node.comments.map((comment, i) => (
                    <p key={comment.body}>{comment.body}</p>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </section>
      </div>
    )
  }
}

export default IndexPage

export const pageQuery = graphql`
  query getAllArtistsRecordsReviews {
    artists: allArtists {
      edges {
        node {
          id
          name
          slug
          picture {
            id
            handle
            width
            height
          }
          records {
            id
            slug
            title
          }
        }
      }
    }
    records: allRecords {
      edges {
        node {
          id
          slug
          title
          artist {
            id
            slug
            name
          }
          tracks {
            id
            title
            aliasedLength
          }
          cover {
            handle
          }
          reviews {
            id
            slug
            title
          }
        }
      }
    }
    reviews: allReviews {
      edges {
        node {
          id
          slug
          createdAt
          record {
            slug
            title
            artist {
              slug
              name
            }
          }
          title
          review
          rating
          comments {
            body
          }
        }
      }
    }
  }
`
