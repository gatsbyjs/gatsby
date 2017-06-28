/* global window */

import React from 'react'
import PropTypes from 'prop-types'
import { Route, Redirect } from 'react-router'

class GatsbyRedirect extends React.Component {

    static propTypes = {
        pathContext: PropTypes.shape({
            to: PropTypes.string.isRequired,
        }),
    }

    componentDidMount() {
        if (process.env.NODE_ENV === `production`) {
            window.___navigateTo(this.props.pathContext.to)
        }
    }

    render() {
        return (
            <Route
                path="*"
                render={() => <Redirect to={this.props.pathContext.to} />}
            />
        )
    }
}

export default GatsbyRedirect
