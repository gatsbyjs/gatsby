import React from 'react';
import Layout from '../components/Layout';
import { Grid, Row, Col } from 'react-styled-flexboxgrid';

export default () => {
  return (
    <Layout>
      <Grid>
        <Row>
          <Col>
            <h1>Hello there 👋</h1>
          </Col>
        </Row>
      </Grid>
    </Layout>
  );
};
