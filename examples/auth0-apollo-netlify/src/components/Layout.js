import React from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider } from 'styled-components';

import Head from './Head';
import Header from './Header';
import theme from '../utils/theme';

const Layout = ({ children, title = 'Gatsby Auth0 Apollo' }) => {
  return (
    <>
      <Head title={title} />
      <ThemeProvider theme={theme}>
        <>
          <Header />
          {children}
        </>
      </ThemeProvider>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
