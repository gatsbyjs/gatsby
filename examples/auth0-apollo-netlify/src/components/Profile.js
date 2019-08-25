import React from 'react';
import { useAuth } from 'react-use-auth';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Grid, Row, Col } from 'react-styled-flexboxgrid';

const QUERY = gql`
  query {
    hello
  }
`;

const Profile = () => {
  const { user } = useAuth();
  return (
    <Grid>
      <Row>
        <Col>
          <Query query={QUERY}>
            {({ data, error, loading }) => {
              if (loading) {
                return <p>Loading...</p>;
              }

              if (error) {
                return <p>Error: ${error.message}</p>;
              }

              return (
                <div>
                  <h1>Hi {user.name} - this is your profile</h1>
                  <ul
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <li>E-mail: {data.hello}</li>
                  </ul>
                </div>
              );
            }}
          </Query>
        </Col>
      </Row>
    </Grid>
  );
};

export default Profile;
