/* eslint-disable prefer-destructuring */
import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { AuthProvider, useAuth } from 'react-use-auth';

import { navigate } from 'gatsby';
import { client } from './src/apollo/client';

/**
 * Due to the way webpack DefinePlugin works, these values
 * are replaced inline at compile time, so destructuring here
 * doesn't work.
 */
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;

const ApolloWrapper = ({ children }) => {
  const { authResult = {} } = useAuth();
  const idToken = authResult === null ? null : authResult.idToken;

  return <ApolloProvider client={client({ idToken })}>{children}</ApolloProvider>;
};

export const wrapRootElement = ({ element }) => {
  return (
    <AuthProvider navigate={navigate} auth0_domain={AUTH0_DOMAIN} auth0_client_id={AUTH0_CLIENT_ID}>
      <ApolloWrapper>{element}</ApolloWrapper>
    </AuthProvider>
  );
};
