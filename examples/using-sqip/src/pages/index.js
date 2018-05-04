import React from 'react'

const IndexPage = () => (
  <div>
    <h1>Gatsby SQIP Example</h1>
    <blockquote>
      <p>
        SQIP - pronounced \skwɪb\ like the non-magical folk of magical descent
      </p>
    </blockquote>
    <p>It is a svg based implementation of low quality image previews (LQIP)</p>
    <p>
      <strong>More precisely:</strong>
      <br /> An algorithm calculates a primitive representation of your images
      based on simple shapes like circles, ellipses, triangles and more. These
      will be embedded in your initial HTML payload. This will help your users
      to get a feeling of how the pictures will look like, even{' '}
      <strong>before</strong> they got loaded by their (probably) slow
      connection.
    </p>
  </div>
)

export default IndexPage
