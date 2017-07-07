import React from 'react';
import { GatsbyRedirect as Redirect } from 'gatsby-plugin-redirects';

class RedirectWrapper extends React.Component {
    render() {
        return (
            <div>
                <p>Some custom content</p>
                <Redirect {...this.props}/>
            </div>
        )
    }
}

export default RedirectWrapper
