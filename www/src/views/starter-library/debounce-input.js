import React, { Component } from "react"
import debounce from "lodash/debounce"

class DebounceInput extends React.Component {
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
    return <input {...this.props} value={value} onChange={this.onChangeText} />
  }
}

export default DebounceInput
