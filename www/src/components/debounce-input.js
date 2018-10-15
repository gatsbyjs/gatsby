import React, { Component } from "react"
import debounce from "lodash/debounce"
import PropTypes from "prop-types"

class DebounceInput extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    initialValue: PropTypes.string,
    delay: PropTypes.number,
  }

  static defaultProps = {
    initialValue: "",
    delay: 500,
  }

  state = {
    value: this.props.initialValue,
  }

  onChangeText = e => {
    this.setState({ value: e.target.value })
    e.persist()
    this.debounceOnChange(e)
  }

  debounceOnChange = debounce(this.props.onChange, this.props.delay)

  render() {
    const { value } = this.state
    return (
      <input
        {...this.props}
        type="text"
        value={value}
        onChange={this.onChangeText}
      />
    )
  }
}

export default DebounceInput
