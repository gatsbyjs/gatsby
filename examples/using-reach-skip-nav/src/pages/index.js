import React from "react"
import { Router, Link, Location } from "@reach/router"
import { TransitionGroup, CSSTransition } from "react-transition-group"
import Layout from "../components/layout"

import "./main.css"

const App = () => (
  <Layout className="app">
    <nav className="nav">
      <Link to="/">Page 1</Link> <Link to="page/2">Page 2</Link>
      {` `}
      <Link to="page/3">Page 3</Link> <Link to="page/4">Page 4</Link>
    </nav>

    <FadeTransitionRouter>
      <Page path="/" page="1" />
      <Page path="page/:page" />
    </FadeTransitionRouter>
  </Layout>
)

const FadeTransitionRouter = props => (
  <Location>
    {({ location }) => (
      <TransitionGroup className="transition-group">
        <CSSTransition key={location.key} classNames="fade" timeout={500}>
          {/* the only difference between a router animation and
              any other animation is that you have to pass the
              location to the router so the old screen renders
              the "old location" */}
          <Router location={location} className="router">
            {props.children}
          </Router>
        </CSSTransition>
      </TransitionGroup>
    )}
  </Location>
)

const Page = props => (
  <div
    className="page"
    style={{ background: `hsl(${props.page * 75}, 60%, 60%)` }}
  >
    <h1>Welcome to Page {props.page}!</h1>
    <span>
      This <Link to="/">link to page 1</Link> is the next in tab order if you
      click the skip nav link.
    </span>
  </div>
)

export default App
