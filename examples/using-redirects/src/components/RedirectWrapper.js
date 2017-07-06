import React from 'react';
import { Redirect } from 'gatsby-plugin-redirects';

const RedirectWrapper = props => (
    <div>
        <p>Some custom content</p>
        <Redirect {...props}/>
    </div>
)

export default RedirectWrapper;
