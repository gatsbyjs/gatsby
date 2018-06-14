/* eslint-disable react/prop-types */
import React from 'react'
import { Link } from 'gatsby'
import Layout from '../components/layout'

const Cat = ({ transition }) => (
  <Layout>
    <div style={transition && transition.style}>
      <h1>meow</h1>
      <div>
        <Link to="/">Go to home</Link>
      </div>
      <div>
        <Link to="/dog/">Go to dog</Link>
      </div>
      <div>
        <Link to="/long-page/">Go to long page</Link>
      </div>
    </div>
  </Layout>
)

export default Cat
