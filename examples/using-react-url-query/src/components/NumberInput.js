import React from "react"
import PropTypes from "prop-types"
import { addUrlProps, UrlQueryParamTypes } from "react-url-query"

const urlPropsQueryConfig = {
  itemCount: { type: UrlQueryParamTypes.number, queryParam: `n` },
}
export default addUrlProps({ urlPropsQueryConfig })(
  class NumberInput extends React.PureComponent {
    static propTypes = {
      /**
       * Automatically mapped from `addUrlProps` HOC
       * https://peterbeshai.com/react-url-query/docs/api/addUrlProps.html
       */
      itemCount: PropTypes.PropTypes.number,
      onChangeItemCount: PropTypes.func.isRequired,
      onChangeUrlQueryParams: PropTypes.func,
    }
    static defaultProps = {
      itemCount: 1,
    }
    handleChange = e => {
      this.props.onChangeItemCount(e.target.value)
    }
    render() {
      const {
        itemCount,
        /* eslint-disable no-unused-vars */

        onChangeItemCount,
        onChangeUrlQueryParams,
        /* eslint-enable no-unused-vars */
        ...passedProps
      } = this.props
      return (
        <input
          type="range"
          min={0}
          max={20}
          step={1}
          value={itemCount}
          onChange={this.handleChange}
          {...passedProps}
        />
      )
    }
  }
)
