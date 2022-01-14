
    import * as React from 'react';
    
    import Layout from '../components/layout';
    
    export default function SomeComponent() {
      return (
        <Layout>
          <h1 data-testid="message">Hello %REPLACEMENT%</h1>
        </Layout>
      )
    }
    