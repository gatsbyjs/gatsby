import React from 'react';
import { Link } from 'gatsby';
import { useAuth } from 'react-use-auth';
import styled from 'styled-components';
import { Grid, Row, Col } from 'react-styled-flexboxgrid';

const Wrapper = styled.div`
  background: ${({ theme }) => theme.colors.blue};
`;

const Header = () => {
  const { isAuthenticated, login, logout } = useAuth();
  const isAuthed = isAuthenticated();

  return (
    <Wrapper>
      <Grid>
        <Row between="xs" middle="xs">
          <Col xs={12} md={6}>
            <Link to="/">
              <h2>Your lovely Gatsby app</h2>
            </Link>
          </Col>
          <Col>
            <nav>
              {isAuthed ? (
                <>
                  <li>
                    <Link to="/app/profile">Profile</Link>
                  </li>
                  <li onClick={() => logout()}>logout</li>
                </>
              ) : (
                <li onClick={() => login()}>login</li>
              )}
            </nav>
          </Col>
        </Row>
      </Grid>
    </Wrapper>
  );
};

export default Header;
