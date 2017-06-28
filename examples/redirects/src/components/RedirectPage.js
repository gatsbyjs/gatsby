import React from 'react'
import { Route, Redirect } from 'react-router'

class RedirectPage extends React.Component {

    componentDidMount() {
        if (process.env.NODE_ENV === `production`) {
            window.___navigateTo(`/b/`)
        }
    }

    render() {
        return (
            <Route
                path="*"
                render={() => <Redirect to={`/b/`} />}
            />
        )
    }
}

export default RedirectPage