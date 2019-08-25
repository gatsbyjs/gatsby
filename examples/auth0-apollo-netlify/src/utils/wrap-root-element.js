/* eslint-disable prefer-destructuring */
import React from 'react';
import { navigate } from 'gatsby';
import { AuthProvider } from 'react-use-auth';

/**
 * Due to the way webpack DefinePlugin works, these values
 * are replaced inline at compile time, so destructuring here
 * doesn't work.
 */
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;

export const RootElement = ({ children }) => {
  return (
    <AuthProvider navigate={navigate} auth0_domain={AUTH0_DOMAIN} auth0_client_id={AUTH0_CLIENT_ID}>
      {children}
    </AuthProvider>
  );
};
