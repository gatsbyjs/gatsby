import React, { Component } from "react"
import { debounce } from "lodash-es"
import PropTypes from "prop-types"

class DebounceInput extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
    delay: PropTypes.number,
  }

  static defaultProps = {
    value: ``,
    delay: 500,
  }

  state = {
    inputValue: ``,
  }

  componentDidMount() {
    this.setInputValue(this.props.value)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value != this.props.value)
      this.setInputValue(this.props.value)
  }

  setInputValue = (value = ``) => {
    this.setState({ inputValue: value })
  }

  onChangeInputText = e => {
    this.setInputValue(e.target.value)
    e.persist()
    this.debounceOnChange()
  }

  onChangeValue = () => {
    this.props.onChange(this.state.inputValue)
  }

  debounceOnChange = debounce(this.onChangeValue, this.props.delay)

  render() {
    const { inputValue } = this.state
    return (
      <input
        {...this.props}
        type="text"
        value={inputValue}
        onChange={this.onChangeInputText}
      />
    )
  }
}

export default DebounceInput
