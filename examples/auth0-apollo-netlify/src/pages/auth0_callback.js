import React, { useEffect } from 'react';
import { Grid, Row, Col } from 'react-styled-flexboxgrid';
import { useAuth } from 'react-use-auth';

import Layout from '../components/Layout';

const Auth0CallbackPage = () => {
  const { handleAuthentication } = useAuth();
  useEffect(() => {
    handleAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout>
      <Grid>
        <Row>
          <Col>
            <h1>This is the auth callback page, you should be redirected immediately.</h1>
          </Col>
        </Row>
      </Grid>
    </Layout>
  );
};

export default Auth0CallbackPage;
