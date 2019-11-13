/** @jsx jsx */
import { jsx } from "theme-ui"
import { Fragment } from "react"
import styled from "@emotion/styled"
import WidgetWrapper from "./widget-wrapper"
import { SubmitButton, CloseButton } from "./buttons"
import { themedInput, themedInputFocus } from "../../utils/styles"
import { Actions, Title, ScreenReaderText } from "./styled-elements"
import RatingOption from "./rating-option"
import MdSentimentDissatisfied from "react-icons/lib/md/sentiment-dissatisfied"
import MdSentimentNeutral from "react-icons/lib/md/sentiment-neutral"
import MdSentimentVerySatisfied from "react-icons/lib/md/sentiment-very-satisfied"
import MdSend from "react-icons/lib/md/send"
import MdRefresh from "react-icons/lib/md/refresh"

const Form = styled(`form`)`
  margin-bottom: 0;
`

const Fieldset = styled(`fieldset`)`
  border: 0;
  margin: 0 0 ${p => p.theme.space[4]};
  padding: 0;
`

const Legend = styled(`legend`)`
  display: inline-block;
  font-size: ${p => p.theme.fontSizes[1]};
  margin-bottom: ${p => p.theme.space[4]};
  padding: 0 ${p => p.theme.space[2]};
  text-align: center;
`

const Rating = ({ children }) => (
  <div
    sx={{
      ...themedInput,
      px: 0,
      alignContent: `stretch`,
      display: `flex`,
      flex: `1 1 auto`,
      justifyContent: `stretch`,
      overflow: `hidden`,
      transition: `0.5s`,
      width: `99.99%`,

      "&:focus-within": {
        ...themedInputFocus,
      },

      "[disabled] &": {
        opacity: `0.5`,
      },
    }}
  >
    {children}
  </div>
)

const TextareaLabel = styled(`label`)`
  font-size: ${p => p.theme.fontSizes[1]};
  font-weight: bold;

  span {
    font-weight: normal;
  }
`

const textareaStyles = {
  ...themedInput,
  height: `5.5rem`,
  mt: 1,
  mb: 4,
  overflowY: `scroll`,
}

const FeedbackForm = ({
  handleSubmit,
  handleClose,
  handleChange,
  handleCommentChange,
  titleRef,
  rating,
  comment,
  submitting,
}) => (
  <WidgetWrapper id="feedback-widget" handleClose={handleClose}>
    <Form
      onSubmit={handleSubmit}
      className={`${submitting ? `submitting` : ``}`}
    >
      <Title ref={titleRef} tabIndex="-1">
        Was this doc helpful to you?
      </Title>
      <Fieldset className="ratings" disabled={submitting}>
        <Legend>Rate your experience</Legend>
        <Rating>
          <RatingOption
            iconLabel="frowning face"
            icon={MdSentimentDissatisfied}
            ratingText="poor"
            ratingValue="1"
            checked={rating === 1}
            handleChange={handleChange}
          />
          <RatingOption
            iconLabel="neutral face"
            icon={MdSentimentNeutral}
            ratingText="fine"
            ratingValue="2"
            checked={rating === 2}
            handleChange={handleChange}
          />
          <RatingOption
            iconLabel="smiling face"
            icon={MdSentimentVerySatisfied}
            ratingText="great"
            ratingValue="3"
            checked={rating === 3}
            handleChange={handleChange}
          />
        </Rating>
      </Fieldset>
      <TextareaLabel className={`textarea ${submitting ? `disabled` : ``}`}>
        Your comments <span>(optional):</span>
        <textarea
          sx={{ ...textareaStyles, mb: 4 }}
          value={comment}
          onChange={handleCommentChange}
          disabled={submitting}
        />
      </TextareaLabel>
      <Actions>
        <CloseButton onClick={handleClose} disabled={submitting} type="button">
          Cancel{` `}
          <ScreenReaderText className="sr-only">this widget</ScreenReaderText>
        </CloseButton>
        <SubmitButton
          type="submit"
          className={submitting && `submitting`}
          disabled={submitting}
        >
          {submitting ? (
            <Fragment>
              Sending, wait <MdRefresh />
            </Fragment>
          ) : (
            <Fragment>
              Send feedback
              <MdSend />
            </Fragment>
          )}
        </SubmitButton>
      </Actions>
    </Form>
  </WidgetWrapper>
)

export default FeedbackForm
