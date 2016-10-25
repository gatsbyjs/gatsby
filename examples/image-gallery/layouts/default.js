import React from 'react'
import Link from 'react-router/lib/Link'
import {rhythm} from 'utils/typography'

const DefaultLayout = ({children}) => {
  return (
    <div
      style={{
        padding: rhythm(1),
      }}
    >
      <Link to="/"><h1>Image gallery</h1></Link>
      {children}
      <p>(images courtesy of Unsplash)</p>
    </div>
  )
}

export default DefaultLayout
