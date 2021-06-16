import { Link } from 'gatsby'
import React from 'react'

const LoggedOut = () => {
    return (
        <>
        <h1>You're logged out!</h1>
        <Link to="/">Go Home</Link>
        </>
    )
}

export default LoggedOut