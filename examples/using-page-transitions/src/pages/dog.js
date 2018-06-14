/* eslint-disable react/prop-types */
import React from 'react'
import { Link } from 'gatsby'
import Layout from '../components/layout'

const Dog = ({ transition }) => (
  <Layout>
    <div style={transition && transition.style}>
      <h1>ruff</h1>
      <div>
        <Link to="/">Go to home</Link>
      </div>
      <div>
        <Link to="/cat/">Go to cat</Link>
      </div>
      <div>
        <Link to="/long-page/">Go to long page</Link>
      </div>
    </div>
  </Layout>
)

export default Dog
