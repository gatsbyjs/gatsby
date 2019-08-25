import React from 'react';
import { useAuth } from 'react-use-auth';
import { navigate } from 'gatsby';
import { Grid, Row, Col } from 'react-styled-flexboxgrid';

export default () => {
  const { isAuthenticated, login } = useAuth();
  if (isAuthenticated()) {
    navigate('/app/profile');
  }

  return (
    <Grid>
      <Row>
        <Col>
          <button type="button" onClick={() => login()}>
            login
          </button>
        </Col>
      </Row>
    </Grid>
  );
};
