import React from "react"
import PropTypes from "prop-types"
import axios from "axios"
import styled from "react-emotion"
import { rhythm, options } from "../utils/typography"
import { colors } from "../utils/presets"
import EnvelopeIcon from "react-icons/lib/fa/envelope-o"
import CancelIcon from "react-icons/lib/md/close"
import SendIcon from "react-icons/lib/io/paper-airplane"

const FeedbackComponent = styled(`section`)`
  box-sizing: border-box;
  position: relative;
`

const FeedbackToggle = styled(`div`)`
  width: 60px;
  height: 60px;
  background-color: ${colors.gatsby};
  color: #fff;
  border-radius: 100%;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06), 0 2px 32px rgba(0, 0, 0, 0.16);
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 99999;
  background-size: 30px 30px;
  background-repeat: no-repeat;
  background-position: center;
  cursor: pointer;

  &:hover {
    background-color: ${colors.gatsbyDarker};
  }
`

const IconWrapper = styled(`div`)`
  position: relative;
  width: 60px;
  height: 60px;
`

const StatusMessage = styled(`span`)`
  position: absolute;
  width: 100%;
  background: ${colors.gray.dark};
  bottom: 60px;
  color: #fff;
  font-size: 16px;
  padding: 0.4rem 0.8rem;
  text-align: left;
`

const FeedbackForm = styled(`div`)`
  position: fixed;
  right: 30px;
  bottom: 100px;
  width: 350px;
  height: 300px;
  background-color: ${colors.gatsby};
  box-shadow: 0 0 40px 5px rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  overflow: hidden;
  flex-direction: column;
  justify-content: space-between;
  text-align: center;
  font-family: ${options.systemFontFamily.join(`,`)};
`

const Label = styled(`label`)`
  width: 100%;
  height: 240px;
  background-color: ${colors.gatsby};
  color: #fff;
  font-weight: 200;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  font-size: 22px;
`

const Form = styled(`form`)`
  height: 100%;
  position: relative;
`

const Input = styled(`input`)`
  height: 60px;
  width: 100%;
  font-size: 14px;
  padding: 20px 60px 20px 20px;
  border: none;
  resize: none;

  &:hover {
    outline: none;
  }
`

const Send = styled(`button`)`
  width: 30px;
  height: 30px;
  position: absolute;
  right: 20px;
  bottom: 15px;
  cursor: pointer;
  background-size: 30px 30px;
  background-repeat: no-repeat;
  background-position: center;
  border: none;
`

class Unbird extends React.Component {
  state = {
    visible: false,
    feedbackInput: ``,
    statusMessage: ``,
  }

  static defaultProps = {
    feedbackPrompt: `How can we improve your experience?`,
    feedbackPlaceholder: `Send feedback...`,
  }

  render() {
    return (
      <FeedbackComponent>
        <FeedbackToggle onClick={this.toggleFeedbackForm}>
          <IconWrapper>
            {this.state.visible ? (
              <CancelIcon
                css={{
                  color: `#fff`,
                  fontSize: rhythm(1.6),
                  padding: rhythm(0.2),
                  position: `absolute`,
                  top: `50%`,
                  left: `50%`,
                  transform: `translate(-50%, -50%)`,
                  cursor: `pointer`,
                }}
              />
            ) : (
              <EnvelopeIcon
                css={{
                  color: `#fff`,
                  fontSize: rhythm(1.4),
                  padding: rhythm(0.2),
                  position: `absolute`,
                  top: `50%`,
                  left: `50%`,
                  transform: `translate(-50%, -50%)`,
                  cursor: `pointer`,
                }}
              />
            )}
          </IconWrapper>
        </FeedbackToggle>

        {this.state.visible && (
          <FeedbackForm>
            <Form autoComplete="off" onSubmit={this.submitFeedback}>
              <Label htmlFor="unbird-feedback">
                {this.props.feedbackPrompt}
              </Label>
              {this.state.statusMessage && (
                <StatusMessage>{this.state.statusMessage}</StatusMessage>
              )}
              <Input
                id="unbird-feedback"
                type="text"
                value={this.state.feedbackInput}
                onChange={this.handleFeedbackInput}
                placeholder={this.props.feedbackPlaceholder}
              />
              <Send>
                <SendIcon
                  css={{
                    color: colors.gatsby,
                    fontSize: rhythm(1.4),
                    padding: rhythm(0.2),
                    position: `absolute`,
                    top: `-25%`,
                    left: 0,
                  }}
                />
              </Send>
            </Form>
          </FeedbackForm>
        )}
      </FeedbackComponent>
    )
  }

  toggleFeedbackForm = () => {
    this.setState({
      visible: !this.state.visible,
      statusMessage: ``,
      feedbackInput: ``,
    })
  }

  handleFeedbackInput = e => {
    this.setState({ feedbackInput: event.target.value })
  }

  setStatusMessage = msg => {
    this.setState({ statusMessage: msg })
  }

  submitFeedback = async e => {
    e.preventDefault()

    const { dataSetId, publicKey } = this.props
    const Unbird = `https://app.unbird.com/widget/entry/${dataSetId}/${publicKey}`

    return axios
      .post(Unbird, {
        entry: this.state.feedbackInput,
      })
      .then(_ => {
        this.setStatusMessage(`Sent! Thanks :)`)
        this.setState({ feedbackInput: `` })
      })
      .catch(_ => {
        this.setStatusMessage(`Oops. Something went wrong...`)
      })
  }
}

Unbird.propTypes = {
  dataSetId: PropTypes.string.isRequired,
  publicKey: PropTypes.string.isRequired,
  feedbackPrompt: PropTypes.string,
  feedbackPlaceholder: PropTypes.string,
}

export default Unbird
