import React from "react"
import PropTypes from "prop-types"
import { addUrlProps, UrlQueryParamTypes } from "react-url-query"

/**
 * This example uses basic prop mapping, but also provides a `mapUrlToProps`
 * function to ensure the URL param value respects the `maxLength` prop. This
 * technique could also be used to coerce string formats or custom types.
 */

const urlPropsQueryConfig = {
  searchTerm: { type: UrlQueryParamTypes.string, queryParam: `t` },
}
const mapUrlToProps = (parsedParams, props) => {
  const searchTerm = parsedParams.searchTerm || ``
  const maxLength = props.maxLength || ParamInput.defaultProps.maxLength
  parsedParams.searchTerm = searchTerm.substr(0, maxLength)
  return parsedParams
}

class ParamInput extends React.PureComponent {
  static propTypes = {
    /**
     * Automatically mapped from `addUrlProps` HOC
     * https://peterbeshai.com/react-url-query/docs/api/addUrlProps.html
     */
    searchTerm: PropTypes.PropTypes.string,
    onChangeSearchTerm: PropTypes.func.isRequired,
    onChangeUrlQueryParams: PropTypes.func,
    /** Options **/
    maxLength: PropTypes.number,
  }
  static defaultProps = {
    searchTerm: ``,
    maxLength: 8,
  }
  handleChange = e => {
    const { onChangeSearchTerm, maxLength } = this.props
    onChangeSearchTerm(e.target.value.substr(0, maxLength))
  }
  render() {
    const {
      searchTerm,
      /* eslint-disable no-unused-vars */
      onChangeSearchTerm,
      maxLength,
      onChangeUrlQueryParams,
      /* eslint-disable no-unused-vars */
      ...passedProps
    } = this.props
    return (
      <input
        type="text"
        value={searchTerm}
        onChange={this.handleChange}
        {...passedProps}
      />
    )
  }
}

export default addUrlProps({
  urlPropsQueryConfig,
  mapUrlToProps,
})(ParamInput)
