import * as React from "react"
import { connect } from "react-redux"
import Layout from "../components/layout"
import SEO from "../components/seo"
import ReduxButton from "../components/redux-button"

import { toggleDarkMode } from "../redux/reducers/darkMode"

const IndexPage = ({ isDarkMode, dispatch }) => {
  return (
    <Layout>
      <SEO title="Home" keywords={[`gatsby`, `application`, `react`]} />
      <br />
      <p>
        This example shows using a code-split Redux architecture to attach some
        reducers at the root, but to only attach others when the user carries
        out a certain interaction. This results in a smaller app bundle in
        Gatsby by only loading its code, <i>its dependencies and its data</i>{" "}
        when needed. To see the basic example that loads all reducers initially
        ,{" "}
        <a href="https://build-dc43cf70-b1b5-4a32-add3-1852d6210f53.gtsb.io/">
          go here
        </a>
        .
      </p>
      <div className="container">
        <div>
          <h2>A simple slice of the store for dark mode</h2>
          <p>This is a boolean value that does not:</p>
          <ul>
            <li>make any API calls</li>
            <li>have large external dependencies </li>
            <li>require large data sets</li>
          </ul>
          <p>
            Putting it in our global store has little effect on our bundle size.
          </p>
          <button
            // Simple dispatch works fine.
            className="button dark-mode-button"
            style={
              isDarkMode
                ? { background: "rebeccapurple", color: "white" }
                : null
            }
            onClick={() => dispatch(toggleDarkMode(!isDarkMode))}
          >
            Dark mode {isDarkMode ? "on" : "off"}
          </button>
        </div>
        <div>
          {/* More complex slice of the store handled in here. */}
          <h2>Data in the Redux store set dynamically</h2>
          <p>This reducer has:</p>
          <ul>
            <li>large external dependencies</li>
            <li>sets a large data set in to the store</li>
          </ul>
          <p>
            Watch the network tab when the page loads and see the data and
            dependencies only loaded when the user clicks. Wonderful!
          </p>
          <ReduxButton />
        </div>
      </div>
    </Layout>
  )
}

export default connect(state => ({
  isDarkMode: state.darkMode.isDarkMode,
}))(IndexPage)
