import React from "react"
import PropTypes from "prop-types"
import axios from "axios"
import styled from "@emotion/styled"
import {
  colors,
  space,
  radii,
  shadows,
  breakpoints,
  fontSizes,
  fonts,
} from "../utils/presets"
import EnvelopeFaIcon from "react-icons/lib/fa/envelope-o"
import CancelMdIcon from "react-icons/lib/md/close"
import SendIcon from "react-icons/lib/io/paper-airplane"

const FeedbackComponent = styled(`section`)`
  box-sizing: border-box;
  position: relative;
`

const FeedbackToggle = styled(`div`)`
  width: ${space[10]};
  height: ${space[10]};
  bottom: ${space[11]};
  background-color: ${colors.gatsby};
  color: ${colors.white};
  border-radius: 100%;
  box-shadow: ${shadows.dialog};
  position: fixed;
  right: ${space[6]};
  z-index: 99999;
  cursor: pointer;

  :hover {
    background-color: ${colors.gatsbyDark};
  }

  ${breakpoints.md} {
    bottom: ${space[6]};
  }
`

const IconWrapper = styled(`div`)`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;

  svg {
    height: auto;
  }
`

const EnvelopeIcon = styled(EnvelopeFaIcon)`
  font-size: ${fontSizes[4]};
`
const CancelIcon = styled(CancelMdIcon)`
  font-size: ${fontSizes[3]};
`

const StatusMessage = styled(`span`)`
  position: absolute;
  width: 100%;
  background: ${colors.gray.dark};
  bottom: 60px;
  color: ${colors.white};
  font-size: ${fontSizes[2]};
  padding: ${fontSizes[2]} ${fontSizes[4]};
  text-align: left;
  left: 0;
`

const FeedbackForm = styled(`div`)`
  position: fixed;
  right: 5%;
  bottom: 134px;
  width: 90%;
  background-color: ${colors.gatsby};
  box-shadow: ${shadows.dialog};
  border-radius: ${radii[2]}px;
  font-family: ${fonts.system};

  ${breakpoints.md} {
    width: 350px;
    right: 30px;
    bottom: 100px;
  }
`

const Label = styled(`label`)`
  font-family: ${fonts.header};
  font-weight: 600;
  height: 240px;
  color: ${colors.white};
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${space[8]};
  font-size: ${fontSizes[3]};
  float: left;
`

const Form = styled(`form`)`
  margin: 0;
`

const Input = styled(`input`)`
  float: left;
  height: 60px;
  width: calc(100% - 60px);
  font-size: ${fontSizes[1]};
  padding: ${space[5]};
  border: none;
  resize: none;
  border-right: 1px solid #ddd;
  border-radius: 0;
`

const Send = styled(`button`)`
  float: left;
  width: 60px;
  height: 60px;
  cursor: pointer;
  border: none;
  background: ${colors.white};
  padding: 0;

  svg {
    width: 50%;
    height: auto;
    fill: ${colors.gatsby};
  }
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
    const { publicKey, feedbackPrompt, feedbackPlaceholder } = this.props

    return (
      <FeedbackComponent>
        <FeedbackToggle onClick={this.toggleFeedbackForm}>
          <IconWrapper>
            {this.state.visible ? <CancelIcon /> : <EnvelopeIcon />}
          </IconWrapper>
        </FeedbackToggle>

        {this.state.visible && (
          <FeedbackForm>
            <Form autoComplete="off" onSubmit={this.submitFeedback}>
              <Label htmlFor="unbird-feedback">
                {publicKey
                  ? feedbackPrompt
                  : `Feedback widget not configured in dev`}
              </Label>
              {this.state.statusMessage && (
                <StatusMessage>{this.state.statusMessage}</StatusMessage>
              )}
              {publicKey && (
                <>
                  <Input
                    id="unbird-feedback"
                    type="text"
                    value={this.state.feedbackInput}
                    onChange={this.handleFeedbackInput}
                    placeholder={feedbackPlaceholder}
                    required
                  />
                  <Send>
                    <SendIcon />
                  </Send>
                </>
              )}
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
    this.setState({ feedbackInput: e.target.value })
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
