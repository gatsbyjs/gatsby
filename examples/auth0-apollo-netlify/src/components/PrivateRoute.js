import React from 'react';
import { useAuth } from 'react-use-auth';
import { navigate } from 'gatsby';

const PrivateRoute = ({ component: Component, location, ...rest }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated() && location.pathname !== '/app/login') {
    navigate('/app/login');
  }

  return isAuthenticated() ? <Component {...rest} /> : null;
};

export default PrivateRoute;
