import React from "react"
import PropTypes from "prop-types"
import SearchInput from "../components/SearchInput"
import NumberInput from "../components/NumberInput"

export default class IndexPage extends React.PureComponent {
  static propTypes = {
    history: PropTypes.object.isRequired,
  }
  componentDidMount() {
    // force an update if the URL changes
    this.props.history.listen(() => this.forceUpdate())
  }
  render() {
    return (
      <div>
        <p>
          The example shows how to use{` `}
          <a href="https://github.com/pbeshai/react-url-query">
            react-url-query
          </a>
          {` `}
          for binding url query parameters to props.
        </p>
        <hr />
        <p>
          The value of this input is reflected in the URL as the <code>t</code>
          {` `}
          query parameter (with a max length of 8).
        </p>
        <div>
          <label htmlFor="search-input">String:</label>
          <SearchInput id="search-input" style={{ marginLeft: `0.5em` }} />
        </div>
        <p>
          The value of this input is reflected in the URL as the <code>n</code>
          {` `}
          query parameter.
        </p>
        <div>
          <label htmlFor="count-input">Number:</label>
          <NumberInput id="count-input" style={{ marginLeft: `0.5em` }} />
        </div>
      </div>
    )
  }
}
