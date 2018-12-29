import React from 'react';
import { graphql } from 'gatsby';

const Post = ({ data }) => {
  const { title, date, authors } = data.markdown.frontmatter;
  return (
    <>
      <h1>{title}</h1>
      <time>{date}</time>
      {authors.map(({ name, firstname, email, image }) => (
        <div key={email}>
          <img src={'/' + image.relativePath} alt={name} />
          {firstname} {name} ({email})
        </div>
      ))}
    </>
  );
};

export default Post;

export const query = graphql`
  query($id: ID) {
    markdown(filter: { id: { eq: $id } }) {
      frontmatter {
        title
        date
        authors {
          name
          firstname
          email
          image {
            relativePath
          }
        }
      }
    }
  }
`;
